import { planAnnualBilling } from '@/lib/annualBillingPlan';
import { annualBillingExamples } from '@/lib/annualBillingExample';

describe('annual billing across active months', () => {
  it('keeps a twelve-month need when billing in only ten months', () => {
    const plan = planAnnualBilling({ monthlyBilling: 1200, activeMonths: 10, hoursPerActiveMonth: 80 });
    expect(plan).toMatchObject({ valid: true, annualTarget: 14400, inactiveMonths: 2, billingPerActiveMonth: 1440, annualHours: 800, hourlyRate: 18, extraPerActiveMonth: 240 });
  });

  it('does not penalize the same annual hours twice for inactive months', () => {
    const twelve = planAnnualBilling({ monthlyBilling: 1200, activeMonths: 12, hoursPerActiveMonth: 80 });
    const ten = planAnnualBilling({ monthlyBilling: 1200, activeMonths: 10, hoursPerActiveMonth: 96 });
    if (!twelve.valid || !ten.valid) throw new Error('Expected valid plans');
    expect(twelve.annualHours).toBe(960);
    expect(ten.annualHours).toBe(960);
    expect(ten.monthlyAverageHours).toBe(80);
    expect(ten.hourlyRate).toBe(twelve.hourlyRate);
  });

  it('rounds up monthly and hourly references without falling short of the annual target', () => {
    const plan = planAnnualBilling({ monthlyBilling: 0.01, activeMonths: 7, hoursPerActiveMonth: 3 });
    if (!plan.valid) throw new Error('Expected valid plan');
    expect(plan.annualTarget).toBe(0.12);
    expect(plan.billingPerActiveMonth).toBe(0.02);
    expect(plan.plannedAnnualBilling).toBe(0.14);
    expect(plan.roundingExcess).toBe(0.02);
    expect(plan.hourlyRate).toBe(0.01);
    expect(plan.hourlyRate * plan.hoursPerActiveMonth).toBeGreaterThanOrEqual(plan.billingPerActiveMonth);
  });

  it('normalizes decimal halves before producing the plan', () => {
    expect(planAnnualBilling({ monthlyBilling: 1.005, activeMonths: 12, hoursPerActiveMonth: 1.005 })).toMatchObject({ valid: true, monthlyBilling: 1.01, hoursPerActiveMonth: 1.01, annualTarget: 12.12 });
  });

  it('reproduces the three editorial calendars from the same billing engine result', () => {
    const [twelve, ten, sameAnnualHours] = annualBillingExamples;
    expect(twelve.annualTarget).toBe(26816.52);
    expect(twelve.annualHours).toBe(840);
    expect(ten.billingPerActiveMonth).toBe(2681.66);
    expect(ten.annualHours).toBe(700);
    expect(ten.hourlyRate).toBe(38.31);
    expect(ten.roundingExcess).toBe(0.08);
    expect(sameAnnualHours.annualHours).toBe(840);
    expect(sameAnnualHours.hourlyRate).toBe(twelve.hourlyRate);
  });

  it.each([0, 13, 1.5, NaN, Infinity])('rejects invalid active months: %s', (activeMonths) => {
    expect(planAnnualBilling({ monthlyBilling: 1200, activeMonths, hoursPerActiveMonth: 80 })).toMatchObject({ valid: false, errors: { activeMonths: expect.any(String) } });
  });

  it.each([0, -1, 745, NaN, Infinity])('rejects invalid active-month hours: %s', (hoursPerActiveMonth) => {
    expect(planAnnualBilling({ monthlyBilling: 1200, activeMonths: 10, hoursPerActiveMonth })).toMatchObject({ valid: false, errors: { hoursPerActiveMonth: expect.any(String) } });
  });

  it.each([0, -1, NaN, Infinity, 1e14, 1e12])('rejects invalid or unsafe monthly amounts: %s', (monthlyBilling) => {
    expect(planAnnualBilling({ monthlyBilling, activeMonths: 1, hoursPerActiveMonth: 80 })).toMatchObject({ valid: false, errors: { monthlyBilling: expect.any(String) } });
  });
});
