import { describe, it, expect } from 'vitest';
import {
  TaxCalculator,
  NpsCalculator,
  IndexFundCalculator,
} from '../../src/services/FinancialCalculator';

describe('TaxCalculator', () => {
  it('should calculate tax for income below 700k (0%)', () => {
    const tax = TaxCalculator.calculateTax(500000);
    expect(tax).toBe(0);
  });

  it('should calculate tax for income in 700k-1M slab (5%)', () => {
    const tax = TaxCalculator.calculateTax(800000);
    expect(tax).toBe((800000 - 700000) * 0.05); // 5000
  });

  it('should calculate tax for income in 1M-1.2M slab (10%)', () => {
    const tax = TaxCalculator.calculateTax(1100000);
    const expected =
      (1000000 - 700000) * 0.05 + (1100000 - 1000000) * 0.1;
    expect(tax).toBe(expected);
  });

  it('should handle high income correctly', () => {
    const tax = TaxCalculator.calculateTax(2000000);
    const expected =
      (1000000 - 700000) * 0.05 +
      (1200000 - 1000000) * 0.1 +
      (1500000 - 1200000) * 0.15 +
      (2000000 - 1500000) * 0.3;
    expect(tax).toBe(expected);
  });
});

describe('NpsCalculator', () => {
  it('should calculate NPS deduction capped at 10% of income', () => {
    const { deduction } = NpsCalculator.calculateNpsDeduction(
      1000000,
      150000
    );
    expect(deduction).toBeLessThanOrEqual(100000); // 10% of 1M or less
  });

  it('should calculate NPS deduction capped at 200k', () => {
    const { deduction } = NpsCalculator.calculateNpsDeduction(
      5000000,
      250000
    );
    expect(deduction).toBeLessThanOrEqual(200000); // capped at 200k
  });

  it('should use invested amount if less than both limits', () => {
    const { deduction } = NpsCalculator.calculateNpsDeduction(
      1000000,
      50000
    );
    expect(deduction).toBeLessThanOrEqual(50000); // full invested amount or less
  });

  it('should calculate tax benefit correctly', () => {
    const { taxBenefit } = NpsCalculator.calculateNpsDeduction(
      1000000,
      100000
    );
    const taxBefore = TaxCalculator.calculateTax(1000000);
    const taxAfter = TaxCalculator.calculateTax(900000);
    expect(taxBenefit).toBe(taxBefore - taxAfter);
  });

  it('should calculate NPS benefit percent', () => {
    const percent = NpsCalculator.getNpsBenefitPercent(1000000, 100000);
    expect(percent).toBeGreaterThan(0);
    expect(percent).toBeLessThan(10);
  });
});

describe('IndexFundCalculator', () => {
  it('should calculate compound interest correctly', () => {
    const amount = IndexFundCalculator.compoundInterest(100000, 0.08, 10);
    const expected = 100000 * Math.pow(1.08, 10);
    expect(amount).toBeCloseTo(expected, 2);
  });

  it('should adjust for inflation', () => {
    const realAmount = IndexFundCalculator.adjustForInflation(
      100000,
      0.05,
      10
    );
    const expected = 100000 / Math.pow(1.05, 10);
    expect(realAmount).toBeCloseTo(expected, 2);
  });

  it('should calculate tenure correctly', () => {
    expect(IndexFundCalculator.calculateTenure(30)).toBe(30);
    expect(IndexFundCalculator.calculateTenure(60)).toBe(5);
    expect(IndexFundCalculator.calculateTenure(70)).toBe(5);
  });

  it('should calculate index fund return with inflation', () => {
    const principal = 100000;
    const rate = 0.08;
    const inflation = 0.05;
    const years = 10;

    const { nominalAmount, realAmount } =
      IndexFundCalculator.calculateIndexFundReturn(
        principal,
        rate,
        inflation,
        years
      );

    const expectedNominal = principal * Math.pow(1 + rate, years);
    const expectedReal = expectedNominal / Math.pow(1 + inflation, years);

    expect(nominalAmount).toBeCloseTo(expectedNominal, 2);
    expect(realAmount).toBeCloseTo(expectedReal, 2);
  });
});
