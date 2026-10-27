export type CashMonthInput = { receipts: number; payments: number };
export type CashPlanInput = { initialBalance: number; months: readonly CashMonthInput[] };
type CashPlanErrors = { initialBalance?: string; months?: string; rows: Partial<Record<keyof CashMonthInput, string>>[] };
type CashMonthResult = CashMonthInput & { openingBalance: number; closingBalance: number };
export const CASH_PLAN_MONTHS = 3;

function toCents(value: number) {
  const [coefficient, exponent = '0'] = String(Math.abs(value)).split('e');
  const cents = Math.round(Number(`${coefficient}e${Number(exponent) + 2}`));
  return cents === 0 ? 0 : Math.sign(value) * cents;
}

export function planCash(input: CashPlanInput) {
  const errors: CashPlanErrors = { rows: input.months.map(() => ({})) };
  const initialCents = toCents(input.initialBalance);
  if (!Number.isFinite(input.initialBalance) || !Number.isSafeInteger(initialCents)) {
    errors.initialBalance = 'Indica un saldo inicial válido; puede ser cero o negativo.';
  }
  if (input.months.length !== CASH_PLAN_MONTHS) errors.months = 'Introduce cobros y pagos para tres meses consecutivos.';
  const units = input.months.map((month, index) => {
    const receipts = toCents(month.receipts);
    const payments = toCents(month.payments);
    for (const key of ['receipts', 'payments'] as const) {
      if (!Number.isFinite(month[key]) || month[key] < 0 || !Number.isSafeInteger(key === 'receipts' ? receipts : payments)) {
        errors.rows[index][key] = 'Indica un importe válido de cero o más euros. Usa 0 si no prevés movimientos.';
      }
    }
    return { receipts, payments };
  });
  if (errors.initialBalance || errors.months || errors.rows.some((row) => Object.keys(row).length)) return { valid: false, errors } as const;

  let balance = initialCents;
  let totalReceipts = 0;
  let totalPayments = 0;
  let minimumBalance = initialCents;
  let firstNegativePoint: number | null = initialCents < 0 ? 0 : null;
  const months: CashMonthResult[] = [];
  for (const [index, month] of units.entries()) {
    const beforePayments = balance + month.receipts;
    const closingBalance = beforePayments - month.payments;
    totalReceipts += month.receipts;
    totalPayments += month.payments;
    if (![beforePayments, closingBalance, totalReceipts, totalPayments].every(Number.isSafeInteger)) {
      errors.months = 'Los movimientos o saldos son demasiado grandes para calcularlos con precisión.';
      return { valid: false, errors } as const;
    }
    months.push({ openingBalance: balance / 100, receipts: month.receipts / 100, payments: month.payments / 100, closingBalance: closingBalance / 100 });
    balance = closingBalance;
    minimumBalance = Math.min(minimumBalance, balance);
    if (firstNegativePoint === null && balance < 0) firstNegativePoint = index + 1;
  }
  return {
    valid: true,
    initialBalance: initialCents / 100,
    months,
    totalReceipts: totalReceipts / 100,
    totalPayments: totalPayments / 100,
    balanceChange: (totalReceipts - totalPayments) / 100,
    finalBalance: balance / 100,
    minimumBalance: minimumBalance / 100,
    additionalAtCheckpoints: Math.max(0, -minimumBalance) / 100,
    firstNegativePoint,
  } as const;
}

export const cashPlanExample: CashPlanInput = {
  initialBalance: 1000,
  months: [{ receipts: 0, payments: 1800 }, { receipts: 3600, payments: 1800 }, { receipts: 1800, payments: 2100 }],
};
export const cashPlanExampleResult = planCash(cashPlanExample);
export const delayedCashPlanExampleResult = planCash({ initialBalance: cashPlanExample.initialBalance, months: [{ receipts: 0, payments: 1800 }, { receipts: 0, payments: 1800 }, { receipts: 5400, payments: 2100 }] });
export const cashPlanSource = 'https://clientebancario.bde.es/pcb/es/blog/autonomo--puedes-adelantar-el-cobro-de-tus-facturas.html';
