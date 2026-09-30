import { describe, expect, it } from 'vitest';
import { calculateExample, getExampleUrl } from '@/lib/scenarioExamples';

describe('worked billing examples', () => {
  it('keeps the published breakdown consistent with the calculator', () => {
    const result = calculateExample(2000);

    expect(result.billingWithoutVAT).toBe(2972.94);
    expect(result.hourlyRate).toBe(37.16);
    expect(result.estimatedIRPF).toBe(352.94);
    expect(result.selfEmployedFee).toBe(320);
    expect(result.billingWithoutVAT).toBeCloseTo(
      result.targetNet + result.monthlyExpenses + result.selfEmployedFee + result.estimatedIRPF,
      2,
    );
  });

  it('opens the calculator with the same assumptions as the example', () => {
    const url = new URL(getExampleUrl(1500, { monthlyExpenses: 500, billableHours: 90 }), 'https://www.cuantofacturar.es');

    expect(url.searchParams.get('targetNet')).toBe('1500');
    expect(url.searchParams.get('monthlyExpenses')).toBe('500');
    expect(url.searchParams.get('billableHours')).toBe('90');
    expect(url.searchParams.get('irpfMode')).toBe('manual');
    expect(url.searchParams.get('selfEmployedFee')).toBe('320');
    expect(url.hash).toBe('#calculadora');
  });
});
