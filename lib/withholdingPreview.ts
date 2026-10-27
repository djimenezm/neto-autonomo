type Input = { baseAmount: number; vatAmount: number; withholdingRate: number };

function toHundredths(value: number) {
  const [coefficient, exponent = '0'] = String(value).split('e');
  return Math.round(Number(`${coefficient}e${Number(exponent) + 2}`));
}

export function previewWithholding({ baseAmount, vatAmount, withholdingRate }: Input) {
  const baseCents = toHundredths(baseAmount);
  const vatCents = toHundredths(vatAmount);
  if (!Number.isFinite(baseAmount) || baseAmount <= 0 || !Number.isSafeInteger(baseCents) || baseCents <= 0
    || !Number.isFinite(vatAmount) || vatAmount < 0 || !Number.isSafeInteger(vatCents)
    || !Number.isSafeInteger(baseCents + vatCents)) {
    return { valid: false, field: 'reference', error: 'No se puede comprobar esta base y su IVA. Revisa la referencia del cálculo.' } as const;
  }
  if (!Number.isFinite(withholdingRate) || withholdingRate < 0 || withholdingRate > 100) {
    return { valid: false, field: 'withholdingRate', error: 'Indica un porcentaje entre 0 y 100. Usa 0 si no hay retención.' } as const;
  }
  const rateHundredths = toHundredths(withholdingRate);
  const product = baseCents * rateHundredths;
  if (!Number.isSafeInteger(product)) {
    return { valid: false, field: 'reference', error: 'El importe es demasiado grande para comprobarlo con precisión.' } as const;
  }
  const withholdingCents = Math.round(product / 10000);
  return {
    valid: true,
    baseCents,
    vatCents,
    rateUsed: rateHundredths / 100,
    beforeWithholdingCents: baseCents + vatCents,
    withholdingCents,
    receivableCents: baseCents + vatCents - withholdingCents,
  } as const;
}

export const withholdingExample = { baseAmount: 1000, vatAmount: 210 };
export const withholdingExampleRows = [0, 15].map((withholdingRate) => {
  const result = previewWithholding({ ...withholdingExample, withholdingRate });
  if (!result.valid) throw new Error('Invalid editorial withholding example');
  return result;
});
export const withholdingSource = 'https://sede.agenciatributaria.gob.es/Sede/irpf/retenciones-ingresos-cuenta-pagos-fraccionados/retenciones-ingresos-cuenta.html';
