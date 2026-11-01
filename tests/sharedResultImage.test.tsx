import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/resultado-opengraph-image/route';
import { calculateFreelanceBilling } from '@/lib/calculator';
import { buildCalculatorUrl, DEFAULT_FORM_VALUES, parseFormNumber, type CalculatorFormValues } from '@/lib/calculatorForm';
import { formatCurrency } from '@/lib/format';

const image = vi.hoisted(() => ({ capture: vi.fn() }));
vi.mock('next/og', () => ({
  ImageResponse: class extends Response {
    constructor(element: ReactElement, options: { width?: number; height?: number }) {
      super('', { headers: { 'content-type': 'image/png' } });
      image.capture(element, options);
    }
  },
}));

const manual = {
  targetNet: '1500', monthlyExpenses: '200', monthlyNonDeductibleExpenses: '0',
  billableHours: '80', irpfMode: 'manual', irpfRate: '15', autonomousCommunity: 'common',
  hasIVA: 'yes', selfEmployedFeeMode: 'manual', selfEmployedFee: '320', reducedFeePeriod: 'initial',
};

async function imageText(params: URLSearchParams) {
  const response = await GET(new Request(`https://www.cuantofacturar.es/resultado-opengraph-image?${params}`));
  expect(response.status).toBe(200);
  expect(image.capture).toHaveBeenCalledTimes(1);
  const [element, options] = image.capture.mock.calls[0];
  expect(options).toMatchObject({ width: 1200, height: 630 });
  const container = document.createElement('div');
  container.innerHTML = renderToStaticMarkup(element as ReactElement);
  return container.textContent ?? '';
}

function expectGeneric(text: string) {
  expect(text).toContain('Calcula cuánto facturar para llegar al neto mensual que buscas');
  expect(text).not.toContain('Resultado compartido');
  expect(text).not.toContain('Neto objetivo');
  expect(text).not.toMatch(/\d[.,]\d{2}\s*€/);
}

describe('shared result image and calculator values', () => {
  beforeEach(() => image.capture.mockClear());

  it.each([
    [{ targetNet: '2.500,50' }, 2500.5, 3461.76, 43.27],
    [{ monthlyExpenses: '1.234,56' }, 1500, 3319.27, 41.49],
  ] as const)('uses compatible number formats from the same shared query: %j', async (overrides, net, billing, hourly) => {
    const text = await imageText(new URLSearchParams({ ...manual, ...overrides }));
    expect(text).toContain('Resultado compartido');
    expect(text).toContain(`${formatCurrency(net)}/mes`);
    expect(text).toContain(`${formatCurrency(billing)}/mes`);
    expect(text).toContain(`${formatCurrency(hourly)}/h`);
  });

  it.each([
    ['billableHours', ''], ['billableHours', '0'], ['billableHours', '80.5'],
    ['targetNet', '0'], ['targetNet', '2,,50'],
    ['monthlyExpenses', '-1'], ['monthlyExpenses', '1,,50'],
    ['irpfRate', '100'], ['selfEmployedFee', '0'],
  ])('uses a generic image instead of adjusting an invalid active %s=%j', async (field, value) => {
    expectGeneric(await imageText(new URLSearchParams({ ...manual, [field]: value })));
  });

  it('uses defaults for absent fields in a partial query', async () => {
    const text = await imageText(new URLSearchParams({ targetNet: '1500' }));
    const result = calculateFreelanceBilling({
      targetNet: 1500, monthlyExpenses: 200, monthlyNonDeductibleExpenses: 0,
      billableHours: 80, irpfMode: 'progressive', irpfRate: 15, autonomousCommunity: 'common',
      hasIVA: true, selfEmployedFeeMode: 'auto', selfEmployedFee: 0, reducedFeePeriod: 'initial',
    });
    expect(text).toContain(`${formatCurrency(result.billingWithoutVAT)}/mes`);
    expect(text).toContain(`${formatCurrency(result.hourlyRate)}/h`);
  });

  it('keeps the first duplicate value, including when that first value is invalid', async () => {
    const params = new URLSearchParams(manual);
    params.append('billableHours', '0');
    expect(await imageText(params)).toContain(`${formatCurrency(28.56)}/h`);
    image.capture.mockClear();
    params.set('billableHours', '0');
    params.append('billableHours', '80');
    expectGeneric(await imageText(params));
  });

  it.each([
    { irpfMode: 'manual', irpfRate: '17.6', hasIVA: false, selfEmployedFeeMode: 'manual', selfEmployedFee: '350' },
    { irpfMode: 'progressive', autonomousCommunity: 'madrid', selfEmployedFeeMode: 'auto' },
    { irpfMode: 'progressive', selfEmployedFeeMode: 'reduced', reducedFeePeriod: 'extended' },
  ] satisfies Partial<CalculatorFormValues>[])('preserves the figures in a canonical calculator link: %j', async (overrides) => {
    const values: CalculatorFormValues = {
      ...DEFAULT_FORM_VALUES, targetNet: '2500.5', monthlyExpenses: '475.25',
      monthlyNonDeductibleExpenses: '60', billableHours: '70', ...overrides,
    };
    const link = new URL(buildCalculatorUrl(values, 'https://www.cuantofacturar.es/'));
    const text = await imageText(link.searchParams);
    const result = calculateFreelanceBilling({
      targetNet: parseFormNumber(values.targetNet), monthlyExpenses: parseFormNumber(values.monthlyExpenses),
      monthlyNonDeductibleExpenses: parseFormNumber(values.monthlyNonDeductibleExpenses),
      billableHours: parseFormNumber(values.billableHours), irpfMode: values.irpfMode,
      irpfRate: parseFormNumber(values.irpfRate), autonomousCommunity: values.autonomousCommunity,
      hasIVA: values.hasIVA, selfEmployedFeeMode: values.selfEmployedFeeMode,
      selfEmployedFee: parseFormNumber(values.selfEmployedFee), reducedFeePeriod: values.reducedFeePeriod,
    });
    expect(text).toContain('Resultado compartido');
    expect(text).toContain(`${formatCurrency(result.targetNet)}/mes`);
    expect(text).toContain(`${formatCurrency(result.billingWithoutVAT)}/mes`);
    expect(text).toContain(`${formatCurrency(result.hourlyRate)}/h`);
  });

  it.each(['auto', 'reduced'])('ignores an inactive invalid percentage and fee in progressive/%s mode', async (feeMode) => {
    const text = await imageText(new URLSearchParams({
      ...manual, irpfMode: 'progressive', irpfRate: 'not a percentage',
      selfEmployedFeeMode: feeMode, selfEmployedFee: 'not a fee',
    }));
    expect(text).toContain('Resultado compartido');
    expect(text).not.toContain('NaN');
  });
});
