import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Planner from '@/components/CashFlowPlanner';

type Month = { receipts: string; payments: string };
type Values = { initialBalance: string; months: Month[] };
const initial = () => screen.getByRole('textbox', { name: 'Saldo inicial de la cuenta (EUR)' }) as HTMLInputElement;
const field = (key: keyof Month, month: number) => screen.getByRole('textbox', {
  name: `${key === 'receipts' ? 'Cobros' : 'Pagos'} previstos del mes ${month} (EUR)`,
}) as HTMLInputElement;
const result = () => screen.getByRole('status', { name: 'Plan de caja de tres meses' });
const check = () => userEvent.click(screen.getByRole('button', { name: 'Comprobar plan de caja' }));
const example = () => userEvent.click(screen.getByRole('button', { name: 'Probar tres meses ficticios' }));
const pending = () => screen.queryByText('Datos modificados. Pulsa «Comprobar plan de caja» para actualizar los saldos.');
const invalidFields = () => screen.getAllByRole('textbox').filter(input => input.getAttribute('aria-invalid') === 'true');
const change = (input: HTMLElement, value: string) => fireEvent.change(input, { target: { value } });
const zeroMonths = (): Month[] => Array.from({ length: 3 }, () => ({ receipts: '0', payments: '0' }));
function write(values: Values) {
  change(initial(), values.initialBalance);
  values.months.forEach((month, index) => {
    for (const key of ['receipts', 'payments'] as const) change(field(key, index + 1), month[key]);
  });
}
const current = (): Values => ({ initialBalance: initial().value, months: [1, 2, 3].map(month => ({ receipts: field('receipts', month).value, payments: field('payments', month).value })) });
function expectNoBalances() {
  expect(within(result()).queryByRole('table')).not.toBeInTheDocument();
  expect(within(result()).queryByText('Saldo al cierre del tercer mes')).not.toBeInTheDocument();
}

describe('current validation while correcting the three-month cash plan', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });
  afterEach(() => vi.restoreAllMocks());

  it('leaves initial input quiet and retains all six monthly errors after correcting the starting balance to zero', async () => {
    const user = userEvent.setup();
    render(<Planner />);
    await user.type(initial(), '0');
    expect(invalidFields()).toHaveLength(0);
    expect(pending()).not.toBeInTheDocument();
    await user.clear(initial());
    await check();
    expect(invalidFields()).toHaveLength(7);
    expect(initial()).toHaveFocus();
    await user.type(initial(), '0');
    expect(initial()).toHaveFocus();
    expect(initial()).toHaveAttribute('aria-invalid', 'false');
    expect(invalidFields()).toHaveLength(6);
    expect(field('payments', 3)).toHaveAccessibleName('Pagos previstos del mes 3 (EUR)');
    expect(field('payments', 3)).toHaveAccessibleDescription(/Cuenta cada salida una vez/);
    expect(field('payments', 3)).toHaveAccessibleDescription(/Usa 0 si no prevés movimientos/);
    expect(pending()).not.toBeInTheDocument();
    expectNoBalances();
  });

  it('corrects each month independently without hiding other month pairs or moving the editing focus', async () => {
    const user = userEvent.setup();
    render(<Planner />);
    change(initial(), '0');
    await check();
    expect(invalidFields()).toHaveLength(6);
    for (const [index, month] of [2, 1, 3].entries()) {
      await user.type(field('receipts', month), '0');
      expect(field('receipts', month)).toHaveFocus();
      expect(field('receipts', month)).toHaveAttribute('aria-invalid', 'false');
      expect(field('payments', month)).toHaveAttribute('aria-invalid', 'true');
      await user.type(field('payments', month), '0');
      expect(field('payments', month)).toHaveFocus();
      expect(invalidFields()).toHaveLength(4 - index * 2);
      expectNoBalances();
    }
    expect(field('payments', 3)).not.toHaveAccessibleDescription(/Usa 0 si no prevés movimientos/);
    expect(pending()).toBeVisible();
    await check();
    expect(pending()).not.toBeInTheDocument();
    expect(within(result()).getByText('Saldo al cierre del tercer mes').nextElementSibling).toHaveTextContent('0,00');
  });

  it('accepts a negative starting balance while keeping negative flows invalid and requiring deliberate zeroes', async () => {
    render(<Planner />);
    const months = zeroMonths();
    months[0] = { receipts: '-1', payments: '-2' };
    write({ initialBalance: '-100', months });
    await check();
    expect(initial()).toHaveAttribute('aria-invalid', 'false');
    expect(field('receipts', 1)).toHaveFocus();
    expect(invalidFields()).toHaveLength(2);
    change(field('receipts', 1), '0');
    expect(field('payments', 1)).toHaveAttribute('aria-invalid', 'true');
    expect(invalidFields()).toHaveLength(1);
    change(field('payments', 1), '0');
    expect(invalidFields()).toHaveLength(0);
    expect(pending()).toBeVisible();
    expectNoBalances();
    await check();
    expect(within(result()).getByText('Saldo mínimo entre el inicio y los cierres').nextElementSibling).toHaveTextContent('-100,00');
    expect(within(result()).getByText('Primer saldo negativo entre inicio y cierres').nextElementSibling).toHaveTextContent('Saldo inicial');
    change(field('payments', 2), '');
    expect(field('payments', 2)).toHaveAttribute('aria-invalid', 'true');
    expectNoBalances();
    change(field('payments', 2), '0');
    expect(invalidFields()).toHaveLength(0);
    expect(pending()).toBeVisible();
    expectNoBalances();
  });

  it('rejects mismatched units independently in the balance, receipts and payments', async () => {
    const user = userEvent.setup();
    const euroMessage = 'Introduce un importe en euros. Puedes usar € o EUR.';
    render(<Planner />);
    write({ initialBalance: '100', months: zeroMonths() });
    await check();
    expect(within(result()).getByText('Saldo al cierre del tercer mes').nextElementSibling).toHaveTextContent('100,00');

    const receipts = field('receipts', 1);
    const payments = field('payments', 2);
    await user.click(initial());
    initial().select();
    await user.paste('100 USD');
    expectNoBalances();
    change(receipts, '15 %');
    change(payments, '50 GBP');
    await check();
    expect(initial()).toHaveFocus();
    expect(initial()).toHaveValue('100 USD');
    expect(receipts).toHaveValue('15 %');
    expect(payments).toHaveValue('50 GBP');
    expect(invalidFields()).toEqual([initial(), receipts, payments]);
    for (const input of [initial(), receipts, payments]) {
      expect(input).toHaveAccessibleDescription(expect.stringContaining(euroMessage));
    }
    expectNoBalances();

    change(initial(), '-100 EUR');
    expect(invalidFields()).toEqual([receipts, payments]);
    await check();
    expect(receipts).toHaveFocus();
    change(receipts, '15 €');
    expect(invalidFields()).toEqual([payments]);
    await check();
    expect(payments).toHaveFocus();
    change(payments, '50 EUR');
    expect(invalidFields()).toHaveLength(0);
    expect(pending()).toBeVisible();
    expectNoBalances();

    await check();
    expect(within(result()).getByText('Saldo al cierre del tercer mes').nextElementSibling).toHaveTextContent('-135,00');
  });

  it('keeps raw precision until an explicit check, withdraws the previous table on editing and recomputes only with Enter', async () => {
    render(<Planner />);
    const raw: Values = { initialBalance: ' 1,005 € ', months: [{ receipts: '0,105', payments: '0,015' }, { receipts: '0', payments: '0' }, { receipts: '0', payments: '0' }] };
    write(raw);
    expect(current()).toEqual(raw);
    await check();
    expect(initial()).toHaveValue('1,01');
    expect(field('receipts', 1)).toHaveValue('0,11');
    expect(field('payments', 1)).toHaveValue('0,02');
    expect(within(result()).getByText('Saldo al cierre del tercer mes').nextElementSibling).toHaveTextContent('1,10');
    initial().focus();
    change(initial(), ' 2,005 € ');
    expect(initial()).toHaveFocus();
    change(field('receipts', 1), ' 5,005 ');
    expect(initial()).toHaveValue(' 2,005 € ');
    expect(field('receipts', 1)).toHaveValue(' 5,005 ');
    expect(pending()).toBeVisible();
    expectNoBalances();
    fireEvent.keyDown(field('receipts', 1), { key: 'Enter' });
    expect(initial()).toHaveValue('2,01');
    expect(field('receipts', 1)).toHaveValue('5,01');
    expect(pending()).not.toBeInTheDocument();
    expect(within(result()).getByRole('table')).toBeVisible();
    expect(within(result()).getByText('Saldo al cierre del tercer mes').nextElementSibling).toHaveTextContent('7,00');
  });

  it('checks the example explicitly and recovers the first raw draft with validation quiet until another check', async () => {
    render(<Planner />);
    const original: Values = { initialBalance: ' -50,125 € ', months: [{ receipts: '0', payments: '1,,5' }, { receipts: '', payments: '0' }, { receipts: '0', payments: '0' }] };
    write(original);
    await check();
    expect(invalidFields()).toHaveLength(2);
    await example();
    expect(invalidFields()).toHaveLength(0);
    expect(result()).toHaveTextContent('Saldos, cobros y pagos ficticios');
    change(field('receipts', 3), '');
    expect(field('receipts', 3)).toHaveAttribute('aria-invalid', 'true');
    expectNoBalances();
    await example();
    expect(invalidFields()).toHaveLength(0);
    await userEvent.click(screen.getByRole('button', { name: 'Recuperar mis tres meses anteriores' }));
    expect(current()).toEqual(original);
    expect(initial()).toHaveFocus();
    expect(invalidFields()).toHaveLength(0);
    expect(pending()).not.toBeInTheDocument();
    expectNoBalances();
    change(field('payments', 1), '-1');
    expect(invalidFields()).toHaveLength(0);
    fireEvent.keyDown(field('payments', 1), { key: 'Enter' });
    expect(field('payments', 1)).toHaveFocus();
    expect(initial()).toHaveAttribute('aria-invalid', 'false');
    expect(invalidFields()).toHaveLength(2);
    expectNoBalances();
  });

  it('keeps feedback and keyboard checks local without form submissions, URL changes, storage, requests or events', async () => {
    const storageRead = vi.spyOn(Storage.prototype, 'getItem');
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const storageRemove = vi.spyOn(Storage.prototype, 'removeItem');
    const fetch = vi.spyOn(globalThis, 'fetch');
    const previousUrl = window.location.href;
    render(<Planner />);
    expect(fireEvent.keyDown(field('payments', 3), { key: 'Enter' })).toBe(false);
    expect(invalidFields()).toHaveLength(7);
    write({ initialBalance: '0', months: zeroMonths() });
    expect(pending()).toBeVisible();
    expectNoBalances();
    expect(fireEvent.keyDown(field('payments', 3), { key: 'Enter' })).toBe(false);
    expect(within(result()).getByRole('table')).toBeVisible();
    expect(document.querySelector('form')).toBeNull();
    expect(document.querySelector('[name]')).toBeNull();
    expect(screen.getByRole('link', { name: 'Revisar cobros y pagos por fecha' })).toHaveAttribute('href', '#vencimientos-caja');
    expect(window.location.href).toBe(previousUrl);
    expect(storageRead).not.toHaveBeenCalled();
    expect(storageWrite).not.toHaveBeenCalled();
    expect(storageRemove).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });
});
