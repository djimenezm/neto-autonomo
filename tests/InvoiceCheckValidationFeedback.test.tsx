import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import InvoiceCheck from '@/components/InvoiceCheck';

const labels = {
  baseAmount: 'Base de la factura sin IVA (EUR)',
  vatRate: 'IVA que quieres comprobar (%)',
  withholdingRate: 'Retención que quieres comprobar (%)',
} as const;
type Values = Record<keyof typeof labels, string>;
const field = (key: keyof Values) => screen.getByRole('textbox', { name: labels[key] }) as HTMLInputElement;
const check = () => userEvent.click(screen.getByRole('button', { name: 'Comprobar esta factura' }));
const result = () => screen.getByRole('status', { name: 'Comprobación de una factura' });
const example = () => userEvent.click(screen.getByRole('button', { name: 'Probar la factura ficticia de 1000 €' }));
const pending = () => screen.queryByText('Datos modificados. Pulsa «Comprobar esta factura» para actualizar el resultado.');
const invalidFields = () => screen.getAllByRole('textbox').filter(input => input.getAttribute('aria-invalid') === 'true');
const change = (key: keyof Values, value: string) => fireEvent.change(field(key), { target: { value } });
function write(values: Values) {
  for (const key of Object.keys(labels) as (keyof Values)[]) change(key, values[key]);
}
const current = (): Values => Object.fromEntries(Object.keys(labels).map(key => [key, field(key as keyof Values).value])) as Values;
const valid: Values = { baseAmount: '1000', vatRate: '21', withholdingRate: '15' };
function expectNoReceipt() {
  expect(within(result()).queryByText('Importe a cobrar con estos datos')).not.toBeInTheDocument();
  expect(within(result()).queryByText('Base sin IVA')).not.toBeInTheDocument();
}

describe('current validation while correcting an invoice check', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });
  afterEach(() => vi.restoreAllMocks());

  it('leaves initial inputs quiet and removes only the corrected error while retaining other unfinished fields', async () => {
    const user = userEvent.setup();
    render(<InvoiceCheck />);
    await user.type(field('baseAmount'), '1000');
    expect(invalidFields()).toHaveLength(0);
    expect(pending()).not.toBeInTheDocument();
    await user.clear(field('baseAmount'));
    await check();
    expect(invalidFields()).toHaveLength(3);
    expect(field('baseAmount')).toHaveFocus();
    for (const [index, key] of (Object.keys(labels) as (keyof Values)[]).entries()) {
      await user.type(field(key), valid[key]);
      expect(field(key)).toHaveFocus();
      expect(field(key)).toHaveAccessibleName(labels[key]);
      expect(field(key)).toHaveAttribute('aria-invalid', 'false');
      expect(invalidFields()).toHaveLength(2 - index);
      expectNoReceipt();
    }
    expect(field('withholdingRate')).toHaveAccessibleDescription(/No se copia de la reserva estimada de IRPF/);
    expect(field('withholdingRate')).not.toHaveAccessibleDescription(/Indica un porcentaje entre/);
    expect(pending()).toBeVisible();
  });

  it('validates each tax independently and accepts explicit zero and the upper boundary without recomputing the receipt on edit', async () => {
    render(<InvoiceCheck />);
    write({ baseAmount: '1000', vatRate: '-1', withholdingRate: '101' });
    await check();
    expect(field('vatRate')).toHaveFocus();
    expect(invalidFields()).toHaveLength(2);
    expect(field('vatRate')).toHaveAccessibleDescription(/porcentaje entre 0 y 100/);
    expect(field('withholdingRate')).toHaveAccessibleDescription(/porcentaje entre 0 y 100/);
    change('vatRate', '0');
    expect(field('vatRate')).toHaveFocus();
    expect(field('vatRate')).toHaveAttribute('aria-invalid', 'false');
    expect(field('withholdingRate')).toHaveAttribute('aria-invalid', 'true');
    change('withholdingRate', '100');
    expect(invalidFields()).toHaveLength(0);
    expect(pending()).toBeVisible();
    expectNoReceipt();
    await check();
    expect(within(result()).getByText('Importe a cobrar con estos datos').nextElementSibling).toHaveTextContent('= 0,00');
    change('vatRate', '100');
    change('withholdingRate', '0');
    expect(invalidFields()).toHaveLength(0);
    expect(pending()).toBeVisible();
    expectNoReceipt();
    await check();
    expect(within(result()).getByText('Importe a cobrar con estos datos').nextElementSibling).toHaveTextContent('= 2000,00');
    expect(pending()).not.toBeInTheDocument();
  });

  it('keeps valid tax inputs and raw precision while the base is invalid, normalizing only after an explicit successful check', async () => {
    render(<InvoiceCheck />);
    const raw = { baseAmount: '0', vatRate: '21,005', withholdingRate: '7,125' };
    write(raw);
    await check();
    expect(field('baseAmount')).toHaveFocus();
    expect(field('baseAmount')).toHaveAccessibleDescription(/al menos 0,01 EUR/);
    expect(field('vatRate')).toHaveAttribute('aria-invalid', 'false');
    expect(field('withholdingRate')).toHaveAttribute('aria-invalid', 'false');
    expect(current()).toEqual(raw);
    change('baseAmount', ' 1000,005 € ');
    expect(field('baseAmount')).toHaveFocus();
    expect(invalidFields()).toHaveLength(0);
    expect(current()).toEqual({ ...raw, baseAmount: ' 1000,005 € ' });
    expect(pending()).toBeVisible();
    expectNoReceipt();
    await check();
    expect(current()).toEqual({ baseAmount: '1000,01', vatRate: '21,01', withholdingRate: '7,13' });
    expect(within(result()).getByText('Base sin IVA').nextElementSibling).toHaveTextContent('1000,01');
    expect(pending()).not.toBeInTheDocument();
  });

  it('withdraws a checked receipt immediately, keeps feedback current through correction and refreshes only on Enter', async () => {
    render(<InvoiceCheck />);
    write(valid);
    await check();
    expect(within(result()).getByText('Importe a cobrar con estos datos').nextElementSibling).toHaveTextContent('= 1060,00');
    field('baseAmount').focus();
    change('baseAmount', '1,,25');
    expect(field('baseAmount')).toHaveFocus();
    expect(field('baseAmount')).toHaveAttribute('aria-invalid', 'true');
    expectNoReceipt();
    expect(pending()).not.toBeInTheDocument();
    change('baseAmount', '2000');
    expect(field('baseAmount')).toHaveAttribute('aria-invalid', 'false');
    expect(pending()).toBeVisible();
    expectNoReceipt();
    fireEvent.keyDown(field('baseAmount'), { key: 'Enter' });
    expect(pending()).not.toBeInTheDocument();
    expect(within(result()).getByText('Importe a cobrar con estos datos').nextElementSibling).toHaveTextContent('= 2120,00');
  });

  it('checks the example explicitly and resets live errors when recovering the independent unfinished invoice', async () => {
    render(<InvoiceCheck />);
    const original = { baseAmount: ' 1250,505 € ', vatRate: '1,,5', withholdingRate: '' };
    write(original);
    await check();
    expect(invalidFields()).toHaveLength(2);
    await example();
    expect(invalidFields()).toHaveLength(0);
    expect(result()).toHaveTextContent('Base y porcentajes ficticios');
    change('vatRate', '101');
    expect(field('vatRate')).toHaveAttribute('aria-invalid', 'true');
    expectNoReceipt();
    await example();
    expect(invalidFields()).toHaveLength(0);
    expect(result()).toHaveTextContent('Base y porcentajes ficticios');
    await userEvent.click(screen.getByRole('button', { name: 'Recuperar mis datos de factura' }));
    expect(current()).toEqual(original);
    expect(field('baseAmount')).toHaveFocus();
    expect(invalidFields()).toHaveLength(0);
    expect(result()).toBeEmptyDOMElement();
    change('baseAmount', '0');
    expect(invalidFields()).toHaveLength(0);
    expect(pending()).not.toBeInTheDocument();
    fireEvent.keyDown(field('baseAmount'), { key: 'Enter' });
    expect(field('baseAmount')).toHaveFocus();
    expect(invalidFields()).toHaveLength(3);
    expect(screen.queryByRole('button', { name: 'Recuperar mis datos de factura' })).not.toBeInTheDocument();
    expectNoReceipt();
  });

  it('keeps feedback and keyboard checks local, without named form controls, URL changes, storage, requests or events', async () => {
    const storageRead = vi.spyOn(Storage.prototype, 'getItem');
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const storageRemove = vi.spyOn(Storage.prototype, 'removeItem');
    const fetch = vi.spyOn(globalThis, 'fetch');
    const previousUrl = window.location.href;
    render(<InvoiceCheck />);
    expect(fireEvent.keyDown(field('vatRate'), { key: 'Enter' })).toBe(false);
    expect(invalidFields()).toHaveLength(3);
    write(valid);
    expect(pending()).toBeVisible();
    expectNoReceipt();
    expect(fireEvent.keyDown(field('withholdingRate'), { key: 'Enter' })).toBe(false);
    expect(within(result()).getByText('Importe a cobrar con estos datos')).toBeVisible();
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
