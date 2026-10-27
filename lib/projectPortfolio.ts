export type PortfolioGroupInput = { quantity: number; pricePerProject: number; hoursPerProject: number };
export type PortfolioInput = { monthlyBilling: number; billableHours: number; groups: PortfolioGroupInput[] };
type GroupErrors = Partial<Record<keyof PortfolioGroupInput, string>>;
type PortfolioErrors = { monthlyBilling?: string; billableHours?: string; groups?: string; rows: GroupErrors[] };

export const MAX_PORTFOLIO_GROUPS = 8;
export const examplePortfolioGroups: PortfolioGroupInput[] = [
  { quantity: 3, pricePerProject: 800, hoursPerProject: 12 },
  { quantity: 1, pricePerProject: 1800, hoursPerProject: 32 },
];

function toHundredths(value: number) {
  const [coefficient, exponent = '0'] = String(value).split('e');
  return Math.round(Number(`${coefficient}e${Number(exponent) + 2}`));
}

export function planMonthlyPortfolio(input: PortfolioInput) {
  const errors: PortfolioErrors = { rows: input.groups.map(() => ({})) };
  const targetCents = toHundredths(input.monthlyBilling);
  const capacityTicks = toHundredths(input.billableHours);
  if (!Number.isFinite(input.monthlyBilling) || input.monthlyBilling < 0.01 || !Number.isSafeInteger(targetCents)) {
    errors.monthlyBilling = 'Revisa la referencia mensual de facturación.';
  }
  if (!Number.isFinite(input.billableHours) || input.billableHours < 0 || !Number.isSafeInteger(capacityTicks)) {
    errors.billableHours = 'Revisa las horas disponibles de tu cálculo mensual.';
  }
  if (input.groups.length < 1 || input.groups.length > MAX_PORTFOLIO_GROUPS) {
    errors.groups = `Incluye entre 1 y ${MAX_PORTFOLIO_GROUPS} grupos de servicios.`;
  }

  let totalCents = 0;
  let totalTicks = 0;
  const groups = input.groups.map((group, index) => {
    const rowErrors = errors.rows[index];
    const priceCents = toHundredths(group.pricePerProject);
    const hoursTicks = toHundredths(group.hoursPerProject);
    if (!Number.isSafeInteger(group.quantity) || group.quantity < 1) {
      rowErrors.quantity = 'Indica una cantidad entera de al menos 1 servicio.';
    }
    if (!Number.isFinite(group.pricePerProject) || group.pricePerProject < 0 || !Number.isSafeInteger(priceCents)) {
      rowErrors.pricePerProject = 'Indica un precio válido de cero o más euros, sin IVA.';
    }
    if (!Number.isFinite(group.hoursPerProject) || group.hoursPerProject < 0.01 || !Number.isSafeInteger(hoursTicks)) {
      rowErrors.hoursPerProject = 'Indica al menos 0,01 horas por servicio, contando todo el tiempo del cliente.';
    }
    const billingCents = group.quantity * priceCents;
    const workTicks = group.quantity * hoursTicks;
    if (!Object.keys(rowErrors).length) {
      if (!Number.isSafeInteger(billingCents) || !Number.isSafeInteger(workTicks)) {
        rowErrors.quantity = 'El grupo produce cifras demasiado grandes para calcularlas con precisión.';
      } else if (!Number.isSafeInteger(totalCents + billingCents) || !Number.isSafeInteger(totalTicks + workTicks)) {
        errors.groups = 'La suma de los grupos es demasiado grande para calcularla con precisión.';
      } else {
        totalCents += billingCents;
        totalTicks += workTicks;
      }
    }
    return { quantity: group.quantity, pricePerProject: priceCents / 100, hoursPerProject: hoursTicks / 100, billing: billingCents / 100, hours: workTicks / 100 };
  });
  if (errors.monthlyBilling || errors.billableHours || errors.groups || errors.rows.some((row) => Object.keys(row).length)) {
    return { valid: false, errors } as const;
  }
  return {
    valid: true,
    monthlyBilling: targetCents / 100,
    billableHours: capacityTicks / 100,
    groups,
    plannedBilling: totalCents / 100,
    plannedHours: totalTicks / 100,
    billingDifference: (totalCents - targetCents) / 100,
    remainingHours: (capacityTicks - totalTicks) / 100,
    coversBilling: totalCents >= targetCents,
    fitsHours: totalTicks <= capacityTicks,
  } as const;
}
