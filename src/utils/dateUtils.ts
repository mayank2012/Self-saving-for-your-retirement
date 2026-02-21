import { DateTime } from 'luxon';
import type { Expense, QPeriod, PPeriod, KPeriod, Transaction } from '../types.js';

// ==================== DATE UTILITIES ====================

export function parseDate(dateStr: string): DateTime {
  const dt = DateTime.fromISO(dateStr);
  if (!dt.isValid) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }
  return dt;
}

export function isDateInRange(
  date: DateTime,
  startStr: string,
  endStr: string
): boolean {
  const start = parseDate(startStr);
  const end = parseDate(endStr);
  return date >= start && date <= end;
}

export function formatDate(dt: DateTime): string {
  const iso = dt.toISO();
  if (!iso) throw new Error('Failed to convert date to ISO format');
  return iso;
}

// ==================== VALIDATION UTILITIES ====================

export function validateExpense(expense: Expense): string[] {
  const errors: string[] = [];
  
  try {
    parseDate(expense.date);
  } catch {
    errors.push(`Invalid date: ${expense.date}`);
  }

  if (expense.amount <= 0) {
    errors.push(`Amount must be positive, got: ${expense.amount}`);
  }

  if (expense.amount >= 500000) {
    errors.push(`Amount must be less than 500,000, got: ${expense.amount}`);
  }

  return errors;
}

export function validatePeriod(period: QPeriod | PPeriod | KPeriod): string[] {
  const errors: string[] = [];

  try {
    parseDate(period.start);
  } catch {
    errors.push(`Invalid start date: ${period.start}`);
  }

  try {
    parseDate(period.end);
  } catch {
    errors.push(`Invalid end date: ${period.end}`);
  }

  const start = parseDate(period.start);
  const end = parseDate(period.end);
  
  if (start > end) {
    errors.push(`Start date must be before end date`);
  }

  return errors;
}

export function findDuplicateTimestamps(expenses: Expense[]): string[] {
  const seen = new Map<string, number>();
  const duplicates: string[] = [];

  for (const expense of expenses) {
    const key = expense.date;
    if (seen.has(key)) {
      if (!duplicates.includes(key)) {
        duplicates.push(key);
      }
    } else {
      seen.set(key, 1);
    }
  }

  return duplicates;
}

// ==================== PERIOD LOOKUPS ====================

/**
 * Find all Q-periods that match a transaction date.
 * Returns periods sorted by start date descending (latest first).
 */
export function findMatchingQPeriods(
  transactionDate: DateTime,
  qPeriods: QPeriod[]
): QPeriod[] {
  return qPeriods
    .filter((period) => isDateInRange(transactionDate, period.start, period.end))
    .sort((a, b) => parseDate(b.start).toMillis() - parseDate(a.start).toMillis());
}

/**
 * Find all P-periods that match a transaction date.
 */
export function findMatchingPPeriods(
  transactionDate: DateTime,
  pPeriods: PPeriod[]
): PPeriod[] {
  return pPeriods.filter((period) =>
    isDateInRange(transactionDate, period.start, period.end)
  );
}

/**
 * Partition transactions by K-periods.
 * A transaction belongs to a K-period if its date falls within that period.
 */
export function partitionByKPeriods(
  transactions: Transaction[],
  kPeriods: KPeriod[]
): Map<number, Transaction[]> {
  const groups = new Map<number, Transaction[]>();

  kPeriods.forEach((period, idx) => {
    const start = parseDate(period.start);
    const end = parseDate(period.end);
    const filtered = transactions.filter((tx) => {
      const txDate = parseDate(tx.date);
      return txDate >= start && txDate <= end;
    });
    if (filtered.length > 0) {
      groups.set(idx, filtered);
    }
  });

  return groups;
}
