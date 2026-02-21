import { describe, it, expect } from 'vitest';
import {
  parseDate,
  isDateInRange,
  findDuplicateTimestamps,
  findMatchingQPeriods,
  findMatchingPPeriods,
  partitionByKPeriods,
} from '../../src/utils/dateUtils';
import type { QPeriod, PPeriod, KPeriod, Transaction } from '../../src/types';

describe('dateUtils', () => {
  describe('parseDate', () => {
    it('should parse valid ISO date strings', () => {
      const date = parseDate('2024-01-15T10:30:00Z');
      expect(date.isValid).toBe(true);
      expect(date.year).toBe(2024);
      expect(date.month).toBe(1);
    });

    it('should throw on invalid date strings', () => {
      expect(() => parseDate('not-a-date')).toThrow();
    });
  });

  describe('isDateInRange', () => {
    it('should return true if date is within range', () => {
      const date = parseDate('2024-01-15T10:00:00Z');
      const result = isDateInRange(
        date,
        '2024-01-01T00:00:00Z',
        '2024-01-31T23:59:59Z'
      );
      expect(result).toBe(true);
    });

    it('should return true if date equals start', () => {
      const date = parseDate('2024-01-01T00:00:00Z');
      const result = isDateInRange(
        date,
        '2024-01-01T00:00:00Z',
        '2024-01-31T23:59:59Z'
      );
      expect(result).toBe(true);
    });

    it('should return true if date equals end', () => {
      const date = parseDate('2024-01-31T23:59:59Z');
      const result = isDateInRange(
        date,
        '2024-01-01T00:00:00Z',
        '2024-01-31T23:59:59Z'
      );
      expect(result).toBe(true);
    });

    it('should return false if date is before range', () => {
      const date = parseDate('2023-12-31T23:59:59Z');
      const result = isDateInRange(
        date,
        '2024-01-01T00:00:00Z',
        '2024-01-31T23:59:59Z'
      );
      expect(result).toBe(false);
    });

    it('should return false if date is after range', () => {
      const date = parseDate('2024-02-01T00:00:00Z');
      const result = isDateInRange(
        date,
        '2024-01-01T00:00:00Z',
        '2024-01-31T23:59:59Z'
      );
      expect(result).toBe(false);
    });
  });

  describe('findDuplicateTimestamps', () => {
    it('should detect duplicate timestamps', () => {
      const expenses = [
        { date: '2024-01-15T10:00:00Z', amount: 100 },
        { date: '2024-01-16T10:00:00Z', amount: 200 },
        { date: '2024-01-15T10:00:00Z', amount: 150 },
      ];

      const duplicates = findDuplicateTimestamps(expenses);
      expect(duplicates).toContain('2024-01-15T10:00:00Z');
      expect(duplicates.length).toBe(1);
    });

    it('should return empty if no duplicates', () => {
      const expenses = [
        { date: '2024-01-15T10:00:00Z', amount: 100 },
        { date: '2024-01-16T10:00:00Z', amount: 200 },
      ];

      const duplicates = findDuplicateTimestamps(expenses);
      expect(duplicates.length).toBe(0);
    });
  });

  describe('findMatchingQPeriods', () => {
    it('should find matching q-periods sorted by start date descending', () => {
      const date = parseDate('2024-01-15T10:00:00Z');
      const qPeriods: QPeriod[] = [
        {
          fixed: 50,
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-31T23:59:59Z',
        },
        {
          fixed: 75,
          start: '2024-01-10T00:00:00Z',
          end: '2024-01-20T23:59:59Z',
        },
      ];

      const matches = findMatchingQPeriods(date, qPeriods);
      expect(matches.length).toBe(2);
      expect(matches[0].fixed).toBe(75); // Latest start wins
    });

    it('should return empty if no periods match', () => {
      const date = parseDate('2024-02-15T10:00:00Z');
      const qPeriods: QPeriod[] = [
        {
          fixed: 50,
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-31T23:59:59Z',
        },
      ];

      const matches = findMatchingQPeriods(date, qPeriods);
      expect(matches.length).toBe(0);
    });
  });

  describe('findMatchingPPeriods', () => {
    it('should find all matching p-periods', () => {
      const date = parseDate('2024-01-15T10:00:00Z');
      const pPeriods: PPeriod[] = [
        {
          extra: 25,
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-31T23:59:59Z',
        },
        {
          extra: 10,
          start: '2024-01-10T00:00:00Z',
          end: '2024-01-20T23:59:59Z',
        },
      ];

      const matches = findMatchingPPeriods(date, pPeriods);
      expect(matches.length).toBe(2);
    });
  });

  describe('partitionByKPeriods', () => {
    it('should partition transactions by k-periods', () => {
      const transactions: Transaction[] = [
        {
          date: '2024-01-15T10:00:00Z',
          amount: 100,
          ceiling: 100,
          remanent: 0,
        },
        {
          date: '2024-02-15T10:00:00Z',
          amount: 200,
          ceiling: 200,
          remanent: 0,
        },
        {
          date: '2024-03-15T10:00:00Z',
          amount: 300,
          ceiling: 300,
          remanent: 0,
        },
      ];

      const kPeriods: KPeriod[] = [
        { start: '2024-01-01T00:00:00Z', end: '2024-01-31T23:59:59Z' },
        { start: '2024-02-01T00:00:00Z', end: '2024-02-29T23:59:59Z' },
      ];

      const groups = partitionByKPeriods(transactions, kPeriods);
      expect(groups.size).toBe(2);
      expect(groups.get(0)).toHaveLength(1);
      expect(groups.get(1)).toHaveLength(1);
    });
  });
});
