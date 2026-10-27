export type AnnualBillingInput = { monthlyBilling: number; activeMonths: number; hoursPerActiveMonth: number };

function toHundredths(value: number) {
  const [coefficient, exponent = '0'] = String(value).split('e');
  return Math.round(Number(`${coefficient}e${Number(exponent) + 2}`));
}

export function planAnnualBilling(input: AnnualBillingInput) {
  const errors: Partial<Record<keyof AnnualBillingInput, string>> = {};
  const monthlyCents = toHundredths(input.monthlyBilling);
  const hoursTicks = toHundredths(input.hoursPerActiveMonth);
  if (!Number.isFinite(input.monthlyBilling) || input.monthlyBilling < 0.01 || !Number.isSafeInteger(monthlyCents * 12)) {
    errors.monthlyBilling = 'Revisa la referencia mensual de facturación.';
  }
  if (!Number.isInteger(input.activeMonths) || input.activeMonths < 1 || input.activeMonths > 12) {
    errors.activeMonths = 'Indica entre 1 y 12 meses completos con facturación.';
  }
  if (!Number.isFinite(input.hoursPerActiveMonth) || input.hoursPerActiveMonth < 0.01 || input.hoursPerActiveMonth > 744 || !Number.isSafeInteger(hoursTicks)) {
    errors.hoursPerActiveMonth = 'Indica entre 0,01 y 744 horas facturables por mes activo.';
  }
  if (Object.keys(errors).length) return { valid: false, errors } as const;

  const annualTargetCents = monthlyCents * 12;
  const activeMonthCents = Math.ceil(annualTargetCents / input.activeMonths);
  const hourlyNumerator = activeMonthCents * 100;
  if (!Number.isSafeInteger(hourlyNumerator)) {
    errors.monthlyBilling = 'La referencia es demasiado grande para repartirla con precisión.';
    return { valid: false, errors } as const;
  }
  const hourlyRateCents = Math.ceil(hourlyNumerator / hoursTicks);
  const plannedAnnualCents = activeMonthCents * input.activeMonths;
  return {
    valid: true,
    monthlyBilling: monthlyCents / 100,
    activeMonths: input.activeMonths,
    inactiveMonths: 12 - input.activeMonths,
    hoursPerActiveMonth: hoursTicks / 100,
    annualHours: hoursTicks * input.activeMonths / 100,
    monthlyAverageHours: hoursTicks * input.activeMonths / 1200,
    annualTarget: annualTargetCents / 100,
    billingPerActiveMonth: activeMonthCents / 100,
    plannedAnnualBilling: plannedAnnualCents / 100,
    roundingExcess: (plannedAnnualCents - annualTargetCents) / 100,
    hourlyRate: hourlyRateCents / 100,
    extraPerActiveMonth: (activeMonthCents - monthlyCents) / 100,
  } as const;
}
