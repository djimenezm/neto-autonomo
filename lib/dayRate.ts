export type DayRateInput = {
  hourlyRate: number;
  sessionHours: number;
  preparationHours: number;
  followUpHours: number;
  proposedPrice?: number;
};

type Field = keyof DayRateInput;
type DayRateEstimate =
  | { valid: false; errors: Partial<Record<Field, string>> }
  | {
      valid: true;
      totalHours: number;
      hourlyRate: number;
      referencePrice: number;
      proposedPrice: number | null;
      effectiveHourlyRate: number | null;
      priceDifference: number | null;
    };

const roundMoney = (value: number) => Math.round(value * 100) / 100;

export function estimateDayRate(input: DayRateInput): DayRateEstimate {
  const errors: Partial<Record<Field, string>> = {};
  if (!Number.isFinite(input.hourlyRate) || input.hourlyRate < 0.01 || !Number.isSafeInteger(Math.round(input.hourlyRate * 100))) {
    errors.hourlyRate = 'Introduce una referencia de al menos 0,01 EUR por hora.';
  }
  if (!Number.isFinite(input.sessionHours) || input.sessionHours < 0.01 || input.sessionHours > 24) {
    errors.sessionHours = 'Introduce entre 0,01 y 24 horas de jornada con el cliente.';
  }
  for (const key of ['preparationHours', 'followUpHours'] as const) {
    if (!Number.isFinite(input[key]) || input[key] < 0) {
      errors[key] = 'Introduce las horas de esta tarea; usa 0 si no la necesitas.';
    }
  }
  if (input.proposedPrice !== undefined && (!Number.isFinite(input.proposedPrice) || input.proposedPrice < 0)) {
    errors.proposedPrice = 'Introduce un precio de 0 o más, o deja el campo vacío.';
  }
  if (Object.keys(errors).length) return { valid: false, errors };

  const hourlyRate = roundMoney(input.hourlyRate);
  const totalHours = input.sessionHours + input.preparationHours + input.followUpHours;
  const referenceCents = Math.round(hourlyRate * totalHours * 100);
  const proposedCents = input.proposedPrice === undefined ? null : Math.round(input.proposedPrice * 100);
  if (!Number.isFinite(totalHours) || !Number.isSafeInteger(referenceCents)) {
    return { valid: false, errors: { hourlyRate: 'El importe es demasiado grande. Revisa la tarifa y las horas.' } };
  }
  if (proposedCents !== null && !Number.isSafeInteger(proposedCents)) {
    return { valid: false, errors: { proposedPrice: 'El importe es demasiado grande. Revisa el precio.' } };
  }
  return {
    valid: true,
    totalHours,
    hourlyRate,
    referencePrice: referenceCents / 100,
    proposedPrice: proposedCents === null ? null : proposedCents / 100,
    effectiveHourlyRate: proposedCents === null ? null : roundMoney(proposedCents / 100 / totalHours),
    priceDifference: proposedCents === null ? null : (proposedCents - referenceCents) / 100,
  };
}
