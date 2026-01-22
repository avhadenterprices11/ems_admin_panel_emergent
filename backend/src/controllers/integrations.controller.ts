import { Request, Response } from 'express';
import { 
  IntegrationsService, 
  UpsertIntegrationInput,
  IntegrationType,
  Provider
} from '../services/integrations.service';

const integrationsService = new IntegrationsService();

export class IntegrationsController {
  /**
   * Get all integration configs for an event (resolved with global defaults)
   */
  async getEventIntegrations(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const configs = await integrationsService.getAllConfigs(eventId);
      
      // Format response to hide sensitive data
      const sanitized = {
        email: configs.email ? this.sanitizeConfig(configs.email) : null,
        sms: configs.sms ? this.sanitizeConfig(configs.sms) : null,
        maps: configs.maps ? this.sanitizeConfig(configs.maps) : null
      };

      return res.status(200).json(sanitized);
    } catch (error: any) {
      console.error('Error fetching event integrations:', error);
      return res.status(500).json({ message: 'Failed to fetch integrations' });
    }
  }

  /**
   * Get global integration configs (for future global settings page)
   */
  async getGlobalIntegrations(req: Request, res: Response) {
    try {
      const configs = await integrationsService.getAllConfigs(null);
      
      const sanitized = {
        email: configs.email ? this.sanitizeConfig(configs.email) : null,
        sms: configs.sms ? this.sanitizeConfig(configs.sms) : null,
        maps: configs.maps ? this.sanitizeConfig(configs.maps) : null
      };

      return res.status(200).json(sanitized);
    } catch (error: any) {
      console.error('Error fetching global integrations:', error);
      return res.status(500).json({ message: 'Failed to fetch integrations' });
    }
  }

  /**
   * Update/create an integration config for an event
   */
  async upsertEventIntegration(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const { integration_type, provider, is_enabled, config } = req.body;

      if (!integration_type || !provider) {
        return res.status(400).json({ message: 'Integration type and provider are required' });
      }

      // Validate integration type
      if (!['email', 'sms', 'maps'].includes(integration_type)) {
        return res.status(400).json({ message: 'Invalid integration type' });
      }

      // Validate provider based on type
      const validProviders: Record<IntegrationType, string[]> = {
        email: ['sendgrid', 'smtp'],
        sms: ['twilio', 'messagebird'],
        maps: ['google_maps']
      };

      if (!validProviders[integration_type as IntegrationType].includes(provider)) {
        return res.status(400).json({ message: `Invalid provider for ${integration_type}` });
      }

      const input: UpsertIntegrationInput = {
        event_id: eventId,
        integration_type: integration_type as IntegrationType,
        provider: provider as Provider,
        is_enabled: is_enabled ?? false,
        config: config || {}
      };

      const result = await integrationsService.upsertConfig(input);
      
      return res.status(200).json(this.sanitizeConfig(result));
    } catch (error: any) {
      console.error('Error updating integration:', error);
      return res.status(500).json({ message: 'Failed to update integration' });
    }
  }

  /**
   * Update/create a global integration config
   */
  async upsertGlobalIntegration(req: Request, res: Response) {
    try {
      const { integration_type, provider, is_enabled, config } = req.body;

      if (!integration_type || !provider) {
        return res.status(400).json({ message: 'Integration type and provider are required' });
      }

      const input: UpsertIntegrationInput = {
        event_id: null,
        integration_type: integration_type as IntegrationType,
        provider: provider as Provider,
        is_enabled: is_enabled ?? false,
        config: config || {}
      };

      const result = await integrationsService.upsertConfig(input);
      
      return res.status(200).json(this.sanitizeConfig(result));
    } catch (error: any) {
      console.error('Error updating global integration:', error);
      return res.status(500).json({ message: 'Failed to update integration' });
    }
  }

  /**
   * Save all integrations for an event at once
   */
  async saveAllEventIntegrations(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const { email, sms, maps } = req.body;
      const results: any = {};

      // Process email integration
      if (email) {
        const emailInput: UpsertIntegrationInput = {
          event_id: eventId,
          integration_type: 'email',
          provider: email.provider || 'sendgrid',
          is_enabled: email.is_enabled ?? false,
          config: email.config || {}
        };
        results.email = this.sanitizeConfig(await integrationsService.upsertConfig(emailInput));
      }

      // Process SMS integration
      if (sms) {
        const smsInput: UpsertIntegrationInput = {
          event_id: eventId,
          integration_type: 'sms',
          provider: sms.provider || 'twilio',
          is_enabled: sms.is_enabled ?? false,
          config: sms.config || {}
        };
        results.sms = this.sanitizeConfig(await integrationsService.upsertConfig(smsInput));
      }

      // Process Maps integration
      if (maps) {
        const mapsInput: UpsertIntegrationInput = {
          event_id: eventId,
          integration_type: 'maps',
          provider: 'google_maps',
          is_enabled: maps.is_enabled ?? false,
          config: maps.config || {}
        };
        results.maps = this.sanitizeConfig(await integrationsService.upsertConfig(mapsInput));
      }

      return res.status(200).json({ 
        message: 'Integrations saved successfully',
        integrations: results
      });
    } catch (error: any) {
      console.error('Error saving integrations:', error);
      return res.status(500).json({ message: 'Failed to save integrations' });
    }
  }

  /**
   * Test an integration connection
   */
  async testConnection(req: Request, res: Response) {
    try {
      const configId = parseInt(req.params.configId, 10);
      if (isNaN(configId)) {
        return res.status(400).json({ message: 'Invalid config ID' });
      }

      const result = await integrationsService.testConnection(configId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      console.error('Error testing connection:', error);
      return res.status(500).json({ message: 'Failed to test connection' });
    }
  }

  /**
   * Delete an integration config
   */
  async deleteIntegration(req: Request, res: Response) {
    try {
      const configId = parseInt(req.params.configId, 10);
      if (isNaN(configId)) {
        return res.status(400).json({ message: 'Invalid config ID' });
      }

      const success = await integrationsService.deleteConfig(configId);
      if (!success) {
        return res.status(404).json({ message: 'Integration config not found' });
      }

      return res.status(200).json({ message: 'Integration deleted' });
    } catch (error: any) {
      console.error('Error deleting integration:', error);
      return res.status(500).json({ message: 'Failed to delete integration' });
    }
  }

  /**
   * Sanitize config to hide sensitive data
   */
  private sanitizeConfig(config: any): any {
    const sanitized = { ...config };
    
    if (sanitized.config) {
      const cfg = { ...sanitized.config };
      
      // Mask sensitive fields
      if (cfg.api_key) cfg.api_key = this.maskValue(cfg.api_key);
      if (cfg.password) cfg.password = this.maskValue(cfg.password);
      if (cfg.auth_token) cfg.auth_token = this.maskValue(cfg.auth_token);
      if (cfg.account_sid) cfg.account_sid = this.maskValue(cfg.account_sid);
      
      sanitized.config = cfg;
    }
    
    return sanitized;
  }

  private maskValue(value: string): string {
    if (!value || value.length < 8) return '••••••••';
    return value.substring(0, 4) + '••••••••' + value.substring(value.length - 4);
  }
}
