import type { Knex } from 'knex';
import {
  ATTENDANCE_STATUSES,
  INPUT_SOURCES,
  PHOTO_CATEGORIES,
  PHOTO_LINKED_ENTITY_TYPES,
  REPORT_STATUSES,
  SAFETY_CATEGORIES,
  SAFETY_SEVERITIES,
  SITE_STATUSES,
  WEATHER_CONDITIONS,
  WEATHER_IMPACTS,
  WEATHER_PERIODS,
  WEATHER_SOURCES,
  PRECIPITATION_INTENSITIES,
} from '@chantier-compagnon/shared';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('sites', (table) => {
    table.text('id').primary();
    table.text('code').notNullable().unique();
    table.text('name').notNullable();
    table.text('address').notNullable();
    table.text('client_name').notNullable();
    table.float('latitude').nullable();
    table.float('longitude').nullable();
    table.text('start_date').notNullable();
    table.text('expected_end_date').nullable();
    table.enu('status', SITE_STATUSES).notNullable();
    table.text('created_at').notNullable();
  });

  await knex.schema.createTable('journal_days', (table) => {
    table.text('id').primary();
    table.text('site_id').notNullable().references('id').inTable('sites').onDelete('CASCADE');
    table.text('date').notNullable();
    table.enu('report_status', REPORT_STATUSES).notNullable();
    table.text('general_observations').nullable();
    table.text('created_at').notNullable();
    table.unique(['site_id', 'date']);
    table.index(['site_id']);
  });

  await knex.schema.createTable('workers', (table) => {
    table.text('id').primary();
    table.text('first_name').notNullable();
    table.text('last_name').notNullable();
    table.text('company_name').notNullable();
    table.text('employee_code').nullable();
    table.text('primary_qualification').nullable();
    table.text('created_at').notNullable();
  });

  await knex.schema.createTable('attendance_entries', (table) => {
    table.text('id').primary();
    table
      .text('journal_day_id')
      .notNullable()
      .references('id')
      .inTable('journal_days')
      .onDelete('CASCADE');
    table.text('worker_id').notNullable().references('id').inTable('workers').onDelete('CASCADE');
    table.text('arrival_time').nullable();
    table.text('departure_time').nullable();
    table.enu('status', ATTENDANCE_STATUSES).notNullable();
    table.text('assigned_task').nullable();
    table.text('comment').nullable();
    table.enu('input_source', INPUT_SOURCES).notNullable();
    table.text('created_at').notNullable();
    table.index(['journal_day_id']);
    table.index(['worker_id']);
  });

  await knex.schema.createTable('weather_entries', (table) => {
    table.text('id').primary();
    table
      .text('journal_day_id')
      .notNullable()
      .references('id')
      .inTable('journal_days')
      .onDelete('CASCADE');
    table.enu('period', WEATHER_PERIODS).notNullable();
    table.text('recorded_at_time').notNullable();
    table.float('temperature_celsius').notNullable();
    table.float('wind_kmh').nullable();
    table.enu('condition', WEATHER_CONDITIONS).notNullable();
    table.text('precipitation_type').nullable();
    table.enu('precipitation_intensity', PRECIPITATION_INTENSITIES).nullable();
    table.enu('impact', WEATHER_IMPACTS).notNullable();
    table.text('impact_comment').nullable();
    table.enu('source', WEATHER_SOURCES).notNullable();
    table.text('created_at').notNullable();
    table.index(['journal_day_id']);
  });

  await knex.schema.createTable('safety_incidents', (table) => {
    table.text('id').primary();
    table
      .text('journal_day_id')
      .notNullable()
      .references('id')
      .inTable('journal_days')
      .onDelete('CASCADE');
    table.text('occurred_at').notNullable();
    table.text('location').notNullable();
    table.text('description').notNullable();
    table.enu('category', SAFETY_CATEGORIES).notNullable();
    table.enu('potential_severity', SAFETY_SEVERITIES).notNullable();
    table.text('involved_people').nullable();
    table.text('witnesses').nullable();
    table.text('immediate_actions').nullable();
    table.text('planned_actions').nullable();
    table.text('action_owner').nullable();
    table.text('action_due_date').nullable();
    table.enu('input_source', INPUT_SOURCES).notNullable();
    table.text('created_at').notNullable();
    table.index(['journal_day_id']);
    table.index(['potential_severity']);
    table.index(['category']);
  });

  await knex.schema.createTable('photos', (table) => {
    table.text('id').primary();
    table
      .text('journal_day_id')
      .notNullable()
      .references('id')
      .inTable('journal_days')
      .onDelete('CASCADE');
    table.text('file_path').notNullable();
    table.text('original_file_name').notNullable();
    table.text('mime_type').notNullable();
    table.text('captured_at').notNullable();
    table.enu('category', PHOTO_CATEGORIES).notNullable();
    table.text('description').nullable();
    table.float('latitude').nullable();
    table.float('longitude').nullable();
    table.text('linked_entity_id').nullable();
    table.enu('linked_entity_type', PHOTO_LINKED_ENTITY_TYPES).nullable();
    table.text('created_at').notNullable();
    table.index(['journal_day_id']);
    table.index(['category']);
    table.index(['linked_entity_id']);
  });

  await knex.schema.createTable('daily_reports', (table) => {
    table.text('id').primary();
    table
      .text('journal_day_id')
      .notNullable()
      .unique()
      .references('id')
      .inTable('journal_days')
      .onDelete('CASCADE');
    table.enu('status', REPORT_STATUSES).notNullable();
    table.text('content_markdown').notNullable();
    table.text('generated_at').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('daily_reports');
  await knex.schema.dropTableIfExists('photos');
  await knex.schema.dropTableIfExists('safety_incidents');
  await knex.schema.dropTableIfExists('weather_entries');
  await knex.schema.dropTableIfExists('attendance_entries');
  await knex.schema.dropTableIfExists('workers');
  await knex.schema.dropTableIfExists('journal_days');
  await knex.schema.dropTableIfExists('sites');
}
