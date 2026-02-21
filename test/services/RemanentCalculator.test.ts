import { describe, it, expect } from 'vitest';
import { RemanentCalculator } from '../../src/services/RemanentCalculator';

describe('RemanentCalculator', () => {
  describe('calculateRemanent', () => {
    it('should calculate ceiling and remanent correctly', () => {
      const { ceiling, remanent } = RemanentCalculator.calculateRemanent(250);
      expect(ceiling).toBe(300);
      expect(remanent).toBe(50);
    });

    it('should handle exact multiples of 100', () => {
      const { ceiling, remanent } = RemanentCalculator.calculateRemanent(500);
      expect(ceiling).toBe(500);
      expect(remanent).toBe(0);
    });

    it('should handle small amounts', () => {
      const { ceiling, remanent } = RemanentCalculator.calculateRemanent(1);
      expect(ceiling).toBe(100);
      expect(remanent).toBe(99);
    });

    it('should handle large amounts', () => {
      const { ceiling, remanent } = RemanentCalculator.calculateRemanent(123456);
      expect(ceiling).toBe(123500);
      expect(remanent).toBe(44);
    });
  });

  describe('processExpenses', () => {
    it('should process expenses with no period rules', () => {
      const expenses = [
        { date: '2024-01-15T10:00:00Z', amount: 250 },
      ];

      const transactions = RemanentCalculator.processExpenses(expenses, [], []);

      expect(transactions).toHaveLength(1);
      expect(transactions[0].ceiling).toBe(300);
      expect(transactions[0].remanent).toBe(50);
    });

    it('should apply q-period override to latest matching period', () => {
      const expenses = [
        { date: '2024-01-15T10:00:00Z', amount: 250 },
      ];

      const qPeriods = [
        {
          fixed: 75,
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-31T23:59:59Z',
        },
      ];

      const transactions = RemanentCalculator.processExpenses(
        expenses,
        qPeriods,
        []
      );

      expect(transactions[0].remanent).toBe(75); // q-period override
    });

    it('should sum multiple p-period extras', () => {
      const expenses = [
        { date: '2024-01-15T10:00:00Z', amount: 250 },
      ];

      const pPeriods = [
        {
          extra: 25,
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-31T23:59:59Z',
        },
        {
          extra: 15,
          start: '2024-01-10T00:00:00Z',
          end: '2024-01-20T23:59:59Z',
        },
      ];

      const transactions = RemanentCalculator.processExpenses(
        expenses,
        [],
        pPeriods
      );

      expect(transactions[0].remanent).toBe(50 + 25 + 15); // base + both extras
    });
  });

  describe('sumRemanents', () => {
    it('should sum remanents correctly', () => {
      const transactions = [
        {
          date: '2024-01-15T10:00:00Z',
          amount: 250,
          ceiling: 300,
          remanent: 50,
        },
        {
          date: '2024-01-20T10:00:00Z',
          amount: 100,
          ceiling: 100,
          remanent: 0,
        },
        {
          date: '2024-01-25T10:00:00Z',
          amount: 350,
          ceiling: 400,
          remanent: 50,
        },
      ];

      const sum = RemanentCalculator.sumRemanents(transactions);
      expect(sum).toBe(100);
    });
  });
});
