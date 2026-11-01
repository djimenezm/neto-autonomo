import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Planner from '@/components/BillableHoursPlanner';
import CalculatorForm from '@/components/CalculatorForm';

const labels = {
  daysPerWeek: 'Días de trabajo por semana',
  hoursPerDay: 'Horas de trabajo por día',
  nonBillableHoursPerWeek: 'Horas no facturables por semana',
  weeksOff: 'Semanas sin actividad al año',
} as const;
type Values = Record<keyof typeof labels, string>;
const emptyValues: Values = { daysPerWeek: '', hoursPerDay: '', nonBillableHoursPerWeek: '', weeksOff: '' };
const field = (key: keyof Values) => screen.getByRole('textbox', { name: labels[key] }) as HTMLInputElement;
const example = () => userEvent.click(screen.getByRole('button', { name: 'Probar un ejemplo' }));
const restore = () => userEvent.click(screen.getByRole('button', { name: 'Recuperar mi agenda anterior' }));
const estimate = () => userEvent.click(screen.getByRole('button', { name: 'Estimar horas' }));
const toggle = () => userEvent.click(screen.getByText('Estimar mis horas con mi agenda'));

function write(values: Values) {
  for (const key of Object.keys(labels) as (keyof Values)[]) fireEvent.change(field(key), { target: { value: values[key] } });
}

function currentValues(): Values {
  return Object.fromEntries(Object.keys(labels).map((key) => [key, field(key as keyof Values).value])) as Values;
}

function expectRecoveryFinished() {
  expect(screen.queryByRole('button', { name: 'Recuperar mi agenda anterior' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Usar .* horas al mes/ })).not.toBeInTheDocument();
  expect(screen.queryByText(/Capacidad media:/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Ejemplo hipotético; ajústalo a tu actividad/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Revisa los datos de la agenda/)).not.toBeInTheDocument();
  const feedback = screen.getByLabelText('Recuperación de la agenda');
  expect(feedback).toHaveTextContent('Agenda anterior recuperada. Vuelve a estimarla antes de usar sus horas.');
  expect(feedback).toHaveAttribute('aria-live', 'polite');
  expect(feedback).not.toHaveAttribute('role', 'status');
  expect(field('daysPerWeek')).toHaveFocus();
  for (const key of Object.keys(labels) as (keyof Values)[]) expect(field(key)).toHaveAttribute('aria-invalid', 'false');
}

describe('recover the agenda replaced by the fictional example', () => {
  beforeEach(() => {
    window.va = vi.fn();
    window.gtag = vi.fn();
    window.history.replaceState(null, '', '/');
  });
  afterEach(() => vi.restoreAllMocks());

  it('restores all four raw fields without estimating, applying, storing or sending the draft', async () => {
    const storageRead = vi.spyOn(Storage.prototype, 'getItem');
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const storageRemove = vi.spyOn(Storage.prototype, 'removeItem');
    const fetch = vi.spyOn(globalThis, 'fetch');
    const onApply = vi.fn();
    const previousUrl = window.location.href;
    render(<Planner onApply={onApply} />);
    await toggle();
    const original: Values = { daysPerWeek: ' 4,5 ', hoursPerDay: '6,500', nonBillableHoursPerWeek: '1,,25', weeksOff: '' };
    write(original);
    await example();
    expect(screen.getByRole('button', { name: 'Usar 107 horas al mes' })).toBeVisible();
    await restore();

    expect(currentValues()).toEqual(original);
    expectRecoveryFinished();
    expect(onApply).not.toHaveBeenCalled();
    for (const key of Object.keys(labels) as (keyof Values)[]) expect(field(key)).not.toHaveAttribute('name');
    expect(document.querySelector('form')).toBeNull();
    expect(window.location.href).toBe(previousUrl);
    expect(storageRead).not.toHaveBeenCalled();
    expect(storageWrite).not.toHaveBeenCalled();
    expect(storageRemove).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('keeps the first copy through repeated examples and valid or invalid estimates, clearing old errors and example results', async () => {
    const onApply = vi.fn();
    render(<Planner onApply={onApply} />);
    await toggle();
    const original: Values = { daysPerWeek: ' 4 ', hoursPerDay: '4,00', nonBillableHoursPerWeek: '4,800', weeksOff: '7,0' };
    write(original);
    await example();
    await example();
    fireEvent.change(field('weeksOff'), { target: { value: '6,5' } });
    await estimate();
    expect(screen.getByText(/Capacidad media:/)).toBeVisible();
    await example();
    fireEvent.change(field('nonBillableHoursPerWeek'), { target: { value: '1,,5' } });
    await estimate();
    expect(field('nonBillableHoursPerWeek')).toHaveAttribute('aria-invalid', 'true');
    await restore();

    expect(currentValues()).toEqual(original);
    expectRecoveryFinished();
    expect(onApply).not.toHaveBeenCalled();
    await estimate();
    expect(screen.getByRole('button', { name: 'Usar 42 horas al mes' })).toBeVisible();
    expect(screen.queryByText(/Ejemplo hipotético; ajústalo a tu actividad/)).not.toBeInTheDocument();
  });

  it('ignores an empty draft and untouched examples but keeps a deliberate zero', async () => {
    const onApply = vi.fn();
    render(<Planner onApply={onApply} />);
    await toggle();
    expect(currentValues()).toEqual(emptyValues);
    await example();
    await example();
    expect(screen.queryByRole('button', { name: 'Recuperar mi agenda anterior' })).not.toBeInTheDocument();
    write({ ...emptyValues, daysPerWeek: '0' });
    await example();
    await restore();

    expect(currentValues()).toEqual({ ...emptyValues, daysPerWeek: '0' });
    expectRecoveryFinished();
    expect(onApply).not.toHaveBeenCalled();
  });

  it('consumes the old copy and captures a different draft in the next example cycle', async () => {
    const onApply = vi.fn();
    render(<Planner onApply={onApply} />);
    await toggle();
    write({ daysPerWeek: '4', hoursPerDay: '4', nonBillableHoursPerWeek: '4,8', weeksOff: '7' });
    await example();
    await restore();
    expectRecoveryFinished();
    const nextDraft: Values = { daysPerWeek: '', hoursPerDay: ' 7,125 ', nonBillableHoursPerWeek: '1,,50', weeksOff: '0' };
    write(nextDraft);
    await example();
    await restore();

    expect(currentValues()).toEqual(nextDraft);
    expectRecoveryFinished();
    expect(onApply).not.toHaveBeenCalled();
  });

  it('recovers the personal agenda after applying 107 example hours and waits for explicit estimation and application of 42 hours', async () => {
    render(<CalculatorForm initiallySubmitted initialValues={{ irpfMode: 'manual', irpfRate: '15', selfEmployedFeeMode: 'manual', selfEmployedFee: '320' }} />);
    const previousUrl = window.location.href;
    const submit = vi.fn();
    screen.getByRole('form').addEventListener('submit', submit);
    const hours = screen.getByRole('spinbutton', { name: 'Horas facturables al mes' });
    const details = screen.getByText('Estimar mis horas con mi agenda').closest('details')!;
    await toggle();
    const ownAgenda: Values = { daysPerWeek: '4', hoursPerDay: '4', nonBillableHoursPerWeek: '4,8', weeksOff: '7' };
    write(ownAgenda);
    await example();
    await userEvent.click(screen.getByRole('button', { name: 'Usar 107 horas al mes' }));
    expect(hours).toHaveValue(107);
    expect(details).not.toHaveAttribute('open');
    await toggle();
    await restore();

    expect(currentValues()).toEqual(ownAgenda);
    expectRecoveryFinished();
    expect(hours).toHaveValue(107);
    expect(screen.queryByRole('heading', { name: 'Tu referencia mensual para presupuestar' })).not.toBeInTheDocument();
    await estimate();
    expect(screen.getByRole('button', { name: 'Usar 42 horas al mes' })).toBeVisible();
    expect(hours).toHaveValue(107);
    await userEvent.click(screen.getByRole('button', { name: 'Usar 42 horas al mes' }));

    expect(hours).toHaveValue(42);
    expect(hours).toHaveFocus();
    expect(details).not.toHaveAttribute('open');
    expect(screen.queryByRole('heading', { name: 'Tu referencia mensual para presupuestar' })).not.toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
    expect(window.location.href).toBe(previousUrl);
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });
});
