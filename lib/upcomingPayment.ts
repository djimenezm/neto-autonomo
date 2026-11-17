import { recurringCostsExample, roundCostToCents } from '@/lib/recurringCosts';

type UpcomingPaymentInput = { payment: number; saved: number; contributions: number };
type PaymentPlan =
  | { valid: false; errors: Partial<Record<keyof UpcomingPaymentInput, string>> }
  | ({ valid: true; remaining: number; contributionAmount: number | null } & UpcomingPaymentInput);

export const upcomingPaymentExample = { payment: recurringCostsExample.expenses.software.amount, saved: 90, contributions: 3 };

export function planUpcomingPayment(input: UpcomingPaymentInput): PaymentPlan {
  const { payment, saved, contributions } = input;
  const paymentCents = roundCostToCents(payment);
  const savedCents = roundCostToCents(saved);
  const errors: Partial<Record<keyof UpcomingPaymentInput, string>> = {};
  if (payment <= 0 || paymentCents === 0 || !Number.isSafeInteger(paymentCents)) {
    errors.payment = 'Introduce un importe del recibo de al menos 0,01 EUR.';
  }
  if (saved < 0 || !Number.isSafeInteger(savedCents)) {
    errors.saved = 'Introduce un importe apartado de cero o más euros.';
  }
  if (contributions < 0 || !Number.isSafeInteger(contributions)) {
    errors.contributions = 'Introduce un número entero de cero o más aportaciones.';
  }
  if (Object.keys(errors).length) return { valid: false, errors };

  const remainingCents = Math.max(0, paymentCents - savedCents);
  const contributionAmount = contributions === 0 ? null : Math.ceil(remainingCents / contributions) / 100;
  return { valid: true, payment: paymentCents / 100, saved: savedCents / 100, contributions, remaining: remainingCents / 100, contributionAmount };
}
