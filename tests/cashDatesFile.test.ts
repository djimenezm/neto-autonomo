import { cashDatesExample, checkCashDates } from '@/lib/cashDates';
import { decodeCashDatesFile, encodeCashDatesFile, MAX_CASH_DATES_FILE_BYTES } from '@/lib/cashDatesFile';

function stored() {
  const encoded = encodeCashDatesFile(cashDatesExample, true);
  if (!encoded.valid) throw new Error('Invalid test plan');
  return JSON.parse(encoded.text);
}

describe('cash date plan file', () => {
  it('round trips normalized inputs and the fictional marker without persisting computed results', () => {
    const encoded = encodeCashDatesFile({ ...cashDatesExample, initialBalance: -1.005 }, true);
    expect(encoded.valid).toBe(true);
    if (!encoded.valid) return;
    const raw = JSON.parse(encoded.text);
    expect(raw).not.toHaveProperty('days'); expect(raw).not.toHaveProperty('finalBalance');
    const decoded = decodeCashDatesFile(encoded.text);
    expect(decoded).toMatchObject({ valid: true, fictional: true, input: { initialBalance: -1.01, movements: cashDatesExample.movements } });
  });

  it('recomputes results from the inputs and ignores unrelated or forged result fields', () => {
    const raw = stored();
    raw.finalBalance = 999999; raw.movements[0].closingBalance = 999999;
    const decoded = decodeCashDatesFile(JSON.stringify(raw));
    expect(decoded.valid).toBe(true);
    if (decoded.valid) {
      expect(checkCashDates(decoded.input)).toMatchObject({ valid: true, finalBalance: 700, minimumBalance: -800 });
      expect(decoded.input.movements[0]).not.toHaveProperty('closingBalance');
    }
  });

  it('retains row order, zeroes, duplicate dates and a non-fictional plan', () => {
    const input = { initialBalance: 0, movements: [...cashDatesExample.movements].reverse().map((row) => ({ ...row, date: '2026-11-05', amount: 0 })) };
    const encoded = encodeCashDatesFile(input);
    expect(encoded.valid).toBe(true);
    if (encoded.valid) expect(decodeCashDatesFile(encoded.text)).toEqual({ valid: true, fictional: false, input });
  });

  it('accepts a UTF-8 BOM and rejects oversized UTF-8 content', () => {
    expect(decodeCashDatesFile('\uFEFF' + JSON.stringify(stored())).valid).toBe(true);
    expect(decodeCashDatesFile('é'.repeat(MAX_CASH_DATES_FILE_BYTES / 2 + 1))).toMatchObject({ valid: false, error: expect.stringContaining('64 KB') });
  });

  it.each(['', '<script>alert(1)</script>', '{broken', 'null', '[]'])('rejects unreadable or unrelated content %s', (text) => {
    expect(decodeCashDatesFile(text).valid).toBe(false);
  });

  it.each([
    { version: 2 }, { format: 'bank-statement' }, { sameDayOrder: 'receipts-first' },
    { fictional: 'true' }, { initialBalance: '1000' }, { movements: [] },
    { movements: Array.from({ length: 21 }, () => ({ date: '2026-11-05', kind: 'receipt', amount: 0 })) },
  ])('rejects an unsupported envelope %j', (patch) => {
    expect(decodeCashDatesFile(JSON.stringify({ ...stored(), ...patch })).valid).toBe(false);
  });

  it.each([
    null, { date: '2026-02-30', kind: 'payment', amount: 10 },
    { date: '2026-11-05', kind: 'transfer', amount: 10 },
    { date: '2026-11-05', kind: 'payment', amount: '10' },
    { date: '2026-11-05', kind: 'payment', amount: -1 },
    { date: '2026-11-05', kind: 'payment', amount: 1e30 },
  ])('rejects invalid movement data %j', (movement) => {
    expect(decodeCashDatesFile(JSON.stringify({ ...stored(), movements: [movement] })).valid).toBe(false);
  });

  it('refuses to export an invalid plan', () => {
    expect(encodeCashDatesFile({ ...cashDatesExample, initialBalance: Number.NaN }).valid).toBe(false);
    expect(encodeCashDatesFile({ initialBalance: 0, movements: [] }).valid).toBe(false);
  });
});
