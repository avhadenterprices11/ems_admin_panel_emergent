import { Request, Response } from 'express';
import { TemplatesService, CreateTemplateInput, UpdateTemplateInput } from '../services/templates.service';

const templatesService = new TemplatesService();

export class TemplatesController {
  // Get all templates for an event
  async getTemplates(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const templates = await templatesService.getTemplatesByEventId(eventId);
      return res.status(200).json(templates);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      return res.status(500).json({ message: 'Failed to fetch templates' });
    }
  }

  // Get single template
  async getTemplateById(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      const templateId = parseInt(req.params.templateId, 10);

      if (isNaN(eventId) || isNaN(templateId)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }

      const template = await templatesService.getTemplateById(eventId, templateId);
      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }

      return res.status(200).json(template);
    } catch (error: any) {
      console.error('Error fetching template:', error);
      return res.status(500).json({ message: 'Failed to fetch template' });
    }
  }

  // Create template
  async createTemplate(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const { name, channel, subject, content } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Template name is required' });
      }

      if (!channel || !['email', 'sms'].includes(channel)) {
        return res.status(400).json({ message: 'Invalid channel. Must be "email" or "sms"' });
      }

      if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Template content is required' });
      }

      const input: CreateTemplateInput = {
        name: name.trim(),
        channel,
        subject: subject?.trim(),
        content: content.trim(),
      };

      const template = await templatesService.createTemplate(eventId, input);
      return res.status(201).json(template);
    } catch (error: any) {
      console.error('Error creating template:', error);
      return res.status(500).json({ message: 'Failed to create template' });
    }
  }

  // Update template
  async updateTemplate(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      const templateId = parseInt(req.params.templateId, 10);

      if (isNaN(eventId) || isNaN(templateId)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }

      const { name, channel, subject, content } = req.body;

      const input: UpdateTemplateInput = {};
      if (name !== undefined) input.name = name.trim();
      if (channel !== undefined) {
        if (!['email', 'sms'].includes(channel)) {
          return res.status(400).json({ message: 'Invalid channel' });
        }
        input.channel = channel;
      }
      if (subject !== undefined) input.subject = subject?.trim();
      if (content !== undefined) input.content = content.trim();

      const template = await templatesService.updateTemplate(eventId, templateId, input);
      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }

      return res.status(200).json(template);
    } catch (error: any) {
      console.error('Error updating template:', error);
      return res.status(500).json({ message: 'Failed to update template' });
    }
  }

  // Delete template
  async deleteTemplate(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      const templateId = parseInt(req.params.templateId, 10);

      if (isNaN(eventId) || isNaN(templateId)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }

      const deleted = await templatesService.deleteTemplate(eventId, templateId);
      if (!deleted) {
        return res.status(404).json({ message: 'Template not found' });
      }

      return res.status(200).json({ message: 'Template deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting template:', error);
      return res.status(500).json({ message: 'Failed to delete template' });
    }
  }

  // Duplicate template
  async duplicateTemplate(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      const templateId = parseInt(req.params.templateId, 10);

      if (isNaN(eventId) || isNaN(templateId)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }

      const duplicate = await templatesService.duplicateTemplate(eventId, templateId);
      if (!duplicate) {
        return res.status(404).json({ message: 'Template not found' });
      }

      return res.status(201).json(duplicate);
    } catch (error: any) {
      console.error('Error duplicating template:', error);
      return res.status(500).json({ message: 'Failed to duplicate template' });
    }
  }

  // Get available variables
  async getVariables(req: Request, res: Response) {
    try {
      const variables = templatesService.getAvailableVariables();
      return res.status(200).json(variables);
    } catch (error: any) {
      console.error('Error fetching variables:', error);
      return res.status(500).json({ message: 'Failed to fetch variables' });
    }
  }
}
