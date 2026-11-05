import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Planner from '@/components/CashDatePlanner';
import { decodeCashDatesFile, encodeCashDatesFile } from '@/lib/cashDatesFile';

type Row = { date: string; kind: string; amount: string };
const initial = () => screen.getByLabelText('Saldo antes del primer movimiento (EUR)') as HTMLInputElement;
const field = (label: string, row: number) => screen.getByLabelText(`${label} del movimiento ${row}`) as HTMLInputElement | HTMLSelectElement;
const result = () => screen.getByRole('status', { name: 'Caja por fechas' });
const notice = () => screen.getByRole('status', { name: 'Eliminación de movimientos' });
const fileFeedback = () => screen.getByRole('status', { name: 'Archivo del plan' });
const undoButton = () => screen.queryByRole('button', { name: 'Deshacer la última eliminación' });
const undo = () => userEvent.click(screen.getByRole('button', { name: 'Deshacer la última eliminación' }));
const remove = (row: number) => userEvent.click(screen.getByRole('button', { name: `Eliminar movimiento ${row}` }));
const check = () => userEvent.click(screen.getByRole('button', { name: 'Comprobar vencimientos' }));
const change = (input: HTMLElement, value: string) => fireEvent.change(input, { target: { value } });
const rows = (): Row[] => screen.getAllByRole('combobox').map((_, index) => ({ date: field('Fecha', index + 1).value, kind: field('Tipo', index + 1).value, amount: field('Importe (EUR)', index + 1).value }));
const writeRow = (row: number, values: Row) => {
  change(field('Fecha', row), values.date);
  change(field('Tipo', row), values.kind);
  change(field('Importe (EUR)', row), values.amount);
};
const personal = [
  { date: '2026-12-01', kind: 'payment', amount: '180' },
  { date: '2026-12-02', kind: 'receipt', amount: '200' },
  { date: '2026-12-03', kind: 'payment', amount: '50' },
];
function writePersonal() {
  change(initial(), '100');
  personal.forEach((row, index) => writeRow(index + 1, row));
}
function encodedPlan() {
  const encoded = encodeCashDatesFile({ initialBalance: 333, movements: [{ date: '2027-01-02', kind: 'receipt', amount: 444 }] });
  if (!encoded.valid) throw new Error('Invalid import fixture.');
  return encoded.text;
}
const upload = (text = encodedPlan()) => userEvent.upload(screen.getByLabelText('Abrir un plan guardado'), new File([text], 'plan.json', { type: 'application/json' }));
function expectConsumed(row: number) {
  expect(undoButton()).not.toBeInTheDocument();
  expect(field('Fecha', row)).toHaveFocus();
  expect(within(result()).queryByRole('table')).not.toBeInTheDocument();
  expect(within(result()).queryByText('Saldo tras la última fecha')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Guardar este plan en un archivo' })).not.toBeInTheDocument();
  expect(notice()).toHaveTextContent('Vuelve a comprobar');
}

describe('undo the latest deleted cash-date movement', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

  it('restores a raw unfinished middle row in place while keeping later balance and other-row edits without persistence', async () => {
    const storageRead = vi.spyOn(Storage.prototype, 'getItem');
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const storageRemove = vi.spyOn(Storage.prototype, 'removeItem');
    const fetch = vi.spyOn(globalThis, 'fetch');
    const previousUrl = window.location.href;
    render(<Planner />);
    writePersonal();
    const deleted: Row = { date: '', kind: 'payment', amount: ' 1,,25 ' };
    writeRow(2, deleted);
    const deletedId = field('Fecha', 2).id;
    await remove(2);
    expect(field('Fecha', 2)).toHaveFocus();
    expect(undoButton()).toHaveAttribute('type', 'button');
    change(initial(), ' 777,005 ');
    change(field('Importe (EUR)', 1), ' 75,005 ');
    await undo();

    expect(rows()).toEqual([{ ...personal[0], amount: ' 75,005 ' }, deleted, personal[2]]);
    expect(initial()).toHaveValue(' 777,005 ');
    expect(field('Fecha', 2)).toHaveAttribute('id', deletedId);
    expectConsumed(2);
    expect(field('Importe (EUR)', 2)).toHaveAttribute('aria-invalid', 'false');
    await check();
    expect(field('Fecha', 2)).toHaveFocus();
    expect(field('Fecha', 2)).toHaveAttribute('aria-invalid', 'true');
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

  it('restores first and last movements in their original order and consumes each single-use copy', async () => {
    render(<Planner />);
    writePersonal();
    for (const index of [1, 3]) {
      await remove(index);
      expect(rows()).toHaveLength(2);
      await undo();
      expect(rows()).toEqual(personal);
      expectConsumed(index);
    }
  });

  it('keeps only the most recent deletion rather than reviving an earlier removed movement', async () => {
    render(<Planner />);
    writePersonal();
    await userEvent.click(screen.getByRole('button', { name: 'Añadir movimiento' }));
    const fourth = { date: '2026-12-04', kind: 'receipt', amount: ' 44,005 ' };
    writeRow(4, fourth);
    await remove(2);
    await remove(3);
    await undo();
    expect(rows()).toEqual([personal[0], personal[2], fourth]);
    expectConsumed(3);
    await remove(1);
    await undo();
    expect(rows()).toEqual([personal[0], personal[2], fourth]);
    expectConsumed(1);
  });

  it('respects the twenty-row cap and discards undo when adding a new movement changes the structure', async () => {
    render(<Planner />);
    const add = screen.getByRole('button', { name: 'Añadir movimiento' });
    for (let count = 4; count <= 20; count++) fireEvent.click(add);
    expect(add).toBeDisabled();
    writeRow(20, { date: '2026-12-20', kind: 'payment', amount: ' 123,005 ' });
    await remove(20);
    expect(undoButton()).toBeEnabled();
    await undo();
    expect(screen.getAllByRole('combobox')).toHaveLength(20);
    expect(field('Importe (EUR)', 20)).toHaveValue(' 123,005 ');
    expect(add).toBeDisabled();
    await remove(19);
    expect(undoButton()).toBeEnabled();
    await userEvent.click(add);
    expect(undoButton()).not.toBeInTheDocument();
    expect(notice()).toHaveTextContent('Ya no se puede deshacer la eliminación anterior');
    expect(screen.getAllByRole('combobox')).toHaveLength(20);
    expect(add).toBeDisabled();
    await remove(20);
    await undo();
    expect(screen.getAllByRole('combobox')).toHaveLength(20);
    const ids = [...document.querySelectorAll('input[id],select[id]')].map(node => node.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps undo after an invalid file but discards it on example, valid file or complete-plan recovery', async () => {
    render(<Planner />);
    writePersonal();
    await remove(2);
    await upload('not a plan');
    await waitFor(() => expect(fileFeedback().querySelector('.field-error')).toBeInTheDocument());
    expect(undoButton()).toBeEnabled();
    await undo();
    expect(rows()).toEqual(personal);
    await remove(2);
    await userEvent.click(screen.getByRole('button', { name: 'Probar las fechas ficticias' }));
    expect(undoButton()).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Recuperar mi plan anterior' }));
    expect(rows()).toEqual([personal[0], personal[2]]);
    expect(undoButton()).not.toBeInTheDocument();
    await remove(1);
    expect(undoButton()).toBeEnabled();
    await upload();
    await waitFor(() => expect(fileFeedback()).toHaveTextContent('Plan abierto con 1 movimiento.'));
    expect(undoButton()).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Recuperar mi plan anterior' }));
    expect(rows()).toEqual([personal[2]]);
    expect(undoButton()).not.toBeInTheDocument();
  });

  it('cancels a pending file read when undo restores a movement', async () => {
    render(<Planner />);
    writePersonal();
    await remove(2);
    const pending: FileReader[] = [];
    vi.spyOn(FileReader.prototype, 'readAsText').mockImplementation(function (this: FileReader) { pending.push(this); });
    await upload();
    expect(fileFeedback()).toHaveTextContent('Abriendo el archivo');
    await undo();
    expect(rows()).toEqual(personal);
    expectConsumed(2);
    await act(async () => {
      Object.defineProperty(pending[0], 'result', { value: encodedPlan() });
      pending[0].dispatchEvent(new ProgressEvent('load'));
    });
    expect(rows()).toEqual(personal);
    expect(initial()).toHaveValue('100');
    expect(fileFeedback()).toBeEmptyDOMElement();
    expect(screen.queryByRole('button', { name: 'Recuperar mi plan anterior' })).not.toBeInTheDocument();
    expect(field('Fecha', 2)).toHaveFocus();
  });

  it('invalidates checked balances and downloads on undo, then exports only the restored checked inputs', async () => {
    const NativeURL = URL;
    class TestURL extends NativeURL { static createObjectURL = vi.fn(() => 'blob:cash-delete'); static revokeObjectURL = vi.fn(); }
    vi.stubGlobal('URL', TestURL);
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    render(<Planner />);
    writePersonal();
    await check();
    await remove(1);
    await check();
    expect(within(result()).getByText('Saldo tras la última fecha').nextElementSibling).toHaveTextContent('250,00');
    expect(screen.getByRole('button', { name: 'Guardar este plan en un archivo' })).toBeVisible();
    expect(undoButton()).toBeEnabled();
    await undo();
    expectConsumed(1);
    await check();
    expect(within(result()).getByText('Saldo tras la última fecha').nextElementSibling).toHaveTextContent('70,00');
    expect(within(result()).getByText('Saldo mínimo con este orden supuesto').nextElementSibling).toHaveTextContent('-80,00');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar este plan en un archivo' }));
    const blob = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob;
    const text = await new Promise<string>(resolve => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.readAsText(blob); });
    expect(decodeCashDatesFile(text)).toEqual({ valid: true, fictional: false, input: { initialBalance: 100, movements: personal.map(row => ({ ...row, amount: Number(row.amount) })) } });
    expect(Object.keys(JSON.parse(text)).sort()).toEqual(['fictional', 'format', 'initialBalance', 'movements', 'sameDayOrder', 'version']);
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledOnce();
  });
});
