import { workLogReview, workLogTotals, workLogWeeks } from '@/lib/workLogExample';

describe('the explicitly fictional four-week log', () => {
  it('accounts for each worked hour once and sums the four complete weeks', () => {
    expect(workLogWeeks.map((week) => week.total)).toEqual([40, 40, 40, 40]);
    expect(workLogTotals).toEqual({ clientWork: 96, administration: 34, sales: 21, learning: 9, total: 160 });
    expect(workLogTotals.clientWork + workLogTotals.administration + workLogTotals.sales + workLogTotals.learning).toBe(160);
  });

  it('uses the weekly average and the same inactive weeks when contrasting the monthly plan', () => {
    expect(workLogReview.averageClientHours).toBe(24);
    expect(workLogReview.before.weeklyBillableHours).toBe(28);
    expect(workLogReview.before.activeWeeks).toBe(46);
    expect(workLogReview.after.activeWeeks).toBe(46);
    expect(workLogReview.after.annualBillableHours).toBe(1104);
    expect(workLogReview.after.monthlyBillableHours).toBe(92);
    expect(workLogReview.after.hoursToApply).toBe(92);
    expect(workLogReview.before.hoursToApply).toBe(107);
  });
});
