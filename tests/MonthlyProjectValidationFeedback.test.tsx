import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Planner from '@/components/MonthlyProjectPlanner';
import CalculatorForm from '@/components/CalculatorForm';

const labels = {
  pricePerProject: 'Precio por encargo sin IVA (EUR)',
  hoursPerProject: 'Horas totales por encargo',
} as const;
type Values = Record<keyof typeof labels, string>;
const reference = { monthlyBilling: 3000, billableHours: 100 };
const field = (key: keyof Values) => screen.getByRole('textbox', { name: labels[key] }) as HTMLInputElement;
const check = () => userEvent.click(screen.getByRole('button', { name: 'Comprobar encargos' }));
const result = () => screen.getByRole('status', { name: 'Comprobación de encargos' });
const example = () => userEvent.click(screen.getByRole('button', { name: 'Probar un encargo ficticio' }));
const pending = () => screen.queryByText('Datos modificados. Pulsa «Comprobar encargos» para actualizar el resultado.');
const invalidFields = () => within(screen.getByRole('group', { name: 'El encargo que quieres valorar' })).getAllByRole('textbox').filter(input => input.getAttribute('aria-invalid') === 'true');
const change = (key: keyof Values, value: string) => fireEvent.change(field(key), { target: { value } });
function write(values: Values) {
  for (const key of Object.keys(labels) as (keyof Values)[]) change(key, values[key]);
}
const current = (): Values => ({ pricePerProject: field('pricePerProject').value, hoursPerProject: field('hoursPerProject').value });
function expectNoResult() {
  expect(within(result()).queryByRole('heading', { name: 'Qué supone este encargo' })).not.toBeInTheDocument();
  expect(within(result()).queryByText('Encargos completos para alcanzar el importe')).not.toBeInTheDocument();
}

describe('current feedback while correcting a fixed-price project', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });
  afterEach(() => vi.restoreAllMocks());

  it('leaves initial inputs quiet and retains the unfinished hours error when only the price is corrected', async () => {
    const user = userEvent.setup();
    render(<Planner {...reference} />);
    await user.type(field('pricePerProject'), '600');
    expect(invalidFields()).toHaveLength(0);
    expect(pending()).not.toBeInTheDocument();
    await user.clear(field('pricePerProject'));
    await check();
    expect(invalidFields()).toHaveLength(2);
    expect(field('pricePerProject')).toHaveFocus();
    await user.type(field('pricePerProject'), '600');
    expect(field('pricePerProject')).toHaveFocus();
    expect(field('pricePerProject')).toHaveAttribute('aria-invalid', 'false');
    expect(field('hoursPerProject')).toHaveAttribute('aria-invalid', 'true');
    expect(field('hoursPerProject')).toHaveAccessibleName(labels.hoursPerProject);
    expect(field('hoursPerProject')).toHaveAccessibleDescription(/Incluye preparación, reuniones, ejecución/);
    expect(field('hoursPerProject')).toHaveAccessibleDescription(/al menos 0,01 horas/);
    await user.type(field('hoursPerProject'), '20');
    expect(field('hoursPerProject')).toHaveFocus();
    expect(invalidFields()).toHaveLength(0);
    expect(field('hoursPerProject')).not.toHaveAccessibleDescription(/al menos 0,01 horas/);
    expect(pending()).toBeVisible();
    expectNoResult();
  });

  it('keeps zero price and zero hours invalid independently, accepting positive corrections without calculating automatically', async () => {
    render(<Planner {...reference} />);
    write({ pricePerProject: '0', hoursPerProject: '0' });
    await check();
    expect(invalidFields()).toHaveLength(2);
    change('pricePerProject', '600');
    expect(field('pricePerProject')).toHaveFocus();
    expect(field('pricePerProject')).toHaveAttribute('aria-invalid', 'false');
    expect(field('hoursPerProject')).toHaveAttribute('aria-invalid', 'true');
    change('hoursPerProject', '20');
    expect(invalidFields()).toHaveLength(0);
    expect(pending()).toBeVisible();
    expectNoResult();
    change('pricePerProject', '0');
    expect(field('pricePerProject')).toHaveAttribute('aria-invalid', 'true');
    expect(field('hoursPerProject')).toHaveAttribute('aria-invalid', 'false');
    expect(pending()).not.toBeInTheDocument();
    change('pricePerProject', '600');
    await check();
    expect(within(result()).getByText('Encargos completos para alcanzar el importe').nextElementSibling).toHaveTextContent('5');
  });

  it('preserves raw precision through correction and successful checks, withdrawing old results until Enter recomputes them', async () => {
    render(<Planner {...reference} />);
    const raw = { pricePerProject: ' 600,005 € ', hoursPerProject: '20,005' };
    write(raw);
    await check();
    expect(current()).toEqual(raw);
    expect(result()).toHaveTextContent('5 × 600,01');
    field('hoursPerProject').focus();
    change('hoursPerProject', '1,,25');
    expect(field('hoursPerProject')).toHaveFocus();
    expect(field('hoursPerProject')).toHaveAttribute('aria-invalid', 'true');
    expectNoResult();
    change('hoursPerProject', ' 30,005 ');
    expect(field('hoursPerProject')).toHaveFocus();
    expect(invalidFields()).toHaveLength(0);
    expect(current()).toEqual({ ...raw, hoursPerProject: ' 30,005 ' });
    expect(pending()).toBeVisible();
    expectNoResult();
    fireEvent.keyDown(field('hoursPerProject'), { key: 'Enter' });
    expect(pending()).not.toBeInTheDocument();
    expect(current()).toEqual({ ...raw, hoursPerProject: ' 30,005 ' });
    expect(within(result()).getByText('Horas que requieren').nextElementSibling).toHaveTextContent('150,05 h');
  });

  it('checks the example explicitly and resets live errors on recovery while using the current monthly reference', async () => {
    const { rerender } = render(<Planner {...reference} />);
    const original = { pricePerProject: ' 600 ', hoursPerProject: '' };
    write(original);
    await check();
    expect(field('hoursPerProject')).toHaveAttribute('aria-invalid', 'true');
    await example();
    expect(invalidFields()).toHaveLength(0);
    expect(result()).toHaveTextContent('Precio y horas del encargo ficticios');
    change('hoursPerProject', '0');
    expect(field('hoursPerProject')).toHaveAttribute('aria-invalid', 'true');
    expectNoResult();
    rerender(<Planner monthlyBilling={5000} billableHours={80} />);
    await userEvent.click(screen.getByRole('button', { name: 'Recuperar mis datos del encargo' }));
    expect(current()).toEqual(original);
    expect(field('pricePerProject')).toHaveFocus();
    expect(invalidFields()).toHaveLength(0);
    expect(pending()).not.toBeInTheDocument();
    expectNoResult();
    change('hoursPerProject', '20');
    expect(invalidFields()).toHaveLength(0);
    expect(pending()).not.toBeInTheDocument();
    await check();
    expect(screen.getByText(/Referencia de este cálculo/)).toHaveTextContent('5000,00');
    expect(result()).toHaveTextContent('9 × 600,00');
    expect(result()).not.toHaveTextContent('Precio y horas del encargo ficticios');
  });

  it('preserves raw inputs and validation when either reference changes, updating a checked result but leaving edits pending', async () => {
    const { rerender } = render(<Planner {...reference} />);
    const raw = { pricePerProject: ' 600 ', hoursPerProject: '20,00' };
    write(raw);
    await check();
    expect(result()).toHaveTextContent('5 × 600,00');
    field('pricePerProject').focus();
    rerender(<Planner monthlyBilling={5000} billableHours={80} />);
    expect(current()).toEqual(raw);
    expect(field('pricePerProject')).toHaveFocus();
    expect(result()).toHaveTextContent('9 × 600,00');
    change('hoursPerProject', '0');
    expect(field('hoursPerProject')).toHaveAttribute('aria-invalid', 'true');
    rerender(<Planner monthlyBilling={5000} billableHours={60} />);
    expect(current()).toEqual({ ...raw, hoursPerProject: '0' });
    expect(field('hoursPerProject')).toHaveAttribute('aria-invalid', 'true');
    expectNoResult();
    change('hoursPerProject', '20,00');
    expect(pending()).toBeVisible();
    rerender(<Planner monthlyBilling={6000} billableHours={60} />);
    expect(current()).toEqual(raw);
    expect(pending()).toBeVisible();
    expectNoResult();
    await check();
    expect(result()).toHaveTextContent('10 × 600,00');
  });

  it('keeps feedback, checking and invalid edits separate from the main result, GET, storage, requests and events', async () => {
    const storageRead = vi.spyOn(Storage.prototype, 'getItem');
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const storageRemove = vi.spyOn(Storage.prototype, 'removeItem');
    const fetch = vi.spyOn(globalThis, 'fetch');
    render(<CalculatorForm initiallySubmitted initialValues={{ targetNet: '1500', monthlyExpenses: '150', billableHours: '70', irpfMode: 'manual', irpfRate: '15', selfEmployedFeeMode: 'manual', selfEmployedFee: '320' }} initialShareUrl="https://www.cuantofacturar.es/?targetNet=1500#calculadora" />);
    const summary = screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement;
    const originalSummary = summary.value;
    const previousUrl = window.location.href;
    const form = screen.getByRole('form', { name: 'Calculadora de facturación' }) as HTMLFormElement;
    const originalData = [...new FormData(form).entries()];
    const submit = vi.fn();
    form.addEventListener('submit', submit);
    await userEvent.click(screen.getByText('Comprobar cuántos encargos necesito y si caben'));
    write({ pricePerProject: '600', hoursPerProject: '' });
    fireEvent.keyDown(field('hoursPerProject'), { key: 'Enter' });
    expect(field('hoursPerProject')).toHaveAttribute('aria-invalid', 'true');
    change('hoursPerProject', '20');
    expect(pending()).toBeVisible();
    expectNoResult();
    expect(fireEvent.keyDown(field('hoursPerProject'), { key: 'Enter' })).toBe(false);
    expect(within(result()).getByRole('heading', { name: 'Qué supone este encargo' })).toBeVisible();
    change('pricePerProject', '0');
    expect(field('pricePerProject')).toHaveAttribute('aria-invalid', 'true');
    expectNoResult();
    expect(screen.getByRole('heading', { name: 'Tu referencia mensual para presupuestar' })).toBeVisible();
    expect(summary).toHaveValue(originalSummary);
    expect([...new FormData(form).entries()]).toEqual(originalData);
    for (const input of within(screen.getByRole('group', { name: 'El encargo que quieres valorar' })).getAllByRole('textbox')) expect(input).not.toHaveAttribute('name');
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
