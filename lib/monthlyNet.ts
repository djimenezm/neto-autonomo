import { AUTONOMOUS_COMMUNITY_LABELS, calculateSimplifiedAnnualIRPF, type CalculationResult } from '@/lib/calculator';

export type NetPreviewReference = Pick<CalculationResult, 'targetNet' | 'monthlyExpenses' | 'monthlyNonDeductibleExpenses' | 'selfEmployedFee' | 'selfEmployedFeeMode' | 'irpfMode' | 'irpfRate' | 'autonomousCommunity'>;

export function netReferenceFromResult(result: CalculationResult): NetPreviewReference {
  return {
    targetNet: result.targetNet, monthlyExpenses: result.monthlyExpenses,
    monthlyNonDeductibleExpenses: result.monthlyNonDeductibleExpenses,
    selfEmployedFee: result.selfEmployedFee, selfEmployedFeeMode: result.selfEmployedFeeMode,
    irpfMode: result.irpfMode, irpfRate: result.irpfRate, autonomousCommunity: result.autonomousCommunity,
  };
}

function toHundredths(value: number) {
  const [coefficient, exponent = '0'] = String(value).split('e');
  return Math.round(Number(`${coefficient}e${Number(exponent) + 2}`));
}

export function estimateMonthlyNet(reference: NetPreviewReference, monthlyBilling: number) {
  const errors: { monthlyBilling?: string; reference?: string } = {};
  const billingCents = toHundredths(monthlyBilling);
  const expensesCents = toHundredths(reference.monthlyExpenses);
  const feeCents = toHundredths(reference.selfEmployedFee);
  const otherCostsCents = toHundredths(reference.monthlyNonDeductibleExpenses);
  const targetCents = toHundredths(reference.targetNet);
  const rateTicks = toHundredths(reference.irpfRate);
  if (!Number.isFinite(monthlyBilling) || monthlyBilling < 0 || !Number.isSafeInteger(billingCents)) {
    errors.monthlyBilling = 'Indica una facturación mensual válida de cero o más euros, sin IVA.';
  }
  if ([reference.monthlyExpenses, reference.selfEmployedFee, reference.monthlyNonDeductibleExpenses, reference.targetNet].some((value) => !Number.isFinite(value) || value < 0)
    || ![expensesCents, feeCents, otherCostsCents, targetCents, expensesCents + feeCents + otherCostsCents].every(Number.isSafeInteger)
    || !['manual', 'progressive'].includes(reference.irpfMode)
    || !Object.hasOwn(AUTONOMOUS_COMMUNITY_LABELS, reference.autonomousCommunity)
    || (reference.irpfMode === 'manual' && (!Number.isFinite(reference.irpfRate) || reference.irpfRate < 0 || reference.irpfRate > 99))) {
    errors.reference = 'Revisa los costes, la cuota y el criterio de IRPF del cálculo principal.';
  }
  if (Object.keys(errors).length) return { valid: false, errors } as const;

  const preTaxCents = billingCents - expensesCents - feeCents;
  const positiveProfitCents = Math.max(0, preTaxCents);
  if (!Number.isSafeInteger(positiveProfitCents * 12)
    || (reference.irpfMode === 'manual' && !Number.isSafeInteger(positiveProfitCents * rateTicks))) {
    errors.monthlyBilling = 'El importe es demasiado grande para estimar la reserva con precisión.';
    return { valid: false, errors } as const;
  }
  // Reuse the existing annual IRPF model. The contribution is a fixed scenario
  // assumption: no inverse contribution-band solver or new fiscal rules.
  const irpfCents = reference.irpfMode === 'manual'
    ? Math.round(positiveProfitCents * rateTicks / 10000)
    : toHundredths(calculateSimplifiedAnnualIRPF(positiveProfitCents * 12 / 100, reference.autonomousCommunity).annualIRPF / 12);
  const netCents = preTaxCents - irpfCents - otherCostsCents;
  const differenceCents = netCents - targetCents;
  if (![preTaxCents, irpfCents, netCents, differenceCents].every(Number.isSafeInteger) || irpfCents < 0) {
    errors.monthlyBilling = 'La estimación produce cifras demasiado grandes. Revisa el importe y los costes.';
    return { valid: false, errors } as const;
  }
  return {
    valid: true,
    monthlyBilling: billingCents / 100,
    monthlyExpenses: expensesCents / 100,
    selfEmployedFee: feeCents / 100,
    monthlyNonDeductibleExpenses: otherCostsCents / 100,
    preTaxProfit: preTaxCents / 100,
    estimatedIRPF: irpfCents / 100,
    estimatedNet: netCents / 100,
    targetNet: targetCents / 100,
    netDifference: differenceCents / 100,
  } as const;
}

export const netPreviewSources = {
  incomeAndExpenses: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/folleto-actividades-economicas/3-impuesto-sobre-renta-personas-fisicas/3_4-estimacion-directa-normal/3_4_1-calculo-rendimiento-neto.html',
  contributionReview: 'https://www.seg-social.es/wps/portal/wss/internet/HerramientasWeb/a0f05310-9c20-45ba-9dd2-47c9e88f34c1?changeLanguage=es',
};
