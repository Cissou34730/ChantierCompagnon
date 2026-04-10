import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Knex } from 'knex';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const dataDirectory = path.resolve(currentDirectory, '../../data');
const databaseFilePath = path.join(dataDirectory, 'chantier-compagnon.sqlite');

export const databasePaths = {
  dataDirectory,
  databaseFilePath,
  migrationsDirectory: path.join(currentDirectory, 'migrations'),
  seedsDirectory: path.join(currentDirectory, 'seeds'),
};

export function createKnexConfig(): Knex.Config {
  return {
    client: 'better-sqlite3',
    connection: {
      filename: databasePaths.databaseFilePath,
    },
    useNullAsDefault: true,
    migrations: {
      directory: databasePaths.migrationsDirectory,
      extension: 'ts',
    },
    seeds: {
      directory: databasePaths.seedsDirectory,
      extension: 'ts',
    },
    pool: {
      afterCreate(
        connection: { pragma: (statement: string) => void },
        done: (error: Error | null, connection: unknown) => void,
      ) {
        connection.pragma('foreign_keys = ON');
        done(null, connection);
      },
    },
  };
}
