import { calculateFreelanceBilling, type CalculatorInput } from '@/lib/calculator';

type ScenarioOverrides = Partial<Omit<CalculatorInput, 'targetNet'>>;

export const exampleAssumptions = {
  monthlyExpenses: 300,
  billableHours: 80,
  irpfMode: 'manual',
  irpfRate: 15,
  autonomousCommunity: 'common',
  hasIVA: true,
  selfEmployedFeeMode: 'manual',
  selfEmployedFee: 320,
} as const satisfies Omit<CalculatorInput, 'targetNet'>;

export function calculateExample(targetNet: number, overrides: ScenarioOverrides = {}) {
  return calculateFreelanceBilling({
    ...exampleAssumptions,
    ...overrides,
    targetNet,
  });
}

export function getExampleUrl(targetNet: number, overrides: ScenarioOverrides = {}) {
  const input = { ...exampleAssumptions, ...overrides };
  const params = new URLSearchParams({
    targetNet: String(targetNet),
    monthlyExpenses: String(input.monthlyExpenses),
    billableHours: String(input.billableHours),
    irpfMode: input.irpfMode,
    irpfRate: String(input.irpfRate),
    autonomousCommunity: input.autonomousCommunity,
    hasIVA: input.hasIVA ? 'yes' : 'no',
    selfEmployedFeeMode: input.selfEmployedFeeMode,
    selfEmployedFee: String(input.selfEmployedFee),
  });

  return `/?${params.toString()}#calculadora`;
}

export function formatEuro(value: number) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(value);
}
