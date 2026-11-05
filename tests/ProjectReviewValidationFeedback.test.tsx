import { fireEvent, render, screen, within } from '@testing-library/react';
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
const field = (key: keyof Values) => screen.getByRole('textbox', { name: labels[key] }) as HTMLInputElement;
const result = () => screen.getByRole('status', { name: 'Revisión del encargo' });
const check = () => userEvent.click(screen.getByRole('button', { name: 'Revisar encargo' }));
const example = () => userEvent.click(screen.getByRole('button', { name: 'Probar el ejemplo de 400 €' }));
const pending = () => screen.queryByText('Datos modificados. Pulsa «Revisar encargo» para actualizar el resultado.');
const invalidFields = () => screen.getAllByRole('textbox').filter(input => input.getAttribute('aria-invalid') === 'true');
const change = (key: keyof Values, value: string) => fireEvent.change(field(key), { target: { value } });
function write(values: Values) {
  for (const key of Object.keys(labels) as (keyof Values)[]) change(key, values[key]);
}
const current = (): Values => Object.fromEntries(Object.keys(labels).map(key => [key, field(key as keyof Values).value])) as Values;
const valid: Values = { hourlyReference: '40', finalPrice: '400', plannedHours: '8', actualHours: '12' };
function expectNoReview() {
  expect(within(result()).queryByText('Ingreso por hora con el tiempo real')).not.toBeInTheDocument();
  expect(within(result()).queryByText('Importe a tu referencia para el tiempo real')).not.toBeInTheDocument();
}

describe('current validation while correcting a completed-project review', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });
  afterEach(() => vi.restoreAllMocks());

  it('leaves initial input quiet and retains three unfinished errors after correcting the hourly reference without stealing focus', async () => {
    const user = userEvent.setup();
    render(<Review />);
    await user.type(field('hourlyReference'), '40');
    expect(invalidFields()).toHaveLength(0);
    expect(pending()).not.toBeInTheDocument();
    await user.clear(field('hourlyReference'));
    await check();
    expect(invalidFields()).toHaveLength(4);
    expect(field('hourlyReference')).toHaveFocus();
    await user.type(field('hourlyReference'), '40');
    expect(field('hourlyReference')).toHaveFocus();
    expect(field('hourlyReference')).toHaveAttribute('aria-invalid', 'false');
    expect(invalidFields()).toHaveLength(3);
    expect(field('actualHours')).toHaveAccessibleName(labels.actualHours);
    expect(field('actualHours')).toHaveAccessibleDescription(/Todo el tiempo dedicado a ese cliente/);
    expect(field('actualHours')).toHaveAccessibleDescription(/Indica al menos 0,01 horas/);
    for (const key of ['finalPrice', 'plannedHours', 'actualHours'] as const) {
      await user.type(field(key), valid[key]);
      expect(field(key)).toHaveFocus();
      expect(field(key)).toHaveAttribute('aria-invalid', 'false');
    }
    expect(field('actualHours')).not.toHaveAccessibleDescription(/Indica al menos 0,01 horas/);
    expect(invalidFields()).toHaveLength(0);
    expect(pending()).toBeVisible();
    expectNoReview();
  });

  it('accepts a free completed project but requires positive reference and hours, including the existing hundredth minimum', async () => {
    render(<Review />);
    write({ hourlyReference: '0', finalPrice: '0', plannedHours: '0', actualHours: '0' });
    await check();
    expect(invalidFields()).toHaveLength(3);
    expect(field('finalPrice')).toHaveAttribute('aria-invalid', 'false');
    change('hourlyReference', '0,01');
    expect(field('hourlyReference')).toHaveFocus();
    expect(invalidFields()).toHaveLength(2);
    change('plannedHours', '0,01');
    expect(field('actualHours')).toHaveAttribute('aria-invalid', 'true');
    change('actualHours', '0,01');
    expect(invalidFields()).toHaveLength(0);
    expect(pending()).toBeVisible();
    expectNoReview();
    await check();
    expect(within(result()).getByText('Ingreso por hora con el tiempo real').nextElementSibling).toHaveTextContent('0,00');
    expect(result()).not.toHaveTextContent(/Infinity|NaN/);
    change('actualHours', '1000');
    expect(field('actualHours')).toHaveAttribute('aria-invalid', 'false');
    expect(pending()).toBeVisible();
    expectNoReview();
  });

  it('preserves raw precision through a failed review and correction, normalizing all values only on successful review', async () => {
    render(<Review />);
    const raw = { hourlyReference: ' 40,005 € ', finalPrice: '400,005', plannedHours: '8,125', actualHours: '' };
    write(raw);
    await check();
    expect(field('actualHours')).toHaveFocus();
    expect(current()).toEqual(raw);
    change('actualHours', '12,345');
    expect(field('actualHours')).toHaveFocus();
    expect(current()).toEqual({ ...raw, actualHours: '12,345' });
    expect(pending()).toBeVisible();
    expectNoReview();
    await check();
    expect(current()).toEqual({ hourlyReference: '40,01', finalPrice: '400,01', plannedHours: '8,13', actualHours: '12,35' });
    expect(within(result()).getByText('Ingreso por hora con el tiempo real')).toBeVisible();
    expect(pending()).not.toBeInTheDocument();
  });

  it('withdraws old figures on edit and waits for explicit checking after both valid changes and invalid-input correction', async () => {
    render(<Review />);
    write(valid);
    await check();
    expect(within(result()).getByText('Ingreso por hora con el tiempo real').nextElementSibling).toHaveTextContent('33,33');
    field('actualHours').focus();
    change('actualHours', '6');
    expect(field('actualHours')).toHaveFocus();
    expect(pending()).toBeVisible();
    expectNoReview();
    fireEvent.keyDown(field('actualHours'), { key: 'Enter' });
    expect(pending()).not.toBeInTheDocument();
    expect(within(result()).getByText('Ingreso por hora con el tiempo real').nextElementSibling).toHaveTextContent('66,67');
    change('plannedHours', '0');
    expect(field('plannedHours')).toHaveAttribute('aria-invalid', 'true');
    expectNoReview();
    change('plannedHours', '8');
    expect(pending()).toBeVisible();
    expectNoReview();
    await check();
    expect(within(result()).getByText('Diferencia de horas frente a lo previsto').nextElementSibling).toHaveTextContent('-2 h');
  });

  it('checks the example explicitly and recovers the independent first raw draft with validation quiet until another review', async () => {
    render(<Review />);
    const original = { hourlyReference: ' 40,005 € ', finalPrice: '400', plannedHours: '1,,25', actualHours: '' };
    write(original);
    await check();
    expect(invalidFields()).toHaveLength(2);
    await example();
    expect(invalidFields()).toHaveLength(0);
    expect(result()).toHaveTextContent('Ejemplo ficticio');
    change('actualHours', '0');
    expect(field('actualHours')).toHaveAttribute('aria-invalid', 'true');
    expectNoReview();
    await example();
    expect(invalidFields()).toHaveLength(0);
    await userEvent.click(screen.getByRole('button', { name: 'Recuperar mi revisión anterior' }));
    expect(current()).toEqual(original);
    expect(field('hourlyReference')).toHaveFocus();
    expect(invalidFields()).toHaveLength(0);
    expect(pending()).not.toBeInTheDocument();
    expectNoReview();
    change('finalPrice', '-1');
    expect(invalidFields()).toHaveLength(0);
    fireEvent.keyDown(field('finalPrice'), { key: 'Enter' });
    expect(field('finalPrice')).toHaveFocus();
    expect(invalidFields()).toHaveLength(3);
    expectNoReview();
  });

  it('keeps feedback and keyboard review local without form fields, URL mutations, storage, requests or events', async () => {
    const storageRead = vi.spyOn(Storage.prototype, 'getItem');
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const storageRemove = vi.spyOn(Storage.prototype, 'removeItem');
    const fetch = vi.spyOn(globalThis, 'fetch');
    const previousUrl = window.location.href;
    render(<Review />);
    expect(fireEvent.keyDown(field('actualHours'), { key: 'Enter' })).toBe(false);
    expect(invalidFields()).toHaveLength(4);
    write(valid);
    expect(pending()).toBeVisible();
    expectNoReview();
    expect(fireEvent.keyDown(field('actualHours'), { key: 'Enter' })).toBe(false);
    expect(within(result()).getByText('Ingreso por hora con el tiempo real')).toBeVisible();
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
