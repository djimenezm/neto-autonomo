import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CalculatorForm from '@/components/CalculatorForm';

const reference = { targetNet: '1800', monthlyExpenses: '250', monthlyNonDeductibleExpenses: '0', billableHours: '100', irpfMode: 'manual' as const, irpfRate: '15', selfEmployedFeeMode: 'manual' as const, selfEmployedFee: '320' };
const net = () => screen.getByRole('spinbutton', { name: 'Neto mensual deseado (EUR)' });
const fee = () => screen.getByRole('spinbutton', { name: 'Cuota manual de autónomos (EUR)' });
const hours = () => screen.getByRole('spinbutton', { name: 'Horas facturables al mes' });
const form = () => screen.getByRole('form', { name: 'Calculadora de facturación' }) as HTMLFormElement;
const globalError = () => screen.queryByText('Revisa los campos marcados antes de calcular.');
const resultName = 'Tu referencia mensual para presupuestar';
const change = (input: HTMLElement, value: string) => fireEvent.change(input, { target: { value } });
async function submit() {
  await act(async () => { fireEvent.submit(form()); });
}
async function applyExampleHours() {
  const summary = screen.getByText('Estimar mis horas con mi agenda');
  if (!summary.closest('details')!.open) await userEvent.click(summary);
  await userEvent.click(screen.getByRole('button', { name: 'Probar un ejemplo' }));
  await userEvent.click(screen.getByRole('button', { name: 'Usar 107 horas al mes' }));
}
function expectResultUnavailable() {
  expect(screen.queryByRole('heading', { name: resultName })).not.toBeInTheDocument();
  expect(screen.queryByRole('textbox', { name: 'Resumen detallado para compartir' })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'WhatsApp' })).not.toBeInTheDocument();
}
const eventCounts = () => [vi.mocked(window.va!).mock.calls.length, vi.mocked(window.gtag!).mock.calls.length];

describe('main validation remains attempted when applying hours from the agenda', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    window.va = vi.fn();
    window.gtag = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('retains pending net and fee errors and their descriptions after an invalid submission, correcting each without moving focus', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm initialValues={{ ...reference, targetNet: '0', billableHours: '0', selfEmployedFee: '0' }} />);
    await submit();
    expect(net()).toHaveAttribute('aria-invalid', 'true');
    expect(fee()).toHaveAttribute('aria-invalid', 'true');
    expect(hours()).toHaveAttribute('aria-invalid', 'true');
    await applyExampleHours();
    expect(hours()).toHaveValue(107);
    expect(hours()).toHaveFocus();
    expect(hours()).toHaveAttribute('aria-invalid', 'false');
    expect(net()).toHaveAttribute('aria-invalid', 'true');
    expect(net()).toHaveAccessibleDescription(/neto mensual debe ser mayor que 0/);
    expect(fee()).toHaveAttribute('aria-invalid', 'true');
    expect(fee()).toHaveAccessibleDescription(/cuota manual debe ser mayor que 0/);
    expect(net().getAttribute('aria-describedby')?.split(/\s+/)).toContain('target-net-error');
    expect(fee().getAttribute('aria-describedby')?.split(/\s+/)).toContain('self-employed-fee-error');
    expect(globalError()).toHaveAttribute('role', 'alert');
    expect(screen.getByText(/Aplicadas 107 h\/mes/)).toBeVisible();
    expectResultUnavailable();
    await user.clear(net());
    await user.type(net(), '1800');
    expect(net()).toHaveFocus();
    expect(net()).toHaveAttribute('aria-invalid', 'false');
    expect(fee()).toHaveAttribute('aria-invalid', 'true');
    expect(globalError()).toBeVisible();
    await user.clear(fee());
    await user.type(fee(), '320');
    expect(fee()).toHaveFocus();
    expect(fee()).toHaveAttribute('aria-invalid', 'false');
    expect(globalError()).not.toBeInTheDocument();
    expectResultUnavailable();
    expect(eventCounts()).toEqual([0, 0]);
  });

  it('keeps unrelated invalid values quiet when hours are applied before the first attempt while preserving immediate zero-hour feedback', async () => {
    render(<CalculatorForm initialValues={{ ...reference, targetNet: '0', selfEmployedFee: '0' }} />);
    await applyExampleHours();
    expect(hours()).toHaveValue(107);
    expect(hours()).toHaveFocus();
    expect(net()).toHaveAttribute('aria-invalid', 'false');
    expect(fee()).toHaveAttribute('aria-invalid', 'false');
    expect(globalError()).not.toBeInTheDocument();
    change(hours(), '0');
    expect(hours()).toHaveAttribute('aria-invalid', 'true');
    expect(hours()).toHaveAccessibleDescription(/mayores que 0/);
    expect(net()).toHaveAttribute('aria-invalid', 'false');
    expect(fee()).toHaveAttribute('aria-invalid', 'false');
    expect(globalError()).not.toBeInTheDocument();
    expectResultUnavailable();
    expect(eventCounts()).toEqual([0, 0]);
    expect(window.location.search).toBe('');
  });

  it('retains initial shared-scenario errors without a client submission and requires explicit calculation after correction', async () => {
    render(<CalculatorForm initiallySubmitted initialValues={{ ...reference, targetNet: '0', billableHours: '0', selfEmployedFee: '0' }} initialShareUrl="https://www.cuantofacturar.es/?targetNet=0#calculadora" />);
    expect(net()).toHaveAttribute('aria-invalid', 'true');
    await applyExampleHours();
    expect(hours()).toHaveFocus();
    expect(net()).toHaveAttribute('aria-invalid', 'true');
    expect(fee()).toHaveAttribute('aria-invalid', 'true');
    expect(globalError()).toBeVisible();
    change(net(), '1800');
    change(fee(), '320');
    expect(globalError()).not.toBeInTheDocument();
    expectResultUnavailable();
    await submit();
    expect(screen.getByRole('heading', { name: resultName })).toBeVisible();
    expect(new URLSearchParams(window.location.search).get('billableHours')).toBe('107');
    expect(eventCounts()).toEqual([0, 0]);
  });

  it('withdraws a previous result even when the applied hours are unchanged and restores its helper draft only after explicit resubmission', async () => {
    render(<CalculatorForm initialValues={{ ...reference, billableHours: '107' }} />);
    await submit();
    const originalUrl = window.location.href;
    const originalSummary = (screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value;
    await userEvent.click(screen.getByText('Comprobar cuántos encargos necesito y si caben'));
    const price = screen.getByRole('textbox', { name: 'Precio por encargo sin IVA (EUR)' });
    const effort = screen.getByRole('textbox', { name: 'Horas totales por encargo' });
    change(price, '600,555');
    change(effort, '1,,25');
    await applyExampleHours();
    expect(hours()).toHaveValue(107);
    expect(hours()).toHaveFocus();
    expectResultUnavailable();
    expect(price).toHaveValue('600,555');
    expect(effort).toHaveValue('1,,25');
    expect(window.location.href).toBe(originalUrl);
    expect(eventCounts()).toEqual([1, 2]);
    await submit();
    expect(screen.getByRole('heading', { name: resultName })).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Resumen detallado para compartir' })).toHaveValue(originalSummary);
    expect(screen.getByRole('textbox', { name: 'Precio por encargo sin IVA (EUR)' })).toHaveValue('600,555');
    expect(screen.getByRole('textbox', { name: 'Horas totales por encargo' })).toHaveValue('1,,25');
    expect(eventCounts()).toEqual([1, 2]);
  });

  it('preserves a rejected-paste explanation before any submit without marking every other field when applying hours', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm initialValues={reference} />);
    const expenses = screen.getByRole('spinbutton', { name: 'Gastos mensuales deducibles (EUR)' });
    await user.click(expenses);
    await user.paste('100\t200');
    expect(expenses).toHaveAttribute('aria-invalid', 'true');
    expect(expenses).toHaveAccessibleDescription(/Pega un solo número y revisa los separadores/);
    await applyExampleHours();
    expect(hours()).toHaveFocus();
    expect(expenses).toHaveValue(null);
    expect(expenses).toHaveAttribute('aria-invalid', 'true');
    expect(expenses).toHaveAccessibleDescription(/Pega un solo número y revisa los separadores/);
    expect(net()).toHaveAttribute('aria-invalid', 'false');
    expect(fee()).toHaveAttribute('aria-invalid', 'false');
    expect(globalError()).not.toBeInTheDocument();
    await user.type(expenses, '250');
    expect(expenses).toHaveFocus();
    expect(expenses).toHaveAttribute('aria-invalid', 'false');
    expectResultUnavailable();
    expect(eventCounts()).toEqual([0, 0]);
  });

  it('retains attempted validation after a successful calculation, without extra history writes, GET fields or conversions on applying and editing hours', async () => {
    render(<CalculatorForm initialValues={reference} />);
    await submit();
    const originalUrl = window.location.href;
    const originalNames = [...new FormData(form()).keys()];
    const replaceState = vi.spyOn(window.history, 'replaceState');
    await applyExampleHours();
    change(hours(), '1.5');
    expect(hours()).toHaveAttribute('aria-invalid', 'true');
    expect(hours()).toHaveAccessibleDescription(/número entero/);
    expect(globalError()).toBeVisible();
    change(hours(), '0');
    expect(hours()).toHaveAttribute('aria-invalid', 'true');
    expect(globalError()).toBeVisible();
    change(hours(), '107');
    expect(hours()).toHaveAttribute('aria-invalid', 'false');
    expect(globalError()).not.toBeInTheDocument();
    expectResultUnavailable();
    expect(window.location.href).toBe(originalUrl);
    expect(replaceState).not.toHaveBeenCalled();
    expect([...new FormData(form()).keys()]).toEqual(originalNames);
    expect(Object.fromEntries(new FormData(form()))).toMatchObject({ targetNet: '1800', billableHours: '107', irpfMode: 'manual', selfEmployedFeeMode: 'manual', selfEmployedFee: '320' });
    expect(eventCounts()).toEqual([1, 2]);
    await submit();
    expect(replaceState).toHaveBeenCalledTimes(1);
    expect(new URLSearchParams(window.location.search).get('billableHours')).toBe('107');
    expect(eventCounts()).toEqual([1, 2]);
  });
});
