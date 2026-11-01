import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Review from '@/components/ProjectReview';

const labels = {
  hourlyReference: 'Tu referencia por hora sin IVA (EUR)',
  finalPrice: 'Precio final pactado sin IVA (EUR)',
  plannedHours: 'Horas previstas del encargo',
  actualHours: 'Horas reales registradas',
} as const;
type Values = Record<keyof typeof labels, string>;
const emptyValues: Values = { hourlyReference: '', finalPrice: '', plannedHours: '', actualHours: '' };
const field = (key: keyof Values) => screen.getByRole('textbox', { name: labels[key] }) as HTMLInputElement;
const result = () => screen.getByRole('status', { name: 'Revisión del encargo' });
const example = () => userEvent.click(screen.getByRole('button', { name: 'Probar el ejemplo de 400 €' }));
const restore = () => userEvent.click(screen.getByRole('button', { name: 'Recuperar mi revisión anterior' }));
const check = () => userEvent.click(screen.getByRole('button', { name: 'Revisar encargo' }));

function write(values: Values) {
  for (const key of Object.keys(labels) as (keyof Values)[]) fireEvent.change(field(key), { target: { value: values[key] } });
}

function currentValues(): Values {
  return Object.fromEntries(Object.keys(labels).map((key) => [key, field(key as keyof Values).value])) as Values;
}

function expectRecoveryFinished() {
  expect(screen.queryByRole('button', { name: 'Recuperar mi revisión anterior' })).not.toBeInTheDocument();
  expect(screen.queryByText(/sustituye los cambios que ves ahora/)).not.toBeInTheDocument();
  expect(result()).toBeEmptyDOMElement();
  expect(screen.getByRole('status', { name: 'Recuperación de la revisión' })).toHaveTextContent('Revisión anterior recuperada. Vuelve a revisar el encargo para actualizar los resultados.');
  expect(field('hourlyReference')).toHaveFocus();
  for (const key of Object.keys(labels) as (keyof Values)[]) expect(field(key)).toHaveAttribute('aria-invalid', 'false');
}

describe('recover the completed-project review replaced by the fictional example', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });
  afterEach(() => vi.restoreAllMocks());

  it('restores all four raw fields without calculating or sending incomplete personal data', async () => {
    const storageRead = vi.spyOn(Storage.prototype, 'getItem');
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const storageRemove = vi.spyOn(Storage.prototype, 'removeItem');
    const fetch = vi.spyOn(globalThis, 'fetch');
    const previousUrl = window.location.href;
    render(<Review />);
    const original: Values = { hourlyReference: ' 40,005 € ', finalPrice: '500,125', plannedHours: '1,,25', actualHours: '' };
    write(original);
    await example();
    expect(result()).toHaveTextContent('Ejemplo ficticio; no es una tarifa recomendada.');
    expect(screen.getByRole('button', { name: 'Recuperar mi revisión anterior' })).toHaveAccessibleDescription(/sustituye los cambios que ves ahora/);
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

  it('keeps the first snapshot through repeated examples, edits and valid or invalid reviews, clearing old results and errors', async () => {
    render(<Review />);
    const original: Values = { hourlyReference: ' 40,005 ', finalPrice: '425,50', plannedHours: '8,125', actualHours: '10,500' };
    write(original);
    await example();
    await example();
    fireEvent.change(field('actualHours'), { target: { value: '15,005' } });
    await check();
    expect(result()).toHaveTextContent('Ingreso por hora con el tiempo real');
    await example();
    fireEvent.change(field('plannedHours'), { target: { value: '1,,5' } });
    await check();
    expect(field('plannedHours')).toHaveAttribute('aria-invalid', 'true');
    expect(result()).toHaveTextContent('Revisa los campos indicados');
    await restore();

    expect(currentValues()).toEqual(original);
    expectRecoveryFinished();
    await check();
    expect(result()).toHaveTextContent('Ingreso por hora con el tiempo real');
    expect(result()).not.toHaveTextContent('Ejemplo ficticio; no es una tarifa recomendada.');
  });

  it('does not offer a personal recovery for an empty draft or repeated untouched examples', async () => {
    render(<Review />);
    expect(currentValues()).toEqual(emptyValues);
    expect(screen.queryByRole('button', { name: 'Recuperar mi revisión anterior' })).not.toBeInTheDocument();
    await example();
    await example();
    expect(result()).toHaveTextContent('Ejemplo ficticio; no es una tarifa recomendada.');
    expect(screen.queryByRole('button', { name: 'Recuperar mi revisión anterior' })).not.toBeInTheDocument();
  });

  it('keeps a deliberate zero price while the reference and hours are still incomplete', async () => {
    render(<Review />);
    fireEvent.change(field('finalPrice'), { target: { value: '0' } });
    await example();
    await restore();

    expect(currentValues()).toEqual({ ...emptyValues, finalPrice: '0' });
    expectRecoveryFinished();
  });

  it('consumes recovery and captures a new review for the next example cycle', async () => {
    render(<Review />);
    write({ hourlyReference: '40', finalPrice: '500', plannedHours: '10', actualHours: '12' });
    await example();
    await restore();
    expectRecoveryFinished();
    const nextDraft: Values = { hourlyReference: ' 55,125 ', finalPrice: '0', plannedHours: '', actualHours: '1,,5' };
    write(nextDraft);
    await example();
    await restore();

    expect(currentValues()).toEqual(nextDraft);
    expectRecoveryFinished();
  });
});
