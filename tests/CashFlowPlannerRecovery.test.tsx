import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Planner from '@/components/CashFlowPlanner';

type Month = { receipts: string; payments: string };
type Values = { initialBalance: string; months: Month[] };
const initial = () => screen.getByRole('textbox', { name: 'Saldo inicial de la cuenta (EUR)' }) as HTMLInputElement;
const field = (key: keyof Month, month: number) => screen.getByRole('textbox', {
  name: `${key === 'receipts' ? 'Cobros' : 'Pagos'} previstos del mes ${month} (EUR)`,
}) as HTMLInputElement;
const result = () => screen.getByRole('status', { name: 'Plan de caja de tres meses' });
const example = () => userEvent.click(screen.getByRole('button', { name: 'Probar tres meses ficticios' }));
const restore = () => userEvent.click(screen.getByRole('button', { name: 'Recuperar mis tres meses anteriores' }));
const check = () => userEvent.click(screen.getByRole('button', { name: 'Comprobar plan de caja' }));
const emptyValues = (): Values => ({ initialBalance: '', months: Array.from({ length: 3 }, () => ({ receipts: '', payments: '' })) });

function write(values: Values) {
  fireEvent.change(initial(), { target: { value: values.initialBalance } });
  values.months.forEach((month, index) => {
    for (const key of ['receipts', 'payments'] as const) fireEvent.change(field(key, index + 1), { target: { value: month[key] } });
  });
}

function currentValues(): Values {
  return { initialBalance: initial().value, months: [1, 2, 3].map((month) => ({ receipts: field('receipts', month).value, payments: field('payments', month).value })) };
}

function expectRecoveryFinished() {
  expect(screen.queryByRole('button', { name: 'Recuperar mis tres meses anteriores' })).not.toBeInTheDocument();
  expect(screen.queryByText(/sustituye los cambios que ves ahora/)).not.toBeInTheDocument();
  expect(result()).toBeEmptyDOMElement();
  expect(screen.getByRole('status', { name: 'Recuperación del plan de tres meses' })).toHaveTextContent('Plan de tres meses recuperado. Vuelve a comprobarlo para actualizar los saldos.');
  expect(initial()).toHaveFocus();
  for (const input of screen.getAllByRole('textbox')) expect(input).toHaveAttribute('aria-invalid', 'false');
}

describe('recover the three-month cash draft replaced by the fictional example', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });
  afterEach(() => vi.restoreAllMocks());

  it('restores the seven exact input strings across all months without storage, requests, events or URL changes', async () => {
    const storageRead = vi.spyOn(Storage.prototype, 'getItem');
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const storageRemove = vi.spyOn(Storage.prototype, 'removeItem');
    const fetch = vi.spyOn(globalThis, 'fetch');
    const previousUrl = window.location.href;
    render(<Planner />);
    const original: Values = {
      initialBalance: ' -1.234,005 € ',
      months: [{ receipts: ' 0 ', payments: '1.800,500' }, { receipts: '1,,50', payments: '' }, { receipts: '3600,005', payments: ' 0,125 ' }],
    };
    write(original);
    await example();

    expect(result()).toHaveTextContent('Saldos, cobros y pagos ficticios');
    expect(screen.getByRole('button', { name: 'Recuperar mis tres meses anteriores' })).toHaveAccessibleDescription(/sustituye los cambios que ves ahora/);
    await restore();

    expect(currentValues()).toEqual(original);
    expectRecoveryFinished();
    expect(screen.getAllByRole('textbox')).toHaveLength(7);
    expect(document.querySelector('form')).toBeNull();
    expect(document.querySelector('[name]')).toBeNull();
    expect(screen.getByRole('link', { name: 'Revisar cobros y pagos por fecha' })).toHaveAttribute('href', '#vencimientos-caja');
    expect(window.location.href).toBe(previousUrl);
    expect(storageRead).not.toHaveBeenCalled();
    expect(storageWrite).not.toHaveBeenCalled();
    expect(storageRemove).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('keeps the first copy through repeated examples, edits and valid or invalid checks, clearing old errors and the fictional marker', async () => {
    render(<Planner />);
    const original: Values = {
      initialBalance: ' -50,125 ',
      months: [{ receipts: '1000,005', payments: ' 80,50 ' }, { receipts: '200,125', payments: '150' }, { receipts: '0', payments: '0,005' }],
    };
    write(original);
    await example();
    await example();
    fireEvent.change(field('payments', 3), { target: { value: '17,005' } });
    await check();
    expect(result()).toHaveTextContent('Saldo al cierre del tercer mes');
    await example();
    fireEvent.change(field('receipts', 1), { target: { value: '1,,5' } });
    await check();
    expect(field('receipts', 1)).toHaveAttribute('aria-invalid', 'true');
    expect(result()).toHaveTextContent('Revisa los campos indicados');
    await restore();

    expect(currentValues()).toEqual(original);
    expectRecoveryFinished();
    await check();
    expect(result()).toHaveTextContent('Saldo al cierre del tercer mes');
    expect(result()).not.toHaveTextContent('Saldos, cobros y pagos ficticios');
  });

  it('offers no personal recovery when starting empty and loading only untouched examples', async () => {
    render(<Planner />);
    expect(currentValues()).toEqual(emptyValues());
    expect(screen.queryByRole('button', { name: 'Recuperar mis tres meses anteriores' })).not.toBeInTheDocument();
    await example();
    await example();
    expect(result()).toHaveTextContent('Saldos, cobros y pagos ficticios');
    expect(screen.queryByRole('button', { name: 'Recuperar mis tres meses anteriores' })).not.toBeInTheDocument();
  });

  it('preserves a deliberate zero as a draft even when all six monthly amounts are still empty', async () => {
    render(<Planner />);
    fireEvent.change(initial(), { target: { value: '0' } });
    await example();
    await restore();

    expect(currentValues()).toEqual({ ...emptyValues(), initialBalance: '0' });
    expectRecoveryFinished();
  });

  it('consumes the recovered copy and captures the new draft for a later example cycle', async () => {
    render(<Planner />);
    write({ initialBalance: '500', months: [{ receipts: '100', payments: '200' }, { receipts: '300', payments: '400' }, { receipts: '500', payments: '600' }] });
    await example();
    await restore();
    expectRecoveryFinished();
    const nextDraft: Values = {
      initialBalance: ' -12,005 ',
      months: [{ receipts: '', payments: '90,125' }, { receipts: '1,,25', payments: ' 0 ' }, { receipts: '750,005', payments: '8,5' }],
    };
    write(nextDraft);
    await example();
    await restore();

    expect(currentValues()).toEqual(nextDraft);
    expectRecoveryFinished();
  });
});
