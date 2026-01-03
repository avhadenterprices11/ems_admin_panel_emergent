import { Request, Response } from 'express';
import { CampaignsService, CreateCampaignInput, UpdateCampaignInput, AudienceRule } from '../services/campaigns.service';

const campaignsService = new CampaignsService();

export class CampaignsController {
  // Get all campaigns for an event
  async getCampaigns(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const campaigns = await campaignsService.getCampaignsByEventId(eventId);
      return res.status(200).json(campaigns);
    } catch (error: any) {
      console.error('Error fetching campaigns:', error);
      return res.status(500).json({ message: 'Failed to fetch campaigns' });
    }
  }

  // Get campaign stats
  async getCampaignStats(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const stats = await campaignsService.getCampaignStats(eventId);
      return res.status(200).json(stats);
    } catch (error: any) {
      console.error('Error fetching campaign stats:', error);
      return res.status(500).json({ message: 'Failed to fetch campaign stats' });
    }
  }

  // Get single campaign
  async getCampaignById(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      const campaignId = parseInt(req.params.campaignId, 10);

      if (isNaN(eventId) || isNaN(campaignId)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }

      const campaign = await campaignsService.getCampaignById(eventId, campaignId);
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      return res.status(200).json(campaign);
    } catch (error: any) {
      console.error('Error fetching campaign:', error);
      return res.status(500).json({ message: 'Failed to fetch campaign' });
    }
  }

  // Create campaign
  async createCampaign(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const { name, channel, campaign_type, template_id, subject, content, audience_rule, scheduled_at } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Campaign name is required' });
      }

      if (!channel || !['email', 'sms'].includes(channel)) {
        return res.status(400).json({ message: 'Invalid channel. Must be "email" or "sms"' });
      }

      const input: CreateCampaignInput = {
        name: name.trim(),
        channel,
        campaign_type: campaign_type || 'one-time',
        template_id: template_id ? parseInt(template_id, 10) : undefined,
        subject: subject?.trim(),
        content: content?.trim(),
        audience_rule,
        scheduled_at,
      };

      const campaign = await campaignsService.createCampaign(eventId, input);
      return res.status(201).json(campaign);
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      return res.status(500).json({ message: 'Failed to create campaign' });
    }
  }

  // Update campaign
  async updateCampaign(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      const campaignId = parseInt(req.params.campaignId, 10);

      if (isNaN(eventId) || isNaN(campaignId)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }

      const { name, channel, campaign_type, template_id, subject, content, audience_rule, scheduled_at, status } = req.body;

      const input: UpdateCampaignInput = {};
      if (name !== undefined) input.name = name.trim();
      if (channel !== undefined) {
        if (!['email', 'sms'].includes(channel)) {
          return res.status(400).json({ message: 'Invalid channel' });
        }
        input.channel = channel;
      }
      if (campaign_type !== undefined) input.campaign_type = campaign_type;
      if (template_id !== undefined) input.template_id = template_id ? parseInt(template_id, 10) : undefined;
      if (subject !== undefined) input.subject = subject?.trim();
      if (content !== undefined) input.content = content?.trim();
      if (audience_rule !== undefined) input.audience_rule = audience_rule;
      if (scheduled_at !== undefined) input.scheduled_at = scheduled_at;
      if (status !== undefined) input.status = status;

      const campaign = await campaignsService.updateCampaign(eventId, campaignId, input);
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      return res.status(200).json(campaign);
    } catch (error: any) {
      console.error('Error updating campaign:', error);
      if (error.message?.includes('Cannot edit')) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Failed to update campaign' });
    }
  }

  // Delete campaign
  async deleteCampaign(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      const campaignId = parseInt(req.params.campaignId, 10);

      if (isNaN(eventId) || isNaN(campaignId)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }

      const deleted = await campaignsService.deleteCampaign(eventId, campaignId);
      if (!deleted) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      return res.status(200).json({ message: 'Campaign deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting campaign:', error);
      return res.status(500).json({ message: 'Failed to delete campaign' });
    }
  }

  // Duplicate campaign
  async duplicateCampaign(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      const campaignId = parseInt(req.params.campaignId, 10);

      if (isNaN(eventId) || isNaN(campaignId)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }

      const duplicate = await campaignsService.duplicateCampaign(eventId, campaignId);
      if (!duplicate) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      return res.status(201).json(duplicate);
    } catch (error: any) {
      console.error('Error duplicating campaign:', error);
      return res.status(500).json({ message: 'Failed to duplicate campaign' });
    }
  }

  // Send campaign
  async sendCampaign(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      const campaignId = parseInt(req.params.campaignId, 10);

      if (isNaN(eventId) || isNaN(campaignId)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }

      const result = await campaignsService.sendCampaign(eventId, campaignId);
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Error sending campaign:', error);
      return res.status(500).json({ message: 'Failed to send campaign' });
    }
  }

  // Schedule campaign
  async scheduleCampaign(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      const campaignId = parseInt(req.params.campaignId, 10);

      if (isNaN(eventId) || isNaN(campaignId)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }

      const { scheduled_at } = req.body;
      if (!scheduled_at) {
        return res.status(400).json({ message: 'Scheduled time is required' });
      }

      const campaign = await campaignsService.scheduleCampaign(eventId, campaignId, scheduled_at);
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      return res.status(200).json(campaign);
    } catch (error: any) {
      console.error('Error scheduling campaign:', error);
      if (error.message?.includes('Cannot schedule')) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Failed to schedule campaign' });
    }
  }

  // Pause campaign
  async pauseCampaign(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      const campaignId = parseInt(req.params.campaignId, 10);

      if (isNaN(eventId) || isNaN(campaignId)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }

      const campaign = await campaignsService.pauseCampaign(eventId, campaignId);
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      return res.status(200).json(campaign);
    } catch (error: any) {
      console.error('Error pausing campaign:', error);
      if (error.message?.includes('Can only pause')) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Failed to pause campaign' });
    }
  }

  // Resume campaign
  async resumeCampaign(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      const campaignId = parseInt(req.params.campaignId, 10);

      if (isNaN(eventId) || isNaN(campaignId)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }

      const campaign = await campaignsService.resumeCampaign(eventId, campaignId);
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      return res.status(200).json(campaign);
    } catch (error: any) {
      console.error('Error resuming campaign:', error);
      if (error.message?.includes('Can only resume')) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Failed to resume campaign' });
    }
  }

  // Get audience segments
  async getAudienceSegments(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const segments = await campaignsService.getAudienceSegments(eventId);
      return res.status(200).json(segments);
    } catch (error: any) {
      console.error('Error fetching audience segments:', error);
      return res.status(500).json({ message: 'Failed to fetch audience segments' });
    }
  }

  // Preview audience
  async previewAudience(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const { audience_rule } = req.body;
      if (!audience_rule) {
        return res.status(400).json({ message: 'Audience rule is required' });
      }

      const count = await campaignsService.getAudienceCount(eventId, audience_rule as AudienceRule);
      return res.status(200).json({ count });
    } catch (error: any) {
      console.error('Error previewing audience:', error);
      return res.status(500).json({ message: 'Failed to preview audience' });
    }
  }

  // Get campaign recipients
  async getCampaignRecipients(req: Request, res: Response) {
    try {
      const campaignId = parseInt(req.params.campaignId, 10);
      if (isNaN(campaignId)) {
        return res.status(400).json({ message: 'Invalid campaign ID' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await campaignsService.getCampaignRecipients(campaignId, page, limit);
      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Error fetching campaign recipients:', error);
      return res.status(500).json({ message: 'Failed to fetch campaign recipients' });
    }
  }
}
