import { describe, expect, it } from 'vitest';
import {
  buildCalculatorUrl,
  DEFAULT_FORM_VALUES,
  getCalculationKey,
  getNormalizedPastedValue,
  normalizeFieldValue,
  validateForm,
} from '@/lib/calculatorForm';

const numericValues = {
  targetNet: DEFAULT_FORM_VALUES.targetNet,
  monthlyExpenses: DEFAULT_FORM_VALUES.monthlyExpenses,
  monthlyNonDeductibleExpenses: DEFAULT_FORM_VALUES.monthlyNonDeductibleExpenses,
  billableHours: DEFAULT_FORM_VALUES.billableHours,
  irpfRate: DEFAULT_FORM_VALUES.irpfRate,
  selfEmployedFee: DEFAULT_FORM_VALUES.selfEmployedFee,
};

describe('calculator form values', () => {
  it('compares active values without treating numeric formatting or inactive fields as a new calculation', () => {
    const original = getCalculationKey(DEFAULT_FORM_VALUES);
    expect(getCalculationKey({ ...DEFAULT_FORM_VALUES, targetNet: '1500.00', irpfRate: '80', selfEmployedFee: '999', reducedFeePeriod: 'extended' })).toBe(original);
    expect(getCalculationKey({ ...DEFAULT_FORM_VALUES, autonomousCommunity: 'madrid' })).not.toBe(original);
    expect(getCalculationKey({ ...DEFAULT_FORM_VALUES, irpfMode: 'manual' })).not.toBe(original);
    expect(getCalculationKey({ ...DEFAULT_FORM_VALUES, selfEmployedFeeMode: 'manual', selfEmployedFee: '320' })).not.toBe(original);
  });
  it('validates only the inputs used by the selected modes', () => {
    expect(validateForm(numericValues, 'progressive', 'auto')).toEqual({});
    expect(validateForm({ ...numericValues, irpfRate: 'invalid' }, 'progressive', 'auto')).toEqual({});
    expect(validateForm({ ...numericValues, irpfRate: 'invalid' }, 'manual', 'auto')).toHaveProperty(
      'irpfRate',
    );
    expect(validateForm(numericValues, 'progressive', 'manual')).toHaveProperty(
      'selfEmployedFee',
    );
  });

  it('keeps invalid values visible and normalizes valid Spanish currency', () => {
    expect(normalizeFieldValue('monthlyExpenses', 'importe incorrecto')).toBe('importe incorrecto');
    expect(getNormalizedPastedValue('monthlyExpenses', '2.500,50 €')).toBe('2500.5');
    expect(getNormalizedPastedValue('monthlyExpenses', 'no es un número')).toBeNull();
    expect(validateForm({ ...numericValues, billableHours: '1,5' }, 'progressive', 'auto'))
      .toHaveProperty('billableHours');
  });

  it('creates a shareable URL without retaining unrelated parameters', () => {
    const url = new URL(buildCalculatorUrl(DEFAULT_FORM_VALUES, 'https://example.com/guia?ref=old'));

    expect(url.pathname).toBe('/');
    expect(url.hash).toBe('#calculadora');
    expect(url.searchParams.get('targetNet')).toBe('1500');
    expect(url.searchParams.get('hasIVA')).toBe('yes');
    expect(url.searchParams.has('ref')).toBe(false);
  });
});
