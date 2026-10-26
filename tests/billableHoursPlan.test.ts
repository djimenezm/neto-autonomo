import { estimateBillableHours, exampleHoursPlan } from '@/lib/billableHoursPlan';

describe('annual billable-hours planning', () => {
  it('includes non-billable work and inactive weeks before averaging all twelve months', () => {
    expect(estimateBillableHours(exampleHoursPlan)).toMatchObject({
      valid: true,
      weeklyWorkHours: 40,
      weeklyBillableHours: 28,
      activeWeeks: 46,
      annualBillableHours: 1288,
      monthlyBillableHours: 1288 / 12,
      hoursToApply: 107,
    });
    const withoutTimeOff = estimateBillableHours({ ...exampleHoursPlan, weeksOff: 0 });
    expect(withoutTimeOff).toMatchObject({ valid: true, annualBillableHours: 1456, hoursToApply: 121 });
  });

  it('accepts partial days and weeks and never rounds capacity upwards', () => {
    const result = estimateBillableHours({ daysPerWeek: 4.5, hoursPerDay: 6.5, nonBillableHoursPerWeek: 8.25, weeksOff: 5.5 });
    expect(result).toMatchObject({ valid: true, annualBillableHours: 976.5, monthlyBillableHours: 81.375, hoursToApply: 81 });
  });

  it.each([
    { daysPerWeek: Number.NaN },
    { hoursPerDay: Number.POSITIVE_INFINITY },
    { nonBillableHoursPerWeek: -1 },
    { daysPerWeek: 8 },
    { hoursPerDay: 25 },
    { weeksOff: 53 },
    { nonBillableHoursPerWeek: 41 },
  ])('rejects impossible or incomplete agendas: %j', (overrides) => {
    expect(estimateBillableHours({ ...exampleHoursPlan, ...overrides }).valid).toBe(false);
  });

  it.each([{ weeksOff: 52 }, { nonBillableHoursPerWeek: 40 }])('keeps zero capacity explicit: %j', (overrides) => {
    expect(estimateBillableHours({ ...exampleHoursPlan, ...overrides })).toMatchObject({
      valid: true, annualBillableHours: 0, monthlyBillableHours: 0, hoursToApply: 0,
    });
  });
});
