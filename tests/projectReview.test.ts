import { projectReviewExample, reviewProject } from '@/lib/projectReview';

describe('completed project review', () => {
  it('exposes the effect of extra hours on a fixed price', () => {
    expect(reviewProject(projectReviewExample)).toMatchObject({
      valid: true, plannedHourlyRevenue: 50, actualHourlyRevenue: 33.33,
      hoursDifference: 4, hoursAtReference: 10, actualReferencePrice: 480, priceDifference: -80,
    });
  });

  it('also handles work finished earlier and a price above the reference', () => {
    expect(reviewProject({ ...projectReviewExample, actualHours: 6 })).toMatchObject({
      valid: true, actualHourlyRevenue: 66.67, hoursDifference: -2, priceDifference: 160,
    });
  });

  it('distinguishes a zero agreed price from missing data', () => {
    expect(reviewProject({ ...projectReviewExample, finalPrice: 0 })).toMatchObject({
      valid: true, plannedHourlyRevenue: 0, actualHourlyRevenue: 0, hoursAtReference: 0, priceDifference: -480,
    });
    expect(reviewProject({ ...projectReviewExample, finalPrice: Number.NaN }).valid).toBe(false);
  });

  it('compares at cent precision without overstating the hours a price covers', () => {
    const review = reviewProject({ hourlyReference: 12.34, finalPrice: 20, plannedHours: 1, actualHours: 1.25 });
    expect(review).toMatchObject({ valid: true, actualHourlyRevenue: 16, hoursAtReference: 1.62, actualReferencePrice: 15.43, priceDifference: 4.57 });
    if (!review.valid) throw new Error('Expected a valid review');
    expect(review.hoursAtReference * review.hourlyReference).toBeLessThanOrEqual(review.finalPrice);
    expect((review.hoursAtReference + 0.01) * review.hourlyReference).toBeGreaterThan(review.finalPrice);
  });

  it('normalizes amounts and hours before using them and supports a matching price', () => {
    expect(reviewProject({ hourlyReference: 20, finalPrice: 20.195, plannedHours: 1.005, actualHours: 1.005 })).toMatchObject({
      valid: true, finalPrice: 20.2, plannedHours: 1.01, actualHours: 1.01,
      plannedHourlyRevenue: 20, actualHourlyRevenue: 20, actualReferencePrice: 20.2, priceDifference: 0,
    });
  });

  it.each([
    ['hourlyReference', 0], ['hourlyReference', -1], ['hourlyReference', Infinity],
    ['finalPrice', -1], ['finalPrice', 1e14],
    ['plannedHours', 0], ['plannedHours', Number.NaN], ['plannedHours', 1e14],
    ['actualHours', -1], ['actualHours', 0.001], ['actualHours', Infinity],
  ] as const)('rejects invalid or unsafe %s: %s', (key, value) => {
    const review = reviewProject({ ...projectReviewExample, [key]: value });
    expect(review.valid).toBe(false);
    if (!review.valid) expect(review.errors[key]).toBeTruthy();
  });

  it('rejects an unsafe intermediate product even if the separate fields are safe', () => {
    const review = reviewProject({ ...projectReviewExample, hourlyReference: 1e12, actualHours: 1000 });
    expect(review.valid).toBe(false);
    if (!review.valid) expect(review.errors.actualHours).toMatch(/precisión/);
  });
});
