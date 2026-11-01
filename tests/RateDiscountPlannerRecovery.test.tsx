import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Planner from '@/components/RateDiscountPlanner';

const labels = {
  hourlyRate: 'Tarifa actual por hora sin IVA (EUR)',
  discountPercent: 'Rebaja que quieres comprobar (%)',
  currentHours: 'Horas facturadas en el mes de partida',
  capacityHours: 'Capacidad mensual para facturar horas (horas)',
} as const;
type Values = Record<keyof typeof labels, string>;
const emptyValues: Values = { hourlyRate: '', discountPercent: '', currentHours: '', capacityHours: '' };
const field = (key: keyof Values) => screen.getByRole('textbox', { name: labels[key] }) as HTMLInputElement;
const result = () => screen.getByRole('status', { name: 'Rebaja de tarifa y capacidad' });
const example = () => userEvent.click(screen.getByRole('button', { name: 'Probar la rebaja ficticia del 10 %' }));
const restore = () => userEvent.click(screen.getByRole('button', { name: 'Recuperar mi comparación anterior' }));
const check = () => userEvent.click(screen.getByRole('button', { name: 'Comprobar rebaja de tarifa' }));

function write(values: Values) {
  for (const key of Object.keys(labels) as (keyof Values)[]) fireEvent.change(field(key), { target: { value: values[key] } });
}

function currentValues(): Values {
  return Object.fromEntries(Object.keys(labels).map((key) => [key, field(key as keyof Values).value])) as Values;
}

function expectRecoveryFinished() {
  expect(screen.queryByRole('button', { name: 'Recuperar mi comparación anterior' })).not.toBeInTheDocument();
  expect(screen.queryByText(/sustituye los cambios que ves ahora/)).not.toBeInTheDocument();
  expect(result()).toBeEmptyDOMElement();
  expect(screen.getByRole('status', { name: 'Recuperación de la comparación' })).toHaveTextContent('Comparación anterior recuperada. Vuelve a comprobar la rebaja para actualizar los resultados.');
  expect(field('hourlyRate')).toHaveFocus();
  for (const key of Object.keys(labels) as (keyof Values)[]) expect(field(key)).toHaveAttribute('aria-invalid', 'false');
}

describe('recover the rate comparison replaced by the fictional discount example', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });
  afterEach(() => vi.restoreAllMocks());

  it('restores all four raw fields without calculating, storing or sending incomplete personal data', async () => {
    const storageRead = vi.spyOn(Storage.prototype, 'getItem');
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const storageRemove = vi.spyOn(Storage.prototype, 'removeItem');
    const fetch = vi.spyOn(globalThis, 'fetch');
    const previousUrl = window.location.href;
    render(<Planner />);
    const original: Values = { hourlyRate: ' 37,165 € ', discountPercent: '12,345', currentHours: '1,,25', capacityHours: '' };
    write(original);
    await example();
    expect(result()).toHaveTextContent('Tarifa, rebaja y horas ficticias; no son una recomendación de precio.');
    const recovery = screen.getByRole('button', { name: 'Recuperar mi comparación anterior' });
    expect(recovery).toHaveAttribute('type', 'button');
    expect(recovery).toHaveAccessibleDescription(/sustituye los cambios que ves ahora/);
    await restore();

    expect(currentValues()).toEqual(original);
    expectRecoveryFinished();
    expect(screen.getAllByRole('textbox')).toHaveLength(4);
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

  it('keeps the first snapshot through repeated examples, edits and valid or invalid comparisons, clearing old results and errors', async () => {
    render(<Planner />);
    const original: Values = { hourlyRate: ' 37,165 ', discountPercent: '12,345', currentHours: '70,125', capacityHours: '112,505' };
    write(original);
    await example();
    await example();
    fireEvent.change(field('capacityHours'), { target: { value: '120,005' } });
    await check();
    expect(result()).toHaveTextContent('Tarifa tras la rebaja, redondeada');
    await example();
    fireEvent.change(field('discountPercent'), { target: { value: '1,,5' } });
    await check();
    expect(field('discountPercent')).toHaveAttribute('aria-invalid', 'true');
    expect(result()).toHaveTextContent('Revisa los datos indicados');
    await restore();

    expect(currentValues()).toEqual(original);
    expectRecoveryFinished();
    await check();
    expect(result()).toHaveTextContent('Tarifa tras la rebaja, redondeada');
    expect(result()).not.toHaveTextContent('Tarifa, rebaja y horas ficticias; no son una recomendación de precio.');
  });

  it('does not offer a personal recovery for an empty draft or repeated untouched examples', async () => {
    render(<Planner />);
    expect(currentValues()).toEqual(emptyValues);
    expect(screen.queryByRole('button', { name: 'Recuperar mi comparación anterior' })).not.toBeInTheDocument();
    await example();
    await example();
    expect(result()).toHaveTextContent('Tarifa, rebaja y horas ficticias; no son una recomendación de precio.');
    expect(screen.queryByRole('button', { name: 'Recuperar mi comparación anterior' })).not.toBeInTheDocument();
  });

  it('keeps a deliberate zero discount while the reference and hours are still incomplete', async () => {
    render(<Planner />);
    fireEvent.change(field('discountPercent'), { target: { value: '0' } });
    await example();
    await restore();

    expect(currentValues()).toEqual({ ...emptyValues, discountPercent: '0' });
    expectRecoveryFinished();
  });

  it('consumes recovery and captures a new comparison for the next example cycle', async () => {
    render(<Planner />);
    write({ hourlyRate: '50', discountPercent: '15', currentHours: '65', capacityHours: '100' });
    await example();
    await restore();
    expectRecoveryFinished();
    const nextDraft: Values = { hourlyRate: ' 55,125 ', discountPercent: '0', currentHours: '', capacityHours: '1,,5' };
    write(nextDraft);
    await example();
    await restore();

    expect(currentValues()).toEqual(nextDraft);
    expectRecoveryFinished();
  });
});
