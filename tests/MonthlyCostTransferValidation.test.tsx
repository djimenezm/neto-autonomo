import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MonthlyCostCalculator from '@/components/MonthlyCostCalculator';

const fee = () => screen.getByRole('textbox', { name: 'Cuota de autónomos' });
const hours = () => screen.getByRole('textbox', { name: 'Horas facturables al mes' });
const deductible = () => screen.getByRole('textbox', { name: 'Gastos deducibles, sin incluir la cuota' });
const submit = () => userEvent.click(screen.getByRole('button', { name: 'Usar estos datos en mi tarifa' }));
const change = (field: HTMLElement, value: string) => fireEvent.change(field, { target: { value } });
const feeMessage = 'Indica una cuota mensual mayor que cero para trasladar este cálculo.';

describe('accessible correction of the monthly cost transfer', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });
  afterEach(() => vi.restoreAllMocks());

  it.each(['0', '0,004'])('keeps fee %j valid for planning and points to its transfer error only on submission', async (amount) => {
    render(<MonthlyCostCalculator />);
    change(fee(), amount);
    change(deductible(), '100');
    expect(screen.getByText('Media mensual antes de pagarte').parentElement).toHaveTextContent('160,00');
    expect(screen.getByText('Al año según las frecuencias').nextElementSibling).toHaveTextContent('1920,00');
    expect(fee()).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await submit();

    expect(fee()).toHaveFocus();
    expect(fee()).toHaveValue(amount);
    expect(fee()).toHaveAttribute('aria-invalid', 'true');
    expect(fee()).toHaveAttribute('aria-describedby', expect.stringContaining('monthly-cost-fee-error'));
    expect(fee()).toHaveAccessibleDescription(expect.stringContaining(feeMessage));
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'monthly-cost-fee-error');
    expect(screen.getByRole('alert')).toHaveTextContent(feeMessage);
    expect(screen.getByText('Media mensual antes de pagarte').parentElement).toHaveTextContent('160,00');
  });

  it('marks all simultaneous transfer errors but focuses the fee first and retains the open breakdown', async () => {
    render(<MonthlyCostCalculator />);
    change(fee(), '0');
    change(hours(), '');
    const breakdown = screen.getByText('Ver cómo se reparte el coste anual');
    await userEvent.click(breakdown);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await submit();

    expect(fee()).toHaveFocus();
    for (const field of [fee(), hours(), deductible()]) expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getAllByRole('alert')).toHaveLength(3);
    expect(fee()).toHaveAccessibleDescription(expect.stringContaining(feeMessage));
    expect(hours()).toHaveAccessibleDescription(/Indica un número válido de horas mayor que cero/);
    expect(deductible()).toHaveAccessibleDescription(/Indica un importe deducible entre 0 y 160,00/);
    expect(deductible()).toHaveAccessibleDescription(/Escribe 0 si ninguno es deducible/);
    expect(deductible()).toHaveAttribute('aria-describedby', expect.stringContaining('deductible-expenses-error'));
    expect(deductible()).toHaveAttribute('aria-describedby', expect.stringContaining('deductible-expenses-hint'));
    expect(document.getElementById('deductible-expenses-error')).toHaveAttribute('role', 'alert');
    expect(breakdown.closest('details')).toHaveAttribute('open');
    expect(screen.getByRole('region', { name: 'Desglose de pagos de actividad' })).toBeVisible();
    expect(screen.getByText('Media mensual antes de pagarte').parentElement).toHaveTextContent('160,00');
    expect(hours()).toHaveValue('');
    expect(deductible()).toHaveValue('');
  });

  it('moves through fee, fractional hours and deductible errors and clears each one without stealing focus', async () => {
    const user = userEvent.setup();
    const { container } = render(<MonthlyCostCalculator />);
    change(fee(), '0');
    change(hours(), '1,5');
    change(deductible(), '200');
    await submit();
    expect(fee()).toHaveFocus();

    await user.clear(fee());
    await user.type(fee(), '320');
    expect(fee()).toHaveFocus();
    expect(fee()).toHaveAttribute('aria-invalid', 'false');
    expect(document.getElementById('monthly-cost-fee-error')).not.toBeInTheDocument();
    expect(screen.getAllByRole('alert')).toHaveLength(2);
    await submit();
    expect(hours()).toHaveFocus();
    expect(hours()).toHaveAccessibleDescription(/Usa un número entero de horas mayor que cero/);

    await user.clear(hours());
    await user.type(hours(), '80');
    expect(hours()).toHaveFocus();
    expect(hours()).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    await submit();
    expect(deductible()).toHaveFocus();
    await user.clear(deductible());
    await user.type(deductible(), '100');

    expect(deductible()).toHaveFocus();
    expect(deductible()).toHaveAttribute('aria-invalid', 'false');
    expect(deductible()).not.toHaveAttribute('aria-describedby', expect.stringContaining('deductible-expenses-error'));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Datos que se trasladarán a la tarifa' })).toHaveTextContent('100,00');
    const form = container.querySelector('form')!;
    expect(form).toHaveAttribute('action', '/#calculadora');
    expect(form).toHaveAttribute('method', 'get');
    expect(Object.fromEntries(new FormData(form))).toEqual({ source: 'monthly-costs', monthlyExpenses: '100.00', monthlyNonDeductibleExpenses: '60.00', billableHours: '80', selfEmployedFeeMode: 'manual', selfEmployedFee: '320.00' });
  });

  it('focuses the deductible field and links its only error when submitting with Enter', async () => {
    const user = userEvent.setup();
    render(<MonthlyCostCalculator />);
    await user.click(deductible());
    await user.keyboard('{Enter}');

    expect(deductible()).toHaveFocus();
    expect(deductible()).toHaveAttribute('aria-invalid', 'true');
    expect(deductible()).toHaveAccessibleDescription(/Escribe 0 si ninguno es deducible/);
    expect(deductible()).toHaveAccessibleDescription(/Indica un importe deducible entre 0 y 160,00/);
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'deductible-expenses-error');
    expect(screen.getByRole('alert')).toHaveTextContent('Indica un importe deducible entre 0 y 160,00');
  });

  it('updates the deductible limit after a payment change while preserving its raw draft and the active field', async () => {
    const user = userEvent.setup();
    const { container } = render(<MonthlyCostCalculator />);
    change(deductible(), ' 200,005 ');
    await submit();
    expect(deductible()).toHaveFocus();
    const software = screen.getByRole('textbox', { name: 'Software y herramientas' });
    await user.clear(software);
    await user.type(software, '0');

    expect(software).toHaveFocus();
    expect(deductible()).toHaveValue(' 200,005 ');
    expect(deductible()).toHaveAccessibleDescription(/Indica un importe deducible entre 0 y 125,00/);
    expect(screen.getByRole('alert')).toHaveTextContent('125,00');
    expect(screen.getByText('Media mensual antes de pagarte').parentElement).toHaveTextContent('445,00');
    expect(container.querySelector('[name="monthlyExpenses"]')).toHaveValue('');
    await submit();
    expect(deductible()).toHaveFocus();
    await user.clear(deductible());
    await user.type(deductible(), '125');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(container.querySelector('[name="monthlyExpenses"]')).toHaveValue('125.00');
    expect(container.querySelector('[name="monthlyNonDeductibleExpenses"]')).toHaveValue('0.00');
  });

  it('preserves precise inputs and canonical GET values without storage, network, tracking or URL changes', async () => {
    const storageRead = vi.spyOn(Storage.prototype, 'getItem');
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const storageRemove = vi.spyOn(Storage.prototype, 'removeItem');
    const fetch = vi.spyOn(globalThis, 'fetch');
    const previousUrl = window.location.href;
    const { container } = render(<MonthlyCostCalculator />);
    change(fee(), ' 128,075 ');
    change(hours(), ' 080,00 ');
    change(screen.getByRole('textbox', { name: 'Otros gastos de actividad' }), '80');
    change(deductible(), '-0,001');
    await submit();
    expect(deductible()).toHaveFocus();
    expect(deductible()).toHaveAccessibleDescription(/Indica un importe deducible entre 0 y 200,00/);
    change(deductible(), ' 128,075 ');

    expect(fee()).toHaveValue(' 128,075 ');
    expect(hours()).toHaveValue(' 080,00 ');
    expect(deductible()).toHaveValue(' 128,075 ');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('Media mensual antes de pagarte').parentElement).toHaveTextContent('328,08');
    expect(Object.fromEntries(new FormData(container.querySelector('form')!))).toEqual({ source: 'monthly-costs', monthlyExpenses: '128.08', monthlyNonDeductibleExpenses: '71.92', billableHours: '80', selfEmployedFeeMode: 'manual', selfEmployedFee: '128.08' });
    expect(window.location.href).toBe(previousUrl);
    expect(storageRead).not.toHaveBeenCalled();
    expect(storageWrite).not.toHaveBeenCalled();
    expect(storageRemove).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });
});
