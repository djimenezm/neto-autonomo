export type DayRateInput = {
  hourlyRate: number;
  sessionHours: number;
  preparationHours: number;
  followUpHours: number;
  serviceCosts?: number;
  proposedPrice?: number;
};

type Field = keyof DayRateInput;
type DayRateEstimate =
  | { valid: false; errors: Partial<Record<Field, string>> }
  | {
      valid: true;
      totalHours: number;
      hourlyRate: number;
      sessionHours: number;
      preparationHours: number;
      followUpHours: number;
      referencePrice: number;
      serviceCosts: number;
      totalReferencePrice: number;
      proposedPrice: number | null;
      effectiveHourlyRate: number | null;
      availableForTime: number | null;
      availableHourlyRate: number | null;
      priceDifference: number | null;
    };

function toHundredths(value: number) {
  const [coefficient, exponent = '0'] = String(value).split('e');
  return Math.round(Number(`${coefficient}e${Number(exponent) + 2}`));
}

export function estimateDayRate(input: DayRateInput): DayRateEstimate {
  const errors: Partial<Record<Field, string>> = {};
  const rateCents = toHundredths(input.hourlyRate);
  const sessionTicks = toHundredths(input.sessionHours);
  const preparationTicks = toHundredths(input.preparationHours);
  const followUpTicks = toHundredths(input.followUpHours);
  const costCents = toHundredths(input.serviceCosts ?? 0);
  const proposedCents = input.proposedPrice === undefined ? null : toHundredths(input.proposedPrice);
  if (!Number.isFinite(input.hourlyRate) || input.hourlyRate < 0.01 || !Number.isSafeInteger(rateCents)) {
    errors.hourlyRate = 'Introduce una referencia de al menos 0,01 EUR por hora.';
  }
  if (!Number.isFinite(input.sessionHours) || input.sessionHours < 0.01 || input.sessionHours > 24 || !Number.isSafeInteger(sessionTicks)) {
    errors.sessionHours = 'Introduce entre 0,01 y 24 horas de jornada con el cliente.';
  }
  for (const key of ['preparationHours', 'followUpHours'] as const) {
    if (!Number.isFinite(input[key]) || input[key] < 0 || !Number.isSafeInteger(toHundredths(input[key]))) {
      errors[key] = 'Introduce las horas de esta tarea; usa 0 si no la necesitas.';
    }
  }
  if (!Number.isFinite(input.serviceCosts ?? 0) || (input.serviceCosts ?? 0) < 0 || !Number.isSafeInteger(costCents)) {
    errors.serviceCosts = 'Introduce los costes específicos que debe cubrir el precio; usa 0 si no hay.';
  }
  if (input.proposedPrice !== undefined && (!Number.isFinite(input.proposedPrice) || input.proposedPrice < 0)) {
    errors.proposedPrice = 'Introduce un precio de 0 o más, o deja el campo vacío.';
  }
  if (Object.keys(errors).length) return { valid: false, errors };

  // Cents and hundredths of an hour keep a decimal boundary from changing
  // the comparison. Normalized values are also returned to the input fields.
  const totalTicks = sessionTicks + preparationTicks + followUpTicks;
  const referenceProduct = rateCents * totalTicks;
  if (!Number.isSafeInteger(totalTicks) || !Number.isSafeInteger(referenceProduct)) {
    return { valid: false, errors: { hourlyRate: 'El importe es demasiado grande. Revisa la tarifa y las horas.' } };
  }
  const referenceCents = Math.round(referenceProduct / 100);
  const totalReferenceCents = referenceCents + costCents;
  if (!Number.isSafeInteger(totalReferenceCents)) {
    return { valid: false, errors: { serviceCosts: 'La suma de horas y costes es demasiado grande para calcularla con precisión.' } };
  }
  if (proposedCents !== null && !Number.isSafeInteger(proposedCents)) {
    return { valid: false, errors: { proposedPrice: 'El importe es demasiado grande. Revisa el precio.' } };
  }
  const availableCents = proposedCents === null ? null : proposedCents - costCents;
  if (proposedCents !== null && (!Number.isSafeInteger(proposedCents * 100) || !Number.isSafeInteger(availableCents! * 100))) {
    return { valid: false, errors: { proposedPrice: 'La combinación de precio y costes es demasiado grande para comparar por hora.' } };
  }
  return {
    valid: true,
    totalHours: totalTicks / 100,
    hourlyRate: rateCents / 100,
    sessionHours: sessionTicks / 100,
    preparationHours: preparationTicks / 100,
    followUpHours: followUpTicks / 100,
    referencePrice: referenceCents / 100,
    serviceCosts: costCents / 100,
    totalReferencePrice: totalReferenceCents / 100,
    proposedPrice: proposedCents === null ? null : proposedCents / 100,
    effectiveHourlyRate: proposedCents === null ? null : Math.round(proposedCents * 100 / totalTicks) / 100,
    availableForTime: availableCents === null ? null : availableCents / 100,
    // Round negative halves symmetrically and avoid displaying minus zero.
    availableHourlyRate: availableCents === null ? null : (Math.sign(availableCents) * Math.round(Math.abs(availableCents) * 100 / totalTicks) / 100) || 0,
    priceDifference: proposedCents === null ? null : (proposedCents - totalReferenceCents) / 100,
  };
}
