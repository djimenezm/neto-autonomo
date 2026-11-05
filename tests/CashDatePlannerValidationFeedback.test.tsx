import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Planner from '@/components/CashDatePlanner';
import { encodeCashDatesFile } from '@/lib/cashDatesFile';

type Row = { date: string; kind: string; amount: string };
const initial = () => screen.getByLabelText('Saldo antes del primer movimiento (EUR)') as HTMLInputElement;
const field = (label: 'Fecha' | 'Tipo' | 'Importe (EUR)', row: number) => screen.getByLabelText(`${label} del movimiento ${row}`) as HTMLInputElement | HTMLSelectElement;
const result = () => screen.getByRole('status', { name: 'Caja por fechas' });
const fileStatus = () => screen.getByRole('status', { name: 'Archivo del plan' });
const check = () => userEvent.click(screen.getByRole('button', { name: 'Comprobar vencimientos' }));
const add = () => userEvent.click(screen.getByRole('button', { name: 'Añadir movimiento' }));
const remove = (row: number) => userEvent.click(screen.getByRole('button', { name: `Eliminar movimiento ${row}` }));
const undo = () => userEvent.click(screen.getByRole('button', { name: 'Deshacer la última eliminación' }));
const example = () => userEvent.click(screen.getByRole('button', { name: 'Probar las fechas ficticias' }));
const pending = () => screen.queryByText('Datos modificados. Pulsa «Comprobar vencimientos» para actualizar los saldos.');
const invalidControls = () => document.querySelectorAll('input[aria-invalid="true"],select[aria-invalid="true"]');
const change = (input: HTMLElement, value: string) => fireEvent.change(input, { target: { value } });
function writeRow(index: number, row: Row) {
  change(field('Fecha', index), row.date);
  change(field('Tipo', index), row.kind);
  change(field('Importe (EUR)', index), row.amount);
}
const rows = (): Row[] => screen.getAllByRole('combobox').map((_, index) => ({ date: field('Fecha', index + 1).value, kind: field('Tipo', index + 1).value, amount: field('Importe (EUR)', index + 1).value }));
const personal: Row[] = [
  { date: '2026-11-05', kind: 'receipt', amount: '0,105' },
  { date: '2026-11-06', kind: 'payment', amount: '0,015' },
  { date: '2026-11-07', kind: 'receipt', amount: '0' },
];
function writePersonal(balance = '100') {
  change(initial(), balance);
  personal.forEach((row, index) => writeRow(index + 1, row));
}
function expectNoBalances() {
  expect(within(result()).queryByRole('table')).not.toBeInTheDocument();
  expect(within(result()).queryByText('Saldo tras la última fecha')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Guardar este plan en un archivo' })).not.toBeInTheDocument();
}
function encodedPlan(balance = 100) {
  const encoded = encodeCashDatesFile({ initialBalance: balance, movements: [{ date: '2026-12-01', kind: 'receipt', amount: 10 }] });
  if (!encoded.valid) throw new Error('Invalid test plan');
  return encoded.text;
}
const upload = (text = encodedPlan()) => userEvent.upload(screen.getByLabelText('Abrir un plan guardado'), new File([text], 'plan.json', { type: 'application/json' }));

describe('current validation while correcting cash movements by date', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });
  afterEach(() => vi.restoreAllMocks());

  it('retains nine movement errors after fixing the initial balance and corrects date, type and amount without moving focus', async () => {
    const user = userEvent.setup();
    render(<Planner />);
    expect(invalidControls()).toHaveLength(0);
    await check();
    expect(invalidControls()).toHaveLength(10);
    expect(initial()).toHaveFocus();
    await user.type(initial(), '0');
    expect(initial()).toHaveFocus();
    expect(initial()).toHaveAttribute('aria-invalid', 'false');
    expect(invalidControls()).toHaveLength(9);
    field('Fecha', 1).focus();
    change(field('Fecha', 1), '2026-11-10');
    expect(field('Fecha', 1)).toHaveFocus();
    expect(invalidControls()).toHaveLength(8);
    await user.click(field('Tipo', 1));
    await user.selectOptions(field('Tipo', 1), 'receipt');
    expect(field('Tipo', 1)).toHaveFocus();
    expect(invalidControls()).toHaveLength(7);
    await user.type(field('Importe (EUR)', 1), '0');
    expect(field('Importe (EUR)', 1)).toHaveFocus();
    expect(invalidControls()).toHaveLength(6);
    expect(field('Fecha', 2)).toHaveAccessibleName('Fecha del movimiento 2');
    expect(field('Fecha', 2)).toHaveAccessibleDescription(/fecha válida completa/);
    expect(field('Tipo', 3)).toHaveAccessibleDescription(/Elige si es un cobro o un pago/);
    expect(pending()).not.toBeInTheDocument();
    expectNoBalances();
  });

  it('accepts a negative starting balance and deliberate zero amounts while keeping negative movement amounts invalid', async () => {
    render(<Planner />);
    writePersonal('-100');
    change(field('Importe (EUR)', 1), '-1');
    await check();
    expect(initial()).toHaveAttribute('aria-invalid', 'false');
    expect(field('Importe (EUR)', 1)).toHaveFocus();
    expect(invalidControls()).toHaveLength(1);
    change(field('Importe (EUR)', 1), '0');
    expect(field('Importe (EUR)', 1)).toHaveFocus();
    expect(invalidControls()).toHaveLength(0);
    expect(pending()).toBeVisible();
    expectNoBalances();
    await check();
    expect(within(result()).getByText('Primer punto negativo').nextElementSibling).toHaveTextContent('Saldo inicial');
    expect(screen.getByRole('button', { name: 'Guardar este plan en un archivo' })).toBeVisible();
    change(field('Importe (EUR)', 3), '');
    expect(field('Importe (EUR)', 3)).toHaveAttribute('aria-invalid', 'true');
    expectNoBalances();
    change(field('Importe (EUR)', 3), '0');
    expect(invalidControls()).toHaveLength(0);
    expect(pending()).toBeVisible();
    expectNoBalances();
  });

  it('normalizes precision only on explicit checking and withdraws the old table and download until Enter recomputes them', async () => {
    render(<Planner />);
    writePersonal(' 100,005 € ');
    expect(initial()).toHaveValue(' 100,005 € ');
    expect(rows()).toEqual(personal);
    await check();
    expect(initial()).toHaveValue('100,01');
    expect(field('Importe (EUR)', 1)).toHaveValue('0,11');
    expect(field('Importe (EUR)', 2)).toHaveValue('0,02');
    expect(within(result()).getByText('Saldo tras la última fecha').nextElementSibling).toHaveTextContent('100,10');
    field('Importe (EUR)', 1).focus();
    change(field('Importe (EUR)', 1), ' 5,005 ');
    expect(field('Importe (EUR)', 1)).toHaveFocus();
    expect(field('Importe (EUR)', 1)).toHaveValue(' 5,005 ');
    expect(pending()).toBeVisible();
    expectNoBalances();
    fireEvent.keyDown(field('Importe (EUR)', 1), { key: 'Enter' });
    expect(field('Importe (EUR)', 1)).toHaveValue('5,01');
    expect(pending()).not.toBeInTheDocument();
    expect(within(result()).getByRole('table')).toBeVisible();
    expect(within(result()).getByText('Saldo tras la última fecha').nextElementSibling).toHaveTextContent('105,00');
    expect(screen.getByRole('button', { name: 'Guardar este plan en un archivo' })).toBeVisible();
  });

  it('validates added rows at their current indices and restores raw errors and stable IDs when undoing a deletion', async () => {
    render(<Planner />);
    await remove(3);
    change(initial(), '0');
    writeRow(1, { date: '2026-11-10', kind: 'receipt', amount: '10' });
    const unfinished = { date: '', kind: 'payment', amount: ' 1,,25 ' };
    writeRow(2, unfinished);
    const restoredId = field('Fecha', 2).id;
    await check();
    expect(invalidControls()).toHaveLength(2);
    await add();
    expect(invalidControls()).toHaveLength(5);
    await remove(1);
    expect(field('Fecha', 1)).toHaveAttribute('id', restoredId);
    expect(field('Fecha', 1)).toHaveAccessibleName('Fecha del movimiento 1');
    expect(field('Fecha', 1)).toHaveAttribute('aria-invalid', 'true');
    expect(field('Tipo', 1)).toHaveAttribute('aria-invalid', 'false');
    await remove(1);
    expect(invalidControls()).toHaveLength(3);
    await undo();
    expect(rows()).toEqual([unfinished, { date: '', kind: '', amount: '' }]);
    expect(field('Fecha', 1)).toHaveFocus();
    expect(field('Fecha', 1)).toHaveAttribute('id', restoredId);
    expect(invalidControls()).toHaveLength(5);
    expect(field('Importe (EUR)', 1)).toHaveValue(' 1,,25 ');
    expectNoBalances();
    expect(screen.queryByRole('button', { name: 'Deshacer la última eliminación' })).not.toBeInTheDocument();
  });

  it('keeps structural edits quiet before checking and resets validation when the full plan is recovered from the example', async () => {
    render(<Planner />);
    await add();
    const original = rows();
    await remove(2);
    await undo();
    expect(rows()).toEqual(original);
    expect(invalidControls()).toHaveLength(0);
    await example();
    expect(invalidControls()).toHaveLength(0);
    expect(result()).toHaveTextContent('Fechas, saldo y movimientos ficticios');
    change(field('Importe (EUR)', 1), '-1');
    expect(field('Importe (EUR)', 1)).toHaveAttribute('aria-invalid', 'true');
    expectNoBalances();
    await userEvent.click(screen.getByRole('button', { name: 'Recuperar mi plan anterior' }));
    expect(rows()).toEqual(original);
    expect(initial()).toHaveFocus();
    expect(invalidControls()).toHaveLength(0);
    expect(pending()).not.toBeInTheDocument();
    expectNoBalances();
    change(initial(), '1,,5');
    expect(invalidControls()).toHaveLength(0);
    await check();
    expect(invalidControls()).toHaveLength(13);
    expect(initial()).toHaveFocus();
  });

  it('checks a valid file explicitly, retains current errors for invalid files and ignores a pending read after a later edit', async () => {
    render(<Planner />);
    await check();
    expect(invalidControls()).toHaveLength(10);
    await upload();
    await waitFor(() => expect(fileStatus()).toHaveTextContent('Plan abierto con 1 movimiento.'));
    expect(invalidControls()).toHaveLength(0);
    expect(within(result()).getByRole('table')).toBeVisible();
    change(field('Importe (EUR)', 1), '-1');
    expect(invalidControls()).toHaveLength(1);
    await upload('invalid JSON');
    await waitFor(() => expect(fileStatus().querySelector('.field-error')).toBeInTheDocument());
    expect(field('Importe (EUR)', 1)).toHaveValue('-1');
    expect(field('Importe (EUR)', 1)).toHaveAttribute('aria-invalid', 'true');
    const readers: FileReader[] = [];
    vi.spyOn(FileReader.prototype, 'readAsText').mockImplementation(function (this: FileReader) { readers.push(this); });
    await upload(encodedPlan(333));
    expect(fileStatus()).toHaveTextContent('Abriendo el archivo');
    change(field('Importe (EUR)', 1), '0');
    expect(pending()).toBeVisible();
    await act(async () => {
      Object.defineProperty(readers[0], 'result', { value: encodedPlan(333) });
      readers[0].dispatchEvent(new ProgressEvent('load'));
    });
    expect(initial()).toHaveValue('100');
    expect(field('Importe (EUR)', 1)).toHaveValue('0');
    expect(invalidControls()).toHaveLength(0);
    expect(pending()).toBeVisible();
    expect(fileStatus()).toBeEmptyDOMElement();
    expectNoBalances();
  });

  it('keeps validation and keyboard checking local without named fields, requests, storage, URL mutations or events', async () => {
    const storageRead = vi.spyOn(Storage.prototype, 'getItem');
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const storageRemove = vi.spyOn(Storage.prototype, 'removeItem');
    const fetch = vi.spyOn(globalThis, 'fetch');
    const previousUrl = window.location.href;
    render(<Planner />);
    expect(fireEvent.keyDown(initial(), { key: 'Enter' })).toBe(false);
    expect(invalidControls()).toHaveLength(10);
    writePersonal('0');
    expect(pending()).toBeVisible();
    expectNoBalances();
    expect(fireEvent.keyDown(field('Importe (EUR)', 3), { key: 'Enter' })).toBe(false);
    expect(within(result()).getByRole('table')).toBeVisible();
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
});
