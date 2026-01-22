import { Request, Response } from 'express';
import { EmailTemplatesService, UpsertEmailTemplatesInput, EmailScenario } from '../services/email-templates.service';
import { EmailSendingService } from '../services/email-sending.service';

const templatesService = new EmailTemplatesService();
const sendingService = new EmailSendingService();

export class EmailTemplatesController {
  /**
   * Get all email template configurations for an event
   */
  async getEventTemplates(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const templates = await templatesService.getEventTemplates(eventId);
      
      // Also return email provider status
      const emailStatus = await sendingService.isEmailAvailable(eventId);

      return res.status(200).json({
        templates,
        emailProviderStatus: emailStatus
      });
    } catch (error: any) {
      console.error('Error fetching email templates:', error);
      return res.status(500).json({ message: 'Failed to fetch email templates' });
    }
  }

  /**
   * Save all email template configurations for an event
   */
  async saveEventTemplates(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const { scenarios } = req.body as UpsertEmailTemplatesInput;

      if (!scenarios || !Array.isArray(scenarios)) {
        return res.status(400).json({ message: 'Scenarios array is required' });
      }

      // Validate scenarios
      const validScenarios = [
        'registration_complete',
        'payment_successful',
        'event_reminder',
        'event_cancelled',
        'post_event_followup'
      ];

      for (const s of scenarios) {
        if (!validScenarios.includes(s.scenario)) {
          return res.status(400).json({ message: `Invalid scenario: ${s.scenario}` });
        }
      }

      const templates = await templatesService.saveEventTemplates(eventId, { scenarios });

      return res.status(200).json({
        message: 'Email templates saved successfully',
        templates
      });
    } catch (error: any) {
      console.error('Error saving email templates:', error);
      return res.status(500).json({ message: 'Failed to save email templates' });
    }
  }

  /**
   * Reset all event templates to global defaults
   */
  async resetToGlobal(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const templates = await templatesService.resetToGlobal(eventId);

      return res.status(200).json({
        message: 'Email templates reset to global defaults',
        templates
      });
    } catch (error: any) {
      console.error('Error resetting email templates:', error);
      return res.status(500).json({ message: 'Failed to reset email templates' });
    }
  }

  /**
   * Send a test email for a specific scenario
   */
  async sendTestEmail(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const { scenario, email } = req.body;

      if (!scenario) {
        return res.status(400).json({ message: 'Scenario is required' });
      }

      if (!email) {
        return res.status(400).json({ message: 'Email address is required' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }

      const validScenarios = [
        'registration_complete',
        'payment_successful',
        'event_reminder',
        'event_cancelled',
        'post_event_followup'
      ];

      if (!validScenarios.includes(scenario)) {
        return res.status(400).json({ message: `Invalid scenario: ${scenario}` });
      }

      const result = await sendingService.sendTestEmail(eventId, scenario as EmailScenario, email);

      if (result.success) {
        return res.status(200).json({
          message: `Test email sent successfully to ${email}`,
          messageId: result.messageId,
          provider: result.provider
        });
      } else if (result.skipped) {
        return res.status(400).json({
          message: result.error || 'Email was skipped',
          skipped: true
        });
      } else {
        return res.status(500).json({
          message: result.error || 'Failed to send test email'
        });
      }
    } catch (error: any) {
      console.error('Error sending test email:', error);
      return res.status(500).json({ message: 'Failed to send test email' });
    }
  }

  /**
   * Get email provider status for an event
   */
  async getEmailProviderStatus(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const status = await sendingService.isEmailAvailable(eventId);

      return res.status(200).json(status);
    } catch (error: any) {
      console.error('Error getting email provider status:', error);
      return res.status(500).json({ message: 'Failed to get email provider status' });
    }
  }
}
