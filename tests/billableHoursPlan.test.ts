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
    [4, 4, 4.8, 7, 504, 42],
    [5, 8, 17.6, 7, 1008, 84],
    [5, 8, 7.2, 7, 1476, 123],
  ])('keeps exact whole hours for %s days × %s hours, less %s hours and %s weeks off', (daysPerWeek, hoursPerDay, nonBillableHoursPerWeek, weeksOff, annual, monthly) => {
    expect(estimateBillableHours({ daysPerWeek, hoursPerDay, nonBillableHoursPerWeek, weeksOff }))
      .toMatchObject({ valid: true, annualBillableHours: annual, monthlyBillableHours: monthly, hoursToApply: monthly });
  });

  it.each([
    [4.7999, 42],
    [4.8, 42],
    [4.8001, 41],
    [4.799999999999999, 42],
    [4.800000000000001, 41],
  ])('floors the full decimal calculation without adding capacity near an integer: %s', (nonBillableHoursPerWeek, hoursToApply) => {
    expect(estimateBillableHours({ daysPerWeek: 4, hoursPerDay: 4, nonBillableHoursPerWeek, weeksOff: 7 }))
      .toMatchObject({ valid: true, hoursToApply });
  });

  it.each([
    [3, 7.6, 22.8],
    [3, 0.3, 0.9],
  ])('allows all decimal working hours to be non-billable: %s × %s = %s', (daysPerWeek, hoursPerDay, nonBillableHoursPerWeek) => {
    expect(estimateBillableHours({ daysPerWeek, hoursPerDay, nonBillableHoursPerWeek, weeksOff: 7 }))
      .toMatchObject({ valid: true, weeklyWorkHours: nonBillableHoursPerWeek, weeklyBillableHours: 0, annualBillableHours: 0, monthlyBillableHours: 0, hoursToApply: 0 });
  });

  it('does not accept a real decimal excess over the weekly working hours', () => {
    expect(estimateBillableHours({ daysPerWeek: 3, hoursPerDay: 0.3, nonBillableHoursPerWeek: 0.9000000000000001, weeksOff: 7 }))
      .toMatchObject({ valid: false, errors: { nonBillableHoursPerWeek: 'Estas horas no pueden superar tu jornada semanal.' } });
  });

  it('handles decimal exponent notation without granting a complete monthly hour', () => {
    const result = estimateBillableHours({ daysPerWeek: 1e-7, hoursPerDay: 1, nonBillableHoursPerWeek: 0, weeksOff: 0 });
    expect(result).toMatchObject({ valid: true, annualBillableHours: 0.0000052, hoursToApply: 0 });
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
