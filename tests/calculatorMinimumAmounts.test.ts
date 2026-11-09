import { describe, expect, it } from 'vitest';
import {
  readCalculatorPaste,
  normalizeFieldValue,
  validateForm,
} from '@/lib/calculatorForm';
import { calculateValidSharedResult, readCalculatorQuery } from '@/lib/calculatorQuery';

const numericValues = {
  targetNet: '1500',
  monthlyExpenses: '200',
  monthlyNonDeductibleExpenses: '0',
  billableHours: '80',
  irpfRate: '15',
  selfEmployedFee: '320',
};
const positiveMoneyFields = ['targetNet', 'selfEmployedFee'] as const;
const belowHalfCent = ['1e-7', '0.0001', '0.004', '0.0049'];

describe('positive calculator amounts after cent rounding', () => {
  it('rejects an active net or manual fee that would become zero cents', () => {
    for (const field of positiveMoneyFields) {
      for (const value of belowHalfCent) {
        expect(validateForm({ ...numericValues, [field]: value }, 'manual', 'manual'))
          .toEqual({ [field]: expect.stringMatching(/al redondear/) });
      }
    }
  });

  it('keeps the invalid amount visible on normalization and on Spanish paste', () => {
    for (const field of positiveMoneyFields) {
      for (const value of belowHalfCent) {
        expect(normalizeFieldValue(field, value)).toBe(value);
      }
      expect(readCalculatorPaste(field, '0,004 €').value).toBe('0.004');
    }
  });

  it('still accepts the half-cent boundary and normalizes it to a positive cent', () => {
    for (const field of positiveMoneyFields) {
      for (const value of ['0.005', '0.009', '0.01']) {
        expect(validateForm({ ...numericValues, [field]: value }, 'manual', 'manual')).toEqual({});
        expect(normalizeFieldValue(field, value)).toBe('0.01');
      }
    }
  });

  it('preserves the existing zero and negative errors without forbidding zero costs or reserve', () => {
    for (const targetNet of ['0', '-0', '-1']) {
      expect(validateForm({ ...numericValues, targetNet }, 'manual', 'manual'))
        .toEqual({ targetNet: 'El neto mensual debe ser mayor que 0.' });
    }
    for (const selfEmployedFee of ['0', '-0']) {
      expect(validateForm({ ...numericValues, selfEmployedFee }, 'manual', 'manual'))
        .toEqual({ selfEmployedFee: 'La cuota manual debe ser mayor que 0.' });
    }
    expect(validateForm({ ...numericValues, selfEmployedFee: '-1' }, 'manual', 'manual'))
      .toEqual({ selfEmployedFee: 'La cuota de autónomos no puede ser negativa.' });
    for (const expense of ['0', '0.004']) {
      expect(validateForm({ ...numericValues, monthlyExpenses: expense, monthlyNonDeductibleExpenses: expense, irpfRate: '0' }, 'manual', 'manual')).toEqual({});
    }
  });

  it('does not validate a small manual fee while the selected contribution mode ignores it', () => {
    for (const feeMode of ['auto', 'reduced'] as const) {
      expect(validateForm({ ...numericValues, selfEmployedFee: '0.004' }, 'manual', feeMode)).toEqual({});
    }
  });

  it('preserves query precision but withholds shared calculations for invalid active amounts', () => {
    const read = (query: Record<string, string>) => readCalculatorQuery((key) => query[key]);
    const manualQuery = { ...numericValues, irpfMode: 'manual', selfEmployedFeeMode: 'manual' };
    for (const field of positiveMoneyFields) {
      for (const value of belowHalfCent) {
        const values = read({ ...manualQuery, [field]: value });
        expect(values[field]).toBe(String(Number(value)));
        expect(calculateValidSharedResult(values)).toBeNull();
      }
      const validBoundary = read({ ...manualQuery, [field]: '0,005 €' });
      expect(validBoundary[field]).toBe('0.005');
      expect(calculateValidSharedResult(validBoundary)).not.toBeNull();
    }
    for (const selfEmployedFeeMode of ['auto', 'reduced']) {
      const values = read({ ...manualQuery, selfEmployedFeeMode, selfEmployedFee: '0,004 €' });
      expect(values.selfEmployedFee).toBe('0.004');
      expect(calculateValidSharedResult(values)).not.toBeNull();
    }
  });
});
