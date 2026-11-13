import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Planner from '@/components/AnnualBillingPlanner';
import CalculatorForm from '@/components/CalculatorForm';

const monthsLabel = 'Meses completos con facturación en el año';
const hoursLabel = 'Horas facturables en cada mes activo';
const months = () => screen.getByRole('textbox', { name: monthsLabel }) as HTMLInputElement;
const hours = () => screen.getByRole('textbox', { name: hoursLabel }) as HTMLInputElement;
const result = () => screen.getByRole('status', { name: 'Plan anual de facturación' });
const check = () => userEvent.click(screen.getByRole('button', { name: 'Comprobar plan anual' }));
const example = () => userEvent.click(screen.getByRole('button', { name: 'Probar 10 meses de 70 horas' }));
const pending = () => screen.queryByText('Datos modificados. Pulsa «Comprobar plan anual» para actualizar el resultado.');
const change = (input: HTMLElement, value: string) => fireEvent.change(input, { target: { value } });
function expectNoPlan() {
  expect(within(result()).queryByText('Facturación por cada mes activo')).not.toBeInTheDocument();
  expect(within(result()).queryByText('Horas facturables de todo el año')).not.toBeInTheDocument();
}

describe('current validation while correcting the annual billing calendar', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });
  afterEach(() => vi.restoreAllMocks());

  it('leaves initial input quiet and retains the unfinished hours error after correcting only months without moving focus', async () => {
    const user = userEvent.setup();
    render(<Planner monthlyBilling={1200} />);
    await user.type(months(), '10');
    expect(months()).toHaveAttribute('aria-invalid', 'false');
    expect(hours()).toHaveAttribute('aria-invalid', 'false');
    expect(pending()).not.toBeInTheDocument();
    await user.clear(months());
    await check();
    expect(months()).toHaveFocus();
    expect(months()).toHaveAttribute('aria-invalid', 'true');
    expect(hours()).toHaveAttribute('aria-invalid', 'true');
    await user.type(months(), '10');
    expect(months()).toHaveFocus();
    expect(months()).toHaveAttribute('aria-invalid', 'false');
    expect(hours()).toHaveAccessibleName(hoursLabel);
    expect(hours()).toHaveAccessibleDescription(/Horas vendibles de un mes con actividad/);
    expect(hours()).toHaveAccessibleDescription(/entre 0,01 y 744 horas/);
    await user.type(hours(), '70');
    expect(hours()).toHaveFocus();
    expect(hours()).toHaveAttribute('aria-invalid', 'false');
    expect(hours()).not.toHaveAccessibleDescription(/Indica entre 0,01 y 744/);
    expect(pending()).toBeVisible();
    expectNoPlan();
  });

  it('keeps month and hour bounds current without inventing a plan while inputs are being corrected', async () => {
    render(<Planner monthlyBilling={1200} />);
    change(months(), '0');
    change(hours(), '80');
    await check();
    for (const value of ['0', '1,5', '13']) {
      change(months(), value);
      expect(months()).toHaveFocus();
      expect(months()).toHaveAttribute('aria-invalid', 'true');
      expect(hours()).toHaveAttribute('aria-invalid', 'false');
      expectNoPlan();
    }
    for (const value of ['1', '12']) {
      change(months(), value);
      expect(months()).toHaveAttribute('aria-invalid', 'false');
      expect(pending()).toBeVisible();
      expectNoPlan();
    }
    hours().focus();
    for (const value of ['0', '745']) {
      change(hours(), value);
      expect(hours()).toHaveFocus();
      expect(hours()).toHaveAttribute('aria-invalid', 'true');
      expect(pending()).not.toBeInTheDocument();
    }
    for (const value of ['0,01', '744']) {
      change(hours(), value);
      expect(hours()).toHaveAttribute('aria-invalid', 'false');
      expect(pending()).toBeVisible();
      expectNoPlan();
    }
    await check();
    expect(within(result()).getByText('Horas facturables de todo el año').nextElementSibling).toHaveTextContent('8928 h');
  });

  it('rejects units pasted into months and hours until the corrected calendar is checked', async () => {
    const user = userEvent.setup();
    render(<Planner monthlyBilling={1200} />);
    await example();
    expect(within(result()).getByText('Facturación por cada mes activo')).toBeVisible();

    await user.clear(months());
    await user.paste('10 %');
    change(hours(), '70 €');
    await check();
    expect(months()).toHaveValue('10 %');
    expect(hours()).toHaveValue('70 €');
    expect(months()).toHaveFocus();
    expect(months()).toHaveAttribute('aria-invalid', 'true');
    expect(hours()).toHaveAttribute('aria-invalid', 'true');
    expect(months()).toHaveAccessibleDescription(/número de meses, sin moneda ni porcentaje/);
    expect(hours()).toHaveAccessibleDescription(/número de horas, sin moneda ni porcentaje/);
    expectNoPlan();

    change(months(), '10');
    expect(months()).toHaveAttribute('aria-invalid', 'false');
    expect(hours()).toHaveAttribute('aria-invalid', 'true');
    expectNoPlan();
    change(hours(), '70');
    expect(pending()).toBeVisible();
    expectNoPlan();
    await user.type(hours(), '{Enter}');
    expect(within(result()).getByText('Facturación por cada mes activo').nextElementSibling).toHaveTextContent('1440,00');
    expect(within(result()).getByText('Horas facturables de todo el año').nextElementSibling).toHaveTextContent('700 h');
  });

  it('preserves raw precision through failed checking and correction, normalizing hours only when Enter checks a valid calendar', async () => {
    render(<Planner monthlyBilling={1200} />);
    change(months(), '10,5');
    change(hours(), '80,125');
    await check();
    expect(months()).toHaveFocus();
    expect(months()).toHaveValue('10,5');
    expect(hours()).toHaveValue('80,125');
    change(months(), '10');
    expect(months()).toHaveFocus();
    expect(hours()).toHaveValue('80,125');
    expect(pending()).toBeVisible();
    expectNoPlan();
    fireEvent.keyDown(hours(), { key: 'Enter' });
    expect(months()).toHaveValue('10');
    expect(hours()).toHaveValue('80,13');
    expect(within(result()).getByText('Horas facturables de todo el año').nextElementSibling).toHaveTextContent('801,3 h');
    expect(pending()).not.toBeInTheDocument();
  });

  it('withdraws prior figures on edit and waits for explicit checking after valid changes or correction of an invalid hour count', async () => {
    render(<Planner monthlyBilling={1200} />);
    change(months(), '10');
    change(hours(), '70');
    await check();
    expect(within(result()).getByText('Facturación por cada mes activo').nextElementSibling).toHaveTextContent('1440,00');
    months().focus();
    change(months(), '12');
    expect(months()).toHaveFocus();
    expect(pending()).toBeVisible();
    expectNoPlan();
    fireEvent.keyDown(months(), { key: 'Enter' });
    expect(within(result()).getByText('Facturación por cada mes activo').nextElementSibling).toHaveTextContent('1200,00');
    change(hours(), '0');
    expect(hours()).toHaveAttribute('aria-invalid', 'true');
    expectNoPlan();
    change(hours(), '70');
    expect(pending()).toBeVisible();
    expectNoPlan();
    await check();
    expect(pending()).not.toBeInTheDocument();
    expect(within(result()).getByText('Horas facturables de todo el año').nextElementSibling).toHaveTextContent('840 h');
  });

  it('checks the example, preserves first-copy recovery for the same reference and resets validation on recovery or a changed reference', async () => {
    const { rerender } = render(<Planner monthlyBilling={1200} />);
    change(months(), ' 10 ');
    change(hours(), '1,,25');
    await check();
    await example();
    expect(result()).toHaveTextContent('Calendario ficticio');
    change(months(), '0');
    expect(months()).toHaveAttribute('aria-invalid', 'true');
    rerender(<Planner monthlyBilling={1200} />);
    expect(months()).toHaveValue('0');
    expect(months()).toHaveAttribute('aria-invalid', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Recuperar mi calendario anterior' }));
    expect(months()).toHaveValue(' 10 ');
    expect(hours()).toHaveValue('1,,25');
    expect(months()).toHaveFocus();
    expect(months()).toHaveAttribute('aria-invalid', 'false');
    expect(hours()).toHaveAttribute('aria-invalid', 'false');
    expect(pending()).not.toBeInTheDocument();
    expectNoPlan();
    change(months(), '0');
    expect(months()).toHaveAttribute('aria-invalid', 'false');
    await check();
    expect(months()).toHaveAttribute('aria-invalid', 'true');
    expect(hours()).toHaveAttribute('aria-invalid', 'true');
    await example();
    rerender(<Planner monthlyBilling={2000} />);
    expect(months()).toHaveValue('');
    expect(hours()).toHaveValue('');
    expect(months()).toHaveAttribute('aria-invalid', 'false');
    expect(hours()).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByRole('button', { name: 'Recuperar mi calendario anterior' })).not.toBeInTheDocument();
    expect(pending()).not.toBeInTheDocument();
    expectNoPlan();
  });

  it('keeps the actual main reference, summary, GET and URL unchanged while checking the calendar without storage or events', async () => {
    const storageRead = vi.spyOn(Storage.prototype, 'getItem');
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const storageRemove = vi.spyOn(Storage.prototype, 'removeItem');
    const fetch = vi.spyOn(globalThis, 'fetch');
    render(<CalculatorForm initiallySubmitted initialValues={{ targetNet: '1500', monthlyExpenses: '150', billableHours: '70', irpfMode: 'manual', irpfRate: '15', selfEmployedFeeMode: 'manual', selfEmployedFee: '320' }} initialShareUrl="https://www.cuantofacturar.es/?targetNet=1500#calculadora" />);
    const summary = screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement;
    const originalSummary = summary.value;
    const previousUrl = window.location.href;
    const form = screen.getByRole('form', { name: 'Calculadora de facturación' }) as HTMLFormElement;
    const originalData = [...new FormData(form).entries()];
    const submit = vi.fn();
    form.addEventListener('submit', submit);
    await userEvent.click(screen.getByText('Planificar los meses sin facturación'));
    change(months(), '10');
    await check();
    expect(hours()).toHaveAttribute('aria-invalid', 'true');
    change(hours(), '70');
    expect(pending()).toBeVisible();
    expectNoPlan();
    expect(fireEvent.keyDown(hours(), { key: 'Enter' })).toBe(false);
    expect(within(result()).getByText('Objetivo anual de facturación sin IVA').nextElementSibling).toHaveTextContent('26.816,52');
    expect(screen.getByRole('heading', { name: 'Tu referencia mensual para presupuestar' })).toBeVisible();
    expect(summary).toHaveValue(originalSummary);
    expect([...new FormData(form).entries()]).toEqual(originalData);
    expect(months()).not.toHaveAttribute('name');
    expect(hours()).not.toHaveAttribute('name');
    expect(submit).not.toHaveBeenCalled();
    expect(window.location.href).toBe(previousUrl);
    expect(storageRead).not.toHaveBeenCalled();
    expect(storageWrite).not.toHaveBeenCalled();
    expect(storageRemove).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });
});
