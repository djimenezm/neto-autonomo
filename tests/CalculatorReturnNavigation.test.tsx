import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import type { AppProps } from 'next/app';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/pages/_app';
import IndexPage, { getServerSideProps } from '@/pages/index';
import GuidePage from '@/pages/cuanto-facturar-autonomo';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Next's font transform runs in the build; these tests exercise real page routing and controls.
vi.mock('@/lib/fonts', () => ({ fontVariables: 'test-font-variables' }));

const values = { targetNet: '1800', monthlyExpenses: '250', monthlyNonDeductibleExpenses: '0', billableHours: '100', irpfMode: 'manual' as const, irpfRate: '15', autonomousCommunity: 'common' as const, hasIVA: true, selfEmployedFeeMode: 'manual' as const, selfEmployedFee: '320', reducedFeePeriod: 'initial' as const };
const query = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, typeof value === 'boolean' ? value ? 'yes' : 'no' : String(value)]));
const scenarioPath = `/?${new URLSearchParams(query)}#calculadora`;
const target = () => screen.getByRole('spinbutton', { name: 'Neto mensual deseado (EUR)' });
const summary = () => screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement;
const helperPrice = () => screen.getByRole('textbox', { name: 'Precio por encargo sin IVA (EUR)' });
const helperHours = () => screen.getByRole('textbox', { name: 'Horas totales por encargo' });
function page(Component: AppProps['Component'], pageProps: AppProps['pageProps'], pathname = '/') {
  return <App Component={Component} pageProps={pageProps} router={{ pathname } as AppProps['router']} />;
}
function home(initiallySubmitted: boolean) {
  return page(IndexPage, { calculatorInitialValues: values, calculatorInitiallySubmitted: initiallySubmitted, ...(initiallySubmitted ? { calculatorShareUrl: window.location.href } : {}) });
}
function navigationLinks(root: ParentNode) {
  const header = root.querySelector('header .nav-cta');
  const invite = root.querySelector('footer .footer-invite-link');
  const footerCalculator = [...root.querySelectorAll('footer a')].find(link => link.textContent?.trim() === 'Calculadora');
  if (!header || !invite || !footerCalculator) throw new Error('Missing calculator return links');
  return [header, invite, footerCalculator] as HTMLAnchorElement[];
}
async function clickHashReturn(link: HTMLAnchorElement) {
  // JSDOM supports fragment activation, not complete page reloads or visual scroll geometry.
  expect(link).toHaveAttribute('href', '#calculadora');
  const before = new URL(window.location.href);
  before.hash = 'kit-tarifa-form';
  window.history.replaceState(null, '', before);
  fireEvent.click(link);
  await waitFor(() => expect(window.location.hash).toBe('#calculadora'));
  expect(window.location.pathname).toBe(before.pathname);
  expect(window.location.search).toBe(before.search);
}
async function enterHelperDraft() {
  await userEvent.click(screen.getByText('Comprobar cuántos encargos necesito y si caben'));
  fireEvent.change(helperPrice(), { target: { value: '600,555' } });
  fireEvent.change(helperHours(), { target: { value: '1,,25' } });
  return { price: helperPrice(), hours: helperHours() };
}

describe('returning to the calculator without leaving its current document', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    window.va = vi.fn();
    window.gtag = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('renders local calculator anchors in real home App HTML for both an empty visit and a shared GET scenario', async () => {
    for (const calculatorQuery of [{}, query]) {
      const response = await getServerSideProps({ query: calculatorQuery, res: { setHeader: vi.fn() } } as unknown as Parameters<typeof getServerSideProps>[0]);
      if (!('props' in response)) throw new Error('Expected home props');
      const props = await response.props;
      const doc = new DOMParser().parseFromString(renderToString(page(IndexPage, props)), 'text/html');
      expect(navigationLinks(doc)).toHaveLength(3);
      for (const link of navigationLinks(doc)) expect(link.getAttribute('href')).toBe('#calculadora');
      expect(doc.getElementById('calculadora')).not.toBeNull();
      if ('targetNet' in calculatorQuery) {
        expect(doc.querySelector('input[name="targetNet"]')?.getAttribute('value')).toBe('1800');
        expect(doc.body.textContent).toContain('Tu referencia mensual para presupuestar');
      }
    }
  });

  it('keeps guide App navigation and the standalone Header and Footer defaults pointing to the home calculator', () => {
    const routedDoc = new DOMParser().parseFromString(renderToString(page(GuidePage, {}, '/cuanto-facturar-autonomo')), 'text/html');
    for (const link of navigationLinks(routedDoc)) expect(link.getAttribute('href')).toBe('/#calculadora');
    const defaultDoc = new DOMParser().parseFromString(renderToString(<><Header /><Footer /></>), 'text/html');
    for (const link of navigationLinks(defaultDoc)) expect(link.getAttribute('href')).toBe('/#calculadora');
    expect(defaultDoc.querySelector('a[href="/tabla-cuanto-facturar-autonomo"]')).not.toBeNull();
  });

  it('retains the shared calculation, query, GET inputs and raw helper draft when each header or footer anchor is activated', async () => {
    window.history.replaceState(null, '', scenarioPath);
    render(home(true));
    const originalSummary = summary().value;
    const form = screen.getByRole('form', { name: 'Calculadora de facturación' }) as HTMLFormElement;
    const originalData = [...new FormData(form).entries()];
    const draft = await enterHelperDraft();
    const counts = [vi.mocked(window.va!).mock.calls.length, vi.mocked(window.gtag!).mock.calls.length];

    for (const link of navigationLinks(document)) {
      await clickHashReturn(link);
      expect(target()).toHaveValue(1800);
      expect(screen.getByRole('spinbutton', { name: 'Gastos mensuales deducibles (EUR)' })).toHaveValue(250);
      expect(screen.getByRole('spinbutton', { name: 'Horas facturables al mes' })).toHaveValue(100);
      expect(screen.getByRole('spinbutton', { name: 'Cuota manual de autónomos (EUR)' })).toHaveValue(320);
      expect(draft.price).toHaveValue('600,555');
      expect(draft.hours).toHaveValue('1,,25');
      expect(draft.price.closest('details')).toHaveAttribute('open');
      expect(summary()).toHaveValue(originalSummary);
      expect([...new FormData(form).entries()]).toEqual(originalData);
      expect([vi.mocked(window.va!).mock.calls.length, vi.mocked(window.gtag!).mock.calls.length]).toEqual(counts);
    }
  });

  it('keeps client-created query parameters and pending main edits while retaining a helper draft through return anchors', async () => {
    render(home(false));
    await act(async () => { fireEvent.submit(screen.getByRole('form', { name: 'Calculadora de facturación' })); });
    expect(new URL(window.location.href).searchParams.get('targetNet')).toBe('1800');
    const originalSearch = window.location.search;
    const originalSummary = summary().value;
    const draft = await enterHelperDraft();
    fireEvent.change(target(), { target: { value: '1900' } });
    expect(screen.queryByRole('heading', { name: 'Tu referencia mensual para presupuestar' })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Hay cambios sin calcular');
    const counts = [vi.mocked(window.va!).mock.calls.length, vi.mocked(window.gtag!).mock.calls.length];
    expect(counts).toEqual([1, 2]);

    for (const link of navigationLinks(document)) {
      await clickHashReturn(link);
      expect(window.location.search).toBe(originalSearch);
      expect(target()).toHaveValue(1900);
      expect(draft.price).toHaveValue('600,555');
      expect(draft.hours).toHaveValue('1,,25');
      expect(screen.queryByRole('heading', { name: 'Tu referencia mensual para presupuestar' })).not.toBeInTheDocument();
      expect(screen.queryByRole('textbox', { name: 'Resumen detallado para compartir' })).not.toBeInTheDocument();
      expect([vi.mocked(window.va!).mock.calls.length, vi.mocked(window.gtag!).mock.calls.length]).toEqual(counts);
    }
    fireEvent.change(target(), { target: { value: '1800' } });
    expect(within(screen.getByRole('region', { name: 'Tu referencia mensual para presupuestar' })).getByRole('textbox', { name: 'Resumen detallado para compartir' })).toHaveValue(originalSummary);
    expect(helperPrice()).toHaveValue('600,555');
    expect(helperHours()).toHaveValue('1,,25');
    expect(window.location.search).toBe(originalSearch);
    expect([vi.mocked(window.va!).mock.calls.length, vi.mocked(window.gtag!).mock.calls.length]).toEqual(counts);
  });
});
