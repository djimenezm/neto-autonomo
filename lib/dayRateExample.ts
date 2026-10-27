import { estimateDayRate, type DayRateInput } from '@/lib/dayRate';
import { calculateExample } from '@/lib/scenarioExamples';

export const dayRateMonthlyExample = calculateExample(2000);
export const dayRateExample = {
  hourlyRate: dayRateMonthlyExample.hourlyRate,
  sessionHours: 6,
  preparationHours: 1.5,
  followUpHours: 0.5,
  proposedPrice: Math.round(dayRateMonthlyExample.hourlyRate * 6 * 100) / 100,
} satisfies DayRateInput;
export const dayRateExampleResult = estimateDayRate(dayRateExample);

export const dayRateCostExample = {
  ...dayRateExample,
  serviceCosts: 90,
  proposedPrice: 350,
} satisfies DayRateInput;
export const dayRateCostExampleResult = estimateDayRate(dayRateCostExample);
