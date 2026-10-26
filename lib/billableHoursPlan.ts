export type BillableHoursPlan = {
  daysPerWeek: number;
  hoursPerDay: number;
  nonBillableHoursPerWeek: number;
  weeksOff: number;
};

export type BillableHoursPlanErrors = Partial<Record<keyof BillableHoursPlan, string>>;

export const exampleHoursPlan: BillableHoursPlan = {
  daysPerWeek: 5,
  hoursPerDay: 8,
  nonBillableHoursPerWeek: 12,
  weeksOff: 6,
};

export function estimateBillableHours(plan: BillableHoursPlan) {
  const errors: BillableHoursPlanErrors = {};
  const limits = { daysPerWeek: 7, hoursPerDay: 24, weeksOff: 52 } as const;

  for (const field of Object.keys(plan) as (keyof BillableHoursPlan)[]) {
    if (!Number.isFinite(plan[field]) || plan[field] < 0) {
      errors[field] = 'Introduce un número válido igual o mayor que cero.';
    }
  }
  for (const field of Object.keys(limits) as (keyof typeof limits)[]) {
    if (plan[field] > limits[field]) {
      errors[field] = `El máximo es ${limits[field]}.`;
    }
  }

  const weeklyWorkHours = plan.daysPerWeek * plan.hoursPerDay;
  if (!errors.daysPerWeek && !errors.hoursPerDay && !errors.nonBillableHoursPerWeek
    && plan.nonBillableHoursPerWeek > weeklyWorkHours) {
    errors.nonBillableHoursPerWeek = 'Estas horas no pueden superar tu jornada semanal.';
  }

  if (Object.keys(errors).length > 0) return { valid: false, errors } as const;

  const activeWeeks = 52 - plan.weeksOff;
  const weeklyBillableHours = weeklyWorkHours - plan.nonBillableHoursPerWeek;
  const annualBillableHours = activeWeeks * weeklyBillableHours;
  const monthlyBillableHours = annualBillableHours / 12;

  return {
    valid: true,
    activeWeeks,
    weeklyWorkHours,
    weeklyBillableHours,
    annualBillableHours,
    monthlyBillableHours,
    // The main calculator accepts whole hours. Never round capacity upwards.
    hoursToApply: Math.floor(monthlyBillableHours),
  } as const;
}
