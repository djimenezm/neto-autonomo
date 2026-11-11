import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Planner from '@/components/DayRatePlanner';
import { dayRateCostExample, dayRateExample } from '@/lib/dayRateExample';

const labels = {
  hourlyRate: 'Tu referencia por hora sin IVA (EUR)',
  sessionHours: 'Horas de jornada con el cliente',
  preparationHours: 'Horas de preparación de este servicio',
  followUpHours: 'Horas de cierre y seguimiento',
  serviceCosts: 'Costes específicos que debe cubrir el precio (EUR)',
  proposedPrice: 'Precio que estás valorando sin IVA (EUR, opcional)',
} as const;
type Values = Record<keyof typeof labels, string>;
const field = (key: keyof Values) => screen.getByRole('textbox', { name: labels[key] }) as HTMLInputElement;
const check = () => userEvent.click(screen.getByRole('button', { name: 'Comprobar jornada' }));
const result = () => screen.getByRole('status', { name: 'Comprobación de jornada y costes' });
const form = () => screen.getByRole('form', { name: 'Comprobar una tarifa diaria' }) as HTMLFormElement;
const pending = () => screen.queryByText('Datos modificados. Pulsa «Comprobar jornada» para actualizar el resultado.');
const invalidFields = () => screen.getAllByRole('textbox').filter(input => input.getAttribute('aria-invalid') === 'true');
const change = (key: keyof Values, value: string) => fireEvent.change(field(key), { target: { value } });
function write(values: Values) {
  for (const key of Object.keys(labels) as (keyof Values)[]) change(key, values[key]);
}
const current = (): Values => Object.fromEntries(Object.keys(labels).map(key => [key, field(key as keyof Values).value])) as Values;
const valid: Values = { hourlyRate: '50', sessionHours: '8', preparationHours: '0', followUpHours: '0', serviceCosts: '0', proposedPrice: '' };
function expectNoResult() {
  expect(screen.queryByRole('heading', { name: 'Lo que supone esta jornada' })).not.toBeInTheDocument();
  expect(within(result()).queryByText('Referencia total: horas y costes')).not.toBeInTheDocument();
}
function renderPlanner() {
  render(<Planner example={dayRateExample} costExample={dayRateCostExample} />);
}

describe('current validation while correcting a daily-rate check', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });
  afterEach(() => vi.restoreAllMocks());

  it('leaves initial input quiet, then retains every other error while each required field is corrected', async () => {
    const user = userEvent.setup();
    renderPlanner();
    await user.type(field('hourlyRate'), '50');
    expect(invalidFields()).toHaveLength(0);
    expect(pending()).not.toBeInTheDocument();
    await user.clear(field('hourlyRate'));
    await check();
    expect(invalidFields()).toHaveLength(5);
    expect(field('hourlyRate')).toHaveFocus();
    for (const [index, key] of (['hourlyRate', 'sessionHours', 'preparationHours', 'followUpHours', 'serviceCosts'] as const).entries()) {
      await user.type(field(key), valid[key]);
      expect(field(key)).toHaveFocus();
      expect(field(key)).toHaveAccessibleName(labels[key]);
      expect(field(key)).toHaveAttribute('aria-invalid', 'false');
      expect(invalidFields()).toHaveLength(4 - index);
      expectNoResult();
    }
    expect(field('serviceCosts')).toHaveAccessibleDescription(/Solo costes de este servicio/);
    expect(field('proposedPrice')).toHaveAttribute('aria-invalid', 'false');
    expect(pending()).toBeVisible();
  });

  it('distinguishes an invalid optional price from a deliberate zero or no price without hiding required-field errors', async () => {
    renderPlanner();
    write({ ...valid, proposedPrice: '-1' });
    await check();
    expect(field('proposedPrice')).toHaveFocus();
    expect(field('proposedPrice')).toHaveAccessibleDescription(/precio de 0 o más, o deja el campo vacío/);
    change('sessionHours', '');
    expect(invalidFields()).toHaveLength(2);
    change('proposedPrice', '');
    expect(field('proposedPrice')).toHaveAttribute('aria-invalid', 'false');
    expect(field('sessionHours')).toHaveAttribute('aria-invalid', 'true');
    expect(pending()).not.toBeInTheDocument();
    change('sessionHours', '8');
    expect(pending()).toBeVisible();
    expectNoResult();
    await check();
    expect(within(result()).queryByText('Precio que estás valorando')).not.toBeInTheDocument();
    field('proposedPrice').focus();
    change('proposedPrice', '0');
    expect(field('proposedPrice')).toHaveFocus();
    expect(field('proposedPrice')).toHaveAttribute('aria-invalid', 'false');
    expect(pending()).toBeVisible();
    await check();
    expect(within(result()).getByText('Precio que estás valorando').nextElementSibling).toHaveTextContent('0,00');
    expect(result()).toHaveTextContent('Faltan 400,00');
    change('proposedPrice', '1,,25');
    expect(field('proposedPrice')).toHaveAttribute('aria-invalid', 'true');
    expectNoResult();
  });

  it('blocks incompatible units in all six fields, including a supplied optional price', async () => {
    const user = userEvent.setup();
    renderPlanner();
    const wrongUnits = {
      hourlyRate: '40 USD', sessionHours: '6 €', preparationHours: '1 %',
      followUpHours: '1 GBP', serviceCosts: '90 %', proposedPrice: '350 USD',
    };
    write({ ...wrongUnits, proposedPrice: '' });
    await user.click(field('proposedPrice'));
    await user.paste(wrongUnits.proposedPrice);
    await check();

    expect(current()).toEqual(wrongUnits);
    expect(invalidFields()).toHaveLength(6);
    expect(field('hourlyRate')).toHaveFocus();
    expect(field('hourlyRate')).toHaveAccessibleDescription(/referencia por hora en euros/);
    for (const key of ['sessionHours', 'preparationHours', 'followUpHours'] as const) {
      expect(field(key)).toHaveAccessibleDescription(/número de horas, sin moneda ni porcentaje/);
    }
    expect(field('serviceCosts')).toHaveAccessibleDescription(/costes en euros/);
    expect(field('proposedPrice')).toHaveAccessibleDescription(/precio en euros o deja el campo vacío/);
    expectNoResult();

    const corrected = {
      hourlyRate: 'EUR 40,00', sessionHours: '6', preparationHours: '1',
      followUpHours: '1', serviceCosts: '90 €', proposedPrice: wrongUnits.proposedPrice,
    };
    write(corrected);
    expect(invalidFields()).toEqual([field('proposedPrice')]);
    expect(pending()).not.toBeInTheDocument();
    await check();
    expect(field('proposedPrice')).toHaveFocus();
    expectNoResult();

    change('proposedPrice', 'EUR 350,00');
    expect(pending()).toBeVisible();
    expectNoResult();
    await check();
    expect(within(result()).getByText('Referencia total: horas y costes').nextElementSibling).toHaveTextContent('410,00');
    expect(within(result()).getByText('Por hora tras esos costes').nextElementSibling).toHaveTextContent('32,50');
    expect(result()).toHaveTextContent('Faltan 60,00');
  });

  it('keeps raw precision during invalid checks and live correction, normalizing only on a successful explicit check', async () => {
    renderPlanner();
    const raw = { hourlyRate: ' 50,005 € ', sessionHours: '25', preparationHours: '1,005', followUpHours: '0', serviceCosts: ' 1,005 ', proposedPrice: '' };
    write(raw);
    await check();
    expect(current()).toEqual(raw);
    expect(field('sessionHours')).toHaveFocus();
    expect(field('sessionHours')).toHaveAccessibleDescription(/entre 0,01 y 24 horas/);
    change('sessionHours', '6,005');
    expect(field('sessionHours')).toHaveFocus();
    expect(invalidFields()).toHaveLength(0);
    expect(current()).toEqual({ ...raw, sessionHours: '6,005' });
    expect(pending()).toBeVisible();
    expectNoResult();
    await check();
    expect(current()).toEqual({ hourlyRate: '50,01', sessionHours: '6,01', preparationHours: '1,01', followUpHours: '0', serviceCosts: '1,01', proposedPrice: '' });
    expect(screen.getByRole('heading', { name: 'Lo que supone esta jornada' })).toBeVisible();
    expect(pending()).not.toBeInTheDocument();
  });

  it('withdraws a checked result on edit and shows pending feedback after correction until a fresh submission', async () => {
    renderPlanner();
    write(valid);
    await check();
    expect(within(result()).getByText('Referencia total: horas y costes').nextElementSibling).toHaveTextContent('400,00');
    field('hourlyRate').focus();
    change('hourlyRate', '0');
    expect(field('hourlyRate')).toHaveFocus();
    expect(field('hourlyRate')).toHaveAttribute('aria-invalid', 'true');
    expectNoResult();
    change('hourlyRate', '50');
    expect(pending()).toBeVisible();
    change('serviceCosts', '25');
    expect(pending()).toBeVisible();
    expectNoResult();
    fireEvent.submit(form());
    expect(pending()).not.toBeInTheDocument();
    expect(within(result()).getByText('Referencia total: horas y costes').nextElementSibling).toHaveTextContent('425,00');
  });

  it('checks both examples explicitly and resets validation when recovering the independent personal draft', async () => {
    renderPlanner();
    const original = { ...valid, hourlyRate: ' 45,005 € ', preparationHours: '1,,25' };
    write(original);
    await check();
    expect(field('preparationHours')).toHaveAttribute('aria-invalid', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Cargar el ejemplo de la guía' }));
    expect(invalidFields()).toHaveLength(0);
    expect(result()).toHaveTextContent('Ejemplo hipotético');
    change('serviceCosts', '');
    expect(field('serviceCosts')).toHaveAttribute('aria-invalid', 'true');
    expectNoResult();
    await userEvent.click(screen.getByRole('button', { name: 'Probar el ejemplo con costes' }));
    expect(invalidFields()).toHaveLength(0);
    expect(field('serviceCosts')).toHaveValue('90');
    expect(result()).toHaveTextContent('Ejemplo hipotético');
    change('followUpHours', '-1');
    expect(field('followUpHours')).toHaveAttribute('aria-invalid', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Recuperar mi jornada anterior' }));
    expect(current()).toEqual(original);
    expect(field('hourlyRate')).toHaveFocus();
    expect(invalidFields()).toHaveLength(0);
    expect(result()).toBeEmptyDOMElement();
    change('hourlyRate', '0');
    expect(invalidFields()).toHaveLength(0);
    expect(pending()).not.toBeInTheDocument();
    fireEvent.submit(form());
    expect(field('hourlyRate')).toHaveFocus();
    expect(field('hourlyRate')).toHaveAttribute('aria-invalid', 'true');
    expect(field('preparationHours')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByRole('button', { name: 'Recuperar mi jornada anterior' })).not.toBeInTheDocument();
  });

  it('keeps submission local and unnamed while feedback changes, without storage, requests, URL changes or events', async () => {
    const storageRead = vi.spyOn(Storage.prototype, 'getItem');
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const storageRemove = vi.spyOn(Storage.prototype, 'removeItem');
    const fetch = vi.spyOn(globalThis, 'fetch');
    const previousUrl = window.location.href;
    renderPlanner();
    expect(fireEvent.submit(form())).toBe(false);
    expect(invalidFields()).toHaveLength(5);
    write(valid);
    expect(pending()).toBeVisible();
    expectNoResult();
    expect(fireEvent.submit(form())).toBe(false);
    expect(screen.getByRole('heading', { name: 'Lo que supone esta jornada' })).toBeVisible();
    expect([...new FormData(form()).entries()]).toEqual([]);
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
