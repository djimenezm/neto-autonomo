import { calculateFreelanceBilling, type CalculationResult, type CalculatorInput } from '@/lib/calculator';
import { buildCalculatorUrl } from '@/lib/calculatorForm';

export type MonthlyAlternative = { monthlyExpenses: number; billableHours: number };
type Errors = Partial<Record<keyof MonthlyAlternative, string>>;

export function inputFromResult(result: CalculationResult, billableHours: number, hasIVA: boolean): CalculatorInput {
  return {
    targetNet: result.targetNet,
    monthlyExpenses: result.monthlyExpenses,
    monthlyNonDeductibleExpenses: result.monthlyNonDeductibleExpenses,
    billableHours,
    irpfMode: result.irpfMode,
    irpfRate: result.irpfRate,
    autonomousCommunity: result.autonomousCommunity,
    selfEmployedFeeMode: result.selfEmployedFeeMode,
    selfEmployedFee: result.selfEmployedFee,
    reducedFeePeriod: result.reducedFeePeriod,
    hasIVA,
  };
}

export function compareMonthlyScenarios(reference: CalculatorInput, alternative: MonthlyAlternative) {
  const errors: Errors = {};
  const [coefficient, exponent = '0'] = String(alternative.monthlyExpenses).split('e');
  const cents = Math.round(Number(`${coefficient}e${Number(exponent) + 2}`));
  if (!Number.isFinite(alternative.monthlyExpenses) || alternative.monthlyExpenses < 0 || !Number.isSafeInteger(cents)) {
    errors.monthlyExpenses = 'Indica un importe válido igual o mayor que cero.';
  }
  if (!Number.isSafeInteger(alternative.billableHours) || alternative.billableHours <= 0) {
    errors.billableHours = 'Indica un número entero de horas mayor que cero.';
  }
  if (Object.keys(errors).length) return { valid: false, errors } as const;

  const alternativeInput = { ...reference, monthlyExpenses: cents / 100, billableHours: alternative.billableHours };
  const current = calculateFreelanceBilling(reference);
  const proposed = calculateFreelanceBilling(alternativeInput);
  return {
    valid: true,
    current,
    proposed,
    alternativeInput,
    billingDifference: Math.round((proposed.billingWithoutVAT - current.billingWithoutVAT) * 100) / 100,
    hourlyDifference: Math.round((proposed.hourlyRate - current.hourlyRate) * 100) / 100,
  } as const;
}

export function getScenarioPath(input: CalculatorInput) {
  const url = new URL(buildCalculatorUrl({
    targetNet: String(input.targetNet), monthlyExpenses: String(input.monthlyExpenses),
    monthlyNonDeductibleExpenses: String(input.monthlyNonDeductibleExpenses ?? 0),
    billableHours: String(input.billableHours), irpfMode: input.irpfMode ?? 'progressive',
    irpfRate: String(input.irpfRate), autonomousCommunity: input.autonomousCommunity ?? 'common',
    hasIVA: input.hasIVA, selfEmployedFeeMode: input.selfEmployedFeeMode ?? 'auto',
    selfEmployedFee: String(input.selfEmployedFee), reducedFeePeriod: input.reducedFeePeriod ?? 'initial',
  }, 'https://www.cuantofacturar.es'));
  return `${url.pathname}${url.search}${url.hash}`;
}
