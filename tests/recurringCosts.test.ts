import { estimateRecurringCosts, recurringCostsExample, type RecurringCostsInput } from '@/lib/recurringCosts';

const emptyPlan: RecurringCostsInput = {
  fee: 0,
  expenses: {
    advisor: { amount: 0, period: 'monthly' },
    software: { amount: 0, period: 'annual' },
    insurance: { amount: 0, period: 'annual' },
    other: { amount: 0, period: 'monthly' },
  },
};

describe('recurring activity costs', () => {
  it('counts monthly, quarterly and annual payments exactly once in the same plan', () => {
    const result = estimateRecurringCosts(recurringCostsExample);
    expect(result).toMatchObject({ valid: true, monthlyTotal: 480, annualTotal: 5760, monthlyFee: 320, monthlyOtherCosts: 160 });
    if (!result.valid) return;
    expect(result.lines.map(({ key, paymentsPerYear, annualAmount, monthlyAmount }) => ({ key, paymentsPerYear, annualAmount, monthlyAmount }))).toEqual([
      { key: 'fee', paymentsPerYear: 12, annualAmount: 3840, monthlyAmount: 320 },
      { key: 'advisor', paymentsPerYear: 4, annualAmount: 660, monthlyAmount: 55 },
      { key: 'software', paymentsPerYear: 1, annualAmount: 420, monthlyAmount: 35 },
      { key: 'insurance', paymentsPerYear: 1, annualAmount: 360, monthlyAmount: 30 },
      { key: 'other', paymentsPerYear: 12, annualAmount: 480, monthlyAmount: 40 },
    ]);
  });

  it('preserves the annual sum instead of multiplying a rounded monthly equivalent by twelve', () => {
    const result = estimateRecurringCosts({ ...emptyPlan, fee: 320, expenses: { ...emptyPlan.expenses, software: { amount: 100, period: 'annual' } } });
    expect(result).toMatchObject({ valid: true, annualTotal: 3940, monthlyTotal: 328.33, monthlyOtherCosts: 8.33, monthlyFee: 320 });
  });

  it('sums annual amounts before rounding the monthly total, even when rounded row averages differ', () => {
    const result = estimateRecurringCosts({ ...emptyPlan, expenses: { ...emptyPlan.expenses, software: { amount: 100, period: 'annual' }, insurance: { amount: 100, period: 'annual' }, other: { amount: 100, period: 'annual' } } });
    expect(result).toMatchObject({ valid: true, annualTotal: 300, monthlyTotal: 25, monthlyOtherCosts: 25 });
    if (result.valid) expect(result.lines.reduce((sum, line) => sum + line.monthlyAmount, 0)).toBeCloseTo(24.99);
  });

  it('allows zero costs and rounds each payment to cents before repeating it', () => {
    expect(estimateRecurringCosts(emptyPlan)).toMatchObject({ valid: true, monthlyTotal: 0, annualTotal: 0 });
    expect(estimateRecurringCosts({ ...emptyPlan, expenses: { ...emptyPlan.expenses, advisor: { amount: 10.126, period: 'quarterly' } } })).toMatchObject({ valid: true, annualTotal: 40.52, monthlyTotal: 3.38 });
  });

  it.each([
    ['monthly', 12, 1536.96, 128.08],
    ['quarterly', 4, 512.32, 42.69],
    ['annual', 1, 128.08, 10.67],
  ] as const)('rounds a decimal half-cent payment before its %s repetitions', (period, paymentsPerYear, annualTotal, monthlyTotal) => {
    const result = estimateRecurringCosts({ ...emptyPlan, expenses: { ...emptyPlan.expenses, software: { amount: 128.075, period } } });
    expect(result).toMatchObject({ valid: true, annualTotal, monthlyTotal, monthlyOtherCosts: monthlyTotal });
    if (result.valid) expect(result.lines.find((line) => line.key === 'software'))
      .toMatchObject({ amountPerPayment: 128.08, paymentsPerYear, annualAmount: annualTotal });
  });

  it('uses the same cent rounding for the separate monthly fee and keeps real values below a half-cent', () => {
    expect(estimateRecurringCosts({ ...emptyPlan, fee: 128.075 }))
      .toMatchObject({ valid: true, monthlyFee: 128.08, monthlyTotal: 128.08, annualTotal: 1536.96, monthlyOtherCosts: 0 });
    expect(estimateRecurringCosts({ ...emptyPlan, fee: 128.0749 }))
      .toMatchObject({ valid: true, monthlyFee: 128.07 });
    expect(estimateRecurringCosts({ ...emptyPlan, fee: 128.0751 }))
      .toMatchObject({ valid: true, monthlyFee: 128.08 });
    expect(estimateRecurringCosts({ ...emptyPlan, fee: -0.001 }).valid).toBe(false);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, -1, Number.MAX_VALUE])('rejects invalid payment %s', (amount) => {
    const result = estimateRecurringCosts({ ...emptyPlan, expenses: { ...emptyPlan.expenses, software: { amount, period: 'annual' } } });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.software).toBeTruthy();
  });

  it('rejects an invalid fee and an unknown frequency', () => {
    expect(estimateRecurringCosts({ ...emptyPlan, fee: -1 }).valid).toBe(false);
    expect(estimateRecurringCosts({ ...emptyPlan, expenses: { ...emptyPlan.expenses, software: { amount: 100, period: 'weekly' as 'annual' } } }).valid).toBe(false);
  });
});
