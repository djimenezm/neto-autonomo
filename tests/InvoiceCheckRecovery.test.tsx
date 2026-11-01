import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import InvoiceCheck from '@/components/InvoiceCheck';

const labels = {
  baseAmount: 'Base de la factura sin IVA (EUR)',
  vatRate: 'IVA que quieres comprobar (%)',
  withholdingRate: 'Retención que quieres comprobar (%)',
} as const;
type Values = Record<keyof typeof labels, string>;
const emptyValues: Values = { baseAmount: '', vatRate: '', withholdingRate: '' };
const field = (key: keyof Values) => screen.getByRole('textbox', { name: labels[key] }) as HTMLInputElement;
const result = () => screen.getByRole('status', { name: 'Comprobación de una factura' });
const example = () => userEvent.click(screen.getByRole('button', { name: 'Probar la factura ficticia de 1000 €' }));
const restore = () => userEvent.click(screen.getByRole('button', { name: 'Recuperar mis datos de factura' }));
const check = () => userEvent.click(screen.getByRole('button', { name: 'Comprobar esta factura' }));

function write(values: Values) {
  for (const key of Object.keys(labels) as (keyof Values)[]) fireEvent.change(field(key), { target: { value: values[key] } });
}

function currentValues(): Values {
  return Object.fromEntries(Object.keys(labels).map((key) => [key, field(key as keyof Values).value])) as Values;
}

function expectRecoveryFinished() {
  expect(screen.queryByRole('button', { name: 'Recuperar mis datos de factura' })).not.toBeInTheDocument();
  expect(screen.queryByText(/sustituye los cambios que ves ahora/)).not.toBeInTheDocument();
  expect(result()).toBeEmptyDOMElement();
  expect(screen.getByRole('status', { name: 'Recuperación de los datos de factura' })).toHaveTextContent('Datos de factura recuperados. Vuelve a comprobar la factura para actualizar los resultados.');
  expect(field('baseAmount')).toHaveFocus();
  for (const key of Object.keys(labels) as (keyof Values)[]) expect(field(key)).toHaveAttribute('aria-invalid', 'false');
}

describe('recover invoice data replaced by the fictional example', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });
  afterEach(() => vi.restoreAllMocks());

  it('restores all three raw fields without calculating, storing or sending incomplete personal data', async () => {
    const storageRead = vi.spyOn(Storage.prototype, 'getItem');
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const storageRemove = vi.spyOn(Storage.prototype, 'removeItem');
    const fetch = vi.spyOn(globalThis, 'fetch');
    const previousUrl = window.location.href;
    render(<InvoiceCheck />);
    const original: Values = { baseAmount: ' 1250,505 € ', vatRate: '1,,5', withholdingRate: '' };
    write(original);
    await example();
    expect(result()).toHaveTextContent('Base y porcentajes ficticios; no son tipos recomendados para tu actividad.');
    const recovery = screen.getByRole('button', { name: 'Recuperar mis datos de factura' });
    expect(recovery).toHaveAttribute('type', 'button');
    expect(recovery).toHaveAccessibleDescription(/sustituye los cambios que ves ahora/);
    await restore();

    expect(currentValues()).toEqual(original);
    expectRecoveryFinished();
    expect(screen.getAllByRole('textbox')).toHaveLength(3);
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

  it('keeps the first snapshot through repeated examples, edits and valid or invalid checks, clearing old results and errors', async () => {
    render(<InvoiceCheck />);
    const original: Values = { baseAmount: ' 37,165 ', vatRate: '21,005', withholdingRate: '7,125' };
    write(original);
    await example();
    await example();
    fireEvent.change(field('baseAmount'), { target: { value: '1500,505' } });
    await check();
    expect(result()).toHaveTextContent('Importe a cobrar con estos datos');
    await example();
    fireEvent.change(field('vatRate'), { target: { value: '1,,5' } });
    await check();
    expect(field('vatRate')).toHaveAttribute('aria-invalid', 'true');
    expect(result()).toHaveTextContent('Revisa los campos indicados');
    await restore();

    expect(currentValues()).toEqual(original);
    expectRecoveryFinished();
    await check();
    expect(result()).toHaveTextContent('Importe a cobrar con estos datos');
    expect(result()).not.toHaveTextContent('Base y porcentajes ficticios; no son tipos recomendados para tu actividad.');
  });

  it('does not offer a personal recovery for an empty draft or repeated untouched examples', async () => {
    render(<InvoiceCheck />);
    expect(currentValues()).toEqual(emptyValues);
    expect(screen.queryByRole('button', { name: 'Recuperar mis datos de factura' })).not.toBeInTheDocument();
    await example();
    await example();
    expect(result()).toHaveTextContent('Base y porcentajes ficticios; no son tipos recomendados para tu actividad.');
    expect(screen.queryByRole('button', { name: 'Recuperar mis datos de factura' })).not.toBeInTheDocument();
  });

  it('keeps a deliberate zero withholding while the base and VAT are still incomplete', async () => {
    render(<InvoiceCheck />);
    fireEvent.change(field('withholdingRate'), { target: { value: '0' } });
    await example();
    await restore();

    expect(currentValues()).toEqual({ ...emptyValues, withholdingRate: '0' });
    expectRecoveryFinished();
  });

  it('consumes recovery and captures new invoice data for the next example cycle', async () => {
    render(<InvoiceCheck />);
    write({ baseAmount: '750', vatRate: '21', withholdingRate: '15' });
    await example();
    await restore();
    expectRecoveryFinished();
    const nextDraft: Values = { baseAmount: '', vatRate: '0', withholdingRate: '1,,5' };
    write(nextDraft);
    await example();
    await restore();

    expect(currentValues()).toEqual(nextDraft);
    expectRecoveryFinished();
  });
});
