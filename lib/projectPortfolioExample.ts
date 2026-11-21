import { examplePortfolioGroups, planMonthlyPortfolio, simulatePortfolioCancellation } from '@/lib/projectPortfolio';
import { projectCapacityExample } from '@/lib/projectCapacityExample';

export const portfolioExample = { monthlyBilling: projectCapacityExample.monthlyBilling, billableHours: projectCapacityExample.billableHours, groups: examplePortfolioGroups };
export const portfolioExampleResult = planMonthlyPortfolio(portfolioExample);
export const portfolioOverloadResult = planMonthlyPortfolio({ ...portfolioExample, groups: [examplePortfolioGroups[0], { ...examplePortfolioGroups[1], hoursPerProject: 50 }] });
const cancellation = portfolioExampleResult.valid ? simulatePortfolioCancellation(portfolioExampleResult, 0) : null;
export const portfolioShortfallResult = cancellation?.valid ? cancellation.alternative : { valid: false } as const;
