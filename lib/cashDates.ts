export type CashMovementInput = { date: string; kind: 'receipt' | 'payment' | ''; amount: number };
export type CashDatesInput = { initialBalance: number; movements: readonly CashMovementInput[] };
type MovementErrors = Partial<Record<keyof CashMovementInput, string>>;
type CashDatesErrors = { initialBalance?: string; movements?: string; rows: MovementErrors[] };
export const MAX_CASH_MOVEMENTS = 20;

function toCents(value: number) {
  const [coefficient, exponent = '0'] = String(Math.abs(value)).split('e');
  const cents = Math.round(Number(`${coefficient}e${Number(exponent) + 2}`));
  return cents === 0 ? 0 : Math.sign(value) * cents;
}

function isCalendarDate(value: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return year > 0 && day <= days[month - 1];
}

export function formatCashDate(date: string) {
  return date.split('-').reverse().join('/');
}

export function checkCashDates(input: CashDatesInput) {
  const errors: CashDatesErrors = { rows: input.movements.map(() => ({})) };
  const initialCents = toCents(input.initialBalance);
  if (!Number.isFinite(input.initialBalance) || !Number.isSafeInteger(initialCents)) {
    errors.initialBalance = 'Indica el saldo antes del primer movimiento; puede ser cero o negativo.';
  }
  if (input.movements.length < 1 || input.movements.length > MAX_CASH_MOVEMENTS) {
    errors.movements = `Incluye entre 1 y ${MAX_CASH_MOVEMENTS} movimientos.`;
  }
  const normalized = input.movements.map((movement, index) => {
    const cents = toCents(movement.amount);
    if (!isCalendarDate(movement.date)) errors.rows[index].date = 'Indica una fecha válida completa.';
    if (movement.kind !== 'receipt' && movement.kind !== 'payment') errors.rows[index].kind = 'Elige si es un cobro o un pago.';
    if (!Number.isFinite(movement.amount) || movement.amount < 0 || !Number.isSafeInteger(cents)) {
      errors.rows[index].amount = 'Indica un importe válido de cero o más euros.';
    }
    return { ...movement, amount: cents / 100, cents };
  });
  if (errors.initialBalance || errors.movements || errors.rows.some((row) => Object.keys(row).length)) return { valid: false, errors } as const;

  const grouped = new Map<string, { receipts: number; payments: number }>();
  for (const movement of normalized) {
    const day = grouped.get(movement.date) ?? { receipts: 0, payments: 0 };
    day[movement.kind === 'receipt' ? 'receipts' : 'payments'] += movement.cents;
    if (!Number.isSafeInteger(day.receipts) || !Number.isSafeInteger(day.payments)) {
      return { valid: false, errors: { ...errors, movements: 'Los importes agrupados son demasiado grandes para calcularlos con precisión.' } } as const;
    }
    grouped.set(movement.date, day);
  }
  let balance = initialCents;
  let minimum = initialCents;
  let firstNegativePoint: string | null = initialCents < 0 ? 'initial' : null;
  let totalReceipts = 0;
  let totalPayments = 0;
  const days = [];
  for (const [date, day] of [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    // Conservative order within a date: every payment before any receipt.
    // A positive end-of-day balance must not hide the earlier shortfall.
    const afterPayments = balance - day.payments;
    const closing = afterPayments + day.receipts;
    totalReceipts += day.receipts;
    totalPayments += day.payments;
    if (![afterPayments, closing, totalReceipts, totalPayments].every(Number.isSafeInteger)) {
      return { valid: false, errors: { ...errors, movements: 'Los saldos o totales son demasiado grandes para calcularlos con precisión.' } } as const;
    }
    days.push({ date, openingBalance: balance / 100, payments: day.payments / 100, receipts: day.receipts / 100, minimumBalance: afterPayments / 100, closingBalance: closing / 100 });
    minimum = Math.min(minimum, afterPayments);
    if (firstNegativePoint === null && afterPayments < 0) firstNegativePoint = date;
    balance = closing;
  }
  return {
    valid: true,
    initialBalance: initialCents / 100,
    movements: normalized.map(({ date, kind, amount }) => ({ date, kind, amount })),
    days,
    totalReceipts: totalReceipts / 100,
    totalPayments: totalPayments / 100,
    finalBalance: balance / 100,
    minimumBalance: minimum / 100,
    additionalInitialBalance: Math.max(0, -minimum) / 100,
    firstNegativePoint,
  } as const;
}

export const cashDatesExample: CashDatesInput = {
  initialBalance: 1000,
  movements: [
    { date: '2026-11-05', kind: 'payment', amount: 1800 },
    { date: '2026-11-20', kind: 'receipt', amount: 2400 },
    { date: '2026-11-25', kind: 'payment', amount: 900 },
  ],
};
export const cashDatesExampleResult = checkCashDates(cashDatesExample);
