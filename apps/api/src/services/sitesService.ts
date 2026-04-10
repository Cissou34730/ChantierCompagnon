import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import type { CreateSiteRequest, Site } from '@chantier-compagnon/shared';
import { notFound } from '../utils/httpErrors.js';
import { toIsoUtc } from '../utils/time.js';

type SiteRow = {
  id: string;
  code: string;
  name: string;
  address: string;
  client_name: string;
  latitude: number | null;
  longitude: number | null;
  start_date: string;
  expected_end_date: string | null;
  status: Site['status'];
  created_at: string;
};

function mapSite(row: SiteRow): Site {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    address: row.address,
    clientName: row.client_name,
    latitude: row.latitude,
    longitude: row.longitude,
    startDate: row.start_date,
    expectedEndDate: row.expected_end_date,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function listSites(db: Knex): Promise<Site[]> {
  const rows = await db<SiteRow>('sites').select('*').orderBy('name', 'asc');
  return rows.map(mapSite);
}

export async function getSiteById(db: Knex, siteId: string): Promise<Site> {
  const row = await db<SiteRow>('sites').where({ id: siteId }).first();

  if (!row) {
    throw notFound('Site not found.', { siteId });
  }

  return mapSite(row);
}

export async function createSite(db: Knex, input: CreateSiteRequest): Promise<Site> {
  const row: SiteRow = {
    id: randomUUID(),
    code: input.code,
    name: input.name,
    address: input.address,
    client_name: input.clientName,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    start_date: input.startDate,
    expected_end_date: input.expectedEndDate ?? null,
    status: 'active',
    created_at: toIsoUtc(),
  };

  await db<SiteRow>('sites').insert(row);
  return mapSite(row);
}
