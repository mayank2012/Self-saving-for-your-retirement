import { z } from 'zod';

// ==================== SCHEMA DEFINITIONS ====================

export const ExpenseSchema = z.object({
  date: z.string().datetime(),
  amount: z.number().positive().lt(500000),
});

export const TransactionSchema = z.object({
  date: z.string().datetime(),
  amount: z.number().positive(),
  ceiling: z.number().positive(),
  remanent: z.number().nonnegative(),
});

export const QPeriodSchema = z.object({
  fixed: z.number().nonnegative(),
  start: z.string().datetime(),
  end: z.string().datetime(),
});

export const PPeriodSchema = z.object({
  extra: z.number().nonnegative(),
  start: z.string().datetime(),
  end: z.string().datetime(),
});

export const KPeriodSchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
});

export const TransactionPayloadSchema = z.object({
  expenses: z.array(ExpenseSchema),
  q_periods: z.array(QPeriodSchema),
  p_periods: z.array(PPeriodSchema),
  k_periods: z.array(KPeriodSchema),
});

export const NpsCalculationSchema = z.object({
  age: z.number().int().min(18).max(120),
  annual_income: z.number().positive(),
  invested: z.number().nonnegative(),
  years: z.number().int().positive().default(5),
});

export const IndexFundSchema = z.object({
  annual_return_rate: z.number().positive().max(1),
  inflation_rate: z.number().nonnegative().max(1),
  years: z.number().int().positive(),
});

// ==================== TYPE DEFINITIONS ====================

export type Expense = z.infer<typeof ExpenseSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type QPeriod = z.infer<typeof QPeriodSchema>;
export type PPeriod = z.infer<typeof PPeriodSchema>;
export type KPeriod = z.infer<typeof KPeriodSchema>;
export type TransactionPayload = z.infer<typeof TransactionPayloadSchema>;
export type NpsCalculation = z.infer<typeof NpsCalculationSchema>;
export type IndexFund = z.infer<typeof IndexFundSchema>;

// ==================== RETURN TYPES ====================

export interface ParseResponse {
  transactions: Transaction[];
  count: number;
  timestamp: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  duplicates_detected: string[];
  transaction_count: number;
}

export interface FilterResponse {
  filtered_transactions: Transaction[];
  k_period_groups: Record<string, Transaction[]>;
}

export interface NpsResponse {
  contribution_base: number;
  nps_deduction: number;
  annual_nps_benefit: number;
  tax_benefit_percent: number;
  years: number;
}

export interface IndexFundResponse {
  principal: number;
  rate: number;
  years: number;
  amount_nominal: number;
  amount_real: string;
}

export interface PerformanceMetrics {
  total_processing_time_ms: number;
  memory_used_mb: number;
  thread_count: number;
  cpu_usage_percent: number;
  timestamp: string;
}
