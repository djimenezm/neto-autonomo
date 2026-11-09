import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CalculatorForm from '@/components/CalculatorForm';

const reference = { targetNet: '1800', monthlyExpenses: '250', monthlyNonDeductibleExpenses: '0', billableHours: '100', irpfMode: 'manual' as const, irpfRate: '15', selfEmployedFeeMode: 'manual' as const, selfEmployedFee: '320' };
const labels = { net: 'Neto mensual deseado (EUR)', expenses: 'Gastos mensuales deducibles (EUR)', other: 'Gastos mensuales no deducibles (EUR)', hours: 'Horas facturables al mes', irpf: 'Reserva de IRPF para la simulación (%)', fee: 'Cuota manual de autónomos (EUR)' } as const;
const field = (key: keyof typeof labels) => screen.getByRole('spinbutton', { name: labels[key] });
const form = () => screen.getByRole('form', { name: 'Calculadora de facturación' }) as HTMLFormElement;
const message = 'El formato del dato pegado no es válido. Pega un solo número y revisa los separadores.';
const globalMessage = 'Revisa los campos marcados antes de calcular.';
type User = ReturnType<typeof userEvent.setup>;
async function paste(user: User, key: keyof typeof labels, text: string) {
  await user.click(field(key));
  await user.paste(text);
}
async function submit() {
  await act(async () => { fireEvent.submit(form()); });
}
function expectRejected(key: keyof typeof labels, reason = message) {
  const input = field(key);
  expect(input).toHaveValue(null);
  expect(input).toHaveAccessibleName(labels[key]);
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(input).toHaveAccessibleDescription(expect.stringContaining(reason));
  const error = input.getAttribute('aria-describedby')?.split(/\s+/)
    .map(id => document.getElementById(id)).find(node => node?.textContent === reason);
  expect(error).toBeVisible();
  expect(error).toHaveAttribute('role', 'alert');
}
function expectNoResult() {
  expect(screen.queryByRole('heading', { name: 'Tu referencia mensual para presupuestar' })).not.toBeInTheDocument();
  expect(screen.queryByRole('textbox', { name: 'Resumen detallado para compartir' })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'WhatsApp' })).not.toBeInTheDocument();
}

describe('independent rejected pastes in the main calculator', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    window.va = vi.fn();
    window.gtag = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('rejects units incompatible with each field and shares only the corrected calculation', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm initialValues={reference} initiallySubmitted />);
    const originalUrl = window.location.href;
    const amountError = 'Pega un importe en euros. Puedes usar € o EUR.';
    const wrongUnits = [
      ['net', 'USD 1,800.50', amountError],
      ['expenses', '15 %', amountError],
      ['other', 'CHF 20', amountError],
      ['fee', '£320', amountError],
      ['hours', '80 %', 'Pega solo el número de horas, sin moneda ni porcentaje.'],
      ['irpf', '15 €', 'Pega un porcentaje con % o solo el número. Quita el símbolo o código de moneda.'],
    ] as const;
    for (const [key, text, reason] of wrongUnits) {
      await paste(user, key, text);
      expectRejected(key, reason);
    }
    expectNoResult();
    await submit();
    expect(field('net')).toHaveFocus();
    expect(window.location.href).toBe(originalUrl);

    await paste(user, 'net', '1.800,50 €');
    expect(field('net')).toHaveAttribute('aria-invalid', 'false');
    for (const [key, , reason] of wrongUnits.slice(1)) expectRejected(key, reason);
    await paste(user, 'expenses', '250 EUR');
    await paste(user, 'other', '0');
    await paste(user, 'fee', '320 €');
    await paste(user, 'hours', '80');
    await paste(user, 'irpf', '15 %');
    expectNoResult();
    await submit();
    expect(screen.getByRole('heading', { name: 'Tu referencia mensual para presupuestar' })).toBeVisible();
    const query = new URL(window.location.href).searchParams;
    expect(query.get('targetNet')).toBe('1800.5');
    expect(query.get('billableHours')).toBe('80');
    expect(query.get('irpfRate')).toBe('15');
  });

  it('retains both immediate explanations before the first submission and removes only the edited field mark', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm initialValues={reference} />);
    await paste(user, 'net', '100\t200');
    await paste(user, 'expenses', '300\t400');
    expect(field('expenses')).toHaveFocus();
    expectRejected('net');
    expectRejected('expenses');
    expect(screen.getAllByText(message)).toHaveLength(2);
    expect(screen.queryByText(globalMessage)).not.toBeInTheDocument();
    expect(field('other')).toHaveAttribute('aria-invalid', 'false');
    expect(field('fee')).toHaveAttribute('aria-invalid', 'false');

    await user.type(field('expenses'), '250');
    expect(field('expenses')).toHaveFocus();
    expect(field('expenses')).toHaveAttribute('aria-invalid', 'false');
    expect(field('expenses')).not.toHaveAccessibleDescription(expect.stringContaining(message));
    expectRejected('net');
    expect(screen.getAllByText(message)).toHaveLength(1);
    expectNoResult();
    expect(window.location.search).toBe('');
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('preserves each paste-specific reason after submitting and focuses the first remaining invalid field in form order', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm initialValues={reference} />);
    await paste(user, 'net', '100\n200');
    await paste(user, 'expenses', '300\t400');
    await submit();
    expect(field('net')).toHaveFocus();
    expectRejected('net');
    expectRejected('expenses');
    expect(screen.getByText(globalMessage)).toHaveAttribute('role', 'alert');

    await user.type(field('net'), '1800');
    expect(field('net')).toHaveFocus();
    expect(field('net')).toHaveAttribute('aria-invalid', 'false');
    expectRejected('expenses');
    await submit();
    expect(field('expenses')).toHaveFocus();
    expectRejected('expenses');
    expectNoResult();
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('uses a valid Spanish paste to clear only that field and calculates only after the other rejection is corrected', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm initialValues={reference} />);
    await paste(user, 'net', '100\t200');
    await paste(user, 'expenses', '300\t400');
    await paste(user, 'expenses', '250,50 €');
    expect(field('expenses')).toHaveValue(250.5);
    expect(field('expenses')).toHaveAttribute('aria-invalid', 'false');
    expectRejected('net');
    fireEvent.change(field('other'), { target: { value: '10' } });
    expectRejected('net');
    expectNoResult();

    await paste(user, 'net', '1.800,50 €');
    expect(field('net')).toHaveValue(1800.5);
    expect(screen.queryByText(message)).not.toBeInTheDocument();
    expectNoResult();
    await submit();
    expect(screen.getByRole('heading', { name: 'Tu referencia mensual para presupuestar' })).toBeVisible();
    const query = new URL(window.location.href).searchParams;
    expect(query.get('targetNet')).toBe('1800.5');
    expect(query.get('monthlyExpenses')).toBe('250.5');
    expect(query.get('monthlyNonDeductibleExpenses')).toBe('10');
    expect(window.va).toHaveBeenCalledTimes(1);
    expect(window.gtag).toHaveBeenCalledTimes(2);
  });

  it('ignores rejected hidden manual inputs without forgetting their reasons when each mode is reactivated', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm initialValues={reference} />);
    await paste(user, 'irpf', '15\t21');
    await paste(user, 'fee', '320\n350');
    expectRejected('irpf');
    expectRejected('fee');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Cómo quieres estimar el IRPF' }), 'progressive');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Cómo quieres calcular la cuota de autónomos' }), 'auto');
    expect(screen.queryByRole('spinbutton', { name: labels.irpf })).not.toBeInTheDocument();
    expect(screen.queryByRole('spinbutton', { name: labels.fee })).not.toBeInTheDocument();
    expect(screen.queryByText(message)).not.toBeInTheDocument();
    await submit();
    expect(screen.getByRole('heading', { name: 'Tu referencia mensual para presupuestar' })).toBeVisible();
    const previousUrl = window.location.href;

    await user.selectOptions(screen.getByRole('combobox', { name: 'Cómo quieres estimar el IRPF' }), 'manual');
    expectRejected('irpf');
    expectNoResult();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Cómo quieres calcular la cuota de autónomos' }), 'manual');
    expectRejected('irpf');
    expectRejected('fee');
    await paste(user, 'irpf', '15 %');
    expect(field('irpf')).toHaveValue(15);
    expect(field('irpf')).toHaveAttribute('aria-invalid', 'false');
    expectRejected('fee');
    expect(window.location.href).toBe(previousUrl);
    expect(window.va).toHaveBeenCalledTimes(1);
    expect(window.gtag).toHaveBeenCalledTimes(2);
  });

  it('keeps unrelated rejected-paste reasons when agenda hours replace a rejected hours field before any submission', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm initialValues={reference} />);
    await paste(user, 'hours', '80\t100');
    await paste(user, 'net', '100\t200');
    await paste(user, 'expenses', '300\t400');
    expectRejected('hours');
    expectRejected('net');
    expectRejected('expenses');
    await user.click(screen.getByText('Estimar mis horas con mi agenda'));
    await user.click(screen.getByRole('button', { name: 'Probar un ejemplo' }));
    await user.click(screen.getByRole('button', { name: 'Usar 107 horas al mes' }));
    expect(field('hours')).toHaveFocus();
    expect(field('hours')).toHaveValue(107);
    expect(field('hours')).toHaveAttribute('aria-invalid', 'false');
    expect(field('hours')).not.toHaveAccessibleDescription(expect.stringContaining(message));
    expectRejected('net');
    expectRejected('expenses');
    expect(screen.queryByText(globalMessage)).not.toBeInTheDocument();
    await user.type(field('expenses'), '250');
    expect(field('expenses')).toHaveFocus();
    expectRejected('net');
    expectNoResult();
    expect(window.location.search).toBe('');
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('restores the original result and helper draft after correcting both rejections without a new calculation, history change or IO', async () => {
    const user = userEvent.setup();
    const storageRead = vi.spyOn(Storage.prototype, 'getItem');
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const fetch = vi.spyOn(globalThis, 'fetch');
    render(<CalculatorForm initialValues={reference} />);
    await submit();
    const previousUrl = window.location.href;
    const previousData = Object.fromEntries(new FormData(form()));
    const previousSummary = (screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value;
    const history = vi.spyOn(window.history, 'replaceState');
    const disclosure = screen.getByText('Comprobar cuántos encargos necesito y si caben');
    await user.click(disclosure);
    const price = screen.getByRole('textbox', { name: 'Precio por encargo sin IVA (EUR)' });
    const effort = screen.getByRole('textbox', { name: 'Horas totales por encargo' });
    fireEvent.change(price, { target: { value: '600,555' } });
    fireEvent.change(effort, { target: { value: '1,,25' } });
    await paste(user, 'net', '100\t200');
    await paste(user, 'expenses', '300\t400');
    expectRejected('net');
    expectRejected('expenses');
    expectNoResult();
    expect(price).toHaveValue('600,555');
    expect(effort).toHaveValue('1,,25');
    await user.type(field('expenses'), '250');
    expectRejected('net');
    expectNoResult();
    await user.type(field('net'), '1800');
    expect(screen.queryByText(message)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tu referencia mensual para presupuestar' })).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Resumen detallado para compartir' })).toHaveValue(previousSummary);
    expect(disclosure.closest('details')).toHaveAttribute('open');
    expect(screen.getByRole('textbox', { name: 'Precio por encargo sin IVA (EUR)' })).toHaveValue('600,555');
    expect(screen.getByRole('textbox', { name: 'Horas totales por encargo' })).toHaveValue('1,,25');
    expect(Object.fromEntries(new FormData(form()))).toEqual(previousData);
    expect(window.location.href).toBe(previousUrl);
    expect(history).not.toHaveBeenCalled();
    expect(window.va).toHaveBeenCalledTimes(1);
    expect(window.gtag).toHaveBeenCalledTimes(2);
    expect(storageRead).not.toHaveBeenCalled();
    expect(storageWrite).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });
});
