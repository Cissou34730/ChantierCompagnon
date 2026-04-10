import type { FastifyPluginAsync } from 'fastify';
import { getOrCreateJournalDay } from '../services/journalDaysService.js';
import { badRequest } from '../utils/httpErrors.js';
import { isIsoDate } from '../utils/validation.js';

const journalDaySchema = {
  params: {
    type: 'object',
    additionalProperties: false,
    required: ['siteId', 'date'],
    properties: {
      siteId: { type: 'string', minLength: 1 },
      date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
    },
  },
} as const;

export const journalDayRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/sites/:siteId/journal-days/:date',
    { schema: journalDaySchema },
    async (request) => {
      const { siteId, date } = request.params as { siteId: string; date: string };

      if (!isIsoDate(date)) {
        throw badRequest('Date must be formatted as YYYY-MM-DD.', { date });
      }

      return { item: await getOrCreateJournalDay(fastify.db, siteId, date) };
    },
  );
};
