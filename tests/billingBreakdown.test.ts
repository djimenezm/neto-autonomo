import { getBillingBreakdown } from '@/lib/billingBreakdown';
import { calculateExample } from '@/lib/scenarioExamples';

describe('the displayed billing allocation', () => {
  it('accounts for the published manual example without subtracting VAT or IRPF twice', () => {
    const breakdown = getBillingBreakdown(calculateExample(2000));
    expect(breakdown).toMatchObject({
      billingCents: 297294,
      netCents: 200000,
      vatCents: 62432,
      withVatCents: 359726,
      roundingAdjustmentCents: 0,
    });
    expect(breakdown.parts.map((part) => part.cents)).toEqual([30000, 32000, 35294]);
  });

  it.each(['manual', 'progressive'] as const)('also covers non-deductible expenses in %s mode', (irpfMode) => {
    const result = calculateExample(2000, { monthlyNonDeductibleExpenses: 80, irpfMode, hasIVA: false });
    const breakdown = getBillingBreakdown(result);
    expect(breakdown.parts.find((part) => part.key === 'other-costs')?.cents).toBe(8000);
    expect(breakdown.billingCents - breakdown.parts.reduce((total, part) => total + part.cents, 0)
      + breakdown.roundingAdjustmentCents).toBe(200000);
    expect(breakdown.vatCents).toBe(0);
    expect(breakdown.withVatCents).toBe(breakdown.billingCents);
    expect(Math.abs(breakdown.roundingAdjustmentCents)).toBeLessThanOrEqual(1);
  });

  it.each([1, -1])('makes a one-cent display difference explicit without changing the engine result (%i)', (difference) => {
    const result = { ...calculateExample(2000), billingWithoutVAT: 2972.94 + difference / 100 };
    const before = { ...result };
    const breakdown = getBillingBreakdown(result);
    expect(breakdown.roundingAdjustmentCents).toBe(-difference);
    expect(result).toEqual(before);
    expect(breakdown.netCents).toBe(200000);
  });
});
