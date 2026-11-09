import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Planner from '@/components/CashDatePlanner';
import { encodeCashDatesFile, MAX_CASH_DATES_FILE_BYTES } from '@/lib/cashDatesFile';

type Row = { date: string; kind: string; amount: string };
type Values = { initialBalance: string; rows: Row[] };
const initial = () => screen.getByLabelText('Saldo antes del primer movimiento (EUR)') as HTMLInputElement;
const field = (label: string, row: number) => screen.getByLabelText(`${label} del movimiento ${row}`) as HTMLInputElement | HTMLSelectElement;
const result = () => screen.getByRole('status', { name: 'Caja por fechas' });
const fileFeedback = () => screen.getByRole('status', { name: 'Archivo del plan' });
const restoreButton = () => screen.queryByRole('button', { name: 'Recuperar mi plan anterior' });
const restore = () => userEvent.click(screen.getByRole('button', { name: 'Recuperar mi plan anterior' }));
const example = () => userEvent.click(screen.getByRole('button', { name: 'Probar las fechas ficticias' }));
const check = () => userEvent.click(screen.getByRole('button', { name: 'Comprobar vencimientos' }));

function encodedPlan(initialBalance = 333, fictional = false) {
  const encoded = encodeCashDatesFile({ initialBalance, movements: [{ date: '2027-03-01', kind: 'receipt', amount: 444 }] }, fictional);
  if (!encoded.valid) throw new Error('Invalid import-recovery fixture');
  return encoded.text;
}

const file = (text = encodedPlan()) => new File([text], 'plan-caja-fechas.json', { type: 'application/json' });
const upload = (input = file()) => userEvent.upload(screen.getByLabelText('Abrir un plan guardado'), input);
async function open(input = file()) {
  await upload(input);
  await waitFor(() => expect(fileFeedback()).toHaveTextContent('Plan abierto con 1 movimiento.'));
}

function currentValues(): Values {
  return {
    initialBalance: initial().value,
    rows: movementControls().map((row) => ({ date: row.date.value, kind: row.kind.value, amount: row.amount.value })),
  };
}

function movementControls() {
  return screen.getAllByRole('group', { name: /^Movimiento \d+$/ }).map((group, index) => {
    const controls = within(group);
    return {
      date: controls.getByLabelText(`Fecha del movimiento ${index + 1}`) as HTMLInputElement,
      kind: controls.getByLabelText(`Tipo del movimiento ${index + 1}`) as HTMLSelectElement,
      amount: controls.getByLabelText(`Importe (EUR) del movimiento ${index + 1}`) as HTMLInputElement,
    };
  });
}

function write(values: Values) {
  const balance = initial();
  const controls = movementControls();
  fireEvent.change(balance, { target: { value: values.initialBalance } });
  values.rows.forEach((row, index) => {
    fireEvent.change(controls[index].date, { target: { value: row.date } });
    fireEvent.change(controls[index].kind, { target: { value: row.kind } });
    fireEvent.change(controls[index].amount, { target: { value: row.amount } });
  });
}

function expectRecoveryFinished() {
  expect(restoreButton()).not.toBeInTheDocument();
  expect(result()).toBeEmptyDOMElement();
  expect(fileFeedback()).toBeEmptyDOMElement();
  expect(screen.queryByRole('button', { name: 'Guardar este plan en un archivo' })).not.toBeInTheDocument();
  expect(screen.getByRole('status', { name: 'Recuperación del plan' })).toHaveTextContent('Plan anterior recuperado. Vuelve a comprobar los vencimientos para actualizar los saldos.');
  expect(initial()).toHaveFocus();
  for (const control of document.querySelectorAll('[aria-invalid]')) expect(control).toHaveAttribute('aria-invalid', 'false');
}

async function finish(reader: FileReader, text: string) {
  await act(async () => {
    Object.defineProperty(reader, 'result', { value: text });
    reader.dispatchEvent(new ProgressEvent('load'));
  });
}

describe('recover the draft replaced by a valid cash-date file', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });
  afterEach(() => vi.restoreAllMocks());

  it('restores twenty ordered incomplete rows exactly and keeps their add/remove focus flow without requests, storage or events', async () => {
    const storageRead = vi.spyOn(Storage.prototype, 'getItem');
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const storageRemove = vi.spyOn(Storage.prototype, 'removeItem');
    const fetch = vi.spyOn(globalThis, 'fetch');
    const previousUrl = window.location.href;
    render(<Planner />);
    const add = screen.getByRole('button', { name: 'Añadir movimiento' });
    for (let row = 2; row <= 20; row++) fireEvent.click(add);
    const original: Values = {
      initialBalance: ' -1.234,005 € ',
      rows: Array.from({ length: 20 }, (_, index) => ({
        date: index === 7 ? '' : `2026-12-${String(20 - index).padStart(2, '0')}`,
        kind: index % 5 === 0 ? '' : index % 2 === 0 ? 'receipt' : 'payment',
        amount: [' 80,005 ', '', '1,,50', '0'][index % 4],
      })),
    };
    write(original);
    expect(add).toBeDisabled();
    await open();
    expect(screen.getByText(/anterior al primer archivo abierto/)).toHaveTextContent('Recuperarlo sustituye los cambios que ves ahora');
    await restore();

    expect(currentValues()).toEqual(original);
    expectRecoveryFinished();
    expect(add).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar movimiento 1' }));
    expect(field('Fecha', 1)).toHaveFocus();
    expect(currentValues().rows).toEqual(original.rows.slice(1));
    await userEvent.click(add);
    expect(field('Fecha', 20)).toHaveFocus();
    const ids = [...document.querySelectorAll('input[id], select[id]')].map((control) => control.id);
    expect(new Set(ids).size).toBe(ids.length);
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

  it('keeps the first file backup through files, edits, checks and examples, then starts a fresh recovery cycle', async () => {
    render(<Planner />);
    await userEvent.click(screen.getByRole('button', { name: 'Añadir movimiento' }));
    fireEvent.change(initial(), { target: { value: ' 0,005 ' } });
    fireEvent.change(field('Importe (EUR)', 2), { target: { value: '1,,25' } });
    const original = currentValues();
    await open();
    await open(file(encodedPlan(777)));
    fireEvent.change(field('Importe (EUR)', 1), { target: { value: '17,005' } });
    await check();
    expect(result()).toHaveTextContent('Saldo tras la última fecha');
    await example();
    fireEvent.change(field('Importe (EUR)', 2), { target: { value: '' } });
    await check();
    expect(field('Importe (EUR)', 2)).toHaveAttribute('aria-invalid', 'true');
    await open();
    expect(screen.getByText(/anterior al primer archivo abierto/)).toBeInTheDocument();
    await restore();
    expect(currentValues()).toEqual(original);
    expectRecoveryFinished();

    fireEvent.change(initial(), { target: { value: ' -55,005 ' } });
    const nextDraft = currentValues();
    await example();
    await open(file(encodedPlan(999)));
    await restore();
    expect(currentValues()).toEqual(nextDraft);
    expectRecoveryFinished();
  });

  it('creates no backup for invalid JSON, oversized or unreadable files and keeps an existing backup through those errors', async () => {
    render(<Planner />);
    fireEvent.change(initial(), { target: { value: '0' } });
    const original = currentValues();
    async function rejectFiles(withBackup: boolean) {
      const current = currentValues();
      for (const [input, message] of [
        [file('not JSON'), 'No se puede leer este archivo'],
        [file('x'.repeat(MAX_CASH_DATES_FILE_BYTES + 1)), 'El archivo supera el máximo'],
      ] as const) {
        await upload(input);
        await waitFor(() => expect(fileFeedback()).toHaveTextContent(message));
        expect(currentValues()).toEqual(current);
        if (withBackup) expect(restoreButton()).toBeInTheDocument();
        else expect(restoreButton()).not.toBeInTheDocument();
      }
      const read = vi.spyOn(FileReader.prototype, 'readAsText').mockImplementationOnce(function (this: FileReader) {
        this.dispatchEvent(new ProgressEvent('error'));
      });
      await upload();
      await waitFor(() => expect(fileFeedback()).toHaveTextContent('No se ha podido leer el archivo'));
      read.mockRestore();
      expect(currentValues()).toEqual(current);
      if (withBackup) expect(restoreButton()).toBeInTheDocument();
      else expect(restoreButton()).not.toBeInTheDocument();
    }
    await rejectFiles(false);
    await open();
    await rejectFiles(true);
    await restore();
    expect(currentValues()).toEqual(original);
    expectRecoveryFinished();

    fireEvent.change(initial(), { target: { value: '' } });
    await userEvent.click(screen.getByRole('button', { name: 'Añadir movimiento' }));
    const structuralDraft = currentValues();
    expect(structuralDraft.rows).toHaveLength(2);
    await open();
    await restore();
    expect(currentValues()).toEqual(structuralDraft);
    expectRecoveryFinished();
  });

  it('ignores stale reads after edits, a newer import or recovery without replacing the correct first backup', async () => {
    render(<Planner />);
    fireEvent.change(initial(), { target: { value: '111,005' } });
    const pending: FileReader[] = [];
    vi.spyOn(FileReader.prototype, 'readAsText').mockImplementation(function (this: FileReader) { pending.push(this); });
    await upload();
    fireEvent.change(initial(), { target: { value: '222,005' } });
    const original = currentValues();
    await finish(pending[0], encodedPlan());
    expect(currentValues()).toEqual(original);
    expect(restoreButton()).not.toBeInTheDocument();

    await upload();
    await upload(file(encodedPlan(777)));
    await finish(pending[2], encodedPlan(777));
    expect(initial()).toHaveValue('777');
    await finish(pending[1], encodedPlan());
    expect(initial()).toHaveValue('777');
    await upload(file(encodedPlan(999)));
    await restore();
    await finish(pending[3], encodedPlan(999));
    expect(currentValues()).toEqual(original);
    expectRecoveryFinished();
  });

  it.each([false, true])('recovers the first imported fictional flag (%s) and recomputes only after checking again', async (fictional) => {
    render(<Planner />);
    await open(file(encodedPlan(333, fictional)));
    expect(restoreButton()).not.toBeInTheDocument();
    const first = currentValues();
    await open(file(encodedPlan(777, false)));
    await restore();
    expect(currentValues()).toEqual(first);
    expectRecoveryFinished();
    await check();
    expect(result()).toHaveTextContent('777,00');
    if (fictional) expect(result()).toHaveTextContent('movimientos ficticios');
    else expect(result()).not.toHaveTextContent('movimientos ficticios');
  });
});
