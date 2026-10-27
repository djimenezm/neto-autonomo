import { exampleAssumptions } from '@/lib/scenarioExamples';
import { compareMonthlyScenarios } from '@/lib/monthlyScenarios';

export const monthlyScenarioInput = { ...exampleAssumptions, targetNet: 2000 };
export const monthlyScenarioExamples = [
  { label: 'Partida', monthlyExpenses: 300, billableHours: 80 },
  { label: 'Solo menos horas', monthlyExpenses: 300, billableHours: 60 },
  { label: 'Solo más gastos', monthlyExpenses: 450, billableHours: 80 },
  { label: 'Ambos cambios', monthlyExpenses: 450, billableHours: 60 },
].map((scenario) => {
  const comparison = compareMonthlyScenarios(monthlyScenarioInput, scenario);
  if (!comparison.valid) throw new Error('Invalid editorial monthly scenario');
  return { ...scenario, ...comparison };
});
