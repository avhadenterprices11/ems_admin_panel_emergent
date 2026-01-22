import db from '../database/db';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type IntegrationType = 'email' | 'sms' | 'maps';

export type EmailProvider = 'sendgrid' | 'smtp';
export type SmsProvider = 'twilio' | 'messagebird';
export type MapsProvider = 'google_maps';

export type Provider = EmailProvider | SmsProvider | MapsProvider;

export interface IntegrationConfig {
  id: number;
  event_id: number | null;
  integration_type: IntegrationType;
  provider: Provider;
  is_enabled: boolean;
  config: Record<string, any>;
  status: 'not_configured' | 'connected' | 'error';
  status_message: string | null;
  last_tested_at: string | null;
  created_at: string;
  updated_at: string;
}

// Provider-specific config interfaces
export interface SendGridConfig {
  api_key: string;
  from_email: string;
  from_name: string;
}

export interface SmtpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: 'none' | 'tls' | 'ssl';
  from_email: string;
  from_name: string;
}

export interface TwilioConfig {
  account_sid: string;
  auth_token: string;
  from_number: string;
}

export interface MessageBirdConfig {
  api_key: string;
  originator: string;
}

export interface GoogleMapsConfig {
  api_key: string;
}

export type EmailConfig = SendGridConfig | SmtpConfig;
export type SmsConfig = TwilioConfig | MessageBirdConfig;

// Input types for creating/updating configs
export interface UpsertIntegrationInput {
  event_id?: number | null;
  integration_type: IntegrationType;
  provider: Provider;
  is_enabled: boolean;
  config: Record<string, any>;
}

// ============================================================================
// INTEGRATIONS SERVICE - Central config management
// ============================================================================

export class IntegrationsService {
  /**
   * Get integration config with resolution: event-specific → global default
   * @param integrationType - Type of integration (email, sms, maps)
   * @param eventId - Optional event ID for event-specific config
   * @returns The resolved config or null if not found
   */
  async getConfig(integrationType: IntegrationType, eventId?: number | null): Promise<IntegrationConfig | null> {
    // Try event-specific config first
    if (eventId) {
      const eventConfig = await db('integration_configs')
        .where('integration_type', integrationType)
        .where('event_id', eventId)
        .where('is_deleted', false)
        .first();

      if (eventConfig) {
        return this.parseConfig(eventConfig);
      }
    }

    // Fall back to global default (event_id = null)
    const globalConfig = await db('integration_configs')
      .where('integration_type', integrationType)
      .whereNull('event_id')
      .where('is_deleted', false)
      .first();

    if (globalConfig) {
      return this.parseConfig(globalConfig);
    }

    return null;
  }

  /**
   * Get all integration configs for an event (with global fallbacks included)
   */
  async getAllConfigs(eventId?: number | null): Promise<Record<IntegrationType, IntegrationConfig | null>> {
    const types: IntegrationType[] = ['email', 'sms', 'maps'];
    const result: Record<IntegrationType, IntegrationConfig | null> = {
      email: null,
      sms: null,
      maps: null
    };

    for (const type of types) {
      result[type] = await this.getConfig(type, eventId);
    }

    return result;
  }

  /**
   * Get event-specific configs only (not resolved with global)
   */
  async getEventConfigs(eventId: number): Promise<IntegrationConfig[]> {
    const configs = await db('integration_configs')
      .where('event_id', eventId)
      .where('is_deleted', false)
      .orderBy('integration_type');

    return configs.map(c => this.parseConfig(c));
  }

  /**
   * Get global configs only
   */
  async getGlobalConfigs(): Promise<IntegrationConfig[]> {
    const configs = await db('integration_configs')
      .whereNull('event_id')
      .where('is_deleted', false)
      .orderBy('integration_type');

    return configs.map(c => this.parseConfig(c));
  }

  /**
   * Create or update an integration config
   */
  async upsertConfig(input: UpsertIntegrationInput): Promise<IntegrationConfig> {
    const { event_id, integration_type, provider, is_enabled, config } = input;

    // Check if config exists
    let query = db('integration_configs')
      .where('integration_type', integration_type)
      .where('is_deleted', false);

    if (event_id) {
      query = query.where('event_id', event_id);
    } else {
      query = query.whereNull('event_id');
    }

    const existing = await query.first();

    // Determine initial status
    const hasRequiredFields = this.hasRequiredConfigFields(integration_type, provider, config);
    const status = is_enabled && hasRequiredFields ? 'connected' : 'not_configured';

    if (existing) {
      // Update existing
      const [updated] = await db('integration_configs')
        .where('id', existing.id)
        .update({
          provider,
          is_enabled,
          config: JSON.stringify(config),
          status,
          status_message: null,
          updated_at: db.fn.now()
        })
        .returning('*');

      return this.parseConfig(updated);
    }

    // Create new
    const [created] = await db('integration_configs')
      .insert({
        event_id: event_id || null,
        integration_type,
        provider,
        is_enabled,
        config: JSON.stringify(config),
        status,
        status_message: null
      })
      .returning('*');

    return this.parseConfig(created);
  }

  /**
   * Delete an integration config
   */
  async deleteConfig(configId: number): Promise<boolean> {
    const result = await db('integration_configs')
      .where('id', configId)
      .update({ is_deleted: true, updated_at: db.fn.now() });

    return result > 0;
  }

  /**
   * Test an integration connection
   */
  async testConnection(configId: number): Promise<{ success: boolean; message: string }> {
    const config = await db('integration_configs')
      .where('id', configId)
      .where('is_deleted', false)
      .first();

    if (!config) {
      return { success: false, message: 'Configuration not found' };
    }

    const parsedConfig = this.parseConfig(config);

    try {
      let result: { success: boolean; message: string };

      switch (parsedConfig.integration_type) {
        case 'email':
          result = await this.testEmailConnection(parsedConfig);
          break;
        case 'sms':
          result = await this.testSmsConnection(parsedConfig);
          break;
        case 'maps':
          result = await this.testMapsConnection(parsedConfig);
          break;
        default:
          result = { success: false, message: 'Unknown integration type' };
      }

      // Update status in database
      await db('integration_configs')
        .where('id', configId)
        .update({
          status: result.success ? 'connected' : 'error',
          status_message: result.message,
          last_tested_at: db.fn.now(),
          updated_at: db.fn.now()
        });

      return result;
    } catch (error: any) {
      await db('integration_configs')
        .where('id', configId)
        .update({
          status: 'error',
          status_message: error.message,
          last_tested_at: db.fn.now(),
          updated_at: db.fn.now()
        });

      return { success: false, message: error.message };
    }
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private parseConfig(raw: any): IntegrationConfig {
    return {
      ...raw,
      config: typeof raw.config === 'string' ? JSON.parse(raw.config) : raw.config
    };
  }

  private hasRequiredConfigFields(type: IntegrationType, provider: Provider, config: Record<string, any>): boolean {
    switch (type) {
      case 'email':
        if (provider === 'sendgrid') {
          return !!(config.api_key && config.from_email);
        }
        if (provider === 'smtp') {
          return !!(config.host && config.port && config.from_email);
        }
        break;
      case 'sms':
        if (provider === 'twilio') {
          return !!(config.account_sid && config.auth_token && config.from_number);
        }
        if (provider === 'messagebird') {
          return !!(config.api_key && config.originator);
        }
        break;
      case 'maps':
        return !!(config.api_key);
    }
    return false;
  }

  private async testEmailConnection(config: IntegrationConfig): Promise<{ success: boolean; message: string }> {
    const emailConfig = config.config as EmailConfig;

    if (config.provider === 'sendgrid') {
      // Test SendGrid API key by making a simple API call
      try {
        const sgConfig = emailConfig as SendGridConfig;
        // In production, you'd make an actual API call to SendGrid
        // For now, we just validate the config exists
        if (!sgConfig.api_key) {
          return { success: false, message: 'API key is required' };
        }
        if (!sgConfig.api_key.startsWith('SG.')) {
          return { success: false, message: 'Invalid SendGrid API key format' };
        }
        return { success: true, message: 'SendGrid configuration validated' };
      } catch (error: any) {
        return { success: false, message: `SendGrid error: ${error.message}` };
      }
    }

    if (config.provider === 'smtp') {
      try {
        const smtpConfig = emailConfig as SmtpConfig;
        if (!smtpConfig.host || !smtpConfig.port) {
          return { success: false, message: 'SMTP host and port are required' };
        }
        // In production, you'd test the SMTP connection here
        return { success: true, message: 'SMTP configuration validated' };
      } catch (error: any) {
        return { success: false, message: `SMTP error: ${error.message}` };
      }
    }

    return { success: false, message: 'Unknown email provider' };
  }

  private async testSmsConnection(config: IntegrationConfig): Promise<{ success: boolean; message: string }> {
    const smsConfig = config.config as SmsConfig;

    if (config.provider === 'twilio') {
      try {
        const twilioConfig = smsConfig as TwilioConfig;
        if (!twilioConfig.account_sid || !twilioConfig.auth_token) {
          return { success: false, message: 'Twilio Account SID and Auth Token are required' };
        }
        // In production, you'd validate with Twilio API
        return { success: true, message: 'Twilio configuration validated' };
      } catch (error: any) {
        return { success: false, message: `Twilio error: ${error.message}` };
      }
    }

    if (config.provider === 'messagebird') {
      try {
        const mbConfig = smsConfig as MessageBirdConfig;
        if (!mbConfig.api_key) {
          return { success: false, message: 'MessageBird API key is required' };
        }
        // In production, you'd validate with MessageBird API
        return { success: true, message: 'MessageBird configuration validated' };
      } catch (error: any) {
        return { success: false, message: `MessageBird error: ${error.message}` };
      }
    }

    return { success: false, message: 'Unknown SMS provider' };
  }

  private async testMapsConnection(config: IntegrationConfig): Promise<{ success: boolean; message: string }> {
    const mapsConfig = config.config as GoogleMapsConfig;

    if (!mapsConfig.api_key) {
      return { success: false, message: 'Google Maps API key is required' };
    }

    // In production, you'd validate the API key with a Google Maps API call
    return { success: true, message: 'Google Maps configuration validated' };
  }
}

// ============================================================================
// EMAIL SERVICE - Provider-agnostic email sending
// ============================================================================

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
  attachments?: Array<{ filename: string; content: string | Buffer; contentType?: string }>;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class EmailService {
  private integrationsService: IntegrationsService;

  constructor() {
    this.integrationsService = new IntegrationsService();
  }

  /**
   * Send an email using the configured provider
   * @param options - Email options
   * @param eventId - Optional event ID for event-specific config
   */
  async sendEmail(options: SendEmailOptions, eventId?: number): Promise<SendEmailResult> {
    const config = await this.integrationsService.getConfig('email', eventId);

    if (!config || !config.is_enabled) {
      return { success: false, error: 'Email integration not configured or disabled' };
    }

    switch (config.provider) {
      case 'sendgrid':
        return this.sendViaSendGrid(options, config.config as SendGridConfig);
      case 'smtp':
        return this.sendViaSmtp(options, config.config as SmtpConfig);
      default:
        return { success: false, error: `Unknown email provider: ${config.provider}` };
    }
  }

  private async sendViaSendGrid(options: SendEmailOptions, config: SendGridConfig): Promise<SendEmailResult> {
    try {
      // In production, use @sendgrid/mail package
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(config.api_key);
      // const result = await sgMail.send({
      //   to: options.to,
      //   from: { email: options.from || config.from_email, name: options.fromName || config.from_name },
      //   subject: options.subject,
      //   html: options.html,
      //   text: options.text
      // });

      console.log('[EmailService] SendGrid: Would send email to', options.to);
      
      // Simulated response
      return { 
        success: true, 
        messageId: `sg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private async sendViaSmtp(options: SendEmailOptions, config: SmtpConfig): Promise<SendEmailResult> {
    try {
      // In production, use nodemailer
      // const nodemailer = require('nodemailer');
      // const transporter = nodemailer.createTransport({
      //   host: config.host,
      //   port: config.port,
      //   secure: config.encryption === 'ssl',
      //   auth: { user: config.username, pass: config.password }
      // });
      // const result = await transporter.sendMail({...});

      console.log('[EmailService] SMTP: Would send email to', options.to);
      
      return { 
        success: true, 
        messageId: `smtp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

// ============================================================================
// SMS SERVICE - Provider-agnostic SMS sending
// ============================================================================

export interface SendSmsOptions {
  to: string;
  message: string;
  from?: string;
}

export interface SendSmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class SmsService {
  private integrationsService: IntegrationsService;

  constructor() {
    this.integrationsService = new IntegrationsService();
  }

  /**
   * Send an SMS using the configured provider
   */
  async sendSms(options: SendSmsOptions, eventId?: number): Promise<SendSmsResult> {
    const config = await this.integrationsService.getConfig('sms', eventId);

    if (!config || !config.is_enabled) {
      return { success: false, error: 'SMS integration not configured or disabled' };
    }

    switch (config.provider) {
      case 'twilio':
        return this.sendViaTwilio(options, config.config as TwilioConfig);
      case 'messagebird':
        return this.sendViaMessageBird(options, config.config as MessageBirdConfig);
      default:
        return { success: false, error: `Unknown SMS provider: ${config.provider}` };
    }
  }

  private async sendViaTwilio(options: SendSmsOptions, config: TwilioConfig): Promise<SendSmsResult> {
    try {
      // In production, use twilio package
      // const twilio = require('twilio');
      // const client = twilio(config.account_sid, config.auth_token);
      // const message = await client.messages.create({
      //   body: options.message,
      //   from: options.from || config.from_number,
      //   to: options.to
      // });

      console.log('[SmsService] Twilio: Would send SMS to', options.to);
      
      return { 
        success: true, 
        messageId: `twilio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private async sendViaMessageBird(options: SendSmsOptions, config: MessageBirdConfig): Promise<SendSmsResult> {
    try {
      // In production, use messagebird package
      console.log('[SmsService] MessageBird: Would send SMS to', options.to);
      
      return { 
        success: true, 
        messageId: `mb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

// ============================================================================
// MAPS SERVICE - Google Maps API access
// ============================================================================

export class MapsService {
  private integrationsService: IntegrationsService;

  constructor() {
    this.integrationsService = new IntegrationsService();
  }

  /**
   * Get the Maps API key for frontend usage
   */
  async getApiKey(eventId?: number): Promise<string | null> {
    const config = await this.integrationsService.getConfig('maps', eventId);

    if (!config || !config.is_enabled) {
      return null;
    }

    const mapsConfig = config.config as GoogleMapsConfig;
    return mapsConfig.api_key || null;
  }

  /**
   * Check if Maps integration is enabled
   */
  async isEnabled(eventId?: number): Promise<boolean> {
    const config = await this.integrationsService.getConfig('maps', eventId);
    return !!(config && config.is_enabled && config.config?.api_key);
  }
}
