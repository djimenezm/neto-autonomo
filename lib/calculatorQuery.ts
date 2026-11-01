import { calculateFreelanceBilling, type CalculationResult } from '@/lib/calculator';
import {
  DEFAULT_FORM_VALUES,
  parseFormNumber,
  validateForm,
  type CalculatorFormValues,
  type FieldName,
} from '@/lib/calculatorForm';

export const calculatorQueryKeys = [
  'targetNet',
  'monthlyExpenses',
  'monthlyNonDeductibleExpenses',
  'billableHours',
  'irpfMode',
  'autonomousCommunity',
  'irpfRate',
  'hasIVA',
  'selfEmployedFeeMode',
  'reducedFeePeriod',
  'selfEmployedFee',
] as const satisfies readonly (keyof CalculatorFormValues)[];

const irpfModes = ['progressive', 'manual'] satisfies readonly CalculatorFormValues['irpfMode'][];
const autonomousCommunities = [
  'common',
  'madrid',
  'catalunya',
  'andalucia',
  'valencia',
] satisfies readonly CalculatorFormValues['autonomousCommunity'][];
const selfEmployedFeeModes = ['auto', 'reduced', 'manual'] satisfies readonly CalculatorFormValues['selfEmployedFeeMode'][];
const reducedFeePeriods = ['initial', 'extended'] satisfies readonly CalculatorFormValues['reducedFeePeriod'][];

function getAllowedValue<T extends string>(value: string | undefined, allowedValues: readonly T[], fallback: T) {
  return value && allowedValues.includes(value as T) ? (value as T) : fallback;
}

export function readCalculatorQuery(getValue: (key: string) => string | undefined): CalculatorFormValues {
  function readNumber(field: FieldName) {
    const raw = getValue(field) ?? DEFAULT_FORM_VALUES[field];
    const parsed = parseFormNumber(raw);
    // Keep invalid text for the form's errors. Canonical numbers also remain
    // visible in native number inputs when a URL contains Spanish notation.
    return Number.isFinite(parsed) ? String(parsed) : raw;
  }

  const iva = getValue('hasIVA');

  return {
    targetNet: readNumber('targetNet'),
    monthlyExpenses: readNumber('monthlyExpenses'),
    monthlyNonDeductibleExpenses: readNumber('monthlyNonDeductibleExpenses'),
    billableHours: readNumber('billableHours'),
    irpfMode: getAllowedValue(getValue('irpfMode'), irpfModes, DEFAULT_FORM_VALUES.irpfMode),
    autonomousCommunity: getAllowedValue(getValue('autonomousCommunity'), autonomousCommunities, DEFAULT_FORM_VALUES.autonomousCommunity),
    irpfRate: readNumber('irpfRate'),
    hasIVA: iva === 'no' ? false : iva === 'yes' ? true : DEFAULT_FORM_VALUES.hasIVA,
    selfEmployedFeeMode: getAllowedValue(getValue('selfEmployedFeeMode'), selfEmployedFeeModes, DEFAULT_FORM_VALUES.selfEmployedFeeMode),
    reducedFeePeriod: getAllowedValue(getValue('reducedFeePeriod'), reducedFeePeriods, DEFAULT_FORM_VALUES.reducedFeePeriod),
    selfEmployedFee: readNumber('selfEmployedFee'),
  };
}

export function calculateValidSharedResult(values: CalculatorFormValues): CalculationResult | null {
  const numericValues = {
    targetNet: values.targetNet,
    monthlyExpenses: values.monthlyExpenses,
    monthlyNonDeductibleExpenses: values.monthlyNonDeductibleExpenses,
    billableHours: values.billableHours,
    irpfRate: values.irpfRate,
    selfEmployedFee: values.selfEmployedFee,
  };

  if (Object.keys(validateForm(numericValues, values.irpfMode, values.selfEmployedFeeMode)).length) {
    return null;
  }

  const result = calculateFreelanceBilling({
    ...values,
    targetNet: parseFormNumber(values.targetNet),
    monthlyExpenses: parseFormNumber(values.monthlyExpenses),
    monthlyNonDeductibleExpenses: parseFormNumber(values.monthlyNonDeductibleExpenses),
    billableHours: parseFormNumber(values.billableHours),
    irpfRate: parseFormNumber(values.irpfRate),
    selfEmployedFee: parseFormNumber(values.selfEmployedFee),
  });

  return Object.values(result).some((value) => typeof value === 'number' && !Number.isFinite(value))
    ? null
    : result;
}
