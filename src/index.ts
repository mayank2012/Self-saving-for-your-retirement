import Fastify from 'fastify';
import { TransactionController } from './controllers/TransactionController.js';
import { ReturnsController } from './controllers/ReturnsController.js';
import { PerformanceController } from './controllers/PerformanceController.js';

const PORT = 5477;
const HOST = '0.0.0.0';

/**
 * Initialize and start the Fastify server.
 */
async function main() {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport:
        process.env.NODE_ENV === 'production'
          ? undefined
          : {
              target: 'pino-pretty',
              options: {
                colorize: true,
              },
            },
    },
  });

  // ==================== TRANSACTION ENDPOINTS ====================

  /**
   * POST /api/transactions/parse
   * Parse expenses and calculate remanents.
   */
  fastify.post('/api/transactions/parse', async (request, reply) => {
    return TransactionController.parse(request, reply);
  });

  /**
   * POST /api/transactions/validate
   * Validate transaction payload and detect duplicates.
   */
  fastify.post('/api/transactions/validate', async (request, reply) => {
    return TransactionController.validator(request, reply);
  });

  /**
   * POST /api/transactions/filter
   * Filter transactions by q/p/k periods.
   */
  fastify.post('/api/transactions/filter', async (request, reply) => {
    return TransactionController.filter(request, reply);
  });

  // ==================== RETURNS ENDPOINTS ====================

  /**
   * POST /api/returns/nps
   * Calculate NPS deduction and tax benefit.
   */
  fastify.post('/api/returns/nps', async (request, reply) => {
    return ReturnsController.nps(request, reply);
  });

  /**
   * POST /api/returns/index
   * Calculate index fund returns with inflation adjustment.
   */
  fastify.post('/api/returns/index', async (request, reply) => {
    return ReturnsController.index(request, reply);
  });

  // ==================== HEALTH & PERFORMANCE ENDPOINTS ====================

  /**
   * GET /health
   * Health check endpoint for Docker container.
   */
  fastify.get('/health', async (request, reply) => {
    return PerformanceController.health(request, reply);
  });

  /**
   * GET /performance
   * System performance metrics.
   */
  fastify.get('/performance', async (request, reply) => {
    return PerformanceController.getMetrics(request, reply);
  });

  /**
   * GET /docs (API documentation)
   */
  fastify.get('/docs', async (request, reply) => {
    return {
      title: 'BlackRock Retirement Auto-Savings API',
      version: '1.0.0',
      baseUrl: 'http://localhost:5477',
      endpoints: {
        transactions: {
          parse: 'POST /api/transactions/parse',
          validate: 'POST /api/transactions/validate',
          filter: 'POST /api/transactions/filter',
        },
        returns: {
          nps: 'POST /api/returns/nps',
          index: 'POST /api/returns/index',
        },
        health: {
          check: 'GET /health',
          metrics: 'GET /performance',
          docs: 'GET /docs',
        },
      },
    };
  });

  try {
    await fastify.listen({ port: PORT, host: HOST });
    fastify.log.info(`Server listening on http://${HOST}:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main();
