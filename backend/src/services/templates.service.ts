import db from '../database/db';

export interface MessageTemplate {
  id: number;
  event_id: number;
  name: string;
  channel: 'email' | 'sms';
  subject?: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface CreateTemplateInput {
  name: string;
  channel: 'email' | 'sms';
  subject?: string;
  content: string;
}

export interface UpdateTemplateInput {
  name?: string;
  channel?: 'email' | 'sms';
  subject?: string;
  content?: string;
}

export class TemplatesService {
  // Get all templates for an event
  async getTemplatesByEventId(eventId: number): Promise<MessageTemplate[]> {
    const templates = await db('event_message_templates')
      .where('event_id', eventId)
      .andWhere('is_deleted', false)
      .orderBy('created_at', 'desc');

    return templates;
  }

  // Get template by ID
  async getTemplateById(eventId: number, templateId: number): Promise<MessageTemplate | null> {
    const template = await db('event_message_templates')
      .where('id', templateId)
      .andWhere('event_id', eventId)
      .andWhere('is_deleted', false)
      .first();

    return template || null;
  }

  // Create template
  async createTemplate(eventId: number, input: CreateTemplateInput): Promise<MessageTemplate> {
    const [template] = await db('event_message_templates')
      .insert({
        event_id: eventId,
        name: input.name,
        channel: input.channel,
        subject: input.channel === 'email' ? input.subject : null,
        content: input.content,
      })
      .returning('*');

    return template;
  }

  // Update template
  async updateTemplate(eventId: number, templateId: number, input: UpdateTemplateInput): Promise<MessageTemplate | null> {
    const existing = await this.getTemplateById(eventId, templateId);
    if (!existing) return null;

    const updateData: any = { updated_at: db.fn.now() };
    if (input.name !== undefined) updateData.name = input.name;
    if (input.channel !== undefined) updateData.channel = input.channel;
    if (input.subject !== undefined) updateData.subject = input.subject;
    if (input.content !== undefined) updateData.content = input.content;

    const [updated] = await db('event_message_templates')
      .where('id', templateId)
      .andWhere('event_id', eventId)
      .update(updateData)
      .returning('*');

    return updated;
  }

  // Delete template (soft delete)
  async deleteTemplate(eventId: number, templateId: number): Promise<boolean> {
    const result = await db('event_message_templates')
      .where('id', templateId)
      .andWhere('event_id', eventId)
      .update({ is_deleted: true, updated_at: db.fn.now() });

    return result > 0;
  }

  // Duplicate template
  async duplicateTemplate(eventId: number, templateId: number): Promise<MessageTemplate | null> {
    const original = await this.getTemplateById(eventId, templateId);
    if (!original) return null;

    const [duplicate] = await db('event_message_templates')
      .insert({
        event_id: eventId,
        name: `${original.name} (Copy)`,
        channel: original.channel,
        subject: original.subject,
        content: original.content,
      })
      .returning('*');

    return duplicate;
  }

  // Render template with variables
  renderTemplate(content: string, variables: Record<string, string>): string {
    let rendered = content;
    for (const [key, value] of Object.entries(variables)) {
      // Support both {{Variable}} and {{variable}} formats
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'gi');
      rendered = rendered.replace(regex, value);
    }
    return rendered;
  }

  // Get available variables
  getAvailableVariables(): { category: string; variables: { name: string; code: string }[] }[] {
    return [
      {
        category: 'Attendee',
        variables: [
          { name: 'First Name', code: '{{FirstName}}' },
          { name: 'Last Name', code: '{{LastName}}' },
          { name: 'Email', code: '{{Email}}' },
          { name: 'Ticket Type', code: '{{TicketType}}' },
          { name: 'Order ID', code: '{{OrderId}}' },
        ],
      },
      {
        category: 'Event',
        variables: [
          { name: 'Event Name', code: '{{EventName}}' },
          { name: 'Event Date', code: '{{EventDate}}' },
          { name: 'Location', code: '{{Location}}' },
          { name: 'Venue Map', code: '{{MapLink}}' },
        ],
      },
      {
        category: 'System',
        variables: [
          { name: 'QR Code Image', code: '{{QRCode}}' },
          { name: 'Add to Calendar', code: '{{CalendarLink}}' },
          { name: 'Unsubscribe Link', code: '{{Unsubscribe}}' },
        ],
      },
    ];
  }
}
