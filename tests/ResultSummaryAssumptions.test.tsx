import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ResultCard from '@/components/ResultCard';
import { calculateFreelanceBilling, type CalculatorInput } from '@/lib/calculator';
import { formatCurrency } from '@/lib/format';
import { getScenarioPath } from '@/lib/monthlyScenarios';

const base: CalculatorInput = { targetNet: 2000, monthlyExpenses: 300, monthlyNonDeductibleExpenses: 0, billableHours: 80, irpfMode: 'manual', irpfRate: 15, autonomousCommunity: 'common', selfEmployedFeeMode: 'manual', selfEmployedFee: 320, reducedFeePeriod: 'initial', hasIVA: true };

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

  it('keeps the same assumption text in preview, clipboard and encoded channels while preserving their query contracts', async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
    const fetch = vi.spyOn(globalThis, 'fetch');
    const previousUrl = window.location.href;
    const { container, props, rerender } = show({ monthlyNonDeductibleExpenses: 50, selfEmployedFeeMode: 'reduced', reducedFeePeriod: 'extended' });
    const text = summary();
    expect(container.querySelector('.result-copy-preview')?.textContent).toBe(text);
    expect(text).toContain(`Gastos deducibles de actividad, sin cuota: ${formatCurrency(300)} al mes`);
    expect(text).toContain(`Otros costes no deducibles: ${formatCurrency(50)} al mes`);
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
      expect(carrierText).toBe(text);
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
});
