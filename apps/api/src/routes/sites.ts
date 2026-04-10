import type { FastifyPluginAsync } from 'fastify';
import { createSite, getSiteById, listSites } from '../services/sitesService.js';

const createSiteSchema = {
  body: {
    type: 'object',
    additionalProperties: false,
    required: ['code', 'name', 'address', 'clientName', 'startDate'],
    properties: {
      code: { type: 'string', minLength: 1 },
      name: { type: 'string', minLength: 1 },
      address: { type: 'string', minLength: 1 },
      clientName: { type: 'string', minLength: 1 },
      latitude: { type: ['number', 'null'] },
      longitude: { type: ['number', 'null'] },
      startDate: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
      expectedEndDate: { type: ['string', 'null'], pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
    },
  },
} as const;

const siteParamsSchema = {
  params: {
    type: 'object',
    additionalProperties: false,
    required: ['siteId'],
    properties: {
      siteId: { type: 'string', minLength: 1 },
    },
  },
} as const;

export const siteRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/sites', async () => ({ items: await listSites(fastify.db) }));

  fastify.get('/sites/:siteId', { schema: siteParamsSchema }, async (request) => {
    const { siteId } = request.params as { siteId: string };
    return { item: await getSiteById(fastify.db, siteId) };
  });

  fastify.post('/sites', { schema: createSiteSchema }, async (request, reply) => {
    const site = await createSite(fastify.db, request.body as Parameters<typeof createSite>[1]);
    reply.code(201);
    return { item: site };
  });
};
