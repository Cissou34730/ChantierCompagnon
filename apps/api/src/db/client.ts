import fs from 'node:fs/promises';
import knex, { type Knex } from 'knex';
import { createKnexConfig, databasePaths } from './config.js';

export async function createDatabaseClient(): Promise<Knex> {
  await fs.mkdir(databasePaths.dataDirectory, { recursive: true });

  const db = knex(createKnexConfig());
  await db.raw('PRAGMA journal_mode = WAL');
  await db.migrate.latest();
  await db.seed.run();
  return db;
}
