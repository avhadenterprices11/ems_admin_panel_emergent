import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Email templates table - stores email scenario configurations
  // Supports both global defaults (event_id = null) and event-specific overrides
  await knex.schema.createTable('email_templates', (table) => {
    table.bigIncrements('id').primary();
    table.integer('event_id').nullable().references('id').inTable('events').onDelete('CASCADE');
    
    // Scenario identifier: registration_complete, payment_successful, event_reminder, event_cancelled, post_event_followup
    table.string('scenario', 50).notNullable();
    
    // Whether this email is enabled for sending
    table.boolean('is_enabled').defaultTo(true);
    
    // Whether this is an override (false = use global template)
    table.boolean('has_override').defaultTo(false);
    
    // Template content (only used when has_override = true for event-level)
    table.string('subject', 500).nullable();
    table.text('body').nullable();
    
    // Send timing
    table.string('send_timing', 20).defaultTo('immediate'); // 'immediate' | 'scheduled'
    table.integer('schedule_offset').nullable(); // e.g., 24
    table.string('schedule_unit', 20).nullable(); // 'minutes' | 'hours' | 'days'
    
    // Metadata
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.boolean('is_deleted').defaultTo(false);
    
    // Unique constraint: one config per scenario per event (or one global per scenario)
    table.unique(['event_id', 'scenario']);
  });

  // Create index for faster lookups
  await knex.schema.raw(`
    CREATE INDEX idx_email_templates_event_scenario 
    ON email_templates (event_id, scenario) 
    WHERE is_deleted = false
  `);

  // Insert global default templates
  const globalDefaults = [
    {
      event_id: null,
      scenario: 'registration_complete',
      is_enabled: true,
      has_override: true, // Global has the default content
      subject: 'Registration Confirmed - {{event_name}}',
      body: `Hi {{attendee_name}},

Thank you for registering for {{event_name}}!

Event Details:
Date: {{event_date}}
Time: {{event_time}}
Location: {{venue_name}}

Your confirmation number is: {{confirmation_number}}

Best regards,
{{organizer_name}}`,
      send_timing: 'immediate'
    },
    {
      event_id: null,
      scenario: 'payment_successful',
      is_enabled: true,
      has_override: true,
      subject: 'Payment Received - {{event_name}}',
      body: `Hi {{attendee_name}},

Your payment has been successfully processed.

Payment Details:
Amount: {{payment_amount}}
Transaction ID: {{transaction_id}}
Event: {{event_name}}

Your tickets will be sent separately.

Best regards,
{{organizer_name}}`,
      send_timing: 'immediate'
    },
    {
      event_id: null,
      scenario: 'event_reminder',
      is_enabled: true,
      has_override: true,
      subject: 'Reminder: {{event_name}} is Coming Up!',
      body: `Hi {{attendee_name}},

This is a reminder that {{event_name}} is happening soon!

Date: {{event_date}}
Time: {{event_time}}
Location: {{venue_name}}

Don't forget to bring your ticket or confirmation number: {{confirmation_number}}

See you there!
{{organizer_name}}`,
      send_timing: 'scheduled',
      schedule_offset: 24,
      schedule_unit: 'hours'
    },
    {
      event_id: null,
      scenario: 'event_cancelled',
      is_enabled: false,
      has_override: true,
      subject: 'Event Cancelled: {{event_name}}',
      body: `Hi {{attendee_name}},

We regret to inform you that {{event_name}} has been cancelled.

If you have paid for tickets, refunds will be processed within 5-7 business days.

We apologize for any inconvenience caused.

Best regards,
{{organizer_name}}`,
      send_timing: 'immediate'
    },
    {
      event_id: null,
      scenario: 'post_event_followup',
      is_enabled: false,
      has_override: true,
      subject: 'Thank You for Attending {{event_name}}',
      body: `Hi {{attendee_name}},

Thank you for attending {{event_name}}!

We hope you had a great experience. Your feedback is important to us.

We look forward to seeing you at our future events.

Best regards,
{{organizer_name}}`,
      send_timing: 'scheduled',
      schedule_offset: 24,
      schedule_unit: 'hours'
    }
  ];

  await knex('email_templates').insert(globalDefaults);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('email_templates');
}
