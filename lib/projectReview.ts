export type ProjectReviewInput = {
  hourlyReference: number;
  finalPrice: number;
  plannedHours: number;
  actualHours: number;
};

export const projectReviewExample: ProjectReviewInput = {
  hourlyReference: 40,
  finalPrice: 400,
  plannedHours: 8,
  actualHours: 12,
};

function toHundredths(value: number) {
  const [coefficient, exponent = '0'] = String(value).split('e');
  return Math.round(Number(`${coefficient}e${Number(exponent) + 2}`));
}

export function reviewProject(input: ProjectReviewInput) {
  const errors: Partial<Record<keyof ProjectReviewInput, string>> = {};
  const rateCents = toHundredths(input.hourlyReference);
  const priceCents = toHundredths(input.finalPrice);
  const plannedTicks = toHundredths(input.plannedHours);
  const actualTicks = toHundredths(input.actualHours);

  if (!Number.isFinite(input.hourlyReference) || input.hourlyReference < 0.01 || !Number.isSafeInteger(rateCents)) {
    errors.hourlyReference = 'Indica una referencia de al menos 0,01 EUR/h.';
  }
  if (!Number.isFinite(input.finalPrice) || input.finalPrice < 0 || !Number.isSafeInteger(priceCents * 100)) {
    errors.finalPrice = 'Indica un precio de cero o más euros que se pueda calcular con precisión.';
  }
  for (const [key, ticks] of [['plannedHours', plannedTicks], ['actualHours', actualTicks]] as const) {
    if (!Number.isFinite(input[key]) || input[key] < 0.01 || !Number.isSafeInteger(ticks)) {
      errors[key] = 'Indica al menos 0,01 horas, usando decimales: 1,5 significa una hora y media.';
    }
  }
  if (Object.keys(errors).length) return { valid: false, errors } as const;
  if (!Number.isSafeInteger(rateCents * actualTicks)) {
    errors.actualHours = 'La combinación de horas y referencia es demasiado grande para calcularla con precisión.';
    return { valid: false, errors } as const;
  }

  const actualReferenceCents = Math.ceil(rateCents * actualTicks / 100);
  return {
    valid: true,
    hourlyReference: rateCents / 100,
    finalPrice: priceCents / 100,
    plannedHours: plannedTicks / 100,
    actualHours: actualTicks / 100,
    plannedHourlyRevenue: Math.round(priceCents * 100 / plannedTicks) / 100,
    actualHourlyRevenue: Math.round(priceCents * 100 / actualTicks) / 100,
    hoursDifference: (actualTicks - plannedTicks) / 100,
    hoursAtReference: Math.floor(priceCents * 100 / rateCents) / 100,
    actualReferencePrice: actualReferenceCents / 100,
    priceDifference: (priceCents - actualReferenceCents) / 100,
  } as const;
}
