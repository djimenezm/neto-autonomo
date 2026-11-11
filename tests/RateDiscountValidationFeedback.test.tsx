import { fireEvent, render, screen, within } from '@testing-library/react';
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
const field = (key: keyof Values) => screen.getByRole('textbox', { name: labels[key] }) as HTMLInputElement;
const result = () => screen.getByRole('status', { name: 'Rebaja de tarifa y capacidad' });
const check = () => userEvent.click(screen.getByRole('button', { name: 'Comprobar rebaja de tarifa' }));
const example = () => userEvent.click(screen.getByRole('button', { name: 'Probar la rebaja ficticia del 10 %' }));
const pending = () => screen.queryByText('Datos modificados. Pulsa «Comprobar rebaja de tarifa» para actualizar el resultado.');
const invalidFields = () => screen.getAllByRole('textbox').filter(input => input.getAttribute('aria-invalid') === 'true');
const change = (key: keyof Values, value: string) => fireEvent.change(field(key), { target: { value } });
function write(values: Values) {
  for (const key of Object.keys(labels) as (keyof Values)[]) change(key, values[key]);
}
const current = (): Values => Object.fromEntries(Object.keys(labels).map(key => [key, field(key as keyof Values).value])) as Values;
const valid: Values = { hourlyRate: '40', discountPercent: '10', currentHours: '80', capacityHours: '80' };
function expectNoComparison() {
  expect(within(result()).queryByText('Tarifa tras la rebaja, redondeada')).not.toBeInTheDocument();
  expect(within(result()).queryByText('Horas para recuperar el valor de partida')).not.toBeInTheDocument();
}

describe('current validation while correcting a rate-discount comparison', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });
  afterEach(() => vi.restoreAllMocks());

  it('leaves initial input quiet and retains the other three errors after fixing only the rate without stealing focus', async () => {
    const user = userEvent.setup();
    render(<Planner />);
    await user.type(field('hourlyRate'), '40');
    expect(invalidFields()).toHaveLength(0);
    expect(pending()).not.toBeInTheDocument();
    await user.clear(field('hourlyRate'));
    await check();
    expect(invalidFields()).toHaveLength(4);
    expect(field('hourlyRate')).toHaveFocus();
    await user.type(field('hourlyRate'), '40');
    expect(field('hourlyRate')).toHaveFocus();
    expect(field('hourlyRate')).toHaveAttribute('aria-invalid', 'false');
    expect(invalidFields()).toHaveLength(3);
    expect(field('capacityHours')).toHaveAccessibleName(labels.capacityHours);
    expect(field('capacityHours')).toHaveAccessibleDescription(/incluidas las que ya vendes/);
    expect(field('capacityHours')).toHaveAccessibleDescription(/entre 0 y 744 horas/);
    for (const key of ['discountPercent', 'currentHours', 'capacityHours'] as const) {
      await user.type(field(key), valid[key]);
      expect(field(key)).toHaveFocus();
      expect(field(key)).toHaveAttribute('aria-invalid', 'false');
    }
    expect(field('capacityHours')).not.toHaveAccessibleDescription(/Indica entre 0 y 744/);
    expect(invalidFields()).toHaveLength(0);
    expect(pending()).toBeVisible();
    expectNoComparison();
  });

  it('distinguishes valid zero discount and capacity from invalid zero rate or hours and accepts a full discount explicitly', async () => {
    render(<Planner />);
    write({ hourlyRate: '0', discountPercent: '0', currentHours: '0', capacityHours: '0' });
    await check();
    expect(invalidFields()).toHaveLength(2);
    expect(field('discountPercent')).toHaveAttribute('aria-invalid', 'false');
    expect(field('capacityHours')).toHaveAttribute('aria-invalid', 'false');
    change('hourlyRate', '40');
    expect(field('currentHours')).toHaveAttribute('aria-invalid', 'true');
    expect(invalidFields()).toHaveLength(1);
    change('currentHours', '80');
    expect(invalidFields()).toHaveLength(0);
    expect(pending()).toBeVisible();
    expectNoComparison();
    await check();
    expect(result()).toHaveTextContent('Las horas de partida ya superan la capacidad');
    change('discountPercent', '101');
    expect(field('discountPercent')).toHaveAttribute('aria-invalid', 'true');
    expectNoComparison();
    change('discountPercent', '100');
    expect(invalidFields()).toHaveLength(0);
    expect(pending()).toBeVisible();
    await check();
    expect(within(result()).getByText('Horas para recuperar el valor de partida').nextElementSibling).toHaveTextContent('No se recupera con tarifa cero');
    expect(result()).toHaveTextContent('La tarifa cero no permite recuperar la facturación');
    expect(result()).not.toHaveTextContent(/Infinity|NaN/);
    change('hourlyRate', '0,01');
    change('currentHours', '0,01');
    expect(field('currentHours')).toHaveAttribute('aria-invalid', 'true');
    expect(field('currentHours')).toHaveAccessibleDescription(/tarifa y las horas deben sumar al menos 0,01 EUR/);
    field('hourlyRate').focus();
    change('hourlyRate', '1');
    expect(field('hourlyRate')).toHaveFocus();
    expect(field('currentHours')).toHaveAttribute('aria-invalid', 'false');
    expect(pending()).toBeVisible();
    expectNoComparison();
  });

  it('rejects swapped units until all four fields are corrected and checked again', async () => {
    const user = userEvent.setup();
    render(<Planner />);
    write(valid);
    await check();
    expect(within(result()).getByText('Tarifa tras la rebaja, redondeada')).toBeVisible();

    const wrongUnits = { hourlyRate: '40 USD', discountPercent: '10 EUR', currentHours: '80 €', capacityHours: '80 %' };
    await user.clear(field('hourlyRate'));
    await user.paste(wrongUnits.hourlyRate);
    change('discountPercent', wrongUnits.discountPercent);
    change('currentHours', wrongUnits.currentHours);
    change('capacityHours', wrongUnits.capacityHours);
    await check();

    expect(current()).toEqual(wrongUnits);
    expect(invalidFields()).toHaveLength(4);
    expect(field('hourlyRate')).toHaveFocus();
    expect(field('hourlyRate')).toHaveAccessibleDescription(/tarifa en euros/);
    expect(field('discountPercent')).toHaveAccessibleDescription(/Introduce un porcentaje/);
    expect(field('currentHours')).toHaveAccessibleDescription(/número de horas, sin moneda ni porcentaje/);
    expect(field('capacityHours')).toHaveAccessibleDescription(/número de horas, sin moneda ni porcentaje/);
    expectNoComparison();

    change('hourlyRate', 'EUR 40,00');
    expect(field('hourlyRate')).toHaveAttribute('aria-invalid', 'false');
    expect(invalidFields()).toHaveLength(3);
    expect(field('discountPercent')).toHaveAccessibleDescription(/Introduce un porcentaje/);
    expectNoComparison();
    change('discountPercent', '10 %');
    change('currentHours', '80');
    change('capacityHours', '80');
    expect(pending()).toBeVisible();
    expectNoComparison();

    await user.type(field('capacityHours'), '{Enter}');
    expect(within(result()).getByText('Tarifa tras la rebaja, redondeada').nextElementSibling).toHaveTextContent('36,00');
    expect(within(result()).getByText('Horas para recuperar el valor de partida').nextElementSibling).toHaveTextContent('88,89 h');
    expect(result()).toHaveTextContent('No cabe en esa capacidad: faltan 8,89 h');
  });

  it('keeps raw precision during invalid checks and correction, normalizing all four inputs only on a successful check', async () => {
    render(<Planner />);
    const raw = { hourlyRate: ' 37,165 € ', discountPercent: '12,345', currentHours: '8,235', capacityHours: '745' };
    write(raw);
    await check();
    expect(field('capacityHours')).toHaveFocus();
    expect(current()).toEqual(raw);
    expect(field('capacityHours')).toHaveAttribute('aria-invalid', 'true');
    change('capacityHours', '10,234');
    expect(field('capacityHours')).toHaveFocus();
    expect(invalidFields()).toHaveLength(0);
    expect(current()).toEqual({ ...raw, capacityHours: '10,234' });
    expect(pending()).toBeVisible();
    expectNoComparison();
    await check();
    expect(current()).toEqual({ hourlyRate: '37,17', discountPercent: '12,35', currentHours: '8,24', capacityHours: '10,23' });
    expect(within(result()).getByText('Tarifa tras la rebaja, redondeada').nextElementSibling).toHaveTextContent('32,58');
    expect(pending()).not.toBeInTheDocument();
  });

  it('withdraws previous figures on any edit and waits for Enter or the check button after correcting an invalid percentage', async () => {
    render(<Planner />);
    write(valid);
    await check();
    expect(result()).toHaveTextContent('No cabe en esa capacidad: faltan 8,89 h');
    field('capacityHours').focus();
    change('capacityHours', '100');
    expect(field('capacityHours')).toHaveFocus();
    expect(pending()).toBeVisible();
    expectNoComparison();
    fireEvent.keyDown(field('capacityHours'), { key: 'Enter' });
    expect(pending()).not.toBeInTheDocument();
    expect(result()).toHaveTextContent('Cabe por horas; quedarían 11,11 h');
    change('discountPercent', '1,,5');
    expect(field('discountPercent')).toHaveAttribute('aria-invalid', 'true');
    expectNoComparison();
    expect(pending()).not.toBeInTheDocument();
    change('discountPercent', '0');
    expect(pending()).toBeVisible();
    expectNoComparison();
    await check();
    expect(within(result()).getByText('Tarifa tras la rebaja, redondeada').nextElementSibling).toHaveTextContent('40,00');
  });

  it('checks the example explicitly and recovers the first unfinished comparison with validation quiet until another attempt', async () => {
    render(<Planner />);
    const original = { hourlyRate: ' 40,005 € ', discountPercent: '1,,5', currentHours: '', capacityHours: '0' };
    write(original);
    await check();
    expect(invalidFields()).toHaveLength(2);
    await example();
    expect(invalidFields()).toHaveLength(0);
    expect(result()).toHaveTextContent('Tarifa, rebaja y horas ficticias');
    change('currentHours', '0');
    expect(field('currentHours')).toHaveAttribute('aria-invalid', 'true');
    expectNoComparison();
    await example();
    expect(invalidFields()).toHaveLength(0);
    await userEvent.click(screen.getByRole('button', { name: 'Recuperar mi comparación anterior' }));
    expect(current()).toEqual(original);
    expect(field('hourlyRate')).toHaveFocus();
    expect(invalidFields()).toHaveLength(0);
    expect(pending()).not.toBeInTheDocument();
    expectNoComparison();
    change('hourlyRate', '0');
    expect(invalidFields()).toHaveLength(0);
    fireEvent.keyDown(field('hourlyRate'), { key: 'Enter' });
    expect(field('hourlyRate')).toHaveFocus();
    expect(invalidFields()).toHaveLength(3);
    expectNoComparison();
  });

  it('keeps feedback and keyboard checks local without named fields, URL changes, storage, requests or events', async () => {
    const storageRead = vi.spyOn(Storage.prototype, 'getItem');
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const storageRemove = vi.spyOn(Storage.prototype, 'removeItem');
    const fetch = vi.spyOn(globalThis, 'fetch');
    const previousUrl = window.location.href;
    render(<Planner />);
    expect(fireEvent.keyDown(field('capacityHours'), { key: 'Enter' })).toBe(false);
    expect(invalidFields()).toHaveLength(4);
    write(valid);
    expect(pending()).toBeVisible();
    expectNoComparison();
    expect(fireEvent.keyDown(field('capacityHours'), { key: 'Enter' })).toBe(false);
    expect(within(result()).getByText('Tarifa tras la rebaja, redondeada')).toBeVisible();
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
