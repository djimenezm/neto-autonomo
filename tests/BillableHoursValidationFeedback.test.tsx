import { fireEvent, render, screen, within } from '@testing-library/react';
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
const field = (key: keyof Values) => screen.getByRole('textbox', { name: labels[key] }) as HTMLInputElement;
const toggle = () => userEvent.click(screen.getByText('Estimar mis horas con mi agenda'));
const estimate = () => userEvent.click(screen.getByRole('button', { name: 'Estimar horas' }));
const applyButton = () => screen.queryByRole('button', { name: /Usar .* horas al mes/ });
const pending = () => screen.queryByText('Datos modificados. Pulsa «Estimar horas» para actualizar la capacidad.');
const invalidFields = () => within(screen.getByRole('group', { name: 'Tu agenda de trabajo' })).getAllByRole('textbox').filter(input => input.getAttribute('aria-invalid') === 'true');
const change = (key: keyof Values, value: string) => fireEvent.change(field(key), { target: { value } });
function write(values: Values) {
  for (const key of Object.keys(labels) as (keyof Values)[]) change(key, values[key]);
}
const valid: Values = { daysPerWeek: '5', hoursPerDay: '8', nonBillableHoursPerWeek: '12', weeksOff: '6' };
const current = (): Values => Object.fromEntries(Object.keys(labels).map(key => [key, field(key as keyof Values).value])) as Values;
function expectUnestimated() {
  expect(screen.queryByText(/Capacidad media:/)).not.toBeInTheDocument();
  expect(applyButton()).not.toBeInTheDocument();
}

describe('current agenda validation after an explicit estimation attempt', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });
  afterEach(() => vi.restoreAllMocks());

  it('leaves untouched fields quiet, then removes only corrected errors without moving the editing focus', async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    render(<Planner onApply={onApply} />);
    await toggle();
    await user.type(field('daysPerWeek'), '5');
    expect(invalidFields()).toHaveLength(0);
    expect(pending()).not.toBeInTheDocument();
    await user.clear(field('daysPerWeek'));
    await estimate();
    expect(invalidFields()).toHaveLength(4);
    expect(field('daysPerWeek')).toHaveFocus();
    for (const [index, key] of (Object.keys(labels) as (keyof Values)[]).entries()) {
      await user.type(field(key), valid[key]);
      expect(field(key)).toHaveFocus();
      expect(field(key)).toHaveAccessibleName(labels[key]);
      expect(field(key)).toHaveAttribute('aria-invalid', 'false');
      expect(field(key)).not.toHaveAccessibleDescription(/Introduce un número válido/);
      expect(invalidFields()).toHaveLength(3 - index);
      expectUnestimated();
    }
    expect(pending()).toBeVisible();
    expect(onApply).not.toHaveBeenCalled();
  });

  it('updates the non-billable-hours error when days or working hours change, without estimating automatically', async () => {
    render(<Planner onApply={vi.fn()} />);
    await toggle();
    write({ ...valid, hoursPerDay: '2' });
    await estimate();
    expect(field('nonBillableHoursPerWeek')).toHaveFocus();
    expect(field('nonBillableHoursPerWeek')).toHaveAccessibleDescription(/no pueden superar tu jornada semanal/);
    field('daysPerWeek').focus();
    change('daysPerWeek', '7');
    expect(field('daysPerWeek')).toHaveFocus();
    expect(field('nonBillableHoursPerWeek')).toHaveAttribute('aria-invalid', 'false');
    expect(pending()).toBeVisible();
    field('hoursPerDay').focus();
    change('hoursPerDay', '1');
    expect(field('hoursPerDay')).toHaveFocus();
    expect(field('nonBillableHoursPerWeek')).toHaveAttribute('aria-invalid', 'true');
    expect(field('nonBillableHoursPerWeek')).toHaveAccessibleDescription(/Gestión, captación, formación/);
    expect(field('nonBillableHoursPerWeek')).toHaveAccessibleDescription(/no pueden superar tu jornada semanal/);
    expect(pending()).not.toBeInTheDocument();
    field('nonBillableHoursPerWeek').focus();
    change('nonBillableHoursPerWeek', ' 6,5 ');
    expect(field('nonBillableHoursPerWeek')).toHaveFocus();
    expect(field('nonBillableHoursPerWeek')).toHaveValue(' 6,5 ');
    expect(field('nonBillableHoursPerWeek')).toHaveAttribute('aria-invalid', 'false');
    expect(pending()).toBeVisible();
    expectUnestimated();
  });

  it('removes a previous capacity immediately on an invalid edit and waits for estimation after correction before applying', async () => {
    const onApply = vi.fn();
    render(<Planner onApply={onApply} />);
    await toggle();
    write(valid);
    await estimate();
    expect(screen.getByRole('button', { name: 'Usar 107 horas al mes' })).toBeVisible();
    field('weeksOff').focus();
    change('weeksOff', '1,,5');
    expect(field('weeksOff')).toHaveFocus();
    expect(field('weeksOff')).toHaveAttribute('aria-invalid', 'true');
    expect(field('weeksOff')).toHaveAccessibleDescription(/Introduce un número válido/);
    expectUnestimated();
    change('weeksOff', '6');
    expect(field('weeksOff')).toHaveAttribute('aria-invalid', 'false');
    expect(pending()).toBeVisible();
    expectUnestimated();
    expect(onApply).not.toHaveBeenCalled();
    await estimate();
    expect(pending()).not.toBeInTheDocument();
    expect(screen.getByText(/Capacidad media:/)).toHaveTextContent('107,3 h/mes');
    expect(onApply).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Usar 107 horas al mes' }));
    expect(onApply).toHaveBeenCalledExactlyOnceWith(107);
    expect(screen.getByText('Estimar mis horas con mi agenda').closest('details')).not.toHaveAttribute('open');
  });

  it('validates a loaded example but resets live errors and results when the unfinished personal agenda is recovered', async () => {
    render(<Planner onApply={vi.fn()} />);
    await toggle();
    const original = { daysPerWeek: '8', hoursPerDay: '', nonBillableHoursPerWeek: '1,,25', weeksOff: '0' };
    write(original);
    await estimate();
    expect(invalidFields()).toHaveLength(3);
    await userEvent.click(screen.getByRole('button', { name: 'Probar un ejemplo' }));
    expect(invalidFields()).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Usar 107 horas al mes' })).toBeVisible();
    change('weeksOff', '53');
    expect(field('weeksOff')).toHaveAttribute('aria-invalid', 'true');
    expect(field('weeksOff')).toHaveAccessibleDescription(/El máximo es 52/);
    await userEvent.click(screen.getByRole('button', { name: 'Recuperar mi agenda anterior' }));
    expect(current()).toEqual(original);
    expect(field('daysPerWeek')).toHaveFocus();
    expect(invalidFields()).toHaveLength(0);
    expect(pending()).not.toBeInTheDocument();
    expectUnestimated();
    change('daysPerWeek', '9');
    expect(invalidFields()).toHaveLength(0);
    expect(pending()).not.toBeInTheDocument();
    fireEvent.keyDown(field('daysPerWeek'), { key: 'Enter' });
    expect(invalidFields()).toHaveLength(3);
    expect(field('daysPerWeek')).toHaveFocus();
    expect(field('daysPerWeek')).toHaveAccessibleDescription(/El máximo es 7/);
    expectUnestimated();
  });

  it('accepts zero-capacity edits as valid while keeping their new result behind explicit estimation', async () => {
    const onApply = vi.fn();
    render(<Planner onApply={onApply} />);
    await toggle();
    write(valid);
    await estimate();
    change('weeksOff', '52');
    expect(invalidFields()).toHaveLength(0);
    expect(pending()).toBeVisible();
    expectUnestimated();
    await estimate();
    expect(pending()).not.toBeInTheDocument();
    expect(screen.getByText(/Capacidad media:/)).toHaveTextContent('0 h/mes');
    expect(screen.getByText(/No hay una hora mensual completa disponible/)).toBeVisible();
    expect(applyButton()).not.toBeInTheDocument();
    change('weeksOff', '6');
    expect(pending()).toBeVisible();
    expectUnestimated();
    expect(onApply).not.toHaveBeenCalled();
  });

  it('keeps main hours, summary and URL unchanged during feedback and estimation, applying only on the explicit button', async () => {
    const storageRead = vi.spyOn(Storage.prototype, 'getItem');
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const storageRemove = vi.spyOn(Storage.prototype, 'removeItem');
    const fetch = vi.spyOn(globalThis, 'fetch');
    render(<CalculatorForm initiallySubmitted initialValues={{ targetNet: '2000', monthlyExpenses: '300', billableHours: '80', irpfMode: 'manual', irpfRate: '15', selfEmployedFeeMode: 'manual', selfEmployedFee: '320' }} initialShareUrl="https://www.cuantofacturar.es/?targetNet=2000#calculadora" />);
    const summary = screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement;
    const originalSummary = summary.value;
    const previousUrl = window.location.href;
    const form = screen.getByRole('form', { name: 'Calculadora de facturación' });
    const submit = vi.fn();
    form.addEventListener('submit', submit);
    await toggle();
    write({ ...valid, nonBillableHoursPerWeek: '' });
    fireEvent.keyDown(field('weeksOff'), { key: 'Enter' });
    expect(field('nonBillableHoursPerWeek')).toHaveFocus();
    change('nonBillableHoursPerWeek', '12');
    expect(pending()).toBeVisible();
    expectUnestimated();
    await estimate();
    expect(screen.getByRole('button', { name: 'Usar 107 horas al mes' })).toBeVisible();
    expect(screen.getByRole('spinbutton', { name: 'Horas facturables al mes' })).toHaveValue(80);
    expect(screen.getByRole('heading', { name: 'Tu referencia mensual para presupuestar' })).toBeVisible();
    expect(summary).toHaveValue(originalSummary);
    for (const input of within(screen.getByRole('group', { name: 'Tu agenda de trabajo' })).getAllByRole('textbox')) expect(input).not.toHaveAttribute('name');
    await userEvent.click(screen.getByRole('button', { name: 'Usar 107 horas al mes' }));
    expect(screen.getByRole('spinbutton', { name: 'Horas facturables al mes' })).toHaveValue(107);
    expect(screen.queryByRole('heading', { name: 'Tu referencia mensual para presupuestar' })).not.toBeInTheDocument();
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
