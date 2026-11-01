import { fireEvent, render, screen } from '@testing-library/react';
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
const emptyValues: Values = { hourlyRate: '', sessionHours: '', preparationHours: '', followUpHours: '', serviceCosts: '', proposedPrice: '' };
const field = (key: keyof Values) => screen.getByRole('textbox', { name: labels[key] }) as HTMLInputElement;
const result = () => screen.getByRole('status', { name: 'Comprobación de jornada y costes' });
const guideExample = () => userEvent.click(screen.getByRole('button', { name: 'Cargar el ejemplo de la guía' }));
const costExample = () => userEvent.click(screen.getByRole('button', { name: 'Probar el ejemplo con costes' }));
const restore = () => userEvent.click(screen.getByRole('button', { name: 'Recuperar mi jornada anterior' }));
const check = () => userEvent.click(screen.getByRole('button', { name: 'Comprobar jornada' }));

function write(values: Values) {
  for (const key of Object.keys(labels) as (keyof Values)[]) {
    fireEvent.change(field(key), { target: { value: values[key] } });
  }
}

function currentValues(): Values {
  return Object.fromEntries(Object.keys(labels).map((key) => [key, field(key as keyof Values).value])) as Values;
}

function expectRecoveryFinished() {
  expect(screen.queryByRole('button', { name: 'Recuperar mi jornada anterior' })).not.toBeInTheDocument();
  expect(result()).toBeEmptyDOMElement();
  expect(screen.getByRole('status', { name: 'Recuperación de la jornada' })).toHaveTextContent(/Jornada anterior recuperada/);
  expect(field('hourlyRate')).toHaveFocus();
  for (const key of Object.keys(labels) as (keyof Values)[]) expect(field(key)).toHaveAttribute('aria-invalid', 'false');
}

describe('recover the personal day-rate draft replaced by an example', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });
  afterEach(() => vi.restoreAllMocks());

  it('recovers all six raw fields, including incomplete text and an empty optional price, without storage or events', async () => {
    const storageRead = vi.spyOn(Storage.prototype, 'getItem');
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const storageRemove = vi.spyOn(Storage.prototype, 'removeItem');
    const fetch = vi.spyOn(globalThis, 'fetch');
    const previousUrl = window.location.href;
    render(<Planner example={dayRateExample} costExample={dayRateCostExample} />);
    const original: Values = { hourlyRate: ' 45,005 € ', sessionHours: '6,50', preparationHours: '1,,25', followUpHours: ' 0,50 ', serviceCosts: '90,005', proposedPrice: '' };
    write(original);
    await costExample();

    expect(result()).toHaveTextContent('Ejemplo hipotético');
    expect(screen.getByRole('button', { name: 'Recuperar mi jornada anterior' })).toHaveAccessibleDescription(/sustituye los cambios que ves ahora/);
    await restore();

    expect(currentValues()).toEqual(original);
    expectRecoveryFinished();
    expect(screen.getAllByRole('textbox')).toHaveLength(6);
    expect(document.querySelector('[name]')).toBeNull();
    expect(window.location.href).toBe(previousUrl);
    expect(storageRead).not.toHaveBeenCalled();
    expect(storageWrite).not.toHaveBeenCalled();
    expect(storageRemove).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('keeps the first snapshot through both examples, edits and valid or invalid checks, and clears the old error on recovery', async () => {
    render(<Planner example={dayRateExample} costExample={dayRateCostExample} />);
    const original: Values = { hourlyRate: '50,125', sessionHours: ' 7,5 ', preparationHours: '1,25', followUpHours: '0', serviceCosts: ' 125,5 ', proposedPrice: '600,50' };
    write(original);
    await guideExample();
    await costExample();
    fireEvent.change(field('serviceCosts'), { target: { value: '17,005' } });
    await check();
    expect(result()).toHaveTextContent('Lo que supone esta jornada');
    await guideExample();
    fireEvent.change(field('preparationHours'), { target: { value: '1,,5' } });
    await check();
    expect(field('preparationHours')).toHaveAttribute('aria-invalid', 'true');
    expect(result()).toHaveTextContent('Revisa los campos indicados');
    await restore();

    expect(currentValues()).toEqual(original);
    expectRecoveryFinished();
    await check();
    expect(result()).toHaveTextContent('Lo que supone esta jornada');
    expect(result()).not.toHaveTextContent('Ejemplo hipotético');
  });

  it('does not offer a personal recovery when starting empty and alternating only fictional examples', async () => {
    render(<Planner example={dayRateExample} costExample={dayRateCostExample} />);
    expect(currentValues()).toEqual(emptyValues);
    expect(screen.queryByRole('button', { name: 'Recuperar mi jornada anterior' })).not.toBeInTheDocument();
    await guideExample();
    await costExample();
    expect(result()).toHaveTextContent('Ejemplo hipotético');
    expect(screen.queryByRole('button', { name: 'Recuperar mi jornada anterior' })).not.toBeInTheDocument();
  });

  it('treats a deliberate zero as a personal draft even while the other fields are empty', async () => {
    render(<Planner example={dayRateExample} costExample={dayRateCostExample} />);
    fireEvent.change(field('serviceCosts'), { target: { value: '0' } });
    await costExample();
    await restore();

    expect(currentValues()).toEqual({ ...emptyValues, serviceCosts: '0' });
    expectRecoveryFinished();
  });

  it('consumes the first copy and recovers a newly edited draft in the next example cycle', async () => {
    render(<Planner example={dayRateExample} costExample={dayRateCostExample} />);
    write({ hourlyRate: '40', sessionHours: '8', preparationHours: '1', followUpHours: '0', serviceCosts: '15', proposedPrice: '450' });
    await guideExample();
    await restore();
    expectRecoveryFinished();
    const nextDraft: Values = { hourlyRate: ' 61,005 ', sessionHours: '4,5', preparationHours: '', followUpHours: '0', serviceCosts: '23,125', proposedPrice: '1,,50' };
    write(nextDraft);
    await costExample();
    await restore();

    expect(currentValues()).toEqual(nextDraft);
    expectRecoveryFinished();
  });
});
