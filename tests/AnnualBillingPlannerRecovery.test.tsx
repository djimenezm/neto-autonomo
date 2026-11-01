import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Planner from '@/components/AnnualBillingPlanner';

const labels = {
  activeMonths: 'Meses completos con facturación en el año',
  hoursPerActiveMonth: 'Horas facturables en cada mes activo',
} as const;
type Values = Record<keyof typeof labels, string>;
const emptyValues: Values = { activeMonths: '', hoursPerActiveMonth: '' };
const field = (key: keyof Values) => screen.getByRole('textbox', { name: labels[key] }) as HTMLInputElement;
const result = () => screen.getByRole('status', { name: 'Plan anual de facturación' });
const example = () => userEvent.click(screen.getByRole('button', { name: 'Probar 10 meses de 70 horas' }));
const restore = () => userEvent.click(screen.getByRole('button', { name: 'Recuperar mi calendario anterior' }));
const check = () => userEvent.click(screen.getByRole('button', { name: 'Comprobar plan anual' }));

function write(values: Values) {
  for (const key of Object.keys(labels) as (keyof Values)[]) fireEvent.change(field(key), { target: { value: values[key] } });
}

function currentValues(): Values {
  return Object.fromEntries(Object.keys(labels).map((key) => [key, field(key as keyof Values).value])) as Values;
}

function expectRecoveryFinished() {
  expect(screen.queryByRole('button', { name: 'Recuperar mi calendario anterior' })).not.toBeInTheDocument();
  expect(screen.queryByText(/sustituye los cambios que ves ahora/)).not.toBeInTheDocument();
  expect(screen.getAllByRole('status')).toHaveLength(1);
  expect(result()).toHaveTextContent('Calendario anterior recuperado. Vuelve a comprobar el plan anual para actualizar los resultados.');
  expect(result().querySelector('dl')).toBeNull();
  expect(result()).not.toHaveTextContent('Calendario ficticio');
  expect(result()).not.toHaveTextContent('Revisa los campos indicados');
  expect(field('activeMonths')).toHaveFocus();
  for (const key of Object.keys(labels) as (keyof Values)[]) expect(field(key)).toHaveAttribute('aria-invalid', 'false');
}

function expectResetCalendar() {
  expect(currentValues()).toEqual(emptyValues);
  expect(result()).toBeEmptyDOMElement();
  expect(screen.queryByRole('button', { name: 'Recuperar mi calendario anterior' })).not.toBeInTheDocument();
  expect(screen.queryByText(/sustituye los cambios que ves ahora/)).not.toBeInTheDocument();
}

describe('recover the calendar replaced by the annual planning example', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });
  afterEach(() => vi.restoreAllMocks());

  it('restores the raw fields without calculating, storing or sending unfinished personal data', async () => {
    const storageRead = vi.spyOn(Storage.prototype, 'getItem');
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const storageRemove = vi.spyOn(Storage.prototype, 'removeItem');
    const fetch = vi.spyOn(globalThis, 'fetch');
    const previousUrl = window.location.href;
    render(<Planner monthlyBilling={2234.71} />);
    const original: Values = { activeMonths: ' 08 ', hoursPerActiveMonth: '1,,5' };
    write(original);
    await example();
    expect(result()).toHaveTextContent('Calendario ficticio');
    const recovery = screen.getByRole('button', { name: 'Recuperar mi calendario anterior' });
    expect(recovery).toHaveAttribute('type', 'button');
    expect(recovery).toHaveAccessibleDescription(/sustituye los cambios que ves ahora/);
    expect(recovery).toHaveAccessibleDescription(/referencia mensual/);
    await restore();

    expect(currentValues()).toEqual(original);
    expectRecoveryFinished();
    expect(screen.getAllByRole('textbox')).toHaveLength(2);
    expect(document.querySelector('form')).toBeNull();
    expect(document.querySelector('[name]')).toBeNull();
    expect(window.location.href).toBe(previousUrl);
    expect(storageRead).not.toHaveBeenCalled();
    expect(storageWrite).not.toHaveBeenCalled();
    expect(storageRemove).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('keeps the first copy through repeated examples, edits and valid or invalid checks', async () => {
    render(<Planner monthlyBilling={2234.71} />);
    const original: Values = { activeMonths: ' 8 ', hoursPerActiveMonth: '95,125' };
    write(original);
    await example();
    await example();
    fireEvent.change(field('hoursPerActiveMonth'), { target: { value: '84,005' } });
    await check();
    expect(result()).toHaveTextContent('Objetivo anual de facturación sin IVA');
    await example();
    fireEvent.change(field('activeMonths'), { target: { value: '1,,5' } });
    await check();
    expect(field('activeMonths')).toHaveAttribute('aria-invalid', 'true');
    expect(result()).toHaveTextContent('Revisa los campos indicados');
    await restore();

    expect(currentValues()).toEqual(original);
    expectRecoveryFinished();
    await check();
    expect(result()).toHaveTextContent('Objetivo anual de facturación sin IVA');
    expect(result()).not.toHaveTextContent('Calendario ficticio');
    expect(result()).not.toHaveTextContent('Calendario anterior recuperado');
  });

  it('does not offer recovery for empty fields or repeated untouched examples', async () => {
    render(<Planner monthlyBilling={2234.71} />);
    expectResetCalendar();
    await example();
    await example();
    expect(result()).toHaveTextContent('Calendario ficticio');
    expect(screen.queryByRole('button', { name: 'Recuperar mi calendario anterior' })).not.toBeInTheDocument();
  });

  it('preserves a deliberate zero and empty field without treating them as a valid calendar', async () => {
    render(<Planner monthlyBilling={2234.71} />);
    fireEvent.change(field('activeMonths'), { target: { value: '0' } });
    await example();
    await restore();

    expect(currentValues()).toEqual({ ...emptyValues, activeMonths: '0' });
    expectRecoveryFinished();
    await check();
    expect(field('activeMonths')).toHaveAttribute('aria-invalid', 'true');
    expect(result()).toHaveTextContent('Revisa los campos indicados');
    expect(result().querySelector('dl')).toBeNull();
  });

  it('consumes the recovery and captures a new unfinished calendar in the next cycle', async () => {
    render(<Planner monthlyBilling={2234.71} />);
    write({ activeMonths: '8', hoursPerActiveMonth: '95' });
    await example();
    await restore();
    expectRecoveryFinished();
    const nextDraft: Values = { activeMonths: '', hoursPerActiveMonth: ' 95,125 ' };
    write(nextDraft);
    await example();
    await restore();

    expect(currentValues()).toEqual(nextDraft);
    expectRecoveryFinished();
  });

  it('retains recovery for the same reference but resets all calendar state when the monthly reference changes', async () => {
    const { rerender } = render(<Planner monthlyBilling={1200} />);
    write({ activeMonths: '8', hoursPerActiveMonth: '95,125' });
    await example();
    rerender(<Planner monthlyBilling={1200} />);
    expect(screen.getByRole('button', { name: 'Recuperar mi calendario anterior' })).toBeInTheDocument();
    rerender(<Planner monthlyBilling={2000} />);
    expectResetCalendar();
    rerender(<Planner monthlyBilling={1200} />);
    expectResetCalendar();

    write({ activeMonths: '9', hoursPerActiveMonth: '90' });
    await example();
    await restore();
    expectRecoveryFinished();
    rerender(<Planner monthlyBilling={2000} />);
    expectResetCalendar();
  });
});
