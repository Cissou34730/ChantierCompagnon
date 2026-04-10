import fp from 'fastify-plugin';
import type { Knex } from 'knex';
import { createDatabaseClient } from '../db/client.js';

declare module 'fastify' {
  interface FastifyInstance {
    db: Knex;
  }
}

export const dbPlugin = fp(async (fastify) => {
  const db = await createDatabaseClient();
  fastify.decorate('db', db);

  fastify.addHook('onClose', async (instance) => {
    await instance.db.destroy();
  });
});
