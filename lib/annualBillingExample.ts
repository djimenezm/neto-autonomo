import { calculateExample } from '@/lib/scenarioExamples';
import { planAnnualBilling } from '@/lib/annualBillingPlan';

export const annualBaselineScenario = { monthlyExpenses: 150, billableHours: 70 };
export const annualBaselineResult = calculateExample(1500, annualBaselineScenario);
export const annualBillingExamples = [
  { label: 'Doce meses activos', activeMonths: 12, hoursPerActiveMonth: 70 },
  { label: 'Diez meses, mismas horas por mes activo', activeMonths: 10, hoursPerActiveMonth: 70 },
  { label: 'Diez meses, mismas horas anuales', activeMonths: 10, hoursPerActiveMonth: 84 },
].map((scenario) => {
  const plan = planAnnualBilling({ monthlyBilling: annualBaselineResult.billingWithoutVAT, ...scenario });
  if (!plan.valid) throw new Error('Invalid annual billing example');
  return { label: scenario.label, ...plan };
});
