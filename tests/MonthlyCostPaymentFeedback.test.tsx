import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MonthlyCostCalculator from '@/components/MonthlyCostCalculator';
import { getServerSideProps } from '@/pages/index';

const labels = { fee: 'Cuota de autónomos', advisor: 'Gestoría o asesoría', software: 'Software y herramientas', insurance: 'Seguros', other: 'Otros gastos de actividad', hours: 'Horas facturables al mes' } as const;
type PaymentKey = Exclude<keyof typeof labels, 'hours'>;
const field = (key: keyof typeof labels) => screen.getByRole('textbox', { name: labels[key] }) as HTMLInputElement;
const period = (key: Exclude<PaymentKey, 'fee'>) => screen.getByRole('combobox', { name: `Frecuencia de ${labels[key].toLocaleLowerCase('es-ES')}` });
const deductible = () => screen.getByRole('textbox', { name: 'Gastos deducibles, sin incluir la cuota' });
const change = (input: HTMLElement, value: string) => fireEvent.change(input, { target: { value } });
const paymentMessage = 'Revisa el importe y la frecuencia de este gasto.';
const feeTransferMessage = 'Indica una cuota mensual mayor que cero para trasladar este cálculo.';
function expectPaymentError(key: PaymentKey) {
  const input = field(key);
  const errorId = `monthly-cost-${key}-payment-error`;
  const message = document.getElementById(errorId);
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(input).toHaveAccessibleName(labels[key]);
  expect(input.getAttribute('aria-describedby')?.split(/\s+/)).toContain(errorId);
  expect(input).toHaveAccessibleDescription(paymentMessage);
  expect(message).toBeVisible();
  expect(message).toHaveTextContent(paymentMessage);
  expect(message).toHaveAttribute('role', 'alert');
  expect(input.closest('label')).toContainElement(message);
}
function expectCostsUnavailable() {
  expect(screen.queryByText('Media mensual antes de pagarte')).not.toBeInTheDocument();
  expect(screen.queryByText('Al año según las frecuencias')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Usar estos datos en mi tarifa' })).not.toBeInTheDocument();
  expect(screen.queryByRole('status', { name: 'Datos que se trasladarán a la tarifa' })).not.toBeInTheDocument();
}

describe('monthly payment errors are explained beside their own inputs', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    window.va = vi.fn();
    window.gtag = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('identifies simultaneous malformed and negative payments without replacing their raw drafts or frequencies', async () => {
    const user = userEvent.setup();
    render(<MonthlyCostCalculator />);
    await user.click(field('software'));
    change(field('software'), ' 1,,50 ');
    change(field('insurance'), '-1');

    expectPaymentError('software');
    expectPaymentError('insurance');
    expect(field('software')).toHaveFocus();
    expect(field('software')).toHaveValue(' 1,,50 ');
    expect(field('insurance')).toHaveValue('-1');
    expect(period('software')).toHaveValue('annual');
    expect(period('insurance')).toHaveValue('annual');
    expectCostsUnavailable();
    expect(screen.getByText('Introduce importes de pago válidos, iguales o mayores que cero.')).toHaveAttribute('role', 'alert');

    await user.tab();
    expect(field('software')).toHaveValue(' 1,,50 ');
    expectPaymentError('software');
    expectPaymentError('insurance');
  });

  it('clears only the corrected payment error and retains the other error until all costs can be shown again', async () => {
    const user = userEvent.setup();
    const { container } = render(<MonthlyCostCalculator />);
    change(deductible(), '100');
    change(field('software'), '1,,50');
    change(field('insurance'), '-1');

    await user.clear(field('software'));
    await user.type(field('software'), '420');
    expect(field('software')).toHaveFocus();
    expect(field('software')).toHaveAttribute('aria-invalid', 'false');
    expect(field('software')).not.toHaveAttribute('aria-describedby');
    expect(document.getElementById('monthly-cost-software-payment-error')).not.toBeInTheDocument();
    expectPaymentError('insurance');
    expect(field('insurance')).toHaveValue('-1');
    expectCostsUnavailable();

    await user.clear(field('insurance'));
    await user.type(field('insurance'), '360');
    expect(field('insurance')).toHaveFocus();
    expect(field('insurance')).toHaveAttribute('aria-invalid', 'false');
    expect(document.getElementById('monthly-cost-insurance-payment-error')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('Media mensual antes de pagarte').parentElement).toHaveTextContent('480,00');
    expect(screen.getByText('Al año según las frecuencias').nextElementSibling).toHaveTextContent('5760,00');
    expect(deductible()).toHaveValue('100');
    expect(screen.getByRole('status', { name: 'Datos que se trasladarán a la tarifa' })).toHaveTextContent('100,00');
    expect(Object.fromEntries(new FormData(container.querySelector('form')!))).toEqual({ source: 'monthly-costs', monthlyExpenses: '100.00', monthlyNonDeductibleExpenses: '60.00', billableHours: '80', selfEmployedFeeMode: 'manual', selfEmployedFee: '320.00' });
  });

  it('retains payment precision and frequencies while corrected costs feed the same preview and GET values', async () => {
    const user = userEvent.setup();
    const { container } = render(<MonthlyCostCalculator />);
    change(deductible(), '10');
    change(field('fee'), '350');
    change(field('advisor'), '60');
    change(field('other'), '0');
    change(field('software'), '1,,50');
    change(field('insurance'), '-1');
    await user.selectOptions(period('software'), 'quarterly');
    expectPaymentError('software');
    expectPaymentError('insurance');
    expect(field('software')).toHaveValue('1,,50');
    expectCostsUnavailable();

    change(field('software'), ' 48,075 ');
    expectPaymentError('insurance');
    change(field('insurance'), '0');
    expect(field('software')).toHaveValue(' 48,075 ');
    expect(period('software')).toHaveValue('quarterly');
    expect(period('advisor')).toHaveValue('quarterly');
    expect(screen.getByText('Media mensual antes de pagarte').parentElement).toHaveTextContent('386,03');
    expect(screen.getByText('Al año según las frecuencias').nextElementSibling).toHaveTextContent('4632,32');
    const preview = screen.getByRole('status', { name: 'Datos que se trasladarán a la tarifa' });
    expect(preview).toHaveTextContent('10,00');
    expect(preview).toHaveTextContent('26,03');
    const form = container.querySelector('form')!;
    expect(form).toHaveAttribute('method', 'get');
    expect(form).toHaveAttribute('action', '/#calculadora');
    const query = Object.fromEntries(new FormData(form));
    expect(query).toEqual({ source: 'monthly-costs', monthlyExpenses: '10.00', monthlyNonDeductibleExpenses: '26.03', billableHours: '80', selfEmployedFeeMode: 'manual', selfEmployedFee: '350.00' });
    const response = await getServerSideProps({ query, res: { setHeader: vi.fn() } } as unknown as Parameters<typeof getServerSideProps>[0]);
    if (!('props' in response)) throw new Error('Expected imported calculator values.');
    expect(await response.props).toMatchObject({ calculatorInitiallySubmitted: false, importedFromCosts: true, calculatorInitialValues: { monthlyExpenses: '10', monthlyNonDeductibleExpenses: '26.03', billableHours: '80', selfEmployedFeeMode: 'manual', selfEmployedFee: '350' } });
  });

  it('distinguishes an invalid negative fee from a zero fee that is valid for totals but requires correction before transfer', async () => {
    const user = userEvent.setup();
    render(<MonthlyCostCalculator />);
    change(deductible(), '100');
    change(field('fee'), '-1');
    expectPaymentError('fee');
    expect(document.getElementById('monthly-cost-fee-error')).not.toBeInTheDocument();
    expectCostsUnavailable();

    change(field('fee'), '0');
    expect(field('fee')).toHaveAttribute('aria-invalid', 'false');
    expect(document.getElementById('monthly-cost-fee-payment-error')).not.toBeInTheDocument();
    expect(document.getElementById('monthly-cost-fee-error')).not.toBeInTheDocument();
    expect(screen.getByText('Media mensual antes de pagarte').parentElement).toHaveTextContent('160,00');
    await user.click(screen.getByRole('button', { name: 'Usar estos datos en mi tarifa' }));
    expect(field('fee')).toHaveFocus();
    expect(field('fee')).toHaveAttribute('aria-invalid', 'true');
    expect(field('fee')).toHaveAttribute('aria-describedby', 'monthly-cost-fee-error');
    expect(field('fee')).toHaveAccessibleDescription(feeTransferMessage);
    expect(document.getElementById('monthly-cost-fee-error')).toHaveTextContent(feeTransferMessage);
    expect(document.getElementById('monthly-cost-fee-payment-error')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(feeTransferMessage);

    change(field('fee'), '320');
    expect(field('fee')).toHaveAttribute('aria-invalid', 'false');
    expect(document.getElementById('monthly-cost-fee-error')).not.toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Datos que se trasladarán a la tarifa' })).toBeVisible();
  });

  it('clears payment messages on preparation and derives them again from the exact recovered draft', async () => {
    const user = userEvent.setup();
    render(<MonthlyCostCalculator />);
    change(deductible(), '100');
    change(field('software'), ' 1,,50 ');
    change(field('insurance'), '-1');
    change(field('hours'), '1,5');
    expectPaymentError('software');
    expectPaymentError('insurance');

    await user.click(screen.getByRole('button', { name: 'Empezar con mis costes' }));
    expect(field('fee')).toHaveFocus();
    expect(field('software')).toHaveValue('');
    expect(field('insurance')).toHaveValue('');
    expect(field('software')).toHaveAttribute('aria-invalid', 'false');
    expect(field('insurance')).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByText(paymentMessage)).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('Media mensual antes de pagarte').parentElement).toHaveTextContent('0,00');

    await user.click(screen.getByRole('button', { name: 'Recuperar mis costes anteriores' }));
    expect(field('fee')).toHaveFocus();
    expect(field('software')).toHaveValue(' 1,,50 ');
    expect(field('insurance')).toHaveValue('-1');
    expect(field('hours')).toHaveValue('1,5');
    expect(period('software')).toHaveValue('annual');
    expect(period('insurance')).toHaveValue('annual');
    expectPaymentError('software');
    expectPaymentError('insurance');
    expectCostsUnavailable();
    expect(field('hours')).toHaveAttribute('aria-invalid', 'false');
    change(field('software'), '420');
    change(field('insurance'), '360');
    expect(deductible()).toHaveValue('100');
    expect(deductible()).toHaveAttribute('aria-invalid', 'false');
    expect(field('hours')).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('explains a pasted table fragment locally and removes the explanation after correction without IO or URL changes', async () => {
    const user = userEvent.setup();
    const storageRead = vi.spyOn(Storage.prototype, 'getItem');
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const storageRemove = vi.spyOn(Storage.prototype, 'removeItem');
    const fetch = vi.spyOn(globalThis, 'fetch');
    const history = vi.spyOn(window.history, 'replaceState');
    const previousUrl = window.location.href;
    const { container } = render(<MonthlyCostCalculator />);
    change(deductible(), '100');
    await user.click(field('other'));
    field('other').select();
    await user.paste('100\t200');
    expect(field('other')).toHaveValue('100 ⇥ 200');
    expectPaymentError('other');
    expect(field('other')).toHaveFocus();
    expectCostsUnavailable();
    await user.clear(field('other'));
    await user.type(field('other'), '84,005');
    await user.selectOptions(period('other'), 'annual');
    expect(field('other')).toHaveValue('84,005');
    expect(field('other')).toHaveAccessibleName('Otros gastos de actividad');
    expect(field('other')).toHaveAttribute('aria-invalid', 'false');
    expect(document.getElementById('monthly-cost-other-payment-error')).not.toBeInTheDocument();
    expect(screen.getByText('Media mensual antes de pagarte').parentElement).toHaveTextContent('447,00');
    expect(Object.fromEntries(new FormData(container.querySelector('form')!))).toEqual({ source: 'monthly-costs', monthlyExpenses: '100.00', monthlyNonDeductibleExpenses: '27.00', billableHours: '80', selfEmployedFeeMode: 'manual', selfEmployedFee: '320.00' });
    expect(window.location.href).toBe(previousUrl);
    expect(history).not.toHaveBeenCalled();
    expect(storageRead).not.toHaveBeenCalled();
    expect(storageWrite).not.toHaveBeenCalled();
    expect(storageRemove).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });
});
