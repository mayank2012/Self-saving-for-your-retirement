/**
 * FinancialCalculator: Implements complex financial calculations.
 * - NPS deduction and tax benefit
 * - Index Fund returns with inflation adjustment
 * - Compound interest calculation
 */

/**
 * Tax slab structure for India (simplified 2024 rates).
 * Returns tax amount given an income.
 */
export class TaxCalculator {
  private static readonly SLABS = [
    { min: 0, max: 700000, rate: 0.0 },
    { min: 700000, max: 1000000, rate: 0.05 },
    { min: 1000000, max: 1200000, rate: 0.1 },
    { min: 1200000, max: 1500000, rate: 0.15 },
    { min: 1500000, max: Infinity, rate: 0.3 },
  ];

  static calculateTax(income: number): number {
    let tax = 0;
    let prevMax = 0;

    for (const slab of this.SLABS) {
      if (income > slab.min) {
        const taxableInThisSlab = Math.min(income, slab.max) - slab.min;
        tax += taxableInThisSlab * slab.rate;
        prevMax = slab.max;
      }
    }

    return tax;
  }
}

/**
 * NPS (National Pension Scheme) calculator.
 */
export class NpsCalculator {
  static MAX_NPS_DEDUCTION = 200000;
  static MAX_DEDUCTION_PERCENTAGE = 0.1; // 10% of income

  /**
   * Calculate NPS deduction and tax benefit.
   * Deduction = min(invested, 10% of annual_income, 200,000)
   * Tax benefit = tax(income) - tax(income - deduction)
   */
  static calculateNpsDeduction(
    annualIncome: number,
    invested: number
  ): { deduction: number; taxBenefit: number } {
    const maxDeductionByIncome = annualIncome * this.MAX_DEDUCTION_PERCENTAGE;
    const deduction = Math.min(
      invested,
      maxDeductionByIncome,
      this.MAX_NPS_DEDUCTION
    );

    const taxBefore = TaxCalculator.calculateTax(annualIncome);
    const taxAfter = TaxCalculator.calculateTax(annualIncome - deduction);
    const taxBenefit = taxBefore - taxAfter;

    return { deduction, taxBenefit };
  }

  /**
   * Calculate annual NPS benefit as percentage of income.
   */
  static getNpsBenefitPercent(
    annualIncome: number,
    invested: number
  ): number {
    const { taxBenefit } = this.calculateNpsDeduction(annualIncome, invested);
    return (taxBenefit / annualIncome) * 100;
  }
}

/**
 * Index Fund calculator with compound interest and inflation adjustment.
 */
export class IndexFundCalculator {
  /**
   * Calculate investment return with compound interest.
   * A = P * (1 + r)^t
   */
  static compoundInterest(
    principal: number,
    annualRate: number,
    years: number
  ): number {
    return principal * Math.pow(1 + annualRate, years);
  }

  /**
   * Adjust nominal amount for inflation.
   * A_real = A / (1 + inflation_rate)^t
   */
  static adjustForInflation(
    nominalAmount: number,
    inflationRate: number,
    years: number
  ): number {
    return nominalAmount / Math.pow(1 + inflationRate, years);
  }

  /**
   * Calculate effective years based on age.
   * Tenure = max(60 - age, 5)
   */
  static calculateTenure(age: number): number {
    return Math.max(60 - age, 5);
  }

  /**
   * Calculate index fund return with inflation adjustment.
   */
  static calculateIndexFundReturn(
    principal: number,
    annualReturnRate: number,
    inflationRate: number,
    years: number
  ): { nominalAmount: number; realAmount: number } {
    const nominalAmount = this.compoundInterest(
      principal,
      annualReturnRate,
      years
    );
    const realAmount = this.adjustForInflation(
      nominalAmount,
      inflationRate,
      years
    );

    return { nominalAmount, realAmount };
  }
}
