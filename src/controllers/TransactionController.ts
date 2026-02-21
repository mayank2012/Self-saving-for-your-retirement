import type { FastifyRequest, FastifyReply } from 'fastify';
import { RemanentCalculator } from '../services/RemanentCalculator.js';
import { PerformanceMonitor } from '../services/PerformanceMonitor.js';
import {
  TransactionPayloadSchema,
  type ParseResponse,
  type ValidationResult,
  type FilterResponse,
} from '../types.js';
import {
  validateExpense,
  findDuplicateTimestamps,
  validatePeriod,
  partitionByKPeriods,
} from '../utils/dateUtils.js';

/**
 * TransactionController: Handles parsing, validation, and filtering of transactions.
 */
export class TransactionController {
  /**
   * POST /transactions:parse
   * Parse expenses into transactions with remanent calculations.
   */
  static async parse(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const monitor = new PerformanceMonitor();

    try {
      const payload = TransactionPayloadSchema.parse(request.body);

      // Process expenses through remanent calculator
      const transactions = RemanentCalculator.processExpenses(
        payload.expenses,
        payload.q_periods,
        payload.p_periods
      );

      const response: ParseResponse = {
        transactions,
        count: transactions.length,
        timestamp: new Date().toISOString(),
      };

      const metrics = monitor.finalize();
      reply.header('X-Processing-Time-Ms', metrics.total_processing_time_ms);
      reply.header('X-Memory-Used-Mb', metrics.memory_used_mb.toFixed(2));

      reply.code(200).send(response);
    } catch (error) {
      reply.code(400).send({
        error: 'Invalid payload',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * POST /transactions:validator
   * Validate all constraints and detect duplicates.
   */
  static async validator(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const monitor = new PerformanceMonitor();

    try {
      const payload = TransactionPayloadSchema.parse(request.body);
      const errors: string[] = [];
      const duplicates = findDuplicateTimestamps(payload.expenses);

      // Validate all expenses
      for (const expense of payload.expenses) {
        const expenseErrors = validateExpense(expense);
        errors.push(...expenseErrors);
      }

      // Validate all periods
      for (const qPeriod of payload.q_periods) {
        const qErrors = validatePeriod(qPeriod);
        errors.push(...qErrors);
      }

      for (const pPeriod of payload.p_periods) {
        const pErrors = validatePeriod(pPeriod);
        errors.push(...pErrors);
      }

      for (const kPeriod of payload.k_periods) {
        const kErrors = validatePeriod(kPeriod);
        errors.push(...kErrors);
      }

      const result: ValidationResult = {
        valid: errors.length === 0 && duplicates.length === 0,
        errors,
        duplicates_detected: duplicates,
        transaction_count: payload.expenses.length,
      };

      const metrics = monitor.finalize();
      reply.header('X-Processing-Time-Ms', metrics.total_processing_time_ms);

      reply.code(result.valid ? 200 : 422).send(result);
    } catch (error) {
      reply.code(400).send({
        error: 'Invalid payload',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * POST /transactions:filter
   * Apply q, p, k period filtering and return grouped results.
   */
  static async filter(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const monitor = new PerformanceMonitor();

    try {
      const payload = TransactionPayloadSchema.parse(request.body);

      // Process into transactions
      const transactions = RemanentCalculator.processExpenses(
        payload.expenses,
        payload.q_periods,
        payload.p_periods
      );

      // Partition by k-periods
      const kGroups = partitionByKPeriods(transactions, payload.k_periods);
      const kPeriodGroups: Record<string, typeof transactions> = {};

      kGroups.forEach((txs, idx) => {
        kPeriodGroups[`k_period_${idx}`] = txs;
      });

      const response: FilterResponse = {
        filtered_transactions: transactions,
        k_period_groups: kPeriodGroups,
      };

      const metrics = monitor.finalize();
      reply.header('X-Processing-Time-Ms', metrics.total_processing_time_ms);
      reply.header('X-Memory-Used-Mb', metrics.memory_used_mb.toFixed(2));

      reply.code(200).send(response);
    } catch (error) {
      reply.code(400).send({
        error: 'Invalid payload',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
