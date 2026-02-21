import { DateTime } from 'luxon';
import type { Expense, Transaction, QPeriod, PPeriod } from '../types.js';
import {
  parseDate,
  findMatchingQPeriods,
  findMatchingPPeriods,
} from '../utils/dateUtils.js';

/**
 * RemanentCalculator: Implements the core remanent calculation logic.
 * 
 * Remanent = ceiling - amount
 * where ceiling = Math.ceil(amount / 100) * 100
 * 
 * Applied with q-period and p-period overrides.
 */
export class RemanentCalculator {
  /**
   * Calculate ceiling and remanent for a single expense.
   */
  static calculateRemanent(amount: number): { ceiling: number; remanent: number } {
    const ceiling = Math.ceil(amount / 100) * 100;
    const remanent = ceiling - amount;
    return { ceiling, remanent };
  }

  /**
   * Convert expenses to transactions with remanent calculation.
   * Then apply q-period and p-period rules.
   */
  static processExpenses(
    expenses: Expense[],
    qPeriods: QPeriod[],
    pPeriods: PPeriod[]
  ): Transaction[] {
    return expenses.map((expense) => {
      const expenseDate = parseDate(expense.date);
      const { ceiling, remanent } = this.calculateRemanent(expense.amount);

      let finalRemanent = remanent;

      // Apply Q-period rule: latest matching q-period's fixed value overrides remanent
      const matchingQPeriods = findMatchingQPeriods(expenseDate, qPeriods);
      if (matchingQPeriods.length > 0) {
        // matchingQPeriods are sorted by start date descending, so first is latest
        finalRemanent = matchingQPeriods[0].fixed;
      }

      // Apply P-period rule: sum all matching p-periods' extra values and add to remanent
      const matchingPPeriods = findMatchingPPeriods(expenseDate, pPeriods);
      const totalExtra = matchingPPeriods.reduce((sum, p) => sum + p.extra, 0);
      finalRemanent += totalExtra;

      return {
        date: expense.date,
        amount: expense.amount,
        ceiling,
        remanent: finalRemanent,
      };
    });
  }

  /**
   * Sum remanents for a filtered set of transactions.
   */
  static sumRemanents(transactions: Transaction[]): number {
    return transactions.reduce((sum, tx) => sum + tx.remanent, 0);
  }
}
