import { checkCashDates, MAX_CASH_MOVEMENTS, type CashDatesInput, type CashMovementInput } from '@/lib/cashDates';

export const CASH_DATES_FILENAME = 'plan-caja-fechas.json';
export const MAX_CASH_DATES_FILE_BYTES = 64 * 1024;
const format = 'cuantofacturar-caja-fechas';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function encodeCashDatesFile(input: CashDatesInput, fictional = false) {
  const result = checkCashDates(input);
  if (!result.valid) return { valid: false, error: 'Comprueba un plan válido antes de guardarlo.' } as const;
  return {
    valid: true,
    text: JSON.stringify({
      format, version: 1, sameDayOrder: 'payments-first', fictional,
      initialBalance: result.initialBalance,
      movements: result.movements,
    }, null, 2) + '\n',
  } as const;
}

export function decodeCashDatesFile(text: string) {
  if (new TextEncoder().encode(text).byteLength > MAX_CASH_DATES_FILE_BYTES) {
    return { valid: false, error: 'El archivo supera el máximo de 64 KB.' } as const;
  }
  let data: unknown;
  try { data = JSON.parse(text.replace(/^\uFEFF/, '')); } catch {
    return { valid: false, error: 'No se puede leer este archivo. Elige un plan guardado desde este comprobador (.json).' } as const;
  }
  if (!isRecord(data) || data.format !== format || data.version !== 1 || data.sameDayOrder !== 'payments-first'
    || typeof data.fictional !== 'boolean' || typeof data.initialBalance !== 'number'
    || !Array.isArray(data.movements) || data.movements.length < 1 || data.movements.length > MAX_CASH_MOVEMENTS) {
    return { valid: false, error: 'El archivo no tiene un formato de plan compatible. No se ha cambiado tu plan actual.' } as const;
  }
  const movements: CashMovementInput[] = [];
  for (const row of data.movements) {
    if (!isRecord(row) || typeof row.date !== 'string' || (row.kind !== 'receipt' && row.kind !== 'payment') || typeof row.amount !== 'number') {
      return { valid: false, error: 'Hay un movimiento con datos no válidos. No se ha cambiado tu plan actual.' } as const;
    }
    // Only copy expected input fields. Stored results and unrelated keys are ignored.
    movements.push({ date: row.date, kind: row.kind, amount: row.amount });
  }
  const result = checkCashDates({ initialBalance: data.initialBalance, movements });
  if (!result.valid) return { valid: false, error: 'Revisa las fechas y los importes del archivo: no forman un plan válido. No se ha cambiado tu plan actual.' } as const;
  return {
    valid: true,
    input: { initialBalance: result.initialBalance, movements: result.movements },
    fictional: data.fictional,
  } as const;
}
