import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Children, isValidElement, type ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import Head from 'next/head';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CalculatorForm from '@/components/CalculatorForm';
import HomePage from '@/components/HomePage';
import IndexPage, { getServerSideProps } from '@/pages/index';
import { siteConfig } from '@/lib/site';

const reference = { targetNet: '2000', monthlyExpenses: '300', monthlyNonDeductibleExpenses: '0', billableHours: '80', irpfMode: 'manual' as const, irpfRate: '15', selfEmployedFeeMode: 'manual' as const, selfEmployedFee: '320' };
const cases = [
  { field: 'targetNet' as const, label: 'Neto mensual deseado (EUR)', message: 'El neto mensual queda en 0,00 EUR al redondear. Indica al menos 0,01 EUR.' },
  { field: 'selfEmployedFee' as const, label: 'Cuota manual de autónomos (EUR)', message: 'La cuota manual queda en 0,00 EUR al redondear. Indica al menos 0,01 EUR.' },
];
const expectNoResult = () => {
  expect(screen.queryByRole('heading', { name: 'Tu referencia mensual para presupuestar' })).not.toBeInTheDocument();
  expect(screen.queryByRole('textbox', { name: 'Resumen detallado para compartir' })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'WhatsApp' })).not.toBeInTheDocument();
};

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

describe('positive main amounts that would round to zero cents', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });

  it.each(cases)('blocks Enter without blurring $field before altering the URL, result or conversion', async ({ field, label, message }) => {
    const user = userEvent.setup();
    render(<CalculatorForm initialValues={reference} />);
    const previousUrl = window.location.href;
    const input = screen.getByRole('spinbutton', { name: label });
    await user.clear(input);
    await user.type(input, '0.004');
    await user.keyboard('{Enter}');

    await waitFor(() => expect(input).toHaveFocus());
    expect(input).toHaveValue(0.004);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(message);
    expect(screen.getByText(message)).toHaveAttribute('role', 'alert');
    expectNoResult();
    expect(window.location.href).toBe(previousUrl);
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();

    await user.clear(input);
    await user.type(input, '0.01');
    await act(async () => { fireEvent.submit(screen.getByRole('form', { name: 'Calculadora de facturación' })); });
    expect(screen.getByRole('heading', { name: 'Tu referencia mensual para presupuestar' })).toBeVisible();
    expect(new URL(window.location.href).searchParams.get(field)).toBe('0.01');
    expect(new URL(window.location.href).searchParams.get('selfEmployedFeeMode')).toBe('manual');
    expect(screen.getByText(/Hemos usado tu cuota manual/)).toBeInTheDocument();
    expect(window.va).toHaveBeenCalledTimes(1);
    expect(window.gtag).toHaveBeenCalledTimes(2);
  });

  it.each(cases)('preserves $field through blur and Spanish currency paste until corrected', async ({ label, message }) => {
    const user = userEvent.setup();
    render(<CalculatorForm initialValues={reference} />);
    const previousUrl = window.location.href;
    const input = screen.getByRole('spinbutton', { name: label });
    await user.clear(input);
    await user.type(input, '0.004');
    await user.tab();
    expect(input).toHaveValue(0.004);
    await user.click(input);
    await user.paste('0,004 €');
    expect(input).toHaveValue(0.004);
    await user.keyboard('{Enter}');
    await waitFor(() => expect(input).toHaveFocus());
    expect(input).toHaveAccessibleDescription(message);
    expectNoResult();
    expect(window.location.href).toBe(previousUrl);
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();

    await user.clear(input);
    await user.type(input, '0.01');
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByText(message)).not.toBeInTheDocument();
  });

  it('keeps invalid shared precision for correction while SSR and metadata withhold a calculated result', async () => {
    for (const { field, message } of cases) {
      const response = await getServerSideProps({ query: { ...reference, [field]: '0,004' }, res: { setHeader: vi.fn() } } as unknown as Parameters<typeof getServerSideProps>[0]);
      if (!('props' in response)) throw new Error('Expected calculator props.');
      const props = await response.props;
      expect(props.calculatorInitialValues?.[field]).toBe('0.004');
      expect(props.calculatorInitiallySubmitted).toBe(true);
      expect(new URL(props.calculatorShareUrl!).searchParams.get(field)).toBe('0.004');
      const page = metadata(props);
      expect(page.content('og:image')).toBe(`${siteConfig.url}/opengraph-image`);
      expect(page.content('twitter:image')).toBe(`${siteConfig.url}/opengraph-image`);
      expect(page.content('og:title')).toBe('Cuánto facturar como autónomo | Calculadora gratis');
      expect(page.home.calculatorInitiallySubmitted).toBe(true);
      expect(page.home.trackServerConversion).toBe(true);
      const markup = renderToString(<CalculatorForm initialValues={props.calculatorInitialValues} initiallySubmitted={props.calculatorInitiallySubmitted} initialShareUrl={props.calculatorShareUrl} />);
      expect(markup).toContain(message);
      expect(markup).not.toContain('Tu referencia mensual para presupuestar');
      expect(markup).not.toContain('Resumen detallado para compartir');
    }
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('still permits tiny expenses and ignores an inactive manual fee in automatic and reduced modes', async () => {
    const user = userEvent.setup();
    for (const mode of ['auto', 'reduced'] as const) {
      const { unmount } = render(<CalculatorForm initialValues={{ ...reference, monthlyExpenses: '0.004', monthlyNonDeductibleExpenses: '0.004', selfEmployedFeeMode: mode, selfEmployedFee: '0.004' }} />);
      await user.click(screen.getByRole('button', { name: 'Calcular mi tarifa orientativa' }));
      expect(screen.getByRole('heading', { name: 'Tu referencia mensual para presupuestar' })).toBeVisible();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByRole('spinbutton', { name: 'Gastos mensuales deducibles (EUR)' })).toHaveValue(0);
      expect(screen.getByRole('spinbutton', { name: 'Gastos mensuales no deducibles (EUR)' })).toHaveValue(0);
      expect(screen.getByRole('combobox', { name: 'Cómo quieres calcular la cuota de autónomos' })).toHaveValue(mode);
      expect(screen.queryByText(/Hemos usado tu cuota manual/)).not.toBeInTheDocument();
      unmount();
    }
  });
});
