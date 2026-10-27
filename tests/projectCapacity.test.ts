import { estimateProjectCapacity, type ProjectCapacityInput } from '@/lib/projectCapacity';
import { projectCapacityExample, projectCapacityResult, projectMonthlyExample, slowerProjectResult } from '@/lib/projectCapacityExample';
import { calculateExample } from '@/lib/scenarioExamples';

describe('monthly complete-project capacity', () => {
  it('uses the same monthly engine and distinguishes billing coverage from capacity', () => {
    expect(projectMonthlyExample).toEqual(calculateExample(3000));
    expect(projectMonthlyExample.billingWithoutVAT).toBe(4149.41);
    expect(projectCapacityResult).toMatchObject({ valid: true, requiredProjects: 2, plannedBilling: 4200, plannedHours: 80, remainingHours: 0, maxProjects: 2, capacityBilling: 4200, billingDifference: 50.59 });
    expect(slowerProjectResult).toMatchObject({ valid: true, requiredProjects: 2, plannedBilling: 4200, plannedHours: 120, remainingHours: -40, maxProjects: 1, capacityBilling: 2100, capacityDifference: -2049.41 });
  });

  it('does not request an extra project for an exact goal, but does for one extra cent', () => {
    expect(estimateProjectCapacity({ ...projectCapacityExample, monthlyBilling: 4200 })).toMatchObject({ valid: true, requiredProjects: 2, billingDifference: 0 });
    expect(estimateProjectCapacity({ ...projectCapacityExample, monthlyBilling: 4200.01 })).toMatchObject({ valid: true, requiredProjects: 3, capacityDifference: -0.01 });
  });

  it('handles decimal durations at the exact capacity boundary without losing a project', () => {
    expect(estimateProjectCapacity({ monthlyBilling: 0.3, pricePerProject: 0.1, billableHours: 0.3, hoursPerProject: 0.1 })).toMatchObject({ valid: true, requiredProjects: 3, maxProjects: 3, plannedHours: 0.3, plannedBilling: 0.3, remainingHours: 0 });
  });

  it('rounds decimal halves in money and hours consistently before dividing', () => {
    expect(estimateProjectCapacity({ monthlyBilling: 2.01, pricePerProject: 1.005, billableHours: 2.02, hoursPerProject: 1.005 })).toMatchObject({ valid: true, pricePerProject: 1.01, hoursPerProject: 1.01, plannedBilling: 2.02, remainingHours: 0, requiredProjects: 2, maxProjects: 2 });
  });

  it('handles spare capacity and a month with no hours for complete projects', () => {
    expect(estimateProjectCapacity({ ...projectCapacityExample, billableHours: 100 })).toMatchObject({ valid: true, remainingHours: 20, maxProjects: 2 });
    expect(estimateProjectCapacity({ ...projectCapacityExample, billableHours: 0 })).toMatchObject({ valid: true, maxProjects: 0, capacityBilling: 0, capacityDifference: -4149.41 });
    expect(estimateProjectCapacity({ ...projectCapacityExample, hoursPerProject: 100 })).toMatchObject({ valid: true, requiredProjects: 2, maxProjects: 0 });
  });

  it.each([
    ['monthlyBilling', 0], ['monthlyBilling', Number.NaN],
    ['pricePerProject', 0], ['pricePerProject', -1], ['pricePerProject', Number.MAX_VALUE],
    ['hoursPerProject', 0], ['hoursPerProject', Number.POSITIVE_INFINITY],
    ['billableHours', -1], ['billableHours', Number.NaN],
  ] as const)('rejects invalid %s without showing a plan', (key, value) => {
    const result = estimateProjectCapacity({ ...projectCapacityExample, [key]: value });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors[key]).toBeTruthy();
  });

  it('blocks unsafe multiplication of otherwise finite values', () => {
    const extreme: ProjectCapacityInput = { monthlyBilling: 1e12, pricePerProject: 0.01, hoursPerProject: 1e12, billableHours: 80 };
    expect(estimateProjectCapacity(extreme).valid).toBe(false);
  });
});
