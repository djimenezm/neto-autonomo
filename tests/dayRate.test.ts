import { estimateDayRate, type DayRateInput } from '@/lib/dayRate';
import { dayRateExample, dayRateExampleResult, dayRateMonthlyExample } from '@/lib/dayRateExample';
import { calculateExample } from '@/lib/scenarioExamples';

const input: DayRateInput = { hourlyRate: 50, sessionHours: 6, preparationHours: 1.5, followUpHours: 0.5 };

describe('day-rate time and price comparison', () => {
  it('reuses the monthly engine and the displayed hourly rate for the fictional example', () => {
    expect(dayRateMonthlyExample).toEqual(calculateExample(2000));
    expect(dayRateExample.hourlyRate).toBe(37.16);
    expect(dayRateExampleResult).toMatchObject({ valid: true, totalHours: 8, referencePrice: 297.28, proposedPrice: 222.96, effectiveHourlyRate: 27.87, priceDifference: -74.32 });
  });

  it('does not invent a proposed price, and allows preparation already included in the session', () => {
    expect(estimateDayRate(input)).toMatchObject({ valid: true, totalHours: 8, referencePrice: 400, proposedPrice: null, effectiveHourlyRate: null, priceDifference: null });
    expect(estimateDayRate({ ...input, sessionHours: 8, preparationHours: 0, followUpHours: 0 })).toMatchObject({ valid: true, totalHours: 8, referencePrice: 400 });
  });

  it.each([[300, -100, 37.5], [400, 0, 50], [450, 50, 56.25], [0, -400, 0]])('compares a price of %s with all hours', (proposedPrice, priceDifference, effectiveHourlyRate) => {
    expect(estimateDayRate({ ...input, proposedPrice })).toMatchObject({ valid: true, priceDifference, effectiveHourlyRate });
  });

  it('rounds money to cents before the comparison, including decimal durations', () => {
    expect(estimateDayRate({ ...input, hourlyRate: 50.126, sessionHours: 0.25, preparationHours: 0, followUpHours: 0, proposedPrice: 12.534 })).toMatchObject({ valid: true, hourlyRate: 50.13, referencePrice: 12.53, proposedPrice: 12.53, priceDifference: 0 });
  });

  it.each([
    ['hourlyRate', 0], ['hourlyRate', Number.NaN], ['hourlyRate', Number.MAX_VALUE],
    ['sessionHours', 0], ['sessionHours', 25], ['sessionHours', Number.MIN_VALUE],
    ['preparationHours', -1], ['followUpHours', Number.POSITIVE_INFINITY],
    ['proposedPrice', -1], ['proposedPrice', Number.NaN], ['proposedPrice', Number.MAX_VALUE],
  ] as const)('rejects invalid %s values instead of creating a misleading result', (field, value) => {
    const result = estimateDayRate({ ...input, [field]: value });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors[field]).toBeTruthy();
  });

  it('rejects numeric overflow when summing preparation and follow-up', () => {
    expect(estimateDayRate({ ...input, preparationHours: Number.MAX_VALUE, followUpHours: Number.MAX_VALUE }).valid).toBe(false);
  });
});
