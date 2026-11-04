import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Planner from '@/components/MonthlyPortfolioPlanner';
import CalculatorForm from '@/components/CalculatorForm';

type Group = { quantity: string; price: string; hours: string };
const reference = { monthlyBilling: 4149.41, billableHours: 80 };
const label = (group: number, key: keyof Group) => key === 'quantity' ? `Cantidad del grupo ${group}`
  : key === 'price' ? `Precio por servicio del grupo ${group} sin IVA (EUR)`
    : `Horas por servicio del grupo ${group}`;
const field = (group: number, key: keyof Group) => screen.getByLabelText(label(group, key)) as HTMLInputElement;
const result = () => screen.getByRole('status', { name: 'Plan de servicios combinados' });
const changes = () => screen.getByRole('status', { name: 'Cambios en la combinación' });
const undoButton = () => screen.queryByRole('button', { name: 'Deshacer la última eliminación' });
const undo = () => userEvent.click(screen.getByRole('button', { name: 'Deshacer la última eliminación' }));
const remove = (group: number) => userEvent.click(screen.getByRole('button', { name: `Quitar grupo ${group}` }));
const add = () => userEvent.click(screen.getByRole('button', { name: 'Añadir otro grupo' }));
const check = () => userEvent.click(screen.getByRole('button', { name: 'Comprobar combinación' }));
const example = () => userEvent.click(screen.getByRole('button', { name: 'Probar dos servicios ficticios' }));
const recover = () => userEvent.click(screen.getByRole('button', { name: 'Recuperar mi combinación anterior' }));
const change = (input: HTMLElement, value: string) => fireEvent.change(input, { target: { value } });
const groups = (): Group[] => screen.getAllByRole('group', { name: /Grupo \d+ de servicios iguales/ }).map((group) => {
  const [quantity, price, hours] = within(group).getAllByRole('textbox') as HTMLInputElement[];
  return { quantity: quantity.value, price: price.value, hours: hours.value };
});
function writeGroup(group: number, values: Group) {
  for (const key of ['quantity', 'price', 'hours'] as const) change(field(group, key), values[key]);
}
const personal: Group[] = [
  { quantity: '2', price: '500', hours: '5' },
  { quantity: '1', price: '0', hours: '2' },
  { quantity: '3', price: '200', hours: '4' },
];
async function writePersonal() {
  await add();
  await add();
  personal.forEach((group, index) => writeGroup(index + 1, group));
}
function expectConsumed(group: number) {
  expect(undoButton()).not.toBeInTheDocument();
  expect(field(group, 'quantity')).toHaveFocus();
  expect(within(result()).queryByText('Facturación prevista sin IVA')).not.toBeInTheDocument();
  expect(result().querySelector('dl')).toBeNull();
  expect(changes()).toHaveTextContent(/Vuelve a comprobar/);
}

describe('undo the latest deleted group of monthly services', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });
  afterEach(() => vi.restoreAllMocks());

  it('restores an unfinished raw middle group and its ID while preserving later edits and validation without persistence', async () => {
    const storageRead = vi.spyOn(Storage.prototype, 'getItem');
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const storageRemove = vi.spyOn(Storage.prototype, 'removeItem');
    const fetch = vi.spyOn(globalThis, 'fetch');
    const previousUrl = window.location.href;
    render(<Planner {...reference} />);
    await writePersonal();
    const deleted = { quantity: '', price: '0', hours: ' 1,,25 ' };
    writeGroup(2, deleted);
    const deletedId = field(2, 'quantity').id;
    await check();
    expect(field(2, 'quantity')).toHaveAttribute('aria-invalid', 'true');
    await remove(2);
    expect(field(2, 'quantity')).toHaveFocus();
    expect(undoButton()).toHaveAttribute('type', 'button');
    expect(undoButton()).toHaveAccessibleDescription(/posición anterior/);
    change(field(1, 'price'), ' 75,005 ');
    change(field(2, 'hours'), '');
    await check();
    expect(undoButton()).toBeEnabled();
    await undo();

    expect(groups()).toEqual([{ ...personal[0], price: ' 75,005 ' }, deleted, { ...personal[2], hours: '' }]);
    expect(field(2, 'quantity')).toHaveAttribute('id', deletedId);
    expectConsumed(2);
    expect(field(2, 'quantity')).toHaveAttribute('aria-invalid', 'true');
    expect(field(3, 'hours')).toHaveAttribute('aria-invalid', 'true');
    await check();
    expect(field(2, 'quantity')).toHaveFocus();
    expect(field(2, 'quantity')).toHaveAttribute('aria-invalid', 'true');
    expect(field(2, 'hours')).toHaveAttribute('aria-invalid', 'true');
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

  it('restores first and last groups in order and consumes each single-use copy', async () => {
    render(<Planner {...reference} />);
    await writePersonal();
    for (const group of [1, 3]) {
      await remove(group);
      expect(groups()).toHaveLength(2);
      await undo();
      expect(groups()).toEqual(personal);
      expectConsumed(group);
    }
  });

  it('restores only the latest deletion and allows a fresh deletion cycle', async () => {
    render(<Planner {...reference} />);
    await writePersonal();
    await add();
    const fourth = { quantity: '4', price: ' 80,005 ', hours: '1,005' };
    writeGroup(4, fourth);
    await remove(2);
    await remove(3);
    await undo();
    expect(groups()).toEqual([personal[0], personal[2], fourth]);
    expectConsumed(3);
    await remove(1);
    await undo();
    expect(groups()).toEqual([personal[0], personal[2], fourth]);
    expectConsumed(1);
  });

  it('respects eight groups and explicitly discards the copy when adding a group', async () => {
    render(<Planner {...reference} />);
    const addButton = screen.getByRole('button', { name: 'Añadir otro grupo' });
    for (let count = 2; count <= 8; count++) fireEvent.click(addButton);
    expect(addButton).toBeDisabled();
    const eighth = { quantity: '', price: '0', hours: ' 2,005 ' };
    writeGroup(8, eighth);
    await remove(8);
    expect(undoButton()).toBeEnabled();
    await undo();
    expect(groups()).toHaveLength(8);
    expect(groups()[7]).toEqual(eighth);
    expect(addButton).toBeDisabled();
    await remove(7);
    await add();
    expect(undoButton()).not.toBeInTheDocument();
    expect(changes()).toHaveTextContent('Ya no se puede deshacer la eliminación anterior');
    expect(groups()).toHaveLength(8);
    expect(addButton).toBeDisabled();
    await remove(8);
    await undo();
    expectConsumed(8);
    const ids = [...document.querySelectorAll('input[id]')].map(node => node.id);
    expect(new Set(ids).size).toBe(24);
  });

  it('keeps complete-example recovery independent while replacements discard row undo', async () => {
    render(<Planner {...reference} />);
    await writePersonal();
    change(field(2, 'hours'), ' 1,,25 ');
    const original = groups();
    await example();
    await remove(1);
    expect(undoButton()).toBeEnabled();
    await add();
    expect(undoButton()).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Recuperar mi combinación anterior' })).toBeEnabled();
    await remove(2);
    expect(undoButton()).toBeEnabled();
    await recover();
    expect(groups()).toEqual(original);
    expect(undoButton()).not.toBeInTheDocument();
    expect(result()).toBeEmptyDOMElement();
    expect(field(1, 'quantity')).toHaveFocus();
    await remove(2);
    await example();
    expect(undoButton()).not.toBeInTheDocument();
    await recover();
    expect(groups()).toEqual([original[0], original[2]]);
    expect(undoButton()).not.toBeInTheDocument();
  });

  it('keeps undo for the same reference but discards it when either reference value changes', async () => {
    const { rerender } = render(<Planner {...reference} />);
    await writePersonal();
    await remove(2);
    rerender(<Planner {...reference} />);
    expect(undoButton()).toBeEnabled();
    await undo();
    expect(groups()).toEqual(personal);
    await remove(2);
    rerender(<Planner monthlyBilling={5000} billableHours={80} />);
    expect(groups()).toEqual([{ quantity: '', price: '', hours: '' }]);
    expect(undoButton()).not.toBeInTheDocument();
    expect(changes().textContent).toBe('');
    await add();
    await remove(1);
    expect(undoButton()).toBeEnabled();
    rerender(<Planner monthlyBilling={5000} billableHours={60} />);
    expect(groups()).toEqual([{ quantity: '', price: '', hours: '' }]);
    expect(undoButton()).not.toBeInTheDocument();
    expect(result()).toBeEmptyDOMElement();
  });

  it('rechecks a restored paid group beside a free service without changing the main result or shared summary', async () => {
    render(<CalculatorForm initiallySubmitted initialValues={{ targetNet: '1500', monthlyExpenses: '150', billableHours: '70', irpfMode: 'manual', irpfRate: '15', selfEmployedFeeMode: 'manual', selfEmployedFee: '320' }} initialShareUrl="https://www.cuantofacturar.es/?targetNet=1500#calculadora" />);
    const summary = screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement;
    const originalSummary = summary.value;
    const previousUrl = window.location.href;
    await userEvent.click(screen.getByText('Comprobar cuántos encargos necesito y si caben'));
    await userEvent.click(screen.getByText('Combinar encargos de distintos precios y horas'));
    await writePersonal();
    await check();
    await remove(1);
    await check();
    expect(within(result()).getByText('Facturación prevista sin IVA').nextElementSibling).toHaveTextContent('600,00');
    change(field(2, 'price'), '250');
    await check();
    expect(within(result()).getByText('Facturación prevista sin IVA').nextElementSibling).toHaveTextContent('750,00');
    expect(undoButton()).toBeEnabled();
    await undo();
    expectConsumed(1);
    expect(groups()).toEqual([personal[0], personal[1], { ...personal[2], price: '250' }]);
    await check();
    expect(within(result()).getByText('Facturación prevista sin IVA').nextElementSibling).toHaveTextContent('1750,00');
    expect(within(result()).getByText('Horas necesarias para la combinación').nextElementSibling).toHaveTextContent('24 h');
    expect(result()).toHaveTextContent('quedan 46 h');
    expect(summary).toHaveValue(originalSummary);
    expect(screen.getByRole('spinbutton', { name: 'Horas facturables al mes' })).toHaveValue(70);
    expect(window.location.href).toBe(previousUrl);
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });
});
