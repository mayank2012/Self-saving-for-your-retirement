import type { FastifyRequest, FastifyReply } from 'fastify';
import { PerformanceMonitor } from '../services/PerformanceMonitor.js';
import type { PerformanceMetrics } from '../types.js';

/**
 * PerformanceController: Exposes system performance metrics.
 */
export class PerformanceController {
  /**
   * GET /performance
   * Return current system performance metrics.
   */
  static async getMetrics(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const monitor = new PerformanceMonitor();
    const metrics = monitor.finalize();

    reply.code(200).send(metrics);
  }

  /**
   * GET /health
   * Health check endpoint.
   */
  static async health(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    reply.code(200).send({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  }
}
