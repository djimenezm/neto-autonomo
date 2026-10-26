export const expenseFields = [
  { key: 'advisor', label: 'Gestoría o asesoría' },
  { key: 'software', label: 'Software y herramientas' },
  { key: 'insurance', label: 'Seguros' },
  { key: 'other', label: 'Otros gastos de actividad' },
] as const;

export const paymentPeriods = [
  { value: 'monthly', label: 'Cada mes', paymentsPerYear: 12 },
  { value: 'quarterly', label: 'Cada 3 meses', paymentsPerYear: 4 },
  { value: 'annual', label: 'Una vez al año', paymentsPerYear: 1 },
] as const;

export type ExpenseKey = (typeof expenseFields)[number]['key'];
export type CostKey = 'fee' | ExpenseKey;
export type PaymentPeriod = (typeof paymentPeriods)[number]['value'];
export type RecurringCostsInput = {
  fee: number;
  expenses: Record<ExpenseKey, { amount: number; period: PaymentPeriod }>;
};

type CostLine = {
  key: CostKey;
  label: string;
  amountPerPayment: number;
  paymentsPerYear: number;
  annualAmount: number;
  monthlyAmount: number;
};
type CostPlan =
  | { valid: false; errors: Partial<Record<CostKey | 'total', string>> }
  | { valid: true; lines: CostLine[]; monthlyTotal: number; annualTotal: number; monthlyFee: number; monthlyOtherCosts: number };

export function estimateRecurringCosts(input: RecurringCostsInput): CostPlan {
  const errors: Partial<Record<CostKey | 'total', string>> = {};
  const sources = [
    { key: 'fee' as const, label: 'Cuota de autónomos', amount: input.fee, period: 'monthly' as const },
    ...expenseFields.map((field) => ({ ...field, ...input.expenses[field.key] })),
  ];
  const lines: CostLine[] = [];
  let annualCents = 0;
  for (const source of sources) {
    const period = paymentPeriods.find(({ value }) => value === source.period);
    const paymentCents = Math.round(source.amount * 100);
    const lineAnnualCents = paymentCents * (period?.paymentsPerYear ?? 0);
    if (!period || !Number.isFinite(source.amount) || source.amount < 0 || !Number.isSafeInteger(paymentCents) || !Number.isSafeInteger(lineAnnualCents)) {
      errors[source.key] = 'Revisa el importe y la frecuencia de este gasto.';
      continue;
    }
    annualCents += lineAnnualCents;
    lines.push({
      key: source.key, label: source.label, amountPerPayment: paymentCents / 100,
      paymentsPerYear: period.paymentsPerYear, annualAmount: lineAnnualCents / 100,
      monthlyAmount: Math.round(lineAnnualCents / 12) / 100,
    });
  }
  if (!Number.isSafeInteger(annualCents)) errors.total = 'El total es demasiado grande. Revisa los importes.';
  if (Object.keys(errors).length) return { valid: false, errors };

  const feeCents = Math.round(input.fee * 100);
  return {
    valid: true, lines,
    annualTotal: annualCents / 100,
    monthlyTotal: Math.round(annualCents / 12) / 100,
    monthlyFee: feeCents / 100,
    monthlyOtherCosts: Math.round((annualCents - feeCents * 12) / 12) / 100,
  };
}

// Fictional planning example, not observed prices or tax deductions.
export const recurringCostsExample: RecurringCostsInput = {
  fee: 320,
  expenses: {
    advisor: { amount: 165, period: 'quarterly' },
    software: { amount: 420, period: 'annual' },
    insurance: { amount: 360, period: 'annual' },
    other: { amount: 40, period: 'monthly' },
  },
};
