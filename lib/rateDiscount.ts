export type RateDiscountInput = { hourlyRate: number; discountPercent: number; currentHours: number; capacityHours: number };
type Errors = Partial<Record<keyof RateDiscountInput, string>>;

function invalid(errors: Errors) { return { valid: false, errors } as const; }

function toHundredths(value: number) {
  const [coefficient, exponent = '0'] = String(value).split('e');
  return Math.round(Number(`${coefficient}e${Number(exponent) + 2}`));
}

export function compareRateDiscount(input: RateDiscountInput) {
  const errors: Errors = {};
  const rateCents = toHundredths(input.hourlyRate);
  const discountTicks = toHundredths(input.discountPercent);
  const currentTicks = toHundredths(input.currentHours);
  const capacityTicks = toHundredths(input.capacityHours);
  if (!Number.isFinite(input.hourlyRate) || input.hourlyRate < 0.01 || !Number.isSafeInteger(rateCents)) {
    errors.hourlyRate = 'Indica una tarifa válida de al menos 0,01 EUR/h sin IVA.';
  }
  if (!Number.isFinite(input.discountPercent) || input.discountPercent < 0 || input.discountPercent > 100 || !Number.isSafeInteger(discountTicks)) {
    errors.discountPercent = 'Indica una rebaja entre 0 y 100 %. Usa 0 si no hay rebaja.';
  }
  if (!Number.isFinite(input.currentHours) || input.currentHours < 0.01 || input.currentHours > 744 || !Number.isSafeInteger(currentTicks)) {
    errors.currentHours = 'Indica entre 0,01 y 744 horas facturadas en el mes de partida.';
  }
  if (!Number.isFinite(input.capacityHours) || input.capacityHours < 0 || input.capacityHours > 744 || !Number.isSafeInteger(capacityTicks)) {
    errors.capacityHours = 'Indica entre 0 y 744 horas disponibles para servicios de clientes en el mes.';
  }
  if (Object.keys(errors).length) return invalid(errors);

  const discountProduct = rateCents * (10000 - discountTicks);
  const baselineProduct = rateCents * currentTicks;
  if (![discountProduct, baselineProduct].every(Number.isSafeInteger)) {
    return invalid({ hourlyRate: 'La combinación de tarifa y horas es demasiado grande para calcularla con precisión.' });
  }
  // Round the negotiated rate first, then use that same rate throughout.
  const reducedCents = Math.round(discountProduct / 10000);
  const baselineCents = Math.round(baselineProduct / 100);
  if (baselineCents < 1) return invalid({ currentHours: 'La tarifa y las horas deben sumar al menos 0,01 EUR.' });
  const sameHoursProduct = reducedCents * currentTicks;
  const capacityProduct = reducedCents * capacityTicks;
  // Preserve the original rate × time value before invoice rounding, so an
  // unchanged rate cannot make the recovery hours lower than the original.
  const requiredNumerator = baselineProduct;
  if (![sameHoursProduct, capacityProduct, requiredNumerator].every(Number.isSafeInteger)) {
    return invalid({ hourlyRate: 'El escenario produce importes demasiado grandes para compararlos con precisión.' });
  }
  const requiredTicks = reducedCents === 0 ? null : Math.ceil(requiredNumerator / reducedCents);
  if (requiredTicks !== null && (!Number.isSafeInteger(requiredTicks) || !Number.isSafeInteger(reducedCents * requiredTicks))) {
    return invalid({ hourlyRate: 'La recuperación de facturación produce cifras demasiado grandes.' });
  }
  const sameHoursCents = Math.round(sameHoursProduct / 100);
  const capacityBillingCents = Math.round(capacityProduct / 100);
  return {
    valid: true,
    hourlyRate: rateCents / 100,
    discountPercent: discountTicks / 100,
    currentHours: currentTicks / 100,
    capacityHours: capacityTicks / 100,
    reducedHourlyRate: reducedCents / 100,
    baselineBilling: baselineCents / 100,
    sameHoursBilling: sameHoursCents / 100,
    lostBilling: (baselineCents - sameHoursCents) / 100,
    requiredHours: requiredTicks === null ? null : requiredTicks / 100,
    extraHours: requiredTicks === null ? null : (requiredTicks - currentTicks) / 100,
    remainingHours: requiredTicks === null ? null : (capacityTicks - requiredTicks) / 100,
    recoveryBilling: requiredTicks === null ? null : Math.round(reducedCents * requiredTicks / 100) / 100,
    capacityBilling: capacityBillingCents / 100,
    capacityBillingDifference: (capacityBillingCents - baselineCents) / 100,
    currentFitsCapacity: currentTicks <= capacityTicks,
    fitsCapacity: requiredTicks !== null && requiredTicks <= capacityTicks,
  } as const;
}

export const rateDiscountExample: RateDiscountInput = { hourlyRate: 40, discountPercent: 10, currentHours: 80, capacityHours: 80 };
export const rateDiscountGuideExamples = [0, 10, 20].map((discountPercent) => compareRateDiscount({ ...rateDiscountExample, discountPercent }));
