import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Planner from '@/components/MonthlyPortfolioPlanner';

const reference = { monthlyBilling: 4149.41, billableHours: 80 };
type Group = { quantity: string; price: string; hours: string };
const fieldLabel = (group: number, key: keyof Group) => key === 'quantity' ? `Cantidad del grupo ${group}`
  : key === 'price' ? `Precio por servicio del grupo ${group} sin IVA (EUR)`
    : `Horas por servicio del grupo ${group}`;
const field = (group: number, key: keyof Group) => screen.getByLabelText(fieldLabel(group, key)) as HTMLInputElement;
const result = () => screen.getByRole('status', { name: 'Plan de servicios combinados' });
const recovery = () => screen.getByRole('status', { name: 'Recuperación de la combinación' });
const example = () => userEvent.click(screen.getByRole('button', { name: 'Probar dos servicios ficticios' }));
const restore = () => userEvent.click(screen.getByRole('button', { name: 'Recuperar mi combinación anterior' }));
const check = () => userEvent.click(screen.getByRole('button', { name: 'Comprobar combinación' }));

function currentValues(): Group[] {
  return screen.getAllByRole('group', { name: /Grupo \d+ de servicios iguales/ }).map((group) => {
    const [quantity, price, hours] = within(group).getAllByRole('textbox') as HTMLInputElement[];
    return { quantity: quantity.value, price: price.value, hours: hours.value };
  });
}

function writeGroup(group: number, values: Group) {
  const controls = within(screen.getByRole('group', { name: `Grupo ${group} de servicios iguales` }));
  const inputs = (['quantity', 'price', 'hours'] as const).map((key) => controls.getByLabelText(fieldLabel(group, key)));
  for (const [index, key] of (['quantity', 'price', 'hours'] as const).entries()) {
    fireEvent.change(inputs[index], { target: { value: values[key] } });
  }
}

async function enterPartialCombination() {
  const addGroup = screen.getByRole('button', { name: 'Añadir otro grupo' });
  for (let group = 2; group <= 8; group++) {
    await userEvent.click(addGroup);
  }
  const groups: Group[] = [
    { quantity: '2', price: ' 1.234,005 € ', hours: '1,005' },
    { quantity: '', price: '800,50', hours: '12,500' },
    { quantity: '1,,50', price: '', hours: '0,125' },
    { quantity: '4', price: '0', hours: '' },
    { quantity: '5', price: '50,125', hours: ' 2,50 ' },
    { quantity: '6', price: '1,,25', hours: '3,125' },
    { quantity: '7', price: '70,50', hours: '4,005' },
    { quantity: '8', price: '80,005', hours: '5,005' },
  ];
  groups.forEach((values, index) => writeGroup(index + 1, values));
  return groups;
}

function expectRecoveryFinished() {
  expect(screen.queryByRole('button', { name: 'Recuperar mi combinación anterior' })).not.toBeInTheDocument();
  expect(screen.queryByText(/Conservamos en esta página la combinación anterior al primer ejemplo/)).not.toBeInTheDocument();
  expect(result()).toBeEmptyDOMElement();
  expect(recovery()).toHaveTextContent('Combinación anterior recuperada. Vuelve a comprobarla para actualizar los resultados.');
  expect(field(1, 'quantity')).toHaveFocus();
}

describe('recover the service combination replaced by the first fictional example', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });
  afterEach(() => vi.restoreAllMocks());

  it('recovers all eight groups, incomplete text and precision in order without storage, requests or events', async () => {
    const storageRead = vi.spyOn(Storage.prototype, 'getItem');
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const storageRemove = vi.spyOn(Storage.prototype, 'removeItem');
    const fetch = vi.spyOn(globalThis, 'fetch');
    const previousUrl = window.location.href;
    render(<Planner {...reference} />);
    const original = await enterPartialCombination();
    expect(screen.getByRole('button', { name: 'Añadir otro grupo' })).toBeDisabled();
    await example();

    expect(result()).toHaveTextContent('Precios, cantidades y horas ficticios');
    const note = screen.getByText(/Conservamos en esta página la combinación anterior al primer ejemplo/);
    expect(note).toHaveTextContent('Recuperarla sustituye los cambios que ves ahora.');
    expect(note).toHaveTextContent('La copia se pierde al salir o cambiar el cálculo de referencia.');
    expect(screen.getByRole('button', { name: 'Recuperar mi combinación anterior' })).toHaveAccessibleDescription(/Recuperarla sustituye los cambios que ves ahora/);
    await restore();

    expect(currentValues()).toEqual(original);
    expect(screen.getAllByRole('textbox')).toHaveLength(24);
    expect(screen.getByRole('button', { name: 'Añadir otro grupo' })).toBeDisabled();
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

  it('keeps the first combination when the example is requested repeatedly', async () => {
    render(<Planner {...reference} />);
    writeGroup(1, { quantity: '2', price: '55,125', hours: '' });
    const original = currentValues();
    await example();
    await example();
    await example();
    await restore();

    expect(currentValues()).toEqual(original);
    expectRecoveryFinished();
  });

  it('keeps the backup through edits, adding, removing and both valid and invalid checks', async () => {
    render(<Planner {...reference} />);
    const original = await enterPartialCombination();
    await example();
    writeGroup(1, { quantity: '2', price: '17,005', hours: '1,125' });
    await check();
    expect(result()).toHaveTextContent('Facturación prevista sin IVA');
    await userEvent.click(screen.getByRole('button', { name: 'Añadir otro grupo' }));
    await check();
    expect(result()).toHaveTextContent('Revisa los campos indicados');
    await userEvent.click(screen.getByRole('button', { name: 'Quitar grupo 1' }));
    await example();
    await restore();

    expect(currentValues()).toEqual(original);
    expectRecoveryFinished();
  });

  it('recovers a checked personal combination without reusing the example result or fictional marker', async () => {
    render(<Planner {...reference} />);
    writeGroup(1, { quantity: '2', price: '500', hours: '5' });
    await check();
    const original = currentValues();
    expect(within(result()).getByText('Facturación prevista sin IVA').nextElementSibling).toHaveTextContent('1000,00');
    await example();
    await restore();

    expect(currentValues()).toEqual(original);
    expectRecoveryFinished();
    await check();
    expect(within(result()).getByText('Facturación prevista sin IVA').nextElementSibling).toHaveTextContent('1000,00');
    expect(within(result()).getByText('Horas necesarias para la combinación').nextElementSibling).toHaveTextContent('10 h');
    expect(result()).not.toHaveTextContent('Precios, cantidades y horas ficticios');
  });

  it('consumes recovery and captures a new combination for the next example cycle', async () => {
    render(<Planner {...reference} />);
    writeGroup(1, { quantity: '1', price: '10', hours: '1' });
    await example();
    await restore();
    expectRecoveryFinished();
    writeGroup(1, { quantity: '4', price: '80,125', hours: '' });
    await userEvent.click(screen.getByRole('button', { name: 'Añadir otro grupo' }));
    writeGroup(2, { quantity: '', price: '30', hours: '2,005' });
    const newCombination = currentValues();
    expect(recovery()).toBeEmptyDOMElement();
    await example();
    await restore();

    expect(currentValues()).toEqual(newCombination);
    expectRecoveryFinished();
  });

  it.each([{ monthlyBilling: 5000, billableHours: 80 }, { monthlyBilling: 4149.41, billableHours: 60 }])('discards recovery when the main reference changes: %j', async (next) => {
    const { rerender } = render(<Planner {...reference} />);
    writeGroup(1, { quantity: '3', price: '20,125', hours: '1,005' });
    const original = currentValues();
    await example();
    rerender(<Planner {...reference} />);
    expect(screen.getByRole('button', { name: 'Recuperar mi combinación anterior' })).toBeInTheDocument();
    await restore();
    expect(currentValues()).toEqual(original);
    await example();
    rerender(<Planner {...next} />);

    expect(currentValues()).toEqual([{ quantity: '', price: '', hours: '' }]);
    expect(result()).toBeEmptyDOMElement();
    expect(screen.queryByRole('button', { name: 'Recuperar mi combinación anterior' })).not.toBeInTheDocument();
    expect(screen.queryByText(/Conservamos en esta página la combinación anterior al primer ejemplo/)).not.toBeInTheDocument();
    expect(recovery()).toBeEmptyDOMElement();
  });
});
