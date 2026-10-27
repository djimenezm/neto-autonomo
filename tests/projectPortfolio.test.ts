import { examplePortfolioGroups, MAX_PORTFOLIO_GROUPS, planMonthlyPortfolio, type PortfolioGroupInput } from '@/lib/projectPortfolio';
import { portfolioExample, portfolioExampleResult, portfolioOverloadResult, portfolioShortfallResult } from '@/lib/projectPortfolioExample';
import { calculateExample } from '@/lib/scenarioExamples';

describe('monthly services portfolio', () => {
  it('adds different service groups using the existing monthly reference', () => {
    expect(portfolioExample.monthlyBilling).toBe(calculateExample(3000).billingWithoutVAT);
    expect(portfolioExampleResult).toMatchObject({ valid: true, monthlyBilling: 4149.41, plannedBilling: 4200, plannedHours: 68, billingDifference: 50.59, remainingHours: 12, coversBilling: true, fitsHours: true });
  });

  it('distinguishes billing coverage and available time in all four cases', () => {
    expect(portfolioOverloadResult).toMatchObject({ valid: true, plannedBilling: 4200, plannedHours: 86, remainingHours: -6, coversBilling: true, fitsHours: false });
    expect(portfolioShortfallResult).toMatchObject({ valid: true, plannedBilling: 3400, plannedHours: 56, billingDifference: -749.41, coversBilling: false, fitsHours: true });
    expect(planMonthlyPortfolio({ ...portfolioExample, groups: [examplePortfolioGroups[0], { quantity: 1, pricePerProject: 1000, hoursPerProject: 50 }] })).toMatchObject({ valid: true, plannedBilling: 3400, plannedHours: 86, coversBilling: false, fitsHours: false });
  });

  it('does not lose cents or hours at an exact decimal boundary', () => {
    const group = { quantity: 1, pricePerProject: 0.1, hoursPerProject: 0.1 };
    expect(planMonthlyPortfolio({ monthlyBilling: 0.3, billableHours: 0.3, groups: [group, { ...group, quantity: 2 }] })).toMatchObject({ valid: true, plannedBilling: 0.3, plannedHours: 0.3, billingDifference: 0, remainingHours: 0, coversBilling: true, fitsHours: true });
  });

  it('uses displayed precision before multiplying rather than rounding each total afterwards', () => {
    expect(planMonthlyPortfolio({ monthlyBilling: 0.33, billableHours: 3.03, groups: [{ quantity: 3, pricePerProject: 0.105, hoursPerProject: 1.005 }] })).toMatchObject({ valid: true, groups: [{ quantity: 3, pricePerProject: 0.11, hoursPerProject: 1.01, billing: 0.33, hours: 3.03 }], billingDifference: 0, remainingHours: 0 });
  });

  it('counts free work against capacity and supports a month with zero available hours', () => {
    expect(planMonthlyPortfolio({ monthlyBilling: 100, billableHours: 0, groups: [{ quantity: 2, pricePerProject: 0, hoursPerProject: 2 }] })).toMatchObject({ valid: true, plannedBilling: 0, plannedHours: 4, billingDifference: -100, remainingHours: -4, coversBilling: false, fitsHours: false });
  });

  it.each([
    ['quantity', 0], ['quantity', 1.5], ['quantity', Number.NaN], ['quantity', Number.MAX_SAFE_INTEGER + 1],
    ['pricePerProject', -1], ['pricePerProject', Number.NaN], ['pricePerProject', 1e14],
    ['hoursPerProject', 0], ['hoursPerProject', 0.001], ['hoursPerProject', Infinity],
  ] as const)('rejects invalid %s: %s', (key, value) => {
    const result = planMonthlyPortfolio({ ...portfolioExample, groups: [{ ...examplePortfolioGroups[0], [key]: value }] });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.rows[0][key]).toBeTruthy();
  });

  it.each([
    ['monthlyBilling', 0], ['monthlyBilling', Number.NaN], ['monthlyBilling', 1e14],
    ['billableHours', -1], ['billableHours', Infinity],
  ] as const)('rejects an invalid inherited reference %s: %s', (key, value) => {
    const result = planMonthlyPortfolio({ ...portfolioExample, [key]: value });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors[key]).toBeTruthy();
  });

  it.each([{ groups: [] }, { groups: Array.from({ length: MAX_PORTFOLIO_GROUPS + 1 }, () => examplePortfolioGroups[0]) }])('requires between one and eight groups', ({ groups }) => {
    const result = planMonthlyPortfolio({ ...portfolioExample, groups });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.groups).toBeTruthy();
  });

  it.each(['pricePerProject', 'hoursPerProject'] as const)('rejects unsafe multiplication of %s', (key) => {
    const group: PortfolioGroupInput = { quantity: 1e6, pricePerProject: 10, hoursPerProject: 1, [key]: 1e12 };
    const result = planMonthlyPortfolio({ ...portfolioExample, groups: [group] });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.rows[0].quantity).toMatch(/precisión/);
  });

  it.each(['pricePerProject', 'hoursPerProject'] as const)('rejects an unsafe sum of individually safe %s totals', (key) => {
    const group: PortfolioGroupInput = { quantity: 1, pricePerProject: 10, hoursPerProject: 1, [key]: 5e13 };
    const result = planMonthlyPortfolio({ ...portfolioExample, groups: [group, group] });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.groups).toMatch(/suma/);
  });
});
