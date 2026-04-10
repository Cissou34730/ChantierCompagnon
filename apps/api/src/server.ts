import Fastify from 'fastify';
import { fileURLToPath } from 'node:url';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import type { ApiErrorResponse } from '@chantier-compagnon/shared';
import { dbPlugin } from './plugins/db.js';
import { healthRoutes } from './routes/health.js';
import { journalDayRoutes } from './routes/journalDays.js';
import { siteRoutes } from './routes/sites.js';
import { HttpError } from './utils/httpErrors.js';

export async function buildServer() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: true,
  });

  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024,
      files: 1,
    },
  });

  await app.register(dbPlugin);

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof HttpError) {
      const errorPayload: ApiErrorResponse['error'] = {
        code: error.code,
        message: error.message,
      };

      if (error.details !== undefined) {
        errorPayload.details = error.details;
      }

      const payload: ApiErrorResponse = {
        error: errorPayload,
      };

      reply.status(error.statusCode).send(payload);
      return;
    }

    if (typeof error === 'object' && error !== null && 'validation' in error) {
      const payload: ApiErrorResponse = {
        error: {
          code: 'validation_error',
          message: 'Request validation failed.',
          details: { issues: (error as { validation?: unknown }).validation },
        },
      };

      reply.status(400).send(payload);
      return;
    }

    request.log.error(error);
    reply.status(500).send({
      error: {
        code: 'internal_error',
        message: 'An unexpected error occurred.',
      },
    } satisfies ApiErrorResponse);
  });

  await app.register(healthRoutes);
  await app.register(siteRoutes, { prefix: '/api' });
  await app.register(journalDayRoutes, { prefix: '/api' });

  return app;
}

async function start() {
  const app = await buildServer();
  const port = Number(process.env.PORT ?? '3001');
  const host = process.env.HOST ?? '0.0.0.0';
  await app.listen({ port, host });
}

const currentFilePath = fileURLToPath(import.meta.url);

if (process.argv[1] && currentFilePath === process.argv[1]) {
  start().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

