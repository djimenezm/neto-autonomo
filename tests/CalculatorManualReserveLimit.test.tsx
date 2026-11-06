import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import Head from 'next/head';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CalculatorForm from '@/components/CalculatorForm';
import HomePage from '@/components/HomePage';
import IndexPage, { getServerSideProps } from '@/pages/index';
import { GET } from '@/app/resultado-opengraph-image/route';
import { siteConfig } from '@/lib/site';

const image = vi.hoisted(() => ({ capture: vi.fn() }));
vi.mock('next/og', () => ({
  ImageResponse: class extends Response {
    constructor(element: ReactElement, options: { width?: number; height?: number }) {
      super('', { headers: { 'content-type': 'image/png' } });
      image.capture(element, options);
    }
  },
}));

const reference = { targetNet: '1800', monthlyExpenses: '250', monthlyNonDeductibleExpenses: '0', billableHours: '100', irpfMode: 'manual' as const, irpfRate: '15', selfEmployedFeeMode: 'manual' as const, selfEmployedFee: '320' };
const message = 'La reserva de IRPF debe ser como máximo del 99 %.';
const reserve = () => screen.getByRole('spinbutton', { name: 'Reserva de IRPF para la simulación (%)' });
const form = () => screen.getByRole('form', { name: 'Calculadora de facturación' });
const calculate = () => screen.getByRole('button', { name: 'Calcular mi tarifa orientativa' });
async function submit() {
  await act(async () => { fireEvent.submit(form()); });
}
function expectNoResult() {
  expect(screen.queryByRole('heading', { name: 'Tu referencia mensual para presupuestar' })).not.toBeInTheDocument();
  expect(screen.queryByRole('textbox', { name: 'Resumen detallado para compartir' })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'WhatsApp' })).not.toBeInTheDocument();
}
function metadata(props: Parameters<typeof IndexPage>[0]) {
  const children = Children.toArray(IndexPage(props).props.children);
  const head = children.find(child => isValidElement(child) && child.type === Head);
  const home = children.find(child => isValidElement(child) && child.type === HomePage);
  if (!isValidElement<{ children: ReactNode }>(head) || !isValidElement<{ calculatorInitiallySubmitted: boolean; trackServerConversion: boolean }>(home)) throw new Error('Expected calculator and metadata.');
  return {
    home: home.props,
    content(key: string) {
      const item = Children.toArray(head.props.children).find(child => isValidElement<{ property?: string; name?: string }>(child) && (child.props.property === key || child.props.name === key));
      if (!isValidElement<{ content: string }>(item)) throw new Error(`Missing metadata ${key}`);
      return item.props.content;
    },
  };
}
async function sharedProps(irpfMode: 'manual' | 'progressive', irpfRate: string) {
  const response = await getServerSideProps({ query: { ...reference, irpfMode, irpfRate }, res: { setHeader: vi.fn() } } as unknown as Parameters<typeof getServerSideProps>[0]);
  if (!('props' in response)) throw new Error('Expected shared calculator props.');
  return await response.props;
}
async function imageText(sharedUrl: string) {
  image.capture.mockClear();
  const shared = new URL(sharedUrl);
  const response = await GET(new Request(`${siteConfig.url}/resultado-opengraph-image${shared.search}`));
  expect(response.status).toBe(200);
  expect(image.capture).toHaveBeenCalledTimes(1);
  const [element, options] = image.capture.mock.calls[0];
  expect(options).toMatchObject({ width: 1200, height: 630 });
  const container = document.createElement('div');
  container.innerHTML = renderToStaticMarkup(element as ReactElement);
  return container.textContent ?? '';
}

describe('manual IRPF reserve is validated before accepting or sharing it', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    window.va = vi.fn();
    window.gtag = vi.fn();
    image.capture.mockClear();
  });
  afterEach(() => vi.restoreAllMocks());

  it('blocks Enter without blurring a value just above 99 instead of silently reducing it', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm initialValues={reference} />);
    const previousUrl = window.location.href;
    const history = vi.spyOn(window.history, 'replaceState');
    const input = reserve();
    await user.clear(input);
    await user.type(input, '99.01');
    await user.keyboard('{Enter}');

    await waitFor(() => expect(input).toHaveFocus());
    expect(input).toHaveValue(99.01);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(expect.stringContaining(message));
    expect(input).toHaveAccessibleDescription(/no la retención de una factura/);
    expect(input.getAttribute('aria-describedby')?.split(/\s+/)).toEqual(['irpf-rate-hint', 'irpf-rate-error']);
    expect(screen.getByText(message)).toHaveAttribute('role', 'alert');
    expect(new FormData(form() as HTMLFormElement).get('irpfRate')).toBe('99.01');
    expectNoResult();
    expect(window.location.href).toBe(previousUrl);
    expect(history).not.toHaveBeenCalled();
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('preserves out-of-range decimals on blur and Spanish percentage paste, then accepts an explicit correction', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm initialValues={{ ...reference, irpfRate: '99.9' }} />);
    const previousUrl = window.location.href;
    const input = reserve();
    await user.click(input);
    await user.tab();
    expect(input).toHaveValue(99.9);
    await user.click(input);
    await user.paste('99,95 %');
    expect(input).toHaveValue(99.95);
    await user.click(calculate());

    expect(input).toHaveFocus();
    expect(input).toHaveValue(99.95);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(expect.stringContaining(message));
    expectNoResult();
    expect(window.location.href).toBe(previousUrl);
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();

    await user.clear(input);
    await user.type(input, '98.9');
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByText(message)).not.toBeInTheDocument();
    expectNoResult();
    await submit();
    expect(screen.getByRole('heading', { name: 'Tu referencia mensual para presupuestar' })).toBeVisible();
    expect(new URL(window.location.href).searchParams.get('irpfRate')).toBe('98.9');
    expect(window.va).toHaveBeenCalledTimes(1);
    expect(window.gtag).toHaveBeenCalledTimes(2);
  });

  it.each(['0', '99'])('permits the valid manual boundary %s in the result and its shared link', async irpfRate => {
    render(<CalculatorForm initialValues={{ ...reference, irpfRate }} />);
    await submit();
    expect(reserve()).toHaveValue(Number(irpfRate));
    expect(reserve()).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByRole('heading', { name: 'Tu referencia mensual para presupuestar' })).toBeVisible();
    const summary = (screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value;
    expect(summary).toContain(`reserva manual del ${irpfRate} %`);
    const query = new URL(window.location.href).searchParams;
    expect(query.get('irpfMode')).toBe('manual');
    expect(query.get('irpfRate')).toBe(irpfRate);
    expect(window.va).toHaveBeenCalledTimes(1);
    expect(window.gtag).toHaveBeenCalledTimes(2);
  });

  it('ignores an inactive reserve in progressive mode and validates the retained value if manual mode is selected', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm initialValues={{ ...reference, irpfMode: 'progressive', irpfRate: '99.9' }} />);
    await submit();
    expect(screen.getByRole('heading', { name: 'Tu referencia mensual para presupuestar' })).toBeVisible();
    expect(screen.queryByText(message)).not.toBeInTheDocument();
    expect(screen.queryByRole('spinbutton', { name: 'Reserva de IRPF para la simulación (%)' })).not.toBeInTheDocument();
    const previousUrl = window.location.href;
    expect(new URL(previousUrl).searchParams.get('irpfMode')).toBe('progressive');
    expect(new URL(previousUrl).searchParams.get('irpfRate')).toBe('99.9');

    await user.selectOptions(screen.getByRole('combobox', { name: 'Cómo quieres estimar el IRPF' }), 'manual');
    expect(reserve()).toHaveValue(99.9);
    expect(reserve()).toHaveAttribute('aria-invalid', 'true');
    expect(reserve()).toHaveAccessibleDescription(expect.stringContaining(message));
    expectNoResult();
    await submit();
    expect(reserve()).toHaveFocus();
    expect(reserve()).toHaveValue(99.9);
    expect(window.location.href).toBe(previousUrl);
    expect(window.va).toHaveBeenCalledTimes(1);
    expect(window.gtag).toHaveBeenCalledTimes(2);
  });

  it('keeps invalid shared and GET values available for correction while SSR, metadata and the image withhold a calculated result', async () => {
    for (const irpfRate of ['99,95', '100']) {
      const props = await sharedProps('manual', irpfRate);
      const canonical = irpfRate.replace(',', '.');
      expect(props.calculatorInitialValues?.irpfRate).toBe(canonical);
      expect(props.calculatorInitiallySubmitted).toBe(true);
      expect(new URL(props.calculatorShareUrl!).searchParams.get('irpfRate')).toBe(canonical);
      const page = metadata(props);
      expect(page.content('og:image')).toBe(`${siteConfig.url}/opengraph-image`);
      expect(page.content('twitter:image')).toBe(`${siteConfig.url}/opengraph-image`);
      expect(page.content('og:title')).toBe('Cuánto facturar como autónomo | Calculadora gratis');
      expect(page.home.calculatorInitiallySubmitted).toBe(true);
      expect(page.home.trackServerConversion).toBe(true);
      const markup = renderToString(<CalculatorForm initialValues={props.calculatorInitialValues} initiallySubmitted={props.calculatorInitiallySubmitted} initialShareUrl={props.calculatorShareUrl} />);
      const container = document.createElement('div');
      container.innerHTML = markup;
      expect(container.querySelector('form')?.getAttribute('method')).toBe('get');
      expect(container.querySelector('form')?.getAttribute('action')).toBe('/#calculadora');
      expect(container.querySelector('[name="irpfRate"]')?.getAttribute('value')).toBe(canonical);
      expect(container.querySelector('[name="irpfRate"]')?.getAttribute('aria-invalid')).toBe('true');
      expect(markup).toContain(message);
      expect(markup).not.toContain('Tu referencia mensual para presupuestar');
      expect(markup).not.toContain('Resumen detallado para compartir');
      const text = await imageText(props.calculatorShareUrl!);
      expect(text).toContain('Calcula cuánto facturar para llegar al neto mensual que buscas');
      expect(text).not.toContain('Resultado compartido');
      expect(text).not.toContain('Neto objetivo');
    }
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('still calculates a shared progressive scenario and its image with an inactive value above 99', async () => {
    const props = await sharedProps('progressive', '99,9');
    expect(props.calculatorInitialValues?.irpfRate).toBe('99.9');
    expect(new URL(props.calculatorShareUrl!).searchParams.get('irpfRate')).toBe('99.9');
    const page = metadata(props);
    expect(new URL(page.content('og:image')).pathname).toBe('/resultado-opengraph-image');
    expect(page.content('og:title')).toBe('Resultado orientativo para facturar como autónomo');
    const markup = renderToString(<CalculatorForm initialValues={props.calculatorInitialValues} initiallySubmitted={props.calculatorInitiallySubmitted} initialShareUrl={props.calculatorShareUrl} />);
    expect(markup).toContain('Tu referencia mensual para presupuestar');
    expect(markup).not.toContain(message);
    expect(markup).toContain('Criterio de IRPF: estimación progresiva simplificada.');
    expect(await imageText(props.calculatorShareUrl!)).toContain('Resultado compartido');
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });
});
