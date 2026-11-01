export type ProjectCapacityInput = {
  monthlyBilling: number;
  billableHours: number;
  pricePerProject: number;
  hoursPerProject: number;
};

type ProjectTimeReference =
  | { status: 'available'; hoursCovered: number; excessHours: number }
  | { status: 'no-capacity' | 'out-of-range'; hoursCovered: null; excessHours: null };

type CapacityEstimate =
  | { valid: false; errors: Partial<Record<keyof ProjectCapacityInput, string>> }
  | {
      valid: true;
      monthlyBilling: number;
      billableHours: number;
      pricePerProject: number;
      hoursPerProject: number;
      projectHourlyRate: number;
      projectReferencePrice: number | null;
      projectPriceDifference: number | null;
      projectTimeReference: ProjectTimeReference;
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

  // Compare the project's full hours with the monthly ratio, not with a rounded
  // hourly display. Exact integer division also avoids adding an extra cent
  // at decimal boundaries. Only the reference price rounds up to a whole cent.
  const projectTicks = BigInt(units.hoursPerProject);
  const capacityTicks = BigInt(units.billableHours);
  const hourlyNumerator = BigInt(units.pricePerProject) * BigInt(100);
  const projectHourlyCents = hourlyNumerator / projectTicks
    + (hourlyNumerator % projectTicks * BigInt(2) >= projectTicks ? BigInt(1) : BigInt(0));
  const projectReferenceCents = capacityTicks === BigInt(0) ? null
    : (BigInt(units.monthlyBilling) * projectTicks + capacityTicks - BigInt(1)) / capacityTicks;
  const maximumCents = BigInt(Number.MAX_SAFE_INTEGER);
  if (projectHourlyCents > maximumCents) {
    return { valid: false, errors: { pricePerProject: 'El precio por hora es demasiado grande para calcularlo con precisión. Revisa precio y horas.' } };
  }
  if (projectReferenceCents !== null && projectReferenceCents > maximumCents) {
    return { valid: false, errors: { hoursPerProject: 'La referencia para estas horas es demasiado grande para calcularla con precisión.' } };
  }

  let projectTimeReference: ProjectTimeReference = { status: 'no-capacity', hoursCovered: null, excessHours: null };
  if (capacityTicks > BigInt(0)) {
    // The inverse of the price comparison floors the covered time to hundredths.
    // Keep an unrepresentable time output separate from the existing estimate.
    const coveredTicks = BigInt(units.pricePerProject) * capacityTicks / BigInt(units.monthlyBilling);
    projectTimeReference = coveredTicks > maximumCents
      ? { status: 'out-of-range', hoursCovered: null, excessHours: null }
      : {
          status: 'available',
          hoursCovered: Number(coveredTicks) / 100,
          excessHours: Number(projectTicks > coveredTicks ? projectTicks - coveredTicks : BigInt(0)) / 100,
        };
  }
  return {
    valid: true,
    monthlyBilling: units.monthlyBilling / 100,
    billableHours: units.billableHours / 100,
    pricePerProject: units.pricePerProject / 100,
    hoursPerProject: units.hoursPerProject / 100,
    projectHourlyRate: Number(projectHourlyCents) / 100,
    projectReferencePrice: projectReferenceCents === null ? null : Number(projectReferenceCents) / 100,
    projectPriceDifference: projectReferenceCents === null ? null : Number(BigInt(units.pricePerProject) - projectReferenceCents) / 100,
    projectTimeReference,
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
