import { compareRateDiscount, rateDiscountExample, rateDiscountGuideExamples } from '@/lib/rateDiscount';

function compare(overrides = {}) {
  const result = compareRateDiscount({ ...rateDiscountExample, ...overrides });
  if (!result.valid) throw new Error(JSON.stringify(result.errors));
  return result;
}

describe('rate discount and monthly capacity', () => {
  it('shows the billing loss and the extra hours for a 10% reduction, without confusing capacity with free hours', () => {
    expect(compare()).toMatchObject({
      hourlyRate: 40, reducedHourlyRate: 36, baselineBilling: 3200, sameHoursBilling: 2880,
      lostBilling: 320, requiredHours: 88.89, extraHours: 8.89, remainingHours: -8.89,
      recoveryBilling: 3200.04, capacityBilling: 2880, capacityBillingDifference: -320,
      currentFitsCapacity: true, fitsCapacity: false,
    });
    expect(compare({ capacityHours: 100 })).toMatchObject({ remainingHours: 11.11, fitsCapacity: true, capacityBilling: 3600 });
    expect(compare({ capacityHours: 88.89 })).toMatchObject({ remainingHours: 0, fitsCapacity: true });
  });

  it('keeps the editorial alternatives reproducible and an unchanged tariff unchanged', () => {
    expect(rateDiscountGuideExamples).toEqual([compare({ discountPercent: 0 }), compare(), compare({ discountPercent: 20 })]);
    expect(compare({ discountPercent: 0 })).toMatchObject({ reducedHourlyRate: 40, lostBilling: 0, requiredHours: 80, extraHours: 0, remainingHours: 0, fitsCapacity: true });
    expect(compare({ discountPercent: 20 })).toMatchObject({ reducedHourlyRate: 32, sameHoursBilling: 2560, requiredHours: 100, extraHours: 20 });
  });

  it('uses the rounded negotiated rate consistently and rounds recovery time upwards', () => {
    const result = compare({ hourlyRate: 37.16, discountPercent: 12.345, currentHours: 8.235, capacityHours: 10.234 });
    expect(result).toMatchObject({ hourlyRate: 37.16, discountPercent: 12.35, currentHours: 8.24, capacityHours: 10.23, reducedHourlyRate: 32.57, requiredHours: 9.41 });
    expect(result.recoveryBilling!).toBeGreaterThanOrEqual(result.baselineBilling);
    expect(result.requiredHours! * result.reducedHourlyRate).toBeGreaterThanOrEqual(result.hourlyRate * result.currentHours);
    expect((result.requiredHours! - 0.01) * result.reducedHourlyRate).toBeLessThan(result.hourlyRate * result.currentHours);
  });

  it('does not shrink the reference hours because an invoice rounds down to one cent', () => {
    expect(compare({ hourlyRate: 0.01, discountPercent: 0, currentHours: 1.4, capacityHours: 1.4 })).toMatchObject({ baselineBilling: 0.01, requiredHours: 1.4, extraHours: 0, fitsCapacity: true });
    expect(compare({ hourlyRate: 0.01, discountPercent: 10, currentHours: 10 })).toMatchObject({ reducedHourlyRate: 0.01, lostBilling: 0, requiredHours: 10, extraHours: 0 });
  });

  it.each([{ discountPercent: 100 }, { hourlyRate: 0.01, discountPercent: 60 }])('handles a zero negotiated rate without infinite time: %j', (overrides) => {
    const result = compare(overrides);
    expect(result).toMatchObject({ reducedHourlyRate: 0, sameHoursBilling: 0, requiredHours: null, extraHours: null, remainingHours: null, recoveryBilling: null, fitsCapacity: false });
    expect(result.lostBilling).toBe(result.baselineBilling);
  });

  it('allows zero capacity and reports a reference load already beyond capacity', () => {
    expect(compare({ capacityHours: 0 })).toMatchObject({ currentFitsCapacity: false, fitsCapacity: false, remainingHours: -88.89, capacityBilling: 0 });
    expect(compare({ discountPercent: 0, capacityHours: 79 })).toMatchObject({ currentFitsCapacity: false, fitsCapacity: false, remainingHours: -1 });
  });

  it.each([
    { hourlyRate: 0 }, { hourlyRate: -1 }, { hourlyRate: NaN }, { hourlyRate: Infinity },
    { discountPercent: -0.001 }, { discountPercent: 100.001 }, { discountPercent: NaN },
    { currentHours: 0 }, { currentHours: 744.01 }, { currentHours: Infinity },
    { capacityHours: -0.001 }, { capacityHours: 744.01 }, { capacityHours: NaN },
    { hourlyRate: 1e15 }, { hourlyRate: 1e10, currentHours: 744, discountPercent: 100 },
    { hourlyRate: 0.01, currentHours: 0.01 },
  ])('rejects invalid or unsafe calculations rather than displaying a result: %j', (overrides) => {
    const result = compareRateDiscount({ ...rateDiscountExample, ...overrides });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(Object.keys(result.errors).length).toBeGreaterThan(0);
  });
});
