import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ResultCard from '@/components/ResultCard';
import { calculateFreelanceBilling, type CalculatorInput } from '@/lib/calculator';
import { formatCurrency } from '@/lib/format';
import { getScenarioPath } from '@/lib/monthlyScenarios';
import { calculateValidSharedResult, readCalculatorQuery } from '@/lib/calculatorQuery';

const base: CalculatorInput = { targetNet: 2000, monthlyExpenses: 300, monthlyNonDeductibleExpenses: 0, billableHours: 80, irpfMode: 'manual', irpfRate: 15, autonomousCommunity: 'common', selfEmployedFeeMode: 'manual', selfEmployedFee: 320, reducedFeePeriod: 'initial', hasIVA: true };
const roundingNote = 'La tarifa por hora está redondeada a céntimos. Al multiplicarla por las horas, el total puede diferir del objetivo mensual. El comprobador de encargos usa la proporción mensual completa y redondea su referencia al céntimo superior.';
const xIntroduction = 'Tarifa media orientativa en Cuánto Facturar. Abre el cálculo principal y sus supuestos en el enlace.';

function show(overrides: Partial<CalculatorInput> = {}) {
  const input = { ...base, ...overrides };
  const result = calculateFreelanceBilling(input);
  const shareUrl = new URL(getScenarioPath(input), 'https://www.cuantofacturar.es').toString();
  const props = { result, hoursBillable: input.billableHours, hasIVA: input.hasIVA, shareUrl };
  return { ...render(<ResultCard {...props} />), result, props };
}

const detailed = () => (screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value;
const summary = () => detailed().split('\n\nCalculadora: ')[0];
const line = (prefix: string) => summary().split('\n').find(value => value.startsWith(prefix));

describe('the assumptions carried with the result summary', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });
  afterEach(() => vi.restoreAllMocks());

  it('includes both expense amounts and identifies a zero manual reserve and manual fee without an inactive extension', () => {
    const { result } = show({ irpfRate: 0, reducedFeePeriod: 'extended' });
    expect(summary()).toContain(`Gastos deducibles de actividad, sin cuota: ${formatCurrency(300)} al mes`);
    expect(summary()).toContain(`Otros costes no deducibles: ${formatCurrency(0)} al mes`);
    expect(line('Criterio de IRPF:')).toMatch(/reserva manual del 0 % sobre el beneficio/);
    expect(line('Criterio de IRPF:')).toMatch(/no es retención de una factura/);
    expect(summary()).toContain(`Reserva estimada de IRPF: ${formatCurrency(result.estimatedIRPF)} al mes`);
    expect(summary()).toContain(`Cuota de autónomos aplicada: ${formatCurrency(320)} al mes`);
    expect(line('Modalidad de cuota:')).toBe('Modalidad de cuota: manual indicada');
    expect(summary()).not.toMatch(/Comunidad|SMI|prórroga/i);
  });

  it('distinguishes the progressive regional estimate and automatic fee from an elected fixed percentage', () => {
    const { result } = show({ irpfMode: 'progressive', autonomousCommunity: 'madrid', selfEmployedFeeMode: 'auto', monthlyNonDeductibleExpenses: 75 });
    expect(result.irpfRate).toBeGreaterThan(0);
    expect(line('Criterio de IRPF:')).toBe('Criterio de IRPF: estimación progresiva simplificada.');
    expect(line('Criterio de IRPF:')).not.toMatch(/\d.*%|manual/);
    expect(summary()).toContain('Comunidad de referencia para IRPF: Madrid');
    expect(summary()).toContain(`Otros costes no deducibles: ${formatCurrency(75)} al mes`);
    expect(summary()).toContain(`Reserva estimada de IRPF: ${formatCurrency(result.estimatedIRPF)} al mes`);
    expect(summary()).toContain(`Cuota de autónomos aplicada: ${formatCurrency(result.selfEmployedFee)} al mes`);
    expect(line('Modalidad de cuota:')).toBe('Modalidad de cuota: estimada según tramo 2026');
    expect(summary()).not.toMatch(/SMI|prórroga/i);
  });

  it('identifies the initial reduced fee without applying the extension income test to the initial period', () => {
    const { result } = show({ selfEmployedFeeMode: 'reduced', reducedFeePeriod: 'initial' });
    expect(result.reducedFeeExtensionEligible).toBe(false);
    expect(line('Modalidad de cuota:')).toBe('Modalidad de cuota: cuota reducida inicial simulada (MEI incluido)');
    expect(summary()).toContain(`Cuota de autónomos aplicada: ${formatCurrency(result.selfEmployedFee)} al mes`);
    expect(summary()).not.toMatch(/SMI|rendimientos|prórroga/i);
  });

  it.each([{ targetNet: 1200, below: true }, { targetNet: 2000, below: false }])('carries the annual extension comparison without claiming a right to it: $below', ({ targetNet, below }) => {
    const { result } = show({ targetNet, selfEmployedFeeMode: 'reduced', reducedFeePeriod: 'extended' });
    expect(result.reducedFeeExtensionEligible).toBe(below);
    expect(line('Modalidad de cuota:')).toBe('Modalidad de cuota: prórroga simulada de cuota reducida (MEI incluido)');
    expect(summary()).toContain(formatCurrency(result.annualEstimatedNetReturnsForContributions));
    expect(summary()).toContain(formatCurrency(result.referenceAnnualSMI));
    expect(summary()).toContain(`La estimación ${below ? 'queda' : 'no queda'} por debajo del SMI anual.`);
    expect(summary()).toMatch(/doce meses iguales/);
    expect(summary()).toMatch(/no acredita el derecho a la prórroga/);
    expect(summary()).toMatch(/Solicitud y demás requisitos aparte/);
    expect(summary()).toMatch(/dos años naturales, revisa rendimientos y SMI de cada año/);
  });

  it('explains beside the rounded hourly figure and in the shared summary why a one-hour project can need one cent more', async () => {
    const user = userEvent.setup();
    const { result } = show({ targetNet: 1500, monthlyExpenses: 150, billableHours: 80, irpfRate: 15, selfEmployedFee: 320 });
    expect(result.billingWithoutVAT).toBe(2234.71);
    expect(result.hourlyRate).toBe(27.93);
    expect(screen.getByText('Facturación objetivo sin IVA').parentElement).toHaveTextContent(/2234,71\s*€/);
    const hourlyCard = screen.getByText('Tarifa media por hora').closest<HTMLElement>('.result-item')!;
    expect(within(hourlyCard).getByText(/27,93\s*€\/h/)).toBeVisible();
    expect(within(hourlyCard).getByText(roundingNote)).toBeVisible();
    const originalSummary = summary();
    const lines = originalSummary.split('\n');
    const hourlyLine = lines.indexOf(`Tarifa media orientativa: ${formatCurrency(27.93)}/h`);
    expect(hourlyLine).toBeGreaterThan(-1);
    expect(lines[hourlyLine + 1]).toBe(`Redondeo: ${roundingNote}`);
    expect(lines.filter(value => value.startsWith('Redondeo:'))).toHaveLength(1);

    await user.click(screen.getByText('Comprobar cuántos encargos necesito y si caben'));
    await user.type(screen.getByRole('textbox', { name: 'Precio por encargo sin IVA (EUR)' }), '27,93');
    await user.type(screen.getByRole('textbox', { name: 'Horas totales por encargo' }), '1');
    await user.click(screen.getByRole('button', { name: 'Comprobar encargos' }));
    expect(screen.getByText('Precio por hora del encargo').nextElementSibling).toHaveTextContent(/27,93\s*€\/h/);
    expect(screen.getByText('Referencia para estas horas sin IVA').nextElementSibling).toHaveTextContent(/27,94\s*€/);
    expect(screen.getByText(/El precio queda 0,01\s*€ por debajo de la referencia para estas horas\./)).toBeVisible();
    expect(summary()).toBe(originalSummary);
  });

  it('keeps the detailed assumptions in preview, clipboard, WhatsApp and email while X carries the brief introduction and the same scenario', async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
    const fetch = vi.spyOn(globalThis, 'fetch');
    const previousUrl = window.location.href;
    const { container, props, rerender } = show({ monthlyNonDeductibleExpenses: 50, selfEmployedFeeMode: 'reduced', reducedFeePeriod: 'extended' });
    const text = summary();
    expect(container.querySelector('.result-copy-preview')?.textContent).toBe(text);
    expect(text).toContain(`Gastos deducibles de actividad, sin cuota: ${formatCurrency(300)} al mes`);
    expect(text).toContain(`Otros costes no deducibles: ${formatCurrency(50)} al mes`);
    expect(text).toContain(`Redondeo: ${roundingNote}`);
    const original = new URL(props.shareUrl);
    const links = [
      { name: 'WhatsApp', parameter: 'text', source: 'whatsapp', medium: 'social_share' },
      { name: 'X', parameter: 'text', source: 'x', medium: 'social_share' },
      { name: 'Email', parameter: 'body', source: 'email', medium: 'share_link' },
    ];
    const hrefs: Record<string, string> = {};
    for (const { name, parameter, source, medium } of links) {
      const link = screen.getByRole('link', { name });
      const href = link.getAttribute('href')!;
      hrefs[name] = href;
      expect(link).toHaveAttribute('data-share-channel', source);
      const body = new URL(href).searchParams.get(parameter)!;
      const [carrierText, calculator] = body.split('\n\nCalculadora: ');
      expect(carrierText).toBe(name === 'X' ? xIntroduction : text);
      if (name === 'Email') expect(body).toBe(detailed());
      const encoded = new URL(calculator);
      expect(encoded.origin).toBe(original.origin);
      expect(encoded.pathname).toBe(original.pathname);
      expect(encoded.hash).toBe(original.hash);
      for (const [key, value] of original.searchParams) expect(encoded.searchParams.get(key)).toBe(value);
      expect(encoded.searchParams.get('utm_source')).toBe(source);
      expect(encoded.searchParams.get('utm_medium')).toBe(medium);
      expect(encoded.searchParams.get('utm_campaign')).toBe('shared_calculator_result');
    }
    await user.click(screen.getByRole('button', { name: 'Copiar resumen' }));
    expect(writeText).toHaveBeenCalledOnce();
    expect(writeText).toHaveBeenCalledWith(text);

    rerender(<ResultCard {...props} enableCopy={false} />);
    expect(screen.queryByRole('button', { name: /Copiar resumen|Resumen copiado/ })).not.toBeInTheDocument();
    expect(detailed().split('\n\nCalculadora: ')[0]).toBe(text);
    for (const { name } of links) expect(screen.getByRole('link', { name })).toHaveAttribute('href', hrefs[name]);
    expect(window.location.href).toBe(previousUrl);
    expect(fetch).not.toHaveBeenCalled();
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('keeps the X text within a conservative post budget and every scenario parameter intact while retaining the full summary elsewhere', async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
    const fetch = vi.spyOn(globalThis, 'fetch');
    const previousUrl = window.location.href;
    const scenarios: Partial<CalculatorInput>[] = [
      { targetNet: 1500, monthlyExpenses: 150, billableHours: 80 },
      { targetNet: 1200, monthlyNonDeductibleExpenses: 50, selfEmployedFeeMode: 'reduced', reducedFeePeriod: 'extended', hasIVA: false },
      { targetNet: 2500, monthlyExpenses: 450, monthlyNonDeductibleExpenses: 75, billableHours: 60, irpfMode: 'progressive', autonomousCommunity: 'madrid', selfEmployedFeeMode: 'auto' },
    ];
    for (const overrides of scenarios) {
      const { props, result, unmount } = show(overrides);
      const fullSummary = summary();
      const xLink = screen.getByRole('link', { name: 'X' });
      const intent = new URL(xLink.getAttribute('href')!);
      const body = intent.searchParams.get('text')!;
      const [introduction, calculator] = body.split('\n\nCalculadora: ');
      expect(introduction).toBe(xIntroduction);
      expect(introduction).not.toBe(fullSummary);
      const prefix = body.slice(0, body.length - calculator.length);
      // Each non-URL code unit may count twice; an intact shared URL counts as 23.
      expect(2 * prefix.length + 23).toBeLessThanOrEqual(280);
      const shared = new URL(calculator);
      const original = new URL(props.shareUrl);
      expect(shared.origin).toBe(original.origin);
      expect(shared.pathname).toBe(original.pathname);
      expect(shared.hash).toBe(original.hash);
      for (const [key, value] of original.searchParams) expect(shared.searchParams.get(key)).toBe(value);
      expect(shared.searchParams.get('utm_source')).toBe('x');
      expect(shared.searchParams.get('utm_medium')).toBe('social_share');
      expect(shared.searchParams.get('utm_campaign')).toBe('shared_calculator_result');
      const reconstructed = readCalculatorQuery(key => shared.searchParams.get(key) ?? undefined);
      expect(calculateValidSharedResult(reconstructed)).toEqual(result);
      expect(xLink).toHaveAttribute('data-share-channel', 'x');
      expect(screen.getByText('Copia el resumen detallado con el enlace o compártelo por WhatsApp y correo. En X se prepara un texto breve con el enlace al cálculo.')).toBeVisible();

      expect(fullSummary).toContain(`Redondeo: ${roundingNote}`);
      expect(fullSummary).toContain('Criterio de IRPF:');
      const whatsapp = new URL(screen.getByRole('link', { name: 'WhatsApp' }).getAttribute('href')!).searchParams.get('text')!;
      const email = new URL(screen.getByRole('link', { name: 'Email' }).getAttribute('href')!).searchParams.get('body')!;
      expect(whatsapp.split('\n\nCalculadora: ')[0]).toBe(fullSummary);
      expect(email).toBe(detailed());
      writeText.mockClear();
      await user.click(screen.getByRole('button', { name: 'Copiar resumen' }));
      expect(writeText).toHaveBeenCalledExactlyOnceWith(fullSummary);
      unmount();
    }
    expect(window.location.href).toBe(previousUrl);
    expect(fetch).not.toHaveBeenCalled();
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });
});
