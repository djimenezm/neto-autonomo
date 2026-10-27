import { calculateFreelanceBilling, type CalculatorInput } from '@/lib/calculator';
import { compareMonthlyScenarios, getScenarioPath, inputFromResult } from '@/lib/monthlyScenarios';
import { monthlyScenarioInput, monthlyScenarioExamples } from '@/lib/monthlyScenarioExample';

describe('monthly scenario comparison', () => {
  it('isolates hours from costs while retaining the same net target', () => {
    const [start, hours, costs, both] = monthlyScenarioExamples;
    expect(start.proposed.billingWithoutVAT).toBe(2972.94);
    expect(start.proposed.hourlyRate).toBe(37.16);
    expect(hours.proposed.billingWithoutVAT).toBe(2972.94);
    expect(hours.proposed.hourlyRate).toBe(49.55);
    expect(costs.proposed.billingWithoutVAT).toBe(3122.94);
    expect(costs.proposed.hourlyRate).toBe(39.04);
    expect(both.proposed.hourlyRate).toBe(52.05);
    expect(both.billingDifference).toBe(150);
    expect(both.hourlyDifference).toBe(14.89);
    expect(both.alternativeInput.targetNet).toBe(2000);
  });

  it('supports lower costs and more hours, including zero costs', () => {
    const result = compareMonthlyScenarios(monthlyScenarioInput, { monthlyExpenses: 0, billableHours: 100 });
    if (!result.valid) throw new Error('Expected valid alternative');
    expect(result.billingDifference).toBe(-300);
    expect(result.hourlyDifference).toBe(-10.43);
  });

  it.each([
    { monthlyExpenses: NaN, billableHours: 60 },
    { monthlyExpenses: Infinity, billableHours: 60 },
    { monthlyExpenses: -1, billableHours: 60 },
    { monthlyExpenses: 1e20, billableHours: 60 },
    { monthlyExpenses: 300, billableHours: 0 },
    { monthlyExpenses: 300, billableHours: 1.5 },
    { monthlyExpenses: 300, billableHours: Infinity },
  ])('rejects invalid alternatives before passing them to the forgiving main engine: %j', (input) => {
    expect(compareMonthlyScenarios(monthlyScenarioInput, input).valid).toBe(false);
  });

  it('rounds money once and uses exactly that amount in the alternative URL', () => {
    const result = compareMonthlyScenarios(monthlyScenarioInput, { monthlyExpenses: 1.005, billableHours: 60 });
    if (!result.valid) throw new Error('Expected valid alternative');
    expect(result.alternativeInput.monthlyExpenses).toBe(1.01);
    const url = new URL(getScenarioPath(result.alternativeInput), 'https://www.cuantofacturar.es');
    expect(url.searchParams.get('monthlyExpenses')).toBe('1.01');
    expect(url.searchParams.get('billableHours')).toBe('60');
    expect(url.searchParams.get('targetNet')).toBe('2000');
    expect(url.hash).toBe('#calculadora');
  });

  it.each(['manual', 'auto', 'reduced'] as const)('preserves progressive IRPF, region and %s contribution mode in a round trip', (selfEmployedFeeMode) => {
    const original: CalculatorInput = { ...monthlyScenarioInput, irpfMode: 'progressive', autonomousCommunity: 'valencia', selfEmployedFeeMode, reducedFeePeriod: 'extended', monthlyNonDeductibleExpenses: 150, hasIVA: false };
    const current = calculateFreelanceBilling(original);
    const reconstructed = inputFromResult(current, original.billableHours, original.hasIVA);
    expect(calculateFreelanceBilling(reconstructed)).toEqual(current);
    const comparison = compareMonthlyScenarios(reconstructed, { monthlyExpenses: 450, billableHours: 60 });
    if (!comparison.valid) throw new Error('Expected valid alternative');
    expect(comparison.proposed).toEqual(calculateFreelanceBilling({ ...original, monthlyExpenses: 450, billableHours: 60 }));
    const params = new URL(getScenarioPath(comparison.alternativeInput), 'https://www.cuantofacturar.es').searchParams;
    expect(params.get('irpfMode')).toBe('progressive');
    expect(params.get('autonomousCommunity')).toBe('valencia');
    expect(params.get('monthlyNonDeductibleExpenses')).toBe('150');
    expect(params.get('hasIVA')).toBe('no');
    expect(params.get('selfEmployedFeeMode')).toBe(selfEmployedFeeMode);
    expect(params.get('reducedFeePeriod')).toBe('extended');
    const restored = calculateFreelanceBilling({ ...comparison.alternativeInput, monthlyExpenses: Number(params.get('monthlyExpenses')), billableHours: Number(params.get('billableHours')) });
    expect(restored).toEqual(comparison.proposed);
  });
});
