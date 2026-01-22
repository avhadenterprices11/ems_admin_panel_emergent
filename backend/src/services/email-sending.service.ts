import db from '../database/db';
import { IntegrationsService, SendGridConfig, SmtpConfig } from './integrations.service';
import { EmailTemplatesService, EmailScenario } from './email-templates.service';

// ============================================================================
// TYPES & INTERFACES
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
  provider?: string;
  skipped?: boolean;
}

export interface SendScenarioEmailOptions {
  scenario: EmailScenario;
  eventId: number;
  to: string;
  variables: Record<string, string>;
}

export interface EmailLog {
  id?: number;
  event_id: number | null;
  scenario: string | null;
  to_email: string;
  subject: string;
  status: 'sent' | 'failed' | 'skipped';
  provider: string | null;
  message_id: string | null;
  error_message: string | null;
  created_at?: string;
}

// ============================================================================
// EMAIL SENDING SERVICE
// Uses Integrations config from DB (not .env) for provider credentials
// ============================================================================

export class EmailSendingService {
  private integrationsService: IntegrationsService;
  private templatesService: EmailTemplatesService;

  constructor() {
    this.integrationsService = new IntegrationsService();
    this.templatesService = new EmailTemplatesService();
  }

  /**
   * Send an email using the configured provider from Integrations DB
   * Resolution: Event-specific config → Global config
   * @param options - Email options
   * @param eventId - Optional event ID for event-specific config
   */
  async sendEmail(options: SendEmailOptions, eventId?: number): Promise<SendEmailResult> {
    // Get email provider config from Integrations (DB source of truth)
    const config = await this.integrationsService.getConfig('email', eventId);

    if (!config) {
      console.log('[EmailSendingService] No email provider configured');
      return { 
        success: false, 
        error: 'Email provider not configured. Please configure email settings in Integrations.',
        skipped: true 
      };
    }

    if (!config.is_enabled) {
      console.log('[EmailSendingService] Email provider is disabled');
      return { 
        success: false, 
        error: 'Email provider is disabled. Please enable it in Integrations settings.',
        skipped: true 
      };
    }

    // Determine provider and send
    switch (config.provider) {
      case 'sendgrid':
        return this.sendViaSendGrid(options, config.config as SendGridConfig, eventId);
      case 'smtp':
        return this.sendViaSmtp(options, config.config as SmtpConfig, eventId);
      default:
        return { 
          success: false, 
          error: `Unknown email provider: ${config.provider}`,
          skipped: true 
        };
    }
  }

  /**
   * Send a scenario-based email with template resolution
   */
  async sendScenarioEmail(options: SendScenarioEmailOptions): Promise<SendEmailResult> {
    const { scenario, eventId, to, variables } = options;

    // Get resolved template (event override > global)
    const template = await this.templatesService.getResolvedTemplate(scenario, eventId);

    if (!template) {
      console.log(`[EmailSendingService] Email scenario '${scenario}' is disabled for event ${eventId}`);
      return {
        success: false,
        error: `Email scenario '${scenario}' is disabled`,
        skipped: true
      };
    }

    // Replace variables in subject and body
    let subject = template.subject;
    let body = template.body;

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = key.startsWith('{{') ? key : `{{${key}}}`;
      subject = subject.replaceAll(placeholder, value);
      body = body.replaceAll(placeholder, value);
    });

    // Send the email
    const result = await this.sendEmail(
      {
        to,
        subject,
        text: body,
        html: body.replace(/\n/g, '<br>')
      },
      eventId
    );

    // Log the email
    await this.logEmail({
      event_id: eventId,
      scenario,
      to_email: to,
      subject,
      status: result.success ? 'sent' : (result.skipped ? 'skipped' : 'failed'),
      provider: result.provider || null,
      message_id: result.messageId || null,
      error_message: result.error || null
    });

    return result;
  }

  /**
   * Send test email for a scenario
   */
  async sendTestEmail(
    eventId: number,
    scenario: EmailScenario,
    testEmail: string
  ): Promise<SendEmailResult> {
    // Get the template config
    const config = await this.templatesService.getScenarioConfig(scenario, eventId);

    // Use sample data for variables
    const sampleVariables: Record<string, string> = {
      '{{attendee_name}}': 'Test User',
      '{{attendee_email}}': testEmail,
      '{{event_name}}': 'Sample Event',
      '{{event_date}}': new Date().toLocaleDateString(),
      '{{event_time}}': '10:00 AM',
      '{{venue_name}}': 'Sample Venue',
      '{{confirmation_number}}': 'TEST-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
      '{{organizer_name}}': 'Event Team',
      '{{payment_amount}}': '$100.00',
      '{{transaction_id}}': 'TXN-TEST-' + Date.now()
    };

    // Replace variables
    let subject = config.subject;
    let body = config.body;

    Object.entries(sampleVariables).forEach(([key, value]) => {
      subject = subject.replaceAll(key, value);
      body = body.replaceAll(key, value);
    });

    // Prepend [TEST] to subject
    subject = `[TEST] ${subject}`;

    // Send the email
    const result = await this.sendEmail(
      {
        to: testEmail,
        subject,
        text: body,
        html: body.replace(/\n/g, '<br>')
      },
      eventId
    );

    return result;
  }

  /**
   * Send via SendGrid
   */
  private async sendViaSendGrid(
    options: SendEmailOptions, 
    config: SendGridConfig, 
    eventId?: number
  ): Promise<SendEmailResult> {
    try {
      // Validate config
      if (!config.api_key) {
        return { 
          success: false, 
          error: 'SendGrid API key not configured',
          provider: 'sendgrid',
          skipped: true 
        };
      }

      if (!config.from_email) {
        return { 
          success: false, 
          error: 'SendGrid from email not configured',
          provider: 'sendgrid',
          skipped: true 
        };
      }

      // In production, use @sendgrid/mail package
      // For now, we use fetch to call SendGrid API directly
      const toArray = Array.isArray(options.to) ? options.to : [options.to];
      
      const payload = {
        personalizations: [{ to: toArray.map(email => ({ email })) }],
        from: {
          email: options.from || config.from_email,
          name: options.fromName || config.from_name || 'Event Team'
        },
        subject: options.subject,
        content: [
          ...(options.text ? [{ type: 'text/plain', value: options.text }] : []),
          ...(options.html ? [{ type: 'text/html', value: options.html }] : [])
        ]
      };

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 202 || response.status === 200) {
        const messageId = response.headers.get('x-message-id') || `sg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log(`[EmailSendingService] SendGrid: Email sent to ${options.to}, messageId: ${messageId}`);
        return { 
          success: true, 
          messageId,
          provider: 'sendgrid'
        };
      } else {
        const errorBody = await response.text();
        console.error(`[EmailSendingService] SendGrid error: ${response.status} ${errorBody}`);
        return { 
          success: false, 
          error: `SendGrid error: ${response.status} - ${errorBody}`,
          provider: 'sendgrid'
        };
      }
    } catch (error: any) {
      console.error('[EmailSendingService] SendGrid error:', error);
      return { 
        success: false, 
        error: error.message,
        provider: 'sendgrid'
      };
    }
  }

  /**
   * Send via SMTP using nodemailer
   */
  private async sendViaSmtp(
    options: SendEmailOptions, 
    config: SmtpConfig, 
    eventId?: number
  ): Promise<SendEmailResult> {
    try {
      // Validate config
      if (!config.host || !config.port) {
        return { 
          success: false, 
          error: 'SMTP host and port not configured',
          provider: 'smtp',
          skipped: true 
        };
      }

      if (!config.from_email) {
        return { 
          success: false, 
          error: 'SMTP from email not configured',
          provider: 'smtp',
          skipped: true 
        };
      }

      // Use nodemailer for SMTP
      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.encryption === 'ssl',
        auth: config.username && config.password ? {
          user: config.username,
          pass: config.password
        } : undefined,
        tls: config.encryption === 'tls' ? {
          rejectUnauthorized: false
        } : undefined
      });

      const mailOptions = {
        from: {
          name: options.fromName || config.from_name || 'Event Team',
          address: options.from || config.from_email
        },
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        replyTo: options.replyTo,
        attachments: options.attachments
      };

      const info = await transporter.sendMail(mailOptions);
      
      console.log(`[EmailSendingService] SMTP: Email sent to ${options.to}, messageId: ${info.messageId}`);
      return { 
        success: true, 
        messageId: info.messageId,
        provider: 'smtp'
      };
    } catch (error: any) {
      console.error('[EmailSendingService] SMTP error:', error);
      return { 
        success: false, 
        error: error.message,
        provider: 'smtp'
      };
    }
  }

  /**
   * Log email to database
   */
  private async logEmail(log: EmailLog): Promise<void> {
    try {
      // Check if email_logs table exists
      const tableExists = await db.schema.hasTable('email_logs');
      if (!tableExists) {
        // Create table if not exists
        await db.schema.createTable('email_logs', (table) => {
          table.bigIncrements('id').primary();
          table.integer('event_id').nullable();
          table.string('scenario', 50).nullable();
          table.string('to_email', 255).notNullable();
          table.string('subject', 500).notNullable();
          table.string('status', 20).notNullable(); // sent, failed, skipped
          table.string('provider', 50).nullable();
          table.string('message_id', 255).nullable();
          table.text('error_message').nullable();
          table.timestamp('created_at').defaultTo(db.fn.now());
        });
      }

      await db('email_logs').insert(log);
    } catch (error) {
      console.error('[EmailSendingService] Error logging email:', error);
      // Don't throw - logging failure shouldn't affect email sending
    }
  }

  /**
   * Check if email sending is available for an event
   */
  async isEmailAvailable(eventId?: number): Promise<{ available: boolean; provider?: string; error?: string }> {
    const config = await this.integrationsService.getConfig('email', eventId);

    if (!config) {
      return { available: false, error: 'Email provider not configured' };
    }

    if (!config.is_enabled) {
      return { available: false, error: 'Email provider is disabled' };
    }

    return { available: true, provider: config.provider };
  }
}
