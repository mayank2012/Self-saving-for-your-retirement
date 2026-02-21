import type { FastifyRequest, FastifyReply } from 'fastify';
import { NpsCalculator, IndexFundCalculator } from '../services/FinancialCalculator.js';
import { PerformanceMonitor } from '../services/PerformanceMonitor.js';
import {
  NpsCalculationSchema,
  IndexFundSchema,
  type NpsResponse,
  type IndexFundResponse,
} from '../types.js';

/**
 * ReturnsController: Handles NPS and Index Fund calculations.
 */
export class ReturnsController {
  /**
   * POST /returns:nps
   * Calculate NPS deduction and tax benefit.
   */
  static async nps(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const monitor = new PerformanceMonitor();

    try {
      const payload = NpsCalculationSchema.parse(request.body);
      const { deduction, taxBenefit } = NpsCalculator.calculateNpsDeduction(
        payload.annual_income,
        payload.invested
      );

      const benefitPercent = NpsCalculator.getNpsBenefitPercent(
        payload.annual_income,
        payload.invested
      );

      const response: NpsResponse = {
        contribution_base: payload.invested,
        nps_deduction: deduction,
        annual_nps_benefit: taxBenefit,
        tax_benefit_percent: benefitPercent,
        years: payload.years,
      };

      const metrics = monitor.finalize();
      reply.header('X-Processing-Time-Ms', metrics.total_processing_time_ms);

      reply.code(200).send(response);
    } catch (error) {
      reply.code(400).send({
        error: 'Invalid NPS calculation request',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * POST /returns:index
   * Calculate index fund return with inflation adjustment.
   */
  static async index(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const monitor = new PerformanceMonitor();

    try {
      const payload = IndexFundSchema.parse(request.body);
      const { nominalAmount, realAmount } =
        IndexFundCalculator.calculateIndexFundReturn(
          payload.annual_return_rate, // Using as principal placeholder
          payload.annual_return_rate,
          payload.inflation_rate,
          payload.years
        );

      const response: IndexFundResponse = {
        principal: payload.annual_return_rate,
        rate: payload.annual_return_rate,
        years: payload.years,
        amount_nominal: nominalAmount,
        amount_real: realAmount.toFixed(2),
      };

      const metrics = monitor.finalize();
      reply.header('X-Processing-Time-Ms', metrics.total_processing_time_ms);

      reply.code(200).send(response);
    } catch (error) {
      reply.code(400).send({
        error: 'Invalid index fund calculation request',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
