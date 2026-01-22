import db from '../database/db';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type EmailScenario = 
  | 'registration_complete' 
  | 'payment_successful' 
  | 'event_reminder' 
  | 'event_cancelled' 
  | 'post_event_followup';

export interface EmailTemplate {
  id: number;
  event_id: number | null;
  scenario: EmailScenario;
  is_enabled: boolean;
  has_override: boolean;
  subject: string | null;
  body: string | null;
  send_timing: 'immediate' | 'scheduled';
  schedule_offset: number | null;
  schedule_unit: 'minutes' | 'hours' | 'days' | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  // Virtual fields for resolution
  is_global_default?: boolean;
  source?: 'global' | 'event';
}

export interface EmailScenarioConfig {
  scenario: EmailScenario;
  triggerLabel: string;
  description: string;
  is_enabled: boolean;
  has_override: boolean;
  source: 'global' | 'event';
  subject: string;
  body: string;
  send_timing: 'immediate' | 'scheduled';
  schedule_offset: number | null;
  schedule_unit: 'minutes' | 'hours' | 'days' | null;
  globalSubject: string;
  globalBody: string;
  variables: string[];
}

export interface UpsertEmailTemplatesInput {
  scenarios: Array<{
    scenario: EmailScenario;
    is_enabled: boolean;
    has_override: boolean;
    subject?: string | null;
    body?: string | null;
    send_timing?: 'immediate' | 'scheduled';
    schedule_offset?: number | null;
    schedule_unit?: 'minutes' | 'hours' | 'days' | null;
  }>;
}

// Scenario metadata with variables
const SCENARIO_METADATA: Record<EmailScenario, { triggerLabel: string; description: string; variables: string[] }> = {
  registration_complete: {
    triggerLabel: 'Registration Completed',
    description: 'Sent when attendee completes registration',
    variables: ['{{attendee_name}}', '{{attendee_email}}', '{{event_name}}', '{{event_date}}', '{{event_time}}', '{{venue_name}}', '{{confirmation_number}}', '{{organizer_name}}']
  },
  payment_successful: {
    triggerLabel: 'Payment Successful',
    description: 'Sent when payment is processed',
    variables: ['{{attendee_name}}', '{{event_name}}', '{{payment_amount}}', '{{transaction_id}}', '{{organizer_name}}']
  },
  event_reminder: {
    triggerLabel: 'Event Reminder',
    description: 'Scheduled before event starts',
    variables: ['{{attendee_name}}', '{{event_name}}', '{{event_date}}', '{{event_time}}', '{{venue_name}}', '{{confirmation_number}}', '{{organizer_name}}']
  },
  event_cancelled: {
    triggerLabel: 'Event Cancelled',
    description: 'Sent when event is cancelled',
    variables: ['{{attendee_name}}', '{{event_name}}', '{{organizer_name}}']
  },
  post_event_followup: {
    triggerLabel: 'Post-Event Follow-up',
    description: 'Sent after event ends',
    variables: ['{{attendee_name}}', '{{event_name}}', '{{organizer_name}}']
  }
};

const ALL_SCENARIOS: EmailScenario[] = [
  'registration_complete',
  'payment_successful',
  'event_reminder',
  'event_cancelled',
  'post_event_followup'
];

// ============================================================================
// EMAIL TEMPLATES SERVICE
// ============================================================================

export class EmailTemplatesService {
  /**
   * Get all email template configurations for an event
   * Resolves event-specific → global for each scenario
   */
  async getEventTemplates(eventId: number): Promise<EmailScenarioConfig[]> {
    const result: EmailScenarioConfig[] = [];

    for (const scenario of ALL_SCENARIOS) {
      const config = await this.getScenarioConfig(scenario, eventId);
      result.push(config);
    }

    return result;
  }

  /**
   * Get a single scenario config with resolution
   */
  async getScenarioConfig(scenario: EmailScenario, eventId?: number | null): Promise<EmailScenarioConfig> {
    const metadata = SCENARIO_METADATA[scenario];
    
    // Get global default
    const globalTemplate = await db('email_templates')
      .whereNull('event_id')
      .where('scenario', scenario)
      .where('is_deleted', false)
      .first();

    // Get event-specific if eventId provided
    let eventTemplate = null;
    if (eventId) {
      eventTemplate = await db('email_templates')
        .where('event_id', eventId)
        .where('scenario', scenario)
        .where('is_deleted', false)
        .first();
    }

    // Build the resolved config
    const globalSubject = globalTemplate?.subject || '';
    const globalBody = globalTemplate?.body || '';

    // If event has override, use event's content; otherwise use global
    if (eventTemplate && eventTemplate.has_override) {
      return {
        scenario,
        triggerLabel: metadata.triggerLabel,
        description: metadata.description,
        is_enabled: eventTemplate.is_enabled,
        has_override: true,
        source: 'event',
        subject: eventTemplate.subject || globalSubject,
        body: eventTemplate.body || globalBody,
        send_timing: eventTemplate.send_timing || 'immediate',
        schedule_offset: eventTemplate.schedule_offset,
        schedule_unit: eventTemplate.schedule_unit,
        globalSubject,
        globalBody,
        variables: metadata.variables
      };
    }

    // Use global template (or event without override inherits global content)
    return {
      scenario,
      triggerLabel: metadata.triggerLabel,
      description: metadata.description,
      is_enabled: eventTemplate?.is_enabled ?? globalTemplate?.is_enabled ?? true,
      has_override: false,
      source: 'global',
      subject: globalSubject,
      body: globalBody,
      send_timing: globalTemplate?.send_timing || 'immediate',
      schedule_offset: globalTemplate?.schedule_offset,
      schedule_unit: globalTemplate?.schedule_unit,
      globalSubject,
      globalBody,
      variables: metadata.variables
    };
  }

  /**
   * Save all email template configurations for an event
   */
  async saveEventTemplates(eventId: number, input: UpsertEmailTemplatesInput): Promise<EmailScenarioConfig[]> {
    for (const scenarioInput of input.scenarios) {
      await this.upsertEventScenario(eventId, scenarioInput);
    }

    // Return updated configs
    return this.getEventTemplates(eventId);
  }

  /**
   * Upsert a single scenario for an event
   */
  async upsertEventScenario(
    eventId: number,
    input: {
      scenario: EmailScenario;
      is_enabled: boolean;
      has_override: boolean;
      subject?: string | null;
      body?: string | null;
      send_timing?: 'immediate' | 'scheduled';
      schedule_offset?: number | null;
      schedule_unit?: 'minutes' | 'hours' | 'days' | null;
    }
  ): Promise<EmailTemplate> {
    // Check if event-specific template exists (including soft-deleted due to unique constraint)
    const existing = await db('email_templates')
      .where('event_id', eventId)
      .where('scenario', input.scenario)
      .first();

    const updateData: any = {
      is_enabled: input.is_enabled,
      has_override: input.has_override,
      updated_at: db.fn.now(),
      is_deleted: false
    };

    // Only set content fields if has_override is true
    if (input.has_override) {
      if (input.subject !== undefined) updateData.subject = input.subject;
      if (input.body !== undefined) updateData.body = input.body;
      if (input.send_timing !== undefined) updateData.send_timing = input.send_timing;
      if (input.schedule_offset !== undefined) updateData.schedule_offset = input.schedule_offset;
      if (input.schedule_unit !== undefined) updateData.schedule_unit = input.schedule_unit;
    } else {
      // Clear custom content when disabling override
      updateData.subject = null;
      updateData.body = null;
      updateData.send_timing = 'immediate';
      updateData.schedule_offset = null;
      updateData.schedule_unit = null;
    }

    if (existing) {
      // Update existing
      const [updated] = await db('email_templates')
        .where('id', existing.id)
        .update(updateData)
        .returning('*');

      return updated;
    }

    // Create new event-specific template
    const [created] = await db('email_templates')
      .insert({
        event_id: eventId,
        scenario: input.scenario,
        ...updateData
      })
      .returning('*');

    return created;
  }

  /**
   * Reset all event templates to global defaults
   */
  async resetToGlobal(eventId: number): Promise<EmailScenarioConfig[]> {
    // Soft-delete all event-specific templates
    await db('email_templates')
      .where('event_id', eventId)
      .update({
        is_deleted: true,
        updated_at: db.fn.now()
      });

    // Return global defaults
    return this.getEventTemplates(eventId);
  }

  /**
   * Get global template for a scenario (used for email sending)
   */
  async getGlobalTemplate(scenario: EmailScenario): Promise<EmailTemplate | null> {
    return db('email_templates')
      .whereNull('event_id')
      .where('scenario', scenario)
      .where('is_deleted', false)
      .first();
  }

  /**
   * Get resolved template for sending (event override > global)
   */
  async getResolvedTemplate(scenario: EmailScenario, eventId?: number): Promise<{
    is_enabled: boolean;
    subject: string;
    body: string;
    send_timing: 'immediate' | 'scheduled';
    schedule_offset: number | null;
    schedule_unit: 'minutes' | 'hours' | 'days' | null;
  } | null> {
    const config = await this.getScenarioConfig(scenario, eventId);
    
    if (!config.is_enabled) {
      return null;
    }

    return {
      is_enabled: config.is_enabled,
      subject: config.subject,
      body: config.body,
      send_timing: config.send_timing,
      schedule_offset: config.schedule_offset,
      schedule_unit: config.schedule_unit
    };
  }

  /**
   * Get scenario metadata (for frontend)
   */
  getScenarioMetadata(): typeof SCENARIO_METADATA {
    return SCENARIO_METADATA;
  }
}
