import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Planner from '@/components/CashDatePlanner';
import { encodeCashDatesFile } from '@/lib/cashDatesFile';

const initial = () => screen.getByLabelText('Saldo antes del primer movimiento (EUR)') as HTMLInputElement;
const field = (label: string, row: number) => screen.getByLabelText(`${label} del movimiento ${row}`) as HTMLInputElement | HTMLSelectElement;
const result = () => screen.getByRole('status', { name: 'Caja por fechas' });
const recovery = () => screen.getByRole('status', { name: 'Recuperación del plan' });
const example = () => userEvent.click(screen.getByRole('button', { name: 'Probar las fechas ficticias' }));
const restore = () => userEvent.click(screen.getByRole('button', { name: 'Recuperar mi plan anterior' }));

function currentValues() {
  return {
    initialBalance: initial().value,
    rows: screen.getAllByRole('combobox').map((_, index) => ({
      date: field('Fecha', index + 1).value,
      kind: field('Tipo', index + 1).value,
      amount: field('Importe (EUR)', index + 1).value,
    })),
  };
}

async function enterPartialPlan() {
  await userEvent.click(screen.getByRole('button', { name: 'Añadir movimiento' }));
  fireEvent.change(initial(), { target: { value: ' -1.234,50 € ' } });
  const rows = [
    { date: '2026-12-20', kind: 'receipt', amount: '2.400,005 €' },
    { date: '2026-11-05', kind: 'payment', amount: ' 80,500 ' },
    { date: '', kind: '', amount: '1,,50' },
    { date: '2027-01-03', kind: 'receipt', amount: '' },
  ];
  rows.forEach((row, index) => {
    fireEvent.change(field('Fecha', index + 1), { target: { value: row.date } });
    fireEvent.change(field('Tipo', index + 1), { target: { value: row.kind } });
    fireEvent.change(field('Importe (EUR)', index + 1), { target: { value: row.amount } });
  });
  return currentValues();
}

function encodedPlan(fictional = false) {
  const encoded = encodeCashDatesFile({
    initialBalance: 333,
    movements: [{ date: '2027-03-01', kind: 'receipt', amount: 444 }],
  }, fictional);
  if (!encoded.valid) throw new Error('Invalid recovery fixture');
  return encoded.text;
}

function expectRecoveryFinished() {
  expect(screen.queryByRole('button', { name: 'Recuperar mi plan anterior' })).not.toBeInTheDocument();
  expect(result()).toBeEmptyDOMElement();
  expect(screen.queryByRole('button', { name: 'Guardar este plan en un archivo' })).not.toBeInTheDocument();
  expect(recovery()).toHaveTextContent('Plan anterior recuperado. Vuelve a comprobar los vencimientos para actualizar los saldos.');
  expect(initial()).toHaveFocus();
}

describe('recover the cash-date plan replaced by the first fictional example', () => {
  beforeEach(() => {
    window.va = vi.fn();
    window.gtag = vi.fn();
  });

  afterEach(() => vi.restoreAllMocks());

  it('recovers an incomplete plan with exact input text and row order, locally and without keeping example results', async () => {
    const storageRead = vi.spyOn(Storage.prototype, 'getItem');
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const storageRemove = vi.spyOn(Storage.prototype, 'removeItem');
    const fetch = vi.spyOn(globalThis, 'fetch');
    const previousUrl = window.location.href;
    render(<Planner />);
    const original = await enterPartialPlan();
    await example();

    expect(result()).toHaveTextContent('movimientos ficticios');
    expect(screen.getByText(/Conservamos en esta página el plan anterior al primer ejemplo/))
      .toHaveTextContent('Recuperarlo sustituye los cambios que ves ahora');
    expect(screen.getByText(/Conservamos en esta página el plan anterior al primer ejemplo/))
      .toHaveTextContent('Para conservar un plan al salir, guárdalo en un archivo.');
    await restore();

    expect(currentValues()).toEqual(original);
    expectRecoveryFinished();
    expect(document.querySelector('form')).toBeNull();
    expect(document.querySelector('[name]')).toBeNull();
    expect(window.location.href).toBe(previousUrl);
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
    expect(storageRead).not.toHaveBeenCalled();
    expect(storageWrite).not.toHaveBeenCalled();
    expect(storageRemove).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('keeps the first backup when the fictional example is requested repeatedly', async () => {
    render(<Planner />);
    const original = await enterPartialPlan();
    await example();
    await example();
    await example();
    await restore();

    expect(currentValues()).toEqual(original);
    expectRecoveryFinished();
  });

  it('keeps the backup when the current example is edited, extended or checked again', async () => {
    render(<Planner />);
    const original = await enterPartialPlan();
    await example();
    fireEvent.change(initial(), { target: { value: '2800,75' } });
    fireEvent.change(field('Importe (EUR)', 1), { target: { value: '17,005' } });
    await userEvent.click(screen.getByRole('button', { name: 'Añadir movimiento' }));
    await userEvent.click(screen.getByRole('button', { name: 'Comprobar vencimientos' }));
    await restore();

    expect(currentValues()).toEqual(original);
    expectRecoveryFinished();
  });

  it('cancels a pending file read when the earlier plan is recovered', async () => {
    render(<Planner />);
    const original = await enterPartialPlan();
    await example();
    const pending: FileReader[] = [];
    vi.spyOn(FileReader.prototype, 'readAsText').mockImplementation(function (this: FileReader) {
      pending.push(this);
    });
    await userEvent.upload(screen.getByLabelText('Abrir un plan guardado'), new File([encodedPlan()], 'other-plan.json', { type: 'application/json' }));
    expect(screen.getByRole('status', { name: 'Archivo del plan' })).toHaveTextContent('Abriendo el archivo');
    expect(pending).toHaveLength(1);
    await restore();
    await act(async () => {
      Object.defineProperty(pending[0], 'result', { value: encodedPlan() });
      pending[0].dispatchEvent(new ProgressEvent('load'));
    });

    expect(currentValues()).toEqual(original);
    expectRecoveryFinished();
    expect(screen.getByRole('status', { name: 'Archivo del plan' })).toBeEmptyDOMElement();
  });

  it.each([false, true])('restores the original fictional marker (%s) only after checking the recovered inputs again', async (fictional) => {
    render(<Planner />);
    await userEvent.upload(screen.getByLabelText('Abrir un plan guardado'), new File([encodedPlan(fictional)], 'original-plan.json', { type: 'application/json' }));
    await waitFor(() => expect(screen.getByRole('status', { name: 'Archivo del plan' })).toHaveTextContent('Plan abierto con 1 movimiento.'));
    const original = currentValues();
    await example();
    await restore();

    expect(currentValues()).toEqual(original);
    expectRecoveryFinished();
    await userEvent.click(screen.getByRole('button', { name: 'Comprobar vencimientos' }));
    expect(result()).toHaveTextContent('777,00');
    if (fictional) expect(result()).toHaveTextContent('movimientos ficticios');
    else expect(result()).not.toHaveTextContent('movimientos ficticios');
  });
});
