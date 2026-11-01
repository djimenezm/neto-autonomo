import { describe, expect, it } from 'vitest';
import { calculatorQueryKeys, calculateValidSharedResult, readCalculatorQuery } from '@/lib/calculatorQuery';
import { DEFAULT_FORM_VALUES } from '@/lib/calculatorForm';
import { calculateFreelanceBilling } from '@/lib/calculator';

const read = (query: Record<string, string> = {}) => readCalculatorQuery((key) => query[key]);
const manual = { irpfMode: 'manual', irpfRate: '15', selfEmployedFeeMode: 'manual', selfEmployedFee: '320' };

describe('calculator query values and result validation', () => {
  it('uses the same complete defaults for absent query values', () => {
    expect(read()).toEqual(DEFAULT_FORM_VALUES);
    expect(calculatorQueryKeys).toEqual([
      'targetNet', 'monthlyExpenses', 'monthlyNonDeductibleExpenses', 'billableHours',
      'irpfMode', 'autonomousCommunity', 'irpfRate', 'hasIVA',
      'selfEmployedFeeMode', 'reducedFeePeriod', 'selfEmployedFee',
    ]);
  });

  it('canonicalizes compatible numeric text without rounding the input precision', () => {
    expect(read({
      targetNet: ' 2.500,50 € ', monthlyExpenses: '1,005',
      monthlyNonDeductibleExpenses: '1.005', billableHours: '80,5',
      irpfRate: '17,625 %', selfEmployedFee: '320,075',
    })).toMatchObject({
      targetNet: '2500.5', monthlyExpenses: '1.005', monthlyNonDeductibleExpenses: '1.005',
      billableHours: '80.5', irpfRate: '17.625', selfEmployedFee: '320.075',
    });
  });

  it('preserves empty and malformed text so active field errors are not replaced with defaults', () => {
    expect(read({
      targetNet: '', monthlyExpenses: '  ', monthlyNonDeductibleExpenses: '1,,50',
      billableHours: 'hours', irpfRate: 'not a percentage', selfEmployedFee: 'not a fee',
    })).toMatchObject({
      targetNet: '', monthlyExpenses: '  ', monthlyNonDeductibleExpenses: '1,,50',
      billableHours: 'hours', irpfRate: 'not a percentage', selfEmployedFee: 'not a fee',
    });
  });

  it('retains existing enum fallbacks and the exact no-IVA convention', () => {
    expect(read({
      irpfMode: 'unknown', autonomousCommunity: '', selfEmployedFeeMode: 'unknown',
      reducedFeePeriod: '', hasIVA: 'no', source: 'monthly-costs', utm_source: 'ignored',
    })).toEqual({ ...DEFAULT_FORM_VALUES, hasIVA: false });
    expect(read({ hasIVA: 'NO' }).hasIVA).toBe(true);
    expect(read({ hasIVA: '' }).hasIVA).toBe(true);
  });

  it('uses the first duplicate query value through the supplied getter', () => {
    const query = new URLSearchParams('targetNet=2500&targetNet=0&billableHours=80&billableHours=0');
    expect(readCalculatorQuery((key) => query.get(key) ?? undefined)).toMatchObject({ targetNet: '2500', billableHours: '80' });
  });

  it('matches the independently checked manual example using the original precision', () => {
    const result = calculateValidSharedResult(read({ ...manual, targetNet: '2.500,50' }));
    expect(result).toMatchObject({ targetNet: 2500.5, billingWithoutVAT: 3461.76, hourlyRate: 43.27 });
    const precise = calculateValidSharedResult(read({ ...manual, monthlyExpenses: '128,075' }));
    // A shared GET uses its supplied precision, just like the initial form.
    // It is not another client submission that rounds the field to cents.
    expect(precise?.billingWithoutVAT).toBe(2212.78);
  });

  it.each([
    ['targetNet', ''], ['targetNet', '0'], ['targetNet', '-1'], ['targetNet', 'not a net'],
    ['monthlyExpenses', ''], ['monthlyExpenses', '-0.001'], ['monthlyExpenses', '1,,50'],
    ['monthlyNonDeductibleExpenses', '-1'],
    ['billableHours', ''], ['billableHours', '0'], ['billableHours', '-1'], ['billableHours', '80.5'],
    ['irpfRate', '100'], ['irpfRate', '-1'], ['irpfRate', 'NaN'],
    ['selfEmployedFee', '0'], ['selfEmployedFee', '-1'], ['selfEmployedFee', ''],
  ])('returns no result instead of adjusting invalid active %s=%j', (field, value) => {
    expect(calculateValidSharedResult(read({ ...manual, [field]: value }))).toBeNull();
  });

  it.each(['auto', 'reduced'])('ignores invalid inactive inputs in progressive/%s mode', (feeMode) => {
    const values = read({ irpfMode: 'progressive', irpfRate: 'not a percentage', selfEmployedFeeMode: feeMode, selfEmployedFee: 'not a fee' });
    expect(calculateValidSharedResult(values)).toEqual(calculateFreelanceBilling({
      targetNet: 1500, monthlyExpenses: 200, monthlyNonDeductibleExpenses: 0,
      billableHours: 80, irpfMode: 'progressive', irpfRate: 15, autonomousCommunity: 'common',
      hasIVA: true, selfEmployedFeeMode: feeMode as 'auto' | 'reduced', selfEmployedFee: 0, reducedFeePeriod: 'initial',
    }));
  });
});
