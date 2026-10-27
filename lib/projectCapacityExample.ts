import { estimateProjectCapacity, exampleProject } from '@/lib/projectCapacity';
import { calculateExample, exampleAssumptions } from '@/lib/scenarioExamples';

export const projectMonthlyExample = calculateExample(3000);
export const projectCapacityExample = {
  monthlyBilling: projectMonthlyExample.billingWithoutVAT,
  billableHours: exampleAssumptions.billableHours,
  ...exampleProject,
};
export const projectCapacityResult = estimateProjectCapacity(projectCapacityExample);
export const slowerProjectResult = estimateProjectCapacity({ ...projectCapacityExample, hoursPerProject: 60 });
