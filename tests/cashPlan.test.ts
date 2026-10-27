import { cashPlanExample, cashPlanExampleResult, delayedCashPlanExampleResult, planCash } from '@/lib/cashPlan';

const emptyMonths = () => Array.from({ length: 3 }, () => ({ receipts: 0, payments: 0 }));

describe('three-month cash plan', () => {
  it('finds an intermediate deficit even with a positive final balance', () => {
    expect(cashPlanExampleResult).toMatchObject({ valid: true, initialBalance: 1000, finalBalance: 700, minimumBalance: -800, additionalAtCheckpoints: 800, firstNegativePoint: 1, totalReceipts: 5400, totalPayments: 5700, balanceChange: -300 });
    if (!cashPlanExampleResult.valid) throw new Error('Expected a valid example');
    expect(cashPlanExampleResult.months.map((month) => [month.openingBalance, month.closingBalance])).toEqual([[1000, -800], [-800, 1000], [1000, 700]]);
  });

  it('exposes a larger deficit when the same receipt is deferred without changing the final balance', () => {
    expect(delayedCashPlanExampleResult).toMatchObject({ valid: true, finalBalance: 700, minimumBalance: -2600, additionalAtCheckpoints: 2600, totalReceipts: 5400 });
  });

  it('calculates the additional starting amount that removes negative balances at the observed checkpoints', () => {
    const adjusted = planCash({ ...cashPlanExample, initialBalance: 1800 });
    expect(adjusted).toMatchObject({ valid: true, minimumBalance: 0, additionalAtCheckpoints: 0, firstNegativePoint: null, finalBalance: 1500 });
    if (adjusted.valid) expect(adjusted.months.every((month) => month.closingBalance >= 0)).toBe(true);
  });

  it('includes a negative opening balance even if every month closes positive', () => {
    expect(planCash({ initialBalance: -50, months: [{ receipts: 200, payments: 100 }, ...emptyMonths().slice(0, 2)] })).toMatchObject({ valid: true, finalBalance: 50, minimumBalance: -50, additionalAtCheckpoints: 50, firstNegativePoint: 0 });
  });

  it('accepts explicit zero balances and movements without inventing a deficit', () => {
    expect(planCash({ initialBalance: 0, months: emptyMonths() })).toMatchObject({ valid: true, finalBalance: 0, minimumBalance: 0, additionalAtCheckpoints: 0, firstNegativePoint: null });
  });

  it('does not create a false negative balance at an exact decimal boundary', () => {
    expect(planCash({ initialBalance: 0.1, months: [{ receipts: 0.2, payments: 0.3 }, { receipts: 0.1, payments: 0.1 }, { receipts: 0.2, payments: 0.1 }] })).toMatchObject({ valid: true, finalBalance: 0.1, minimumBalance: 0, additionalAtCheckpoints: 0, firstNegativePoint: null });
  });

  it('normalizes each amount before carrying balances forward and rounds negative halves symmetrically', () => {
    expect(planCash({ initialBalance: 1.005, months: [{ receipts: 0.105, payments: 0.015 }, ...emptyMonths().slice(0, 2)] })).toMatchObject({ valid: true, initialBalance: 1.01, finalBalance: 1.1 });
    expect(planCash({ initialBalance: -1.005, months: emptyMonths() })).toMatchObject({ valid: true, initialBalance: -1.01, finalBalance: -1.01, additionalAtCheckpoints: 1.01 });
    const roundedZero = planCash({ initialBalance: -0.004, months: emptyMonths() });
    if (!roundedZero.valid) throw new Error('Expected a valid zero');
    expect(Object.is(roundedZero.initialBalance, -0)).toBe(false);
  });

  it.each([Number.NaN, Infinity, 1e14, -1e14])('rejects an invalid or unsafe starting balance: %s', (initialBalance) => {
    const result = planCash({ ...cashPlanExample, initialBalance });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.initialBalance).toBeTruthy();
  });

  it.each([
    ['receipts', -1], ['receipts', Number.NaN], ['receipts', 1e14],
    ['payments', -1], ['payments', Infinity], ['payments', 1e14],
  ] as const)('reports an invalid %s in the correct month: %s', (key, value) => {
    const months = emptyMonths(); months[1][key] = value;
    const result = planCash({ initialBalance: 0, months });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.rows[1][key]).toBeTruthy();
  });

  it.each([0, 2, 4])('requires three periods, rejecting %i periods', (length) => {
    const result = planCash({ initialBalance: 0, months: Array.from({ length }, () => ({ receipts: 0, payments: 0 })) });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.months).toBeTruthy();
  });

  it.each([
    { initialBalance: 5e13, months: [{ receipts: 5e13, payments: 0 }, ...emptyMonths().slice(0, 2)] },
    { initialBalance: -5e13, months: [{ receipts: 0, payments: 5e13 }, ...emptyMonths().slice(0, 2)] },
    { initialBalance: 0, months: [{ receipts: 5e13, payments: 5e13 }, { receipts: 5e13, payments: 5e13 }, { receipts: 0, payments: 0 }] },
    { initialBalance: 5e13, months: [{ receipts: 0, payments: 5e13 }, { receipts: 0, payments: 5e13 }, { receipts: 0, payments: 0 }] },
  ])('blocks unsafe running balances or totals: %j', (input) => {
    const result = planCash(input);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.months).toMatch(/precisión/);
  });
});
