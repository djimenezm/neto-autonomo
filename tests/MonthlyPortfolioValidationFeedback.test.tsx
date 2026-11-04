import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Planner from '@/components/MonthlyPortfolioPlanner';
import CalculatorForm from '@/components/CalculatorForm';

type Group = { quantity: string; price: string; hours: string };
const reference = { monthlyBilling: 3000, billableHours: 100 };
const label = (group: number, key: keyof Group) => key === 'quantity' ? `Cantidad del grupo ${group}`
  : key === 'price' ? `Precio por servicio del grupo ${group} sin IVA (EUR)`
    : `Horas por servicio del grupo ${group}`;
const field = (group: number, key: keyof Group) => screen.getByLabelText(label(group, key)) as HTMLInputElement;
const groupElements = () => screen.getAllByRole('group', { name: /Grupo \d+ de servicios iguales/ });
const invalidFields = () => groupElements().flatMap(group => within(group).getAllByRole('textbox')).filter(input => input.getAttribute('aria-invalid') === 'true');
const result = () => screen.getByRole('status', { name: 'Plan de servicios combinados' });
const pending = () => screen.queryByText('Datos modificados. Pulsa «Comprobar combinación» para actualizar el resultado.');
const check = () => userEvent.click(screen.getByRole('button', { name: 'Comprobar combinación' }));
const add = () => userEvent.click(screen.getByRole('button', { name: 'Añadir otro grupo' }));
const remove = (group: number) => userEvent.click(screen.getByRole('button', { name: `Quitar grupo ${group}` }));
const undo = () => userEvent.click(screen.getByRole('button', { name: 'Deshacer la última eliminación' }));
const example = () => userEvent.click(screen.getByRole('button', { name: 'Probar dos servicios ficticios' }));
const change = (group: number, key: keyof Group, value: string) => fireEvent.change(field(group, key), { target: { value } });
function writeGroup(group: number, values: Group) {
  for (const key of ['quantity', 'price', 'hours'] as const) change(group, key, values[key]);
}
const groups = (): Group[] => groupElements().map((_, index) => ({ quantity: field(index + 1, 'quantity').value, price: field(index + 1, 'price').value, hours: field(index + 1, 'hours').value }));
function expectNoPlan() {
  expect(within(result()).queryByText('Facturación prevista sin IVA')).not.toBeInTheDocument();
  expect(within(result()).queryByText('Horas necesarias para la combinación')).not.toBeInTheDocument();
}

describe('current validation across edits to combined monthly services', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });
  afterEach(() => vi.restoreAllMocks());

  it('retains five unfinished fields after correcting one of six errors without stealing the editing focus', async () => {
    const user = userEvent.setup();
    render(<Planner {...reference} />);
    await add();
    expect(invalidFields()).toHaveLength(0);
    await check();
    expect(invalidFields()).toHaveLength(6);
    expect(field(1, 'quantity')).toHaveFocus();
    await user.type(field(1, 'quantity'), '2');
    expect(field(1, 'quantity')).toHaveFocus();
    expect(field(1, 'quantity')).toHaveAttribute('aria-invalid', 'false');
    expect(invalidFields()).toHaveLength(5);
    expect(field(2, 'hours')).toHaveAccessibleName(label(2, 'hours'));
    expect(field(2, 'hours')).toHaveAccessibleDescription(/Todo el tiempo de uno/);
    expect(field(2, 'hours')).toHaveAccessibleDescription(/al menos 0,01 horas/);
    change(1, 'price', '500');
    change(1, 'hours', '5');
    expect(invalidFields()).toHaveLength(3);
    writeGroup(2, { quantity: '1', price: '0', hours: '1' });
    expect(invalidFields()).toHaveLength(0);
    expect(pending()).toBeVisible();
    expectNoPlan();
  });

  it('distinguishes free services from invalid zero quantities or hours and normalizes raw precision only on explicit checking', async () => {
    render(<Planner {...reference} />);
    writeGroup(1, { quantity: '0', price: '0', hours: '0' });
    await check();
    expect(invalidFields()).toHaveLength(2);
    expect(field(1, 'price')).toHaveAttribute('aria-invalid', 'false');
    change(1, 'quantity', '1');
    expect(field(1, 'quantity')).toHaveFocus();
    expect(field(1, 'hours')).toHaveAttribute('aria-invalid', 'true');
    change(1, 'hours', '1');
    expect(invalidFields()).toHaveLength(0);
    expect(pending()).toBeVisible();
    expectNoPlan();
    await check();
    expect(within(result()).getByText('Facturación prevista sin IVA').nextElementSibling).toHaveTextContent('0,00');
    const raw = { quantity: '2', price: ' 50,005 € ', hours: '1,005' };
    writeGroup(1, raw);
    expect(groups()).toEqual([raw]);
    expect(pending()).toBeVisible();
    expectNoPlan();
    await check();
    expect(groups()).toEqual([{ quantity: '2', price: '50,01', hours: '1,01' }]);
    expect(within(result()).getByText('Facturación prevista sin IVA').nextElementSibling).toHaveTextContent('100,02');
    field(1, 'price').focus();
    change(1, 'price', '75,005');
    expect(field(1, 'price')).toHaveFocus();
    expect(field(1, 'price')).toHaveValue('75,005');
    expect(pending()).toBeVisible();
    expectNoPlan();
    fireEvent.keyDown(field(1, 'price'), { key: 'Enter' });
    expect(field(1, 'price')).toHaveValue('75,01');
    expect(within(result()).getByText('Facturación prevista sin IVA').nextElementSibling).toHaveTextContent('150,02');
    expect(pending()).not.toBeInTheDocument();
  });

  it('validates newly added rows and current indices after deletion, restoring raw data and current errors on undo without restoring a plan', async () => {
    render(<Planner {...reference} />);
    await add();
    writeGroup(1, { quantity: '1', price: '500', hours: '5' });
    const unfinished = { quantity: '', price: '0', hours: ' 1,,25 ' };
    writeGroup(2, unfinished);
    const rowId = field(2, 'quantity').id;
    await check();
    expect(invalidFields()).toHaveLength(2);
    await remove(1);
    expect(groups()).toEqual([unfinished]);
    expect(field(1, 'quantity')).toHaveFocus();
    expect(field(1, 'quantity')).toHaveAttribute('id', rowId);
    expect(field(1, 'hours')).toHaveAccessibleName(label(1, 'hours'));
    expect(field(1, 'hours')).toHaveAttribute('aria-invalid', 'true');
    await add();
    expect(field(2, 'quantity')).toHaveFocus();
    expect(invalidFields()).toHaveLength(5);
    await remove(1);
    expect(invalidFields()).toHaveLength(3);
    expect(field(1, 'price')).toHaveAttribute('aria-invalid', 'true');
    await undo();
    expect(groups()).toEqual([unfinished, { quantity: '', price: '', hours: '' }]);
    expect(field(1, 'quantity')).toHaveFocus();
    expect(field(1, 'quantity')).toHaveAttribute('id', rowId);
    expect(invalidFields()).toHaveLength(5);
    expect(field(1, 'price')).toHaveAttribute('aria-invalid', 'false');
    expect(field(1, 'hours')).toHaveAccessibleDescription(/al menos 0,01 horas/);
    expectNoPlan();
    expect(screen.queryByRole('button', { name: 'Deshacer la última eliminación' })).not.toBeInTheDocument();
  });

  it('keeps structural changes quiet before checking, checks examples explicitly and resets validation on full recovery', async () => {
    render(<Planner {...reference} />);
    await add();
    const original = groups();
    await remove(1);
    await undo();
    expect(groups()).toEqual(original);
    expect(invalidFields()).toHaveLength(0);
    expect(pending()).not.toBeInTheDocument();
    await example();
    expect(invalidFields()).toHaveLength(0);
    expect(result()).toHaveTextContent('Precios, cantidades y horas ficticios');
    change(2, 'quantity', '0');
    expect(field(2, 'quantity')).toHaveAttribute('aria-invalid', 'true');
    expectNoPlan();
    await userEvent.click(screen.getByRole('button', { name: 'Recuperar mi combinación anterior' }));
    expect(groups()).toEqual(original);
    expect(field(1, 'quantity')).toHaveFocus();
    expect(invalidFields()).toHaveLength(0);
    expect(pending()).not.toBeInTheDocument();
    change(1, 'quantity', '0');
    expect(invalidFields()).toHaveLength(0);
    await check();
    expect(invalidFields()).toHaveLength(6);
    expectNoPlan();
  });

  it('preserves current errors for an unchanged reference and resets the editor and validation when either reference changes', async () => {
    const { rerender } = render(<Planner {...reference} />);
    await add();
    await check();
    change(1, 'quantity', '1');
    expect(invalidFields()).toHaveLength(5);
    rerender(<Planner {...reference} />);
    expect(invalidFields()).toHaveLength(5);
    expect(field(1, 'quantity')).toHaveValue('1');
    rerender(<Planner monthlyBilling={5000} billableHours={100} />);
    expect(groups()).toEqual([{ quantity: '', price: '', hours: '' }]);
    expect(invalidFields()).toHaveLength(0);
    expect(pending()).not.toBeInTheDocument();
    await add();
    await check();
    await remove(2);
    expect(invalidFields()).toHaveLength(3);
    rerender(<Planner monthlyBilling={5000} billableHours={80} />);
    expect(groups()).toEqual([{ quantity: '', price: '', hours: '' }]);
    expect(invalidFields()).toHaveLength(0);
    expect(screen.queryByRole('button', { name: 'Deshacer la última eliminación' })).not.toBeInTheDocument();
    expectNoPlan();
  });

  it('keeps the eight-group cap and row-bound errors through deleting and restoring a group', async () => {
    render(<Planner {...reference} />);
    const addButton = screen.getByRole('button', { name: 'Añadir otro grupo' });
    for (let count = 2; count <= 8; count++) fireEvent.click(addButton);
    expect(addButton).toBeDisabled();
    await check();
    expect(invalidFields()).toHaveLength(24);
    writeGroup(8, { quantity: '1', price: '0', hours: '1' });
    expect(invalidFields()).toHaveLength(21);
    await remove(7);
    expect(groupElements()).toHaveLength(7);
    expect(invalidFields()).toHaveLength(18);
    expect(field(7, 'price')).toHaveAttribute('aria-invalid', 'false');
    await undo();
    expect(groupElements()).toHaveLength(8);
    expect(addButton).toBeDisabled();
    expect(invalidFields()).toHaveLength(21);
    expect(field(7, 'quantity')).toHaveFocus();
    expect(field(7, 'price')).toHaveAttribute('aria-invalid', 'true');
    expect(field(8, 'price')).toHaveAttribute('aria-invalid', 'false');
    expectNoPlan();
  });

  it('keeps validation and checking separate from the main result, summary, GET, storage, requests and events', async () => {
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
    await userEvent.click(screen.getByText('Comprobar cuántos encargos necesito y si caben'));
    await userEvent.click(screen.getByText('Combinar encargos de distintos precios y horas'));
    await add();
    await check();
    expect(invalidFields()).toHaveLength(6);
    writeGroup(1, { quantity: '1', price: '500', hours: '5' });
    writeGroup(2, { quantity: '1', price: '0', hours: '1' });
    expect(pending()).toBeVisible();
    expectNoPlan();
    expect(fireEvent.keyDown(field(2, 'hours'), { key: 'Enter' })).toBe(false);
    expect(within(result()).getByText('Facturación prevista sin IVA').nextElementSibling).toHaveTextContent('500,00');
    change(1, 'price', '-1');
    expect(field(1, 'price')).toHaveAttribute('aria-invalid', 'true');
    expectNoPlan();
    expect(screen.getByRole('heading', { name: 'Tu referencia mensual para presupuestar' })).toBeVisible();
    expect(summary).toHaveValue(originalSummary);
    expect([...new FormData(form).entries()]).toEqual(originalData);
    for (const group of groupElements()) {
      for (const input of within(group).getAllByRole('textbox')) expect(input).not.toHaveAttribute('name');
    }
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
