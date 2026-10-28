import { checkInvoice, invoiceCheckExample } from '@/lib/invoiceCheck';
import { previewWithholding } from '@/lib/withholdingPreview';

describe('one invoice with a user-supplied base and rates', () => {
  it('adds VAT and withholds from the same base, reconciling the total', () => {
    expect(checkInvoice(invoiceCheckExample)).toMatchObject({ valid: true, baseAmount: 1000, vatRate: 21, withholdingRate: 15, vatAmount: 210, withholdingAmount: 150, beforeWithholdingAmount: 1210, receivableAmount: 1060 });
  });

  it.each([
    [{ vatRate: 0, withholdingRate: 0 }, 0, 0, 1000],
    [{ vatRate: 21, withholdingRate: 0 }, 210, 0, 1210],
    [{ vatRate: 0, withholdingRate: 15 }, 0, 150, 850],
    [{ vatRate: 0, withholdingRate: 100 }, 0, 1000, 0],
    [{ vatRate: 100, withholdingRate: 100 }, 1000, 1000, 1000],
  ] as const)('accepts explicit zero rates and arithmetic boundaries: %j', (rates, vatAmount, withholdingAmount, receivableAmount) => {
    expect(checkInvoice({ ...invoiceCheckExample, ...rates })).toMatchObject({ valid: true, vatAmount, withholdingAmount, receivableAmount });
  });

  it('normalizes the base and rates before calculating and rounds the two taxes separately', () => {
    expect(checkInvoice({ baseAmount: 1.005, vatRate: 21.005, withholdingRate: 15.005 })).toMatchObject({ valid: true, baseAmount: 1.01, vatRate: 21.01, withholdingRate: 15.01, vatAmount: 0.21, withholdingAmount: 0.15, beforeWithholdingAmount: 1.22, receivableAmount: 1.07 });
    // Each 0.005 EUR rounds to 0.01 EUR; they are not netted before rounding.
    expect(checkInvoice({ baseAmount: 0.05, vatRate: 10, withholdingRate: 10 })).toMatchObject({ valid: true, vatAmount: 0.01, withholdingAmount: 0.01, receivableAmount: 0.05 });
  });

  it('shares the existing withholding calculation without changing its monthly reference rules', () => {
    const invoice = checkInvoice({ baseAmount: 2345.67, vatRate: 10, withholdingRate: 7 });
    if (!invoice.valid) throw new Error('Expected a valid invoice');
    const reference = previewWithholding({ baseAmount: invoice.baseAmount, vatAmount: invoice.vatAmount, withholdingRate: invoice.withholdingRate });
    expect(reference).toMatchObject({ valid: true, baseCents: 234567, vatCents: 23457, withholdingCents: 16420, receivableCents: 241604 });
    expect(invoice.receivableAmount).toBe(2416.04);
  });

  it.each([
    ['baseAmount', 0], ['baseAmount', 0.001], ['baseAmount', -1], ['baseAmount', NaN], ['baseAmount', Infinity], ['baseAmount', 1e14],
    ['vatRate', -0.001], ['vatRate', 100.001], ['vatRate', NaN], ['vatRate', Infinity],
    ['withholdingRate', -0.001], ['withholdingRate', 100.001], ['withholdingRate', NaN], ['withholdingRate', Infinity],
  ] as const)('rejects invalid %s values before producing a receipt: %s', (key, value) => {
    const result = checkInvoice({ ...invoiceCheckExample, [key]: value });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors[key]).toBeTruthy();
  });

  it('rejects an unsafe base even with both rates at zero', () => {
    const result = checkInvoice({ baseAmount: 1e12, vatRate: 0, withholdingRate: 0 });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.baseAmount).toMatch(/precisión/);
  });
});
