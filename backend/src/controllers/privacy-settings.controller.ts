import { Request, Response } from 'express';
import { 
  PrivacySettingsService, 
  DataExportService,
  UpsertPrivacySettingsInput 
} from '../services/privacy-settings.service';

const privacySettingsService = new PrivacySettingsService();
const dataExportService = new DataExportService();

export class PrivacySettingsController {
  /**
   * Get privacy settings for an event (resolved with global defaults)
   */
  async getEventSettings(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const settings = await privacySettingsService.getSettings(eventId);
      
      if (!settings) {
        // Return defaults if no settings exist
        return res.status(200).json({
          event_id: eventId,
          gdpr_consent_enabled: false,
          privacy_policy_url: null,
          custom_consent_text: null,
          data_retention_days: '365',
          dpa_signed: false,
          cookie_consent_enabled: false,
          is_global_default: true
        });
      }

      return res.status(200).json(settings);
    } catch (error: any) {
      console.error('Error fetching privacy settings:', error);
      return res.status(500).json({ message: 'Failed to fetch privacy settings' });
    }
  }

  /**
   * Get global privacy settings
   */
  async getGlobalSettings(req: Request, res: Response) {
    try {
      const settings = await privacySettingsService.getGlobalSettings();
      
      if (!settings) {
        return res.status(200).json({
          gdpr_consent_enabled: false,
          privacy_policy_url: null,
          custom_consent_text: null,
          data_retention_days: '365',
          dpa_signed: false,
          cookie_consent_enabled: false,
          is_global_default: true
        });
      }

      return res.status(200).json(settings);
    } catch (error: any) {
      console.error('Error fetching global privacy settings:', error);
      return res.status(500).json({ message: 'Failed to fetch privacy settings' });
    }
  }

  /**
   * Update/create privacy settings for an event
   */
  async updateEventSettings(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const input: UpsertPrivacySettingsInput = {
        gdpr_consent_enabled: req.body.gdpr_consent_enabled,
        privacy_policy_url: req.body.privacy_policy_url,
        custom_consent_text: req.body.custom_consent_text,
        data_retention_days: req.body.data_retention_days,
        dpa_signed: req.body.dpa_signed,
        cookie_consent_enabled: req.body.cookie_consent_enabled
      };

      // Validate data retention value
      if (input.data_retention_days && !['90', '180', '365', 'forever'].includes(input.data_retention_days)) {
        return res.status(400).json({ message: 'Invalid data retention value' });
      }

      const settings = await privacySettingsService.upsertEventSettings(eventId, input);
      
      return res.status(200).json({
        message: 'Privacy settings saved successfully',
        settings
      });
    } catch (error: any) {
      console.error('Error updating privacy settings:', error);
      return res.status(500).json({ message: 'Failed to update privacy settings' });
    }
  }

  /**
   * Update global privacy settings
   */
  async updateGlobalSettings(req: Request, res: Response) {
    try {
      const input: UpsertPrivacySettingsInput = {
        gdpr_consent_enabled: req.body.gdpr_consent_enabled,
        privacy_policy_url: req.body.privacy_policy_url,
        custom_consent_text: req.body.custom_consent_text,
        data_retention_days: req.body.data_retention_days,
        dpa_signed: req.body.dpa_signed,
        cookie_consent_enabled: req.body.cookie_consent_enabled
      };

      const settings = await privacySettingsService.updateGlobalSettings(input);
      
      return res.status(200).json({
        message: 'Global privacy settings saved successfully',
        settings
      });
    } catch (error: any) {
      console.error('Error updating global privacy settings:', error);
      return res.status(500).json({ message: 'Failed to update privacy settings' });
    }
  }

  /**
   * Reset event settings to use global defaults
   */
  async resetToGlobal(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const settings = await privacySettingsService.resetToGlobal(eventId);
      
      return res.status(200).json({
        message: 'Privacy settings reset to global defaults',
        settings
      });
    } catch (error: any) {
      console.error('Error resetting privacy settings:', error);
      return res.status(500).json({ message: 'Failed to reset privacy settings' });
    }
  }

  /**
   * Export full event data as CSV
   */
  async exportEventData(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const { filename, data } = await dataExportService.exportEventDataCSV(eventId);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      return res.status(200).send(data);
    } catch (error: any) {
      console.error('Error exporting event data:', error);
      return res.status(500).json({ message: 'Failed to export event data' });
    }
  }
}
