import { estimateMonthlyNet, netReferenceFromResult, type NetPreviewReference } from '@/lib/monthlyNet';
import { monthlyNetExampleReference, monthlyNetExampleRows } from '@/lib/monthlyNetExample';
import { calculateExample } from '@/lib/scenarioExamples';

describe('net from a different monthly billing with fixed costs and contribution', () => {
  it('reproduces the worked manual examples and recalculates the reserve from profit', () => {
    expect(monthlyNetExampleRows.map((row) => row.valid ? [row.monthlyBilling, row.preTaxProfit, row.estimatedIRPF, row.estimatedNet, row.netDifference] : null)).toEqual([
      [2500, 1880, 282, 1598, -402], [2972.94, 2352.94, 352.94, 2000, 0], [3500, 2880, 432, 2448, 448],
    ]);
  });

  it('uses the existing progressive schedule rather than freezing the previous effective percentage', () => {
    const reference = netReferenceFromResult(calculateExample(2000, { irpfMode: 'progressive' }));
    expect(estimateMonthlyNet(reference, 2500)).toMatchObject({ valid: true, preTaxProfit: 1880, estimatedIRPF: 323.25, estimatedNet: 1556.75 });
    expect(estimateMonthlyNet(reference, 3500)).toMatchObject({ valid: true, preTaxProfit: 2880, estimatedIRPF: 623.25, estimatedNet: 2256.75 });
  });

  it.each(['common', 'madrid', 'catalunya', 'andalucia', 'valencia'] as const)('reproduces published forward results to within one cent in %s without changing their contribution', (autonomousCommunity) => {
    for (const selfEmployedFeeMode of ['manual', 'auto', 'reduced'] as const) {
      for (const irpfMode of ['manual', 'progressive'] as const) {
        for (const target of [0, 1500, 3000]) {
          const original = calculateExample(target, { autonomousCommunity, selfEmployedFeeMode, irpfMode, monthlyNonDeductibleExpenses: 80 });
          const before = { ...original };
          const result = estimateMonthlyNet(netReferenceFromResult(original), original.billingWithoutVAT);
          expect(result.valid).toBe(true);
          if (result.valid) {
            expect(Math.abs(Math.round(result.netDifference * 100))).toBeLessThanOrEqual(1);
            expect(result.selfEmployedFee).toBe(original.selfEmployedFee);
          }
          expect(original).toEqual(before);
        }
      }
    }
  });

  it('keeps non-deductible costs after the reserve, even when the final net is negative', () => {
    expect(estimateMonthlyNet({ ...monthlyNetExampleReference, monthlyNonDeductibleExpenses: 80 }, 650)).toMatchObject({ valid: true, preTaxProfit: 30, estimatedIRPF: 4.5, estimatedNet: -54.5 });
  });

  it.each(['manual', 'progressive'] as const)('shows zero billing and loss without a negative IRPF reserve in %s mode', (irpfMode) => {
    expect(estimateMonthlyNet({ ...monthlyNetExampleReference, irpfMode }, 0)).toMatchObject({ valid: true, monthlyBilling: 0, preTaxProfit: -620, estimatedIRPF: 0, estimatedNet: -620, netDifference: -2620 });
  });

  it('normalizes money and rounds a half-cent reserve before obtaining the reconciled net', () => {
    const reference = { ...monthlyNetExampleReference, targetNet: 0, monthlyExpenses: 0, selfEmployedFee: 0, irpfRate: 50 };
    expect(estimateMonthlyNet(reference, 1.005)).toMatchObject({ valid: true, monthlyBilling: 1.01, estimatedIRPF: 0.51, estimatedNet: 0.5 });
  });

  it.each([Number.NaN, -1, Infinity, 1e14])('rejects invalid or unsafe billing: %s', (billing) => {
    const result = estimateMonthlyNet(monthlyNetExampleReference, billing);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.monthlyBilling).toBeTruthy();
  });

  it.each(['monthlyExpenses', 'selfEmployedFee', 'monthlyNonDeductibleExpenses', 'targetNet'] as const)('rejects invalid inherited %s', (key) => {
    const result = estimateMonthlyNet({ ...monthlyNetExampleReference, [key]: -1 }, 2500);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.reference).toBeTruthy();
  });

  it.each([-1, 100, Number.NaN])('rejects invalid manual reserve percentages: %s', (irpfRate) => {
    expect(estimateMonthlyNet({ ...monthlyNetExampleReference, irpfRate }, 2500).valid).toBe(false);
  });

  it('rejects unknown fiscal contexts and unsafe cost sums', () => {
    expect(estimateMonthlyNet({ ...monthlyNetExampleReference, autonomousCommunity: 'unknown' } as unknown as NetPreviewReference, 2500).valid).toBe(false);
    expect(estimateMonthlyNet({ ...monthlyNetExampleReference, irpfMode: 'unknown' } as unknown as NetPreviewReference, 2500).valid).toBe(false);
    expect(estimateMonthlyNet({ ...monthlyNetExampleReference, monthlyExpenses: 5e13, selfEmployedFee: 5e13 }, 2500).valid).toBe(false);
  });

  it.each(['manual', 'progressive'] as const)('blocks unsafe intermediate arithmetic in %s mode', (irpfMode) => {
    const result = estimateMonthlyNet({ ...monthlyNetExampleReference, irpfMode }, 1e13);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.monthlyBilling).toMatch(/precisión/);
  });
});
