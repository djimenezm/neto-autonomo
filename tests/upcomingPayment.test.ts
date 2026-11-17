import { planUpcomingPayment } from '@/lib/upcomingPayment';

describe('upcoming payment', () => {
  it('rounds each contribution up so the cent left over is covered', () => {
    expect(planUpcomingPayment({ payment: 100, saved: 0, contributions: 3 })).toMatchObject({
      valid: true, remaining: 100, contributionAmount: 33.34,
    });
    expect(planUpcomingPayment({ payment: 0.3, saved: 0.1, contributions: 2 })).toMatchObject({
      valid: true, remaining: 0.2, contributionAmount: 0.1,
    });
  });

  it('keeps the full shortfall when no contributions remain and floors a covered payment at zero', () => {
    expect(planUpcomingPayment({ payment: 420, saved: 90, contributions: 0 })).toMatchObject({
      valid: true, remaining: 330, contributionAmount: null,
    });
    expect(planUpcomingPayment({ payment: 420, saved: 450, contributions: 3 })).toMatchObject({
      valid: true, remaining: 0, contributionAmount: 0,
    });
  });

  it('reports all invalid fields together', () => {
    expect(planUpcomingPayment({ payment: 0.004, saved: -0.01, contributions: 2.5 })).toMatchObject({
      valid: false,
      errors: { payment: expect.any(String), saved: expect.any(String), contributions: expect.any(String) },
    });
  });
});
