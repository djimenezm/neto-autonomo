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

function decimalParts(value: number) {
  const [coefficient, exponent = '0'] = String(value).split('e');
  const fractionalDigits = coefficient.split('.')[1]?.length ?? 0;
  return {
    units: BigInt(coefficient.replace('.', '')),
    places: fractionalDigits - Number(exponent),
  };
}

export function estimateBillableHours(plan: BillableHoursPlan) {
  const errors: BillableHoursPlanErrors = {};
  const limits = { daysPerWeek: 7, hoursPerDay: 24, weeksOff: 52 } as const;
  const fields = ['daysPerWeek', 'hoursPerDay', 'nonBillableHoursPerWeek', 'weeksOff'] as const;

  for (const field of fields) {
    if (!Number.isFinite(plan[field]) || plan[field] < 0) {
      errors[field] = 'Introduce un número válido igual o mayor que cero.';
    }
  }
  for (const field of Object.keys(limits) as (keyof typeof limits)[]) {
    if (plan[field] > limits[field]) {
      errors[field] = `El máximo es ${limits[field]}.`;
    }
  }

  if (Object.keys(errors).length > 0) return { valid: false, errors } as const;

  // Preserve the entered decimal precision. Binary arithmetic can make an exact
  // 42-hour month become 41.999… or reject a week with exactly zero capacity.
  const parts = fields.map((field) => decimalParts(plan[field]));
  const places = Math.max(0, ...parts.map((part) => part.places));
  const ten = BigInt(10);
  const unit = ten ** BigInt(places);
  const [days, hours, nonBillableHours, weeksOff] = parts.map(
    (part) => part.units * ten ** BigInt(places - part.places),
  );
  const weeklyWorkUnits = days * hours;
  const weeklyBillableUnits = weeklyWorkUnits - nonBillableHours * unit;
  if (weeklyBillableUnits < BigInt(0)) {
    errors.nonBillableHoursPerWeek = 'Estas horas no pueden superar tu jornada semanal.';
    return { valid: false, errors } as const;
  }

  const activeWeekUnits = BigInt(52) * unit - weeksOff;
  const annualUnits = activeWeekUnits * weeklyBillableUnits;
  const annualScale = unit * unit * unit;
  // Convert only the displayed quantities to Number. Complete monthly hours
  // come from exact integer division, never from a rounded display or epsilon.
  const activeWeeks = Number(`${activeWeekUnits}e-${places}`);
  const weeklyWorkHours = Number(`${weeklyWorkUnits}e-${places * 2}`);
  const weeklyBillableHours = Number(`${weeklyBillableUnits}e-${places * 2}`);
  const annualBillableHours = Number(`${annualUnits}e-${places * 3}`);
  const monthlyBillableHours = annualBillableHours / 12;

  return {
    valid: true,
    activeWeeks,
    weeklyWorkHours,
    weeklyBillableHours,
    annualBillableHours,
    monthlyBillableHours,
    // The main calculator accepts whole hours. Never round capacity upwards.
    hoursToApply: Number(annualUnits / (BigInt(12) * annualScale)),
  } as const;
}
