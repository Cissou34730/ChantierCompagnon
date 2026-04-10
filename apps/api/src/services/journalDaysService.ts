import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import type { JournalDay } from '@chantier-compagnon/shared';
import { getSiteById } from './sitesService.js';
import { toIsoUtc } from '../utils/time.js';

type JournalDayRow = {
  id: string;
  site_id: string;
  date: string;
  report_status: JournalDay['reportStatus'];
  general_observations: string | null;
  created_at: string;
};

function mapJournalDay(row: JournalDayRow): JournalDay {
  return {
    id: row.id,
    siteId: row.site_id,
    date: row.date,
    reportStatus: row.report_status,
    generalObservations: row.general_observations,
    createdAt: row.created_at,
  };
}

export async function getOrCreateJournalDay(
  db: Knex,
  siteId: string,
  date: string,
): Promise<JournalDay> {
  await getSiteById(db, siteId);

  const existing = await db<JournalDayRow>('journal_days')
    .where({ site_id: siteId, date })
    .first();

  if (existing) {
    return mapJournalDay(existing);
  }

  const row: JournalDayRow = {
    id: randomUUID(),
    site_id: siteId,
    date,
    report_status: 'draft',
    general_observations: null,
    created_at: toIsoUtc(),
  };

  try {
    await db<JournalDayRow>('journal_days').insert(row);
    return mapJournalDay(row);
  } catch {
    const inserted = await db<JournalDayRow>('journal_days')
      .where({ site_id: siteId, date })
      .first();

    if (!inserted) {
      throw new Error('Journal day creation failed.');
    }

    return mapJournalDay(inserted);
  }
}
