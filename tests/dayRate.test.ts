import { estimateDayRate, type DayRateInput } from '@/lib/dayRate';
import { dayRateCostExampleResult, dayRateExample, dayRateExampleResult, dayRateMonthlyExample } from '@/lib/dayRateExample';
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

  it('includes uncovered service costs once and compares what remains for the same hours', () => {
    expect(dayRateCostExampleResult).toMatchObject({
      valid: true, totalHours: 8, referencePrice: 297.28, serviceCosts: 90,
      totalReferencePrice: 387.28, proposedPrice: 350, effectiveHourlyRate: 43.75,
      availableForTime: 260, availableHourlyRate: 32.5, priceDifference: -37.28,
    });
    expect(estimateDayRate({ ...input, serviceCosts: 0, proposedPrice: 450 })).toMatchObject({
      valid: true, totalReferencePrice: 400, availableForTime: 450, availableHourlyRate: 56.25, priceDifference: 50,
    });
  });

  it('can calculate a reference including costs without inventing a price or hourly remainder', () => {
    expect(estimateDayRate({ ...input, serviceCosts: 90 })).toMatchObject({
      valid: true, totalReferencePrice: 490, proposedPrice: null, availableForTime: null, availableHourlyRate: null, priceDifference: null,
    });
  });

  it.each([[60, -30, -3.75, -430], [90, 0, 0, -400], [490, 400, 50, 0], [500, 410, 51.25, 10]])(
    'handles a price of %s against both outlay and time', (proposedPrice, availableForTime, availableHourlyRate, priceDifference) => {
      expect(estimateDayRate({ ...input, serviceCosts: 90, proposedPrice })).toMatchObject({ valid: true, availableForTime, availableHourlyRate, priceDifference });
    },
  );

  it('keeps cent and time boundaries exact after normalizing all inputs', () => {
    expect(estimateDayRate({ hourlyRate: 0.1, sessionHours: 0.1, preparationHours: 0, followUpHours: 0, serviceCosts: 0.2, proposedPrice: 0.21 })).toMatchObject({
      valid: true, referencePrice: 0.01, totalReferencePrice: 0.21, availableForTime: 0.01, availableHourlyRate: 0.1, priceDifference: 0,
    });
    expect(estimateDayRate({ ...input, hourlyRate: 1.005, sessionHours: 1.005, preparationHours: 0, followUpHours: 0, serviceCosts: 1.005, proposedPrice: 2.035 })).toMatchObject({
      valid: true, hourlyRate: 1.01, sessionHours: 1.01, totalHours: 1.01, referencePrice: 1.02, serviceCosts: 1.01, totalReferencePrice: 2.03, proposedPrice: 2.04, priceDifference: 0.01,
    });
  });

  it('rounds negative hourly half cents symmetrically without a negative zero', () => {
    expect(estimateDayRate({ ...input, serviceCosts: 0.04, proposedPrice: 0 })).toMatchObject({ valid: true, availableHourlyRate: -0.01 });
    const result = estimateDayRate({ ...input, serviceCosts: 0.01, proposedPrice: 0 });
    expect(result.valid).toBe(true);
    if (result.valid) expect(Object.is(result.availableHourlyRate, -0)).toBe(false);
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_VALUE])('rejects an invalid service cost of %s', (serviceCosts) => {
    const result = estimateDayRate({ ...input, serviceCosts });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.serviceCosts).toBeTruthy();
  });

  it('rejects unsafe totals and hourly numerators instead of losing precision', () => {
    const total = estimateDayRate({ ...input, serviceCosts: Number.MAX_SAFE_INTEGER / 100 });
    expect(total.valid).toBe(false);
    if (!total.valid) expect(total.errors.serviceCosts).toBeTruthy();
    expect(estimateDayRate({ ...input, serviceCosts: Number.MAX_SAFE_INTEGER / 1000, proposedPrice: 0 }).valid).toBe(false);
    expect(estimateDayRate({ ...input, proposedPrice: Number.MAX_SAFE_INTEGER / 1000 }).valid).toBe(false);
  });
});
