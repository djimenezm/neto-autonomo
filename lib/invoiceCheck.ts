import { previewWithholding } from '@/lib/withholdingPreview';

export type InvoiceCheckInput = { baseAmount: number; vatRate: number; withholdingRate: number };
type Errors = Partial<Record<keyof InvoiceCheckInput, string>>;
function invalid(errors: Errors) { return { valid: false, errors } as const; }

function toHundredths(value: number) {
  const [coefficient, exponent = '0'] = String(value).split('e');
  return Math.round(Number(`${coefficient}e${Number(exponent) + 2}`));
}

export function checkInvoice(input: InvoiceCheckInput) {
  const errors: Errors = {};
  const baseCents = toHundredths(input.baseAmount);
  const vatTicks = toHundredths(input.vatRate);
  const withholdingTicks = toHundredths(input.withholdingRate);
  if (!Number.isFinite(input.baseAmount) || input.baseAmount < 0.01 || !Number.isSafeInteger(baseCents)) {
    errors.baseAmount = 'Indica una base sin IVA de al menos 0,01 EUR.';
  }
  for (const key of ['vatRate', 'withholdingRate'] as const) {
    if (!Number.isFinite(input[key]) || input[key] < 0 || input[key] > 100) {
      errors[key] = 'Indica un porcentaje entre 0 y 100. Escribe 0 si no se aplica en este supuesto.';
    }
  }
  if (Object.keys(errors).length) return invalid(errors);

  // Keep a common safe integer scale for any supported percentage, including
  // zero-rate cases. Round each tax separately on the same normalized base.
  if (!Number.isSafeInteger(baseCents * 10000)) {
    return invalid({ baseAmount: 'La base es demasiado grande para calcularla con precisión.' });
  }
  const vatCents = Math.round(baseCents * vatTicks / 10000);
  const receipt = previewWithholding({ baseAmount: baseCents / 100, vatAmount: vatCents / 100, withholdingRate: withholdingTicks / 100 });
  if (!receipt.valid) return invalid({ baseAmount: 'No se puede comprobar el importe con precisión. Revisa la base y los porcentajes.' });
  return {
    valid: true,
    baseAmount: receipt.baseCents / 100,
    vatRate: vatTicks / 100,
    withholdingRate: receipt.rateUsed,
    vatAmount: receipt.vatCents / 100,
    withholdingAmount: receipt.withholdingCents / 100,
    beforeWithholdingAmount: receipt.beforeWithholdingCents / 100,
    receivableAmount: receipt.receivableCents / 100,
  } as const;
}

export const invoiceCheckExample: InvoiceCheckInput = { baseAmount: 1000, vatRate: 21, withholdingRate: 15 };
export const invoiceVatSource = 'https://sede.agenciatributaria.gob.es/Sede/iva/calculo-iva-repercutido-clientes.html';
