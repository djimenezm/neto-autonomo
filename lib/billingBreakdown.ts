import type { CalculationResult } from '@/lib/calculator';

const toCents = (amount: number) => Math.round(amount * 100);

export function getBillingBreakdown(result: CalculationResult) {
  const billingCents = toCents(result.billingWithoutVAT);
  const netCents = toCents(result.targetNet);
  const parts = [
    { key: 'expenses', label: 'Gastos deducibles de la actividad', cents: toCents(result.monthlyExpenses) },
    { key: 'contribution', label: 'Cuota de autónomos', cents: toCents(result.selfEmployedFee) },
    { key: 'irpf', label: 'Reserva estimada de IRPF', cents: toCents(result.estimatedIRPF) },
    ...(result.monthlyNonDeductibleExpenses > 0
      ? [{ key: 'other-costs', label: 'Costes no deducibles', cents: toCents(result.monthlyNonDeductibleExpenses) }]
      : []),
  ];
  const costsCents = parts.reduce((total, part) => total + part.cents, 0);

  return {
    billingCents,
    parts,
    netCents,
    // Reconcile the already-rounded display values; this does not alter the estimate.
    roundingAdjustmentCents: netCents - (billingCents - costsCents),
    vatCents: toCents(result.estimatedVAT),
    withVatCents: billingCents + toCents(result.estimatedVAT),
  };
}
