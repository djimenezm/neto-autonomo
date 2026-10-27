import { calculateFreelanceBilling, type CalculatorInput } from '@/lib/calculator';

export const reducedFeeExamples = [1200, 1400].map((targetNet) => {
  const input: CalculatorInput = {
    targetNet, monthlyExpenses: 200, monthlyNonDeductibleExpenses: 0,
    billableHours: 80, irpfMode: 'manual', irpfRate: 15,
    autonomousCommunity: 'common', hasIVA: true, selfEmployedFee: 0,
    selfEmployedFeeMode: 'reduced', reducedFeePeriod: 'extended',
  };
  return { input, result: calculateFreelanceBilling(input) };
});
