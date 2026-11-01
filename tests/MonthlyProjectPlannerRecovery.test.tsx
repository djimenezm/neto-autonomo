import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Planner from '@/components/MonthlyProjectPlanner';

const labels = {
  pricePerProject: 'Precio por encargo sin IVA (EUR)',
  hoursPerProject: 'Horas totales por encargo',
} as const;
type Values = Record<keyof typeof labels, string>;
const emptyValues: Values = { pricePerProject: '', hoursPerProject: '' };
const reference = { monthlyBilling: 2687.65, billableHours: 100 };
const field = (key: keyof Values) => screen.getByRole('textbox', { name: labels[key] }) as HTMLInputElement;
const result = () => screen.getByRole('status');
const example = () => userEvent.click(screen.getByRole('button', { name: 'Probar un encargo ficticio' }));
const restore = () => userEvent.click(screen.getByRole('button', { name: 'Recuperar mis datos del encargo' }));
const check = () => userEvent.click(screen.getByRole('button', { name: 'Comprobar encargos' }));

function write(values: Values) {
  for (const key of Object.keys(labels) as (keyof Values)[]) fireEvent.change(field(key), { target: { value: values[key] } });
}

function currentValues(): Values {
  return Object.fromEntries(Object.keys(labels).map((key) => [key, field(key as keyof Values).value])) as Values;
}

function expectRecoveryFinished() {
  expect(screen.queryByRole('button', { name: 'Recuperar mis datos del encargo' })).not.toBeInTheDocument();
  expect(screen.queryByText(/sustituye los cambios que ves ahora/)).not.toBeInTheDocument();
  expect(screen.getAllByRole('status')).toHaveLength(1);
  expect(screen.getByRole('status', { name: 'Comprobación de encargos' })).toHaveTextContent('Datos del encargo recuperados. Vuelve a comprobarlos con la referencia mensual actual.');
  expect(within(result()).queryByRole('heading')).not.toBeInTheDocument();
  expect(result().querySelector('dl')).toBeNull();
  expect(result()).not.toHaveTextContent('Precio y horas del encargo ficticios');
  expect(result()).not.toHaveTextContent('Revisa los datos indicados');
  expect(field('pricePerProject')).toHaveFocus();
  for (const key of Object.keys(labels) as (keyof Values)[]) expect(field(key)).toHaveAttribute('aria-invalid', 'false');
}

describe('recover the offer replaced by the fictional project', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });
  afterEach(() => vi.restoreAllMocks());

  it('restores both raw fields without calculating, storing or sending unfinished personal data', async () => {
    const storageRead = vi.spyOn(Storage.prototype, 'getItem');
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const storageRemove = vi.spyOn(Storage.prototype, 'removeItem');
    const fetch = vi.spyOn(globalThis, 'fetch');
    const previousUrl = window.location.href;
    render(<Planner {...reference} />);
    const original: Values = { pricePerProject: ' 650,505 € ', hoursPerProject: '1,,5' };
    write(original);
    await example();
    expect(result()).toHaveTextContent('Precio y horas del encargo ficticios');
    const recovery = screen.getByRole('button', { name: 'Recuperar mis datos del encargo' });
    expect(recovery).toHaveAttribute('type', 'button');
    expect(recovery).toHaveAccessibleDescription(/sustituye los cambios que ves ahora/);
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
    render(<Planner {...reference} />);
    const original: Values = { pricePerProject: ' 650,505 ', hoursPerProject: '18,755' };
    write(original);
    await example();
    await example();
    fireEvent.change(field('hoursPerProject'), { target: { value: '50' } });
    await check();
    expect(result()).toHaveTextContent('Qué supone este encargo');
    await example();
    fireEvent.change(field('pricePerProject'), { target: { value: '1,,5' } });
    await check();
    expect(field('pricePerProject')).toHaveAttribute('aria-invalid', 'true');
    expect(result()).toHaveTextContent('Revisa los datos indicados');
    await restore();

    expect(currentValues()).toEqual(original);
    expectRecoveryFinished();
    await check();
    expect(result()).toHaveTextContent('Qué supone este encargo');
    expect(result()).not.toHaveTextContent('Precio y horas del encargo ficticios');
    expect(result()).not.toHaveTextContent('Datos del encargo recuperados');
  });

  it('does not offer recovery for an empty draft or repeated untouched examples', async () => {
    render(<Planner {...reference} />);
    expect(currentValues()).toEqual(emptyValues);
    expect(screen.queryByRole('button', { name: 'Recuperar mis datos del encargo' })).not.toBeInTheDocument();
    await example();
    await example();
    expect(result()).toHaveTextContent('Precio y horas del encargo ficticios');
    expect(screen.queryByRole('button', { name: 'Recuperar mis datos del encargo' })).not.toBeInTheDocument();
  });

  it('preserves a deliberate zero and an empty field without treating them as a valid offer', async () => {
    render(<Planner {...reference} />);
    fireEvent.change(field('pricePerProject'), { target: { value: '0' } });
    await example();
    await restore();

    expect(currentValues()).toEqual({ ...emptyValues, pricePerProject: '0' });
    expectRecoveryFinished();
    await check();
    expect(field('pricePerProject')).toHaveAttribute('aria-invalid', 'true');
    expect(result()).toHaveTextContent('Revisa los datos indicados');
    expect(result().querySelector('dl')).toBeNull();
  });

  it('consumes the recovery and captures new unfinished data for the next cycle', async () => {
    render(<Planner {...reference} />);
    write({ pricePerProject: '750', hoursPerProject: '20' });
    await example();
    await restore();
    expectRecoveryFinished();
    const nextDraft: Values = { pricePerProject: '', hoursPerProject: ' 1,255 ' };
    write(nextDraft);
    await example();
    await restore();

    expect(currentValues()).toEqual(nextDraft);
    expectRecoveryFinished();
  });

  it('recovers only personal fields and uses the current monthly reference when checked again', async () => {
    const { rerender } = render(<Planner {...reference} />);
    const original: Values = { pricePerProject: '600', hoursPerProject: '30' };
    write(original);
    await check();
    expect(result()).toHaveTextContent('806,30');
    await example();
    rerender(<Planner monthlyBilling={5000} billableHours={80} />);
    await restore();

    expect(currentValues()).toEqual(original);
    expectRecoveryFinished();
    expect(screen.getByText(/Referencia de este cálculo/)).toHaveTextContent('5000,00');
    expect(screen.getByText(/Referencia de este cálculo/)).toHaveTextContent('80 h');
    await check();
    expect(within(result()).getByText('Referencia para estas horas sin IVA').nextElementSibling).toHaveTextContent('1875,00');
    expect(within(result()).getByText('Horas que cubre este precio a tu referencia').nextElementSibling).toHaveTextContent('9,6 h');
    expect(result()).toHaveTextContent('9 × 600,00');
    expect(result()).not.toHaveTextContent('806,30');
    expect(result()).not.toHaveTextContent('Precio y horas del encargo ficticios');
    expect(result()).not.toHaveTextContent('Datos del encargo recuperados');
  });
});
