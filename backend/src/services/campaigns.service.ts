import db from '../database/db';
import { TemplatesService } from './templates.service';

export interface Campaign {
  id: number;
  event_id: number;
  name: string;
  channel: 'email' | 'sms';
  campaign_type: 'one-time' | 'trigger-based';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'failed';
  template_id?: number;
  subject?: string;
  content?: string;
  audience_rule?: any;
  scheduled_at?: string;
  sent_at?: string;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  open_count: number;
  click_count: number;
  bounce_count: number;
  unsubscribe_count: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface CampaignWithStats extends Campaign {
  open_rate: number;
  click_rate: number;
}

export interface CreateCampaignInput {
  name: string;
  channel: 'email' | 'sms';
  campaign_type?: 'one-time' | 'trigger-based';
  template_id?: number;
  subject?: string;
  content?: string;
  audience_rule?: any;
  scheduled_at?: string;
}

export interface UpdateCampaignInput {
  name?: string;
  channel?: 'email' | 'sms';
  campaign_type?: 'one-time' | 'trigger-based';
  template_id?: number;
  subject?: string;
  content?: string;
  audience_rule?: any;
  scheduled_at?: string;
  status?: string;
}

export interface AudienceRule {
  type: 'all' | 'vip' | 'not_checked_in' | 'checked_in' | 'ticket_type' | 'custom';
  ticket_ids?: number[];
  custom_filter?: any;
}

export interface CampaignRecipient {
  id: number;
  campaign_id: number;
  attendee_id?: number;
  recipient_email?: string;
  recipient_phone?: string;
  recipient_name?: string;
  status: string;
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  error_message?: string;
  metadata?: any;
}

export class CampaignsService {
  private templatesService: TemplatesService;

  constructor() {
    this.templatesService = new TemplatesService();
  }

  // Calculate rates
  private calculateRates(campaign: Campaign): CampaignWithStats {
    const openRate = campaign.total_recipients > 0 
      ? Math.round((campaign.open_count / campaign.total_recipients) * 100) 
      : 0;
    const clickRate = campaign.total_recipients > 0 
      ? Math.round((campaign.click_count / campaign.total_recipients) * 100) 
      : 0;

    return {
      ...campaign,
      open_rate: openRate,
      click_rate: clickRate,
    };
  }

  // Get all campaigns for an event
  async getCampaignsByEventId(eventId: number): Promise<CampaignWithStats[]> {
    const campaigns = await db('event_campaigns')
      .where('event_id', eventId)
      .andWhere('is_deleted', false)
      .orderBy('created_at', 'desc');

    return campaigns.map((c: Campaign) => this.calculateRates(c));
  }

  // Get campaign by ID
  async getCampaignById(eventId: number, campaignId: number): Promise<CampaignWithStats | null> {
    const campaign = await db('event_campaigns')
      .where('id', campaignId)
      .andWhere('event_id', eventId)
      .andWhere('is_deleted', false)
      .first();

    return campaign ? this.calculateRates(campaign) : null;
  }

  // Create campaign
  async createCampaign(eventId: number, input: CreateCampaignInput): Promise<CampaignWithStats> {
    const [campaign] = await db('event_campaigns')
      .insert({
        event_id: eventId,
        name: input.name,
        channel: input.channel,
        campaign_type: input.campaign_type || 'one-time',
        template_id: input.template_id || null,
        subject: input.subject || null,
        content: input.content || null,
        audience_rule: input.audience_rule ? JSON.stringify(input.audience_rule) : null,
        scheduled_at: input.scheduled_at || null,
        status: input.scheduled_at ? 'scheduled' : 'draft',
      })
      .returning('*');

    // Log activity
    await db('event_activity_logs').insert({
      event_id: eventId,
      actor_type: 'admin',
      action_type: 'campaign_created',
      description: `Campaign "${input.name}" created`,
      metadata: JSON.stringify({ campaign_id: campaign.id }),
    });

    return this.calculateRates(campaign);
  }

  // Update campaign
  async updateCampaign(eventId: number, campaignId: number, input: UpdateCampaignInput): Promise<CampaignWithStats | null> {
    const existing = await this.getCampaignById(eventId, campaignId);
    if (!existing) return null;

    // Can only edit draft or scheduled campaigns
    if (!['draft', 'scheduled'].includes(existing.status)) {
      throw new Error('Cannot edit a campaign that has already been sent');
    }

    const updateData: any = { updated_at: db.fn.now() };
    if (input.name !== undefined) updateData.name = input.name;
    if (input.channel !== undefined) updateData.channel = input.channel;
    if (input.campaign_type !== undefined) updateData.campaign_type = input.campaign_type;
    if (input.template_id !== undefined) updateData.template_id = input.template_id;
    if (input.subject !== undefined) updateData.subject = input.subject;
    if (input.content !== undefined) updateData.content = input.content;
    if (input.audience_rule !== undefined) updateData.audience_rule = JSON.stringify(input.audience_rule);
    if (input.scheduled_at !== undefined) {
      updateData.scheduled_at = input.scheduled_at;
      if (input.scheduled_at) {
        updateData.status = 'scheduled';
      } else {
        updateData.status = 'draft';
      }
    }
    if (input.status !== undefined) updateData.status = input.status;

    const [updated] = await db('event_campaigns')
      .where('id', campaignId)
      .andWhere('event_id', eventId)
      .update(updateData)
      .returning('*');

    return this.calculateRates(updated);
  }

  // Delete campaign (soft delete)
  async deleteCampaign(eventId: number, campaignId: number): Promise<boolean> {
    const result = await db('event_campaigns')
      .where('id', campaignId)
      .andWhere('event_id', eventId)
      .update({ is_deleted: true, updated_at: db.fn.now() });

    return result > 0;
  }

  // Duplicate campaign
  async duplicateCampaign(eventId: number, campaignId: number): Promise<CampaignWithStats | null> {
    const original = await this.getCampaignById(eventId, campaignId);
    if (!original) return null;

    const [duplicate] = await db('event_campaigns')
      .insert({
        event_id: eventId,
        name: `${original.name} (Copy)`,
        channel: original.channel,
        campaign_type: original.campaign_type,
        template_id: original.template_id,
        subject: original.subject,
        content: original.content,
        audience_rule: original.audience_rule ? JSON.stringify(original.audience_rule) : null,
        status: 'draft',
      })
      .returning('*');

    return this.calculateRates(duplicate);
  }

  // Resolve audience based on rules
  async resolveAudience(eventId: number, audienceRule: AudienceRule): Promise<{ id: number; name: string; email?: string; phone?: string; ticket_name?: string }[]> {
    let query = db('event_attendees as a')
      .leftJoin('tickets as t', 'a.ticket_id', 't.id')
      .select(
        'a.id',
        'a.attendee_name as name',
        'a.attendee_email as email',
        't.name as ticket_name'
      )
      .where('a.event_id', eventId)
      .andWhere('a.is_deleted', false);

    switch (audienceRule.type) {
      case 'all':
        // No additional filters
        break;
      case 'vip':
        // Assuming VIP tickets have "VIP" in the name or a specific category
        query = query.andWhere(function() {
          this.where('t.name', 'ilike', '%vip%')
            .orWhere('t.category', '=', 'vip');
        });
        break;
      case 'not_checked_in':
        query = query.andWhere('a.checkin_status', '!=', 'checked_in');
        break;
      case 'checked_in':
        query = query.andWhere('a.checkin_status', '=', 'checked_in');
        break;
      case 'ticket_type':
        if (audienceRule.ticket_ids && audienceRule.ticket_ids.length > 0) {
          query = query.whereIn('a.ticket_id', audienceRule.ticket_ids);
        }
        break;
      case 'custom':
        // Custom filter logic can be extended here
        break;
    }

    return query;
  }

  // Get audience count for preview
  async getAudienceCount(eventId: number, audienceRule: AudienceRule): Promise<number> {
    const audience = await this.resolveAudience(eventId, audienceRule);
    return audience.length;
  }

  // Send campaign (stub for now - actual sending would integrate with email/SMS provider)
  async sendCampaign(eventId: number, campaignId: number): Promise<{ success: boolean; message: string; recipientCount: number }> {
    const campaign = await this.getCampaignById(eventId, campaignId);
    if (!campaign) {
      return { success: false, message: 'Campaign not found', recipientCount: 0 };
    }

    if (campaign.status === 'sent') {
      return { success: false, message: 'Campaign has already been sent', recipientCount: 0 };
    }

    if (!campaign.content && !campaign.template_id) {
      return { success: false, message: 'Campaign has no content', recipientCount: 0 };
    }

    // Resolve audience
    const audienceRule: AudienceRule = campaign.audience_rule 
      ? (typeof campaign.audience_rule === 'string' ? JSON.parse(campaign.audience_rule) : campaign.audience_rule)
      : { type: 'all' };
    const recipients = await this.resolveAudience(eventId, audienceRule);

    if (recipients.length === 0) {
      return { success: false, message: 'No recipients found for this campaign', recipientCount: 0 };
    }

    // Get event details for variable replacement
    const event = await db('events').where('id', eventId).first();

    // Get content (from template or direct)
    let content = campaign.content;
    let subject = campaign.subject;
    if (campaign.template_id) {
      const template = await this.templatesService.getTemplateById(eventId, campaign.template_id);
      if (template) {
        content = template.content;
        subject = template.subject || subject;
      }
    }

    // Create recipient records
    const recipientRecords = recipients.map(r => ({
      campaign_id: campaignId,
      attendee_id: r.id,
      recipient_email: r.email,
      recipient_name: r.name,
      status: 'pending',
    }));

    await db('campaign_recipients').insert(recipientRecords);

    // Update campaign status
    await db('event_campaigns')
      .where('id', campaignId)
      .update({
        status: 'sending',
        total_recipients: recipients.length,
        updated_at: db.fn.now(),
      });

    // STUB: In production, this would queue the actual sends
    // For now, we'll simulate successful sending
    await db('campaign_recipients')
      .where('campaign_id', campaignId)
      .update({
        status: 'sent',
        sent_at: db.fn.now(),
        updated_at: db.fn.now(),
      });

    await db('event_campaigns')
      .where('id', campaignId)
      .update({
        status: 'sent',
        sent_at: db.fn.now(),
        sent_count: recipients.length,
        delivered_count: recipients.length, // Simulated
        updated_at: db.fn.now(),
      });

    // Log activity
    await db('event_activity_logs').insert({
      event_id: eventId,
      actor_type: 'system',
      action_type: 'campaign_sent',
      description: `Campaign "${campaign.name}" sent to ${recipients.length} recipients`,
      metadata: JSON.stringify({ campaign_id: campaignId, recipient_count: recipients.length }),
    });

    return { success: true, message: 'Campaign sent successfully', recipientCount: recipients.length };
  }

  // Schedule campaign
  async scheduleCampaign(eventId: number, campaignId: number, scheduledAt: string): Promise<CampaignWithStats | null> {
    const campaign = await this.getCampaignById(eventId, campaignId);
    if (!campaign) return null;

    if (!['draft', 'scheduled'].includes(campaign.status)) {
      throw new Error('Cannot schedule a campaign that has already been sent');
    }

    const [updated] = await db('event_campaigns')
      .where('id', campaignId)
      .andWhere('event_id', eventId)
      .update({
        scheduled_at: scheduledAt,
        status: 'scheduled',
        updated_at: db.fn.now(),
      })
      .returning('*');

    return this.calculateRates(updated);
  }

  // Pause campaign
  async pauseCampaign(eventId: number, campaignId: number): Promise<CampaignWithStats | null> {
    const campaign = await this.getCampaignById(eventId, campaignId);
    if (!campaign) return null;

    if (campaign.status !== 'scheduled') {
      throw new Error('Can only pause scheduled campaigns');
    }

    const [updated] = await db('event_campaigns')
      .where('id', campaignId)
      .andWhere('event_id', eventId)
      .update({
        status: 'paused',
        updated_at: db.fn.now(),
      })
      .returning('*');

    return this.calculateRates(updated);
  }

  // Resume campaign
  async resumeCampaign(eventId: number, campaignId: number): Promise<CampaignWithStats | null> {
    const campaign = await this.getCampaignById(eventId, campaignId);
    if (!campaign) return null;

    if (campaign.status !== 'paused') {
      throw new Error('Can only resume paused campaigns');
    }

    const [updated] = await db('event_campaigns')
      .where('id', campaignId)
      .andWhere('event_id', eventId)
      .update({
        status: campaign.scheduled_at ? 'scheduled' : 'draft',
        updated_at: db.fn.now(),
      })
      .returning('*');

    return this.calculateRates(updated);
  }

  // Get campaign recipients
  async getCampaignRecipients(campaignId: number, page: number = 1, limit: number = 20): Promise<{ recipients: CampaignRecipient[]; total: number }> {
    const offset = (page - 1) * limit;

    const countResult = await db('campaign_recipients')
      .where('campaign_id', campaignId)
      .count('id as count')
      .first();
    const total = parseInt((countResult as any)?.count || '0', 10);

    const recipients = await db('campaign_recipients')
      .where('campaign_id', campaignId)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return { recipients, total };
  }

  // Get campaign stats
  async getCampaignStats(eventId: number): Promise<{
    totalCampaigns: number;
    sentCampaigns: number;
    scheduledCampaigns: number;
    draftCampaigns: number;
    totalRecipients: number;
    avgOpenRate: number;
    avgClickRate: number;
  }> {
    const campaigns = await db('event_campaigns')
      .where('event_id', eventId)
      .andWhere('is_deleted', false);

    const totalCampaigns = campaigns.length;
    const sentCampaigns = campaigns.filter((c: Campaign) => c.status === 'sent').length;
    const scheduledCampaigns = campaigns.filter((c: Campaign) => c.status === 'scheduled').length;
    const draftCampaigns = campaigns.filter((c: Campaign) => c.status === 'draft').length;

    const sentCampaignsList = campaigns.filter((c: Campaign) => c.status === 'sent');
    const totalRecipients = sentCampaignsList.reduce((sum: number, c: Campaign) => sum + c.total_recipients, 0);
    const totalOpens = sentCampaignsList.reduce((sum: number, c: Campaign) => sum + c.open_count, 0);
    const totalClicks = sentCampaignsList.reduce((sum: number, c: Campaign) => sum + c.click_count, 0);

    const avgOpenRate = totalRecipients > 0 ? Math.round((totalOpens / totalRecipients) * 100) : 0;
    const avgClickRate = totalRecipients > 0 ? Math.round((totalClicks / totalRecipients) * 100) : 0;

    return {
      totalCampaigns,
      sentCampaigns,
      scheduledCampaigns,
      draftCampaigns,
      totalRecipients,
      avgOpenRate,
      avgClickRate,
    };
  }

  // Preview audience segments (for audience selector)
  async getAudienceSegments(eventId: number): Promise<{ name: string; type: string; count: number }[]> {
    // Get counts for predefined segments
    const allCount = await db('event_attendees')
      .where('event_id', eventId)
      .andWhere('is_deleted', false)
      .count('id as count')
      .first();

    const vipCount = await db('event_attendees as a')
      .leftJoin('tickets as t', 'a.ticket_id', 't.id')
      .where('a.event_id', eventId)
      .andWhere('a.is_deleted', false)
      .andWhere(function() {
        this.where('t.name', 'ilike', '%vip%')
          .orWhere('t.category', '=', 'vip');
      })
      .count('a.id as count')
      .first();

    const notCheckedInCount = await db('event_attendees')
      .where('event_id', eventId)
      .andWhere('is_deleted', false)
      .andWhere('checkin_status', '!=', 'checked_in')
      .count('id as count')
      .first();

    const checkedInCount = await db('event_attendees')
      .where('event_id', eventId)
      .andWhere('is_deleted', false)
      .andWhere('checkin_status', '=', 'checked_in')
      .count('id as count')
      .first();

    return [
      { name: 'All Attendees', type: 'all', count: parseInt((allCount as any)?.count || '0', 10) },
      { name: 'VIP Ticket Holders', type: 'vip', count: parseInt((vipCount as any)?.count || '0', 10) },
      { name: 'Not Checked In', type: 'not_checked_in', count: parseInt((notCheckedInCount as any)?.count || '0', 10) },
      { name: 'Checked In', type: 'checked_in', count: parseInt((checkedInCount as any)?.count || '0', 10) },
    ];
  }
}
