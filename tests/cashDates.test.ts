import { cashDatesExample, cashDatesExampleResult, checkCashDates, formatCashDate, MAX_CASH_MOVEMENTS, type CashDatesInput } from '@/lib/cashDates';

describe('cash movements by date', () => {
  it('finds the intermediate shortfall even though the final balance is positive', () => {
    expect(cashDatesExampleResult).toMatchObject({ valid: true, initialBalance: 1000, totalReceipts: 2400, totalPayments: 2700, finalBalance: 700, minimumBalance: -800, additionalInitialBalance: 800, firstNegativePoint: '2026-11-05' });
    if (cashDatesExampleResult.valid) expect(cashDatesExampleResult.days.map((day) => day.closingBalance)).toEqual([-800, 1600, 700]);
    expect(checkCashDates({ ...cashDatesExample, initialBalance: 1800 })).toMatchObject({ valid: true, minimumBalance: 0, additionalInitialBalance: 0, firstNegativePoint: null });
  });

  it('sorts unsorted dates without changing the input and changes the deficit when a receipt moves', () => {
    const original = structuredClone(cashDatesExample);
    const reversed = checkCashDates({ ...cashDatesExample, movements: [...cashDatesExample.movements].reverse() });
    expect(reversed.valid).toBe(true);
    if (reversed.valid && cashDatesExampleResult.valid) expect(reversed.days).toEqual(cashDatesExampleResult.days);
    expect(cashDatesExample).toEqual(original);
    expect(checkCashDates({ ...cashDatesExample, movements: cashDatesExample.movements.map((row) => row.kind === 'receipt' ? { ...row, date: '2026-11-01' } : row) })).toMatchObject({ valid: true, finalBalance: 700, minimumBalance: 700, additionalInitialBalance: 0, firstNegativePoint: null });
  });

  it('groups duplicate dates and supposes all payments before all receipts regardless of row order', () => {
    const result = checkCashDates({ initialBalance: 100, movements: [
      { date: '2026-11-05', kind: 'receipt', amount: 200 },
      { date: '2026-11-05', kind: 'payment', amount: 120 },
      { date: '2026-11-05', kind: 'payment', amount: 30 },
    ] });
    expect(result).toMatchObject({ valid: true, minimumBalance: -50, finalBalance: 150, additionalInitialBalance: 50, firstNegativePoint: '2026-11-05' });
    if (result.valid) expect(result.days).toEqual([{ date: '2026-11-05', openingBalance: 100, receipts: 200, payments: 150, minimumBalance: -50, closingBalance: 150 }]);
  });

  it('carries a balance across months and years without inventing unlisted movements', () => {
    const result = checkCashDates({ initialBalance: 10, movements: [
      { date: '2027-01-01', kind: 'payment', amount: 20 },
      { date: '2026-12-31', kind: 'receipt', amount: 15 },
    ] });
    expect(result).toMatchObject({ valid: true, finalBalance: 5, minimumBalance: 5 });
    if (result.valid) expect(result.days.map((day) => day.date)).toEqual(['2026-12-31', '2027-01-01']);
    expect(formatCashDate('2027-01-01')).toBe('01/01/2027');
  });

  it('checks a negative initial balance and explicit zero movements', () => {
    expect(checkCashDates({ initialBalance: -100, movements: [{ date: '2026-11-05', kind: 'receipt', amount: 200 }] })).toMatchObject({ valid: true, finalBalance: 100, minimumBalance: -100, additionalInitialBalance: 100, firstNegativePoint: 'initial' });
    expect(checkCashDates({ initialBalance: 0, movements: [{ date: '2026-11-05', kind: 'payment', amount: 0 }] })).toMatchObject({ valid: true, finalBalance: 0, minimumBalance: 0, firstNegativePoint: null });
  });

  it('normalizes cents exactly and rounds negative initial half cents symmetrically', () => {
    expect(checkCashDates({ initialBalance: 0.1, movements: [{ date: '2026-11-05', kind: 'receipt', amount: 0.2 }, { date: '2026-11-06', kind: 'payment', amount: 0.3 }] })).toMatchObject({ valid: true, finalBalance: 0, minimumBalance: 0, additionalInitialBalance: 0 });
    const result = checkCashDates({ initialBalance: -1.005, movements: [{ date: '2026-11-05', kind: 'receipt', amount: 2.005 }] });
    expect(result).toMatchObject({ valid: true, initialBalance: -1.01, totalReceipts: 2.01, finalBalance: 1 });
    const zero = checkCashDates({ initialBalance: -0.001, movements: [{ date: '2026-11-05', kind: 'payment', amount: 0 }] });
    if (zero.valid) expect(Object.is(zero.initialBalance, -0)).toBe(false);
  });

  it.each(['', '2026-02-29', '1900-02-29', '2026-04-31', '2026-00-10', '2026-13-01', '2026-11-00', '2026-1-05', '0000-01-01', '2026-11-05T12:00:00Z'])('rejects invalid calendar date %s', (date) => {
    const result = checkCashDates({ initialBalance: 0, movements: [{ date, kind: 'receipt', amount: 0 }] });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.rows[0].date).toBeTruthy();
  });

  it.each(['2000-02-29', '2024-02-29', '2026-02-28', '2026-12-31'])('accepts the real calendar date %s', (date) => {
    expect(checkCashDates({ initialBalance: 0, movements: [{ date, kind: 'receipt', amount: 0 }] }).valid).toBe(true);
  });

  it.each([Number.NaN, Infinity, Number.MAX_VALUE])('rejects unsafe initial balances %s', (initialBalance) => {
    const result = checkCashDates({ ...cashDatesExample, initialBalance });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.initialBalance).toBeTruthy();
  });

  it.each([-0.001, -1, Number.NaN, Infinity, Number.MAX_VALUE])('rejects invalid movement amount %s', (amount) => {
    const result = checkCashDates({ initialBalance: 0, movements: [{ date: '2026-11-05', kind: 'payment', amount }] });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.rows[0].amount).toBeTruthy();
  });

  it('requires a movement kind and enforces the list bounds', () => {
    const missing = checkCashDates({ initialBalance: 0, movements: [{ date: '2026-11-05', kind: '', amount: 0 }] });
    expect(missing.valid).toBe(false);
    if (!missing.valid) expect(missing.errors.rows[0].kind).toBeTruthy();
    expect(checkCashDates({ initialBalance: 0, movements: [] }).valid).toBe(false);
    expect(checkCashDates({ initialBalance: 0, movements: Array.from({ length: MAX_CASH_MOVEMENTS }, () => ({ date: '2026-11-05', kind: 'receipt' as const, amount: 0 })) }).valid).toBe(true);
    expect(checkCashDates({ initialBalance: 0, movements: Array.from({ length: MAX_CASH_MOVEMENTS + 1 }, () => ({ date: '2026-11-05', kind: 'receipt' as const, amount: 0 })) }).valid).toBe(false);
  });

  it.each([
    { initialBalance: 0, movements: [{ date: '2026-11-05', kind: 'receipt', amount: 9e13 }, { date: '2026-11-05', kind: 'receipt', amount: 9e13 }] },
    { initialBalance: 0, movements: [{ date: '2026-11-05', kind: 'receipt', amount: 9e13 }, { date: '2026-11-06', kind: 'receipt', amount: 9e13 }] },
    { initialBalance: -9e13, movements: [{ date: '2026-11-05', kind: 'payment', amount: 9e13 }, { date: '2026-11-05', kind: 'receipt', amount: 9e13 }] },
  ] satisfies CashDatesInput[])('rejects unsafe aggregates or intermediate balances', (input) => {
    const result = checkCashDates(input);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.movements).toBeTruthy();
  });
});
