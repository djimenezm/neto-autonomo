export type ProjectCapacityInput = {
  monthlyBilling: number;
  billableHours: number;
  pricePerProject: number;
  hoursPerProject: number;
};

type CapacityEstimate =
  | { valid: false; errors: Partial<Record<keyof ProjectCapacityInput, string>> }
  | {
      valid: true;
      monthlyBilling: number;
      billableHours: number;
      pricePerProject: number;
      hoursPerProject: number;
      requiredProjects: number;
      plannedBilling: number;
      plannedHours: number;
      billingDifference: number;
      remainingHours: number;
      maxProjects: number;
      capacityBilling: number;
      capacityDifference: number;
    };

function toHundredths(value: number) {
  // Shift decimal notation before rounding, including halves such as 1.005.
  const [coefficient, exponent = '0'] = String(value).split('e');
  return Math.round(Number(`${coefficient}e${Number(exponent) + 2}`));
}

export function estimateProjectCapacity(input: ProjectCapacityInput): CapacityEstimate {
  const errors: Partial<Record<keyof ProjectCapacityInput, string>> = {};
  const units = {
    monthlyBilling: toHundredths(input.monthlyBilling),
    billableHours: toHundredths(input.billableHours),
    pricePerProject: toHundredths(input.pricePerProject),
    hoursPerProject: toHundredths(input.hoursPerProject),
  };
  for (const key of ['monthlyBilling', 'pricePerProject', 'hoursPerProject'] as const) {
    if (!Number.isFinite(input[key]) || input[key] < 0.01 || !Number.isSafeInteger(units[key])) {
      errors[key] = key === 'hoursPerProject'
        ? 'Indica al menos 0,01 horas por encargo y un número válido.'
        : 'Indica un importe válido de al menos 0,01 EUR.';
    }
  }
  if (!Number.isFinite(input.billableHours) || input.billableHours < 0 || !Number.isSafeInteger(units.billableHours)) {
    errors.billableHours = 'Revisa las horas disponibles de tu cálculo mensual.';
  }
  if (Object.keys(errors).length) return { valid: false, errors };

  // Money uses cents; time uses hundredths of an hour. Integer division avoids
  // dropping a whole project because of decimal errors such as 0.3 / 0.1.
  const requiredProjects = Math.ceil(units.monthlyBilling / units.pricePerProject);
  const maxProjects = Math.floor(units.billableHours / units.hoursPerProject);
  const plannedBilling = requiredProjects * units.pricePerProject;
  const plannedHours = requiredProjects * units.hoursPerProject;
  const capacityBilling = maxProjects * units.pricePerProject;
  if (![plannedBilling, plannedHours, capacityBilling].every(Number.isSafeInteger)) {
    return { valid: false, errors: { pricePerProject: 'El plan produce cifras demasiado grandes. Revisa precio y horas.' } };
  }
  return {
    valid: true,
    monthlyBilling: units.monthlyBilling / 100,
    billableHours: units.billableHours / 100,
    pricePerProject: units.pricePerProject / 100,
    hoursPerProject: units.hoursPerProject / 100,
    requiredProjects,
    plannedBilling: plannedBilling / 100,
    plannedHours: plannedHours / 100,
    billingDifference: (plannedBilling - units.monthlyBilling) / 100,
    remainingHours: (units.billableHours - plannedHours) / 100,
    maxProjects,
    capacityBilling: capacityBilling / 100,
    capacityDifference: (capacityBilling - units.monthlyBilling) / 100,
  };
}

export const exampleProject = { pricePerProject: 2100, hoursPerProject: 40 } as const;
