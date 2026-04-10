import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';

const siteId = '5b4d9c6e-c4df-4bb2-a6f9-f3ac2b881001';
const workers = [
  {
    id: 'd2d44630-6574-4c6f-a46f-e0a7b4ba1001',
    first_name: 'Jean',
    last_name: 'Dupont',
    company_name: 'Compagnon Construction',
    employee_code: 'EMP-001',
    primary_qualification: 'Coffreur',
  },
  {
    id: 'd2d44630-6574-4c6f-a46f-e0a7b4ba1002',
    first_name: 'Paul',
    last_name: 'Martin',
    company_name: 'Sous Traitance ABC',
    employee_code: 'EMP-002',
    primary_qualification: 'Grutier',
  },
  {
    id: 'd2d44630-6574-4c6f-a46f-e0a7b4ba1003',
    first_name: 'Carlos',
    last_name: 'Silva',
    company_name: 'Sous Traitance XYZ',
    employee_code: 'EMP-003',
    primary_qualification: 'Ferrailleur',
  },
];

export async function seed(knex: Knex): Promise<void> {
  const existingSite = await knex('sites').where({ id: siteId }).first();

  if (!existingSite) {
    await knex('sites').insert({
      id: siteId,
      code: 'CH-001',
      name: 'Residence Les Pins',
      address: '12 avenue du Batiment, Montpellier',
      client_name: 'Promotions Mediterranee',
      latitude: 43.610769,
      longitude: 3.876716,
      start_date: '2026-04-01',
      expected_end_date: '2026-12-31',
      status: 'active',
      created_at: '2026-04-10T08:00:00.000Z',
    });
  }

  for (const worker of workers) {
    const existingWorker = await knex('workers').where({ id: worker.id }).first();
    if (!existingWorker) {
      await knex('workers').insert({
        ...worker,
        created_at: '2026-04-10T08:00:00.000Z',
      });
    }
  }

  const today = '2026-04-10';
  const existingJournalDay = await knex('journal_days').where({ site_id: siteId, date: today }).first();

  if (!existingJournalDay) {
    await knex('journal_days').insert({
      id: randomUUID(),
      site_id: siteId,
      date: today,
      report_status: 'draft',
      general_observations: 'Initial seeded journal day for MVP foundation.',
      created_at: '2026-04-10T08:00:00.000Z',
    });
  }
}
