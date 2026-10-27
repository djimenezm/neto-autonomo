import { previewWithholding, withholdingExample } from '@/lib/withholdingPreview';

describe('base, VAT, withholding and receivable amount', () => {
  it('withholds from the base without VAT and reconciles the exact cents', () => {
    const result = previewWithholding({ ...withholdingExample, withholdingRate: 15 });
    expect(result).toMatchObject({ valid: true, baseCents: 100000, vatCents: 21000, withholdingCents: 15000, beforeWithholdingCents: 121000, receivableCents: 106000 });
  });

  it('supports no withholding and a reference without VAT', () => {
    expect(previewWithholding({ ...withholdingExample, withholdingRate: 0 })).toMatchObject({ valid: true, receivableCents: 121000 });
    expect(previewWithholding({ baseAmount: 1000, vatAmount: 0, withholdingRate: 15 })).toMatchObject({ valid: true, receivableCents: 85000 });
  });

  it('uses the VAT amount supplied by the main calculation, including its rounding', () => {
    expect(previewWithholding({ baseAmount: 2972.94, vatAmount: 624.32, withholdingRate: 15 })).toMatchObject({ valid: true, withholdingCents: 44594, receivableCents: 315132 });
    expect(previewWithholding({ baseAmount: 1000, vatAmount: 1.23, withholdingRate: 15 })).toMatchObject({ valid: true, receivableCents: 85123 });
  });

  it('rounds the base and percentage once and handles half-cent withholding', () => {
    expect(previewWithholding({ baseAmount: 1.005, vatAmount: 0, withholdingRate: 0 })).toMatchObject({ valid: true, baseCents: 101, receivableCents: 101 });
    expect(previewWithholding({ baseAmount: 0.05, vatAmount: 0, withholdingRate: 10 })).toMatchObject({ valid: true, withholdingCents: 1, receivableCents: 4 });
    expect(previewWithholding({ ...withholdingExample, withholdingRate: 15.005 })).toMatchObject({ valid: true, rateUsed: 15.01, withholdingCents: 15010, receivableCents: 105990 });
  });

  it('accepts the full arithmetic boundary without a negative payment', () => {
    expect(previewWithholding({ ...withholdingExample, withholdingRate: 100 })).toMatchObject({ valid: true, receivableCents: 21000 });
  });

  it.each([-1, 100.001, NaN, Infinity])('rejects invalid withholding percentages: %s', (withholdingRate) => {
    expect(previewWithholding({ ...withholdingExample, withholdingRate })).toMatchObject({ valid: false, field: 'withholdingRate' });
  });

  it.each([
    { baseAmount: 0, vatAmount: 0 }, { baseAmount: -1, vatAmount: 0 },
    { baseAmount: NaN, vatAmount: 0 }, { baseAmount: 1000, vatAmount: -1 },
    { baseAmount: 1000, vatAmount: Infinity }, { baseAmount: 1e20, vatAmount: 0 },
    { baseAmount: 1e12, vatAmount: 0 },
  ])('rejects invalid or unsafe references: %j', (reference) => {
    expect(previewWithholding({ ...reference, withholdingRate: 15 })).toMatchObject({ valid: false, field: 'reference' });
  });
});
