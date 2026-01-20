import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('events', (table) => {
    table.string('meeting_platform').nullable(); // 'zoom', 'google-meet', 'other', null
    table.string('meeting_id').nullable(); // Meeting ID from the platform
    table.string('meeting_password').nullable(); // Meeting password if applicable
    table.jsonb('meeting_provider_payload').nullable(); // Full response from provider for reference
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('events', (table) => {
    table.dropColumn('meeting_platform');
    table.dropColumn('meeting_id');
    table.dropColumn('meeting_password');
    table.dropColumn('meeting_provider_payload');
  });
}
