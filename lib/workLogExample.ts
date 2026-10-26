import { estimateBillableHours, exampleHoursPlan } from '@/lib/billableHoursPlan';

// Invented records for explaining the worksheet, never observations of real users.
export const workLogWeeks = [
  { label: 'Semana 1', clientWork: 24, administration: 8, sales: 6, learning: 2 },
  { label: 'Semana 2', clientWork: 26, administration: 9, sales: 4, learning: 1 },
  { label: 'Semana 3', clientWork: 20, administration: 10, sales: 7, learning: 3 },
  { label: 'Semana 4', clientWork: 26, administration: 7, sales: 4, learning: 3 },
].map((week) => ({ ...week, total: week.clientWork + week.administration + week.sales + week.learning }));

export const workLogTotals = workLogWeeks.reduce((sum, week) => ({
  clientWork: sum.clientWork + week.clientWork,
  administration: sum.administration + week.administration,
  sales: sum.sales + week.sales,
  learning: sum.learning + week.learning,
  total: sum.total + week.total,
}), { clientWork: 0, administration: 0, sales: 0, learning: 0, total: 0 });

export const workLogReview = (() => {
  const averageClientHours = workLogTotals.clientWork / workLogWeeks.length;
  const before = estimateBillableHours(exampleHoursPlan);
  const after = estimateBillableHours({
    ...exampleHoursPlan,
    nonBillableHoursPerWeek: exampleHoursPlan.daysPerWeek * exampleHoursPlan.hoursPerDay - averageClientHours,
  });
  if (!before.valid || !after.valid) throw new Error('Invalid illustrative work log');
  return { averageClientHours, before, after, weeksOff: exampleHoursPlan.weeksOff };
})();
