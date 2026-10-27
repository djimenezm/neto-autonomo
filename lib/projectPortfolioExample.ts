import { examplePortfolioGroups, planMonthlyPortfolio } from '@/lib/projectPortfolio';
import { projectCapacityExample } from '@/lib/projectCapacityExample';

export const portfolioExample = { monthlyBilling: projectCapacityExample.monthlyBilling, billableHours: projectCapacityExample.billableHours, groups: examplePortfolioGroups };
export const portfolioExampleResult = planMonthlyPortfolio(portfolioExample);
export const portfolioOverloadResult = planMonthlyPortfolio({ ...portfolioExample, groups: [examplePortfolioGroups[0], { ...examplePortfolioGroups[1], hoursPerProject: 50 }] });
export const portfolioShortfallResult = planMonthlyPortfolio({ ...portfolioExample, groups: [{ ...examplePortfolioGroups[0], quantity: 2 }, examplePortfolioGroups[1]] });
