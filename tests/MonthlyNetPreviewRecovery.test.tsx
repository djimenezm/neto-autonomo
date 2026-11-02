import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Preview from '@/components/MonthlyNetPreview';
import { monthlyNetExampleReference as reference } from '@/lib/monthlyNetExample';

const label = 'Facturación mensual prevista sin IVA (EUR)';
const field = () => screen.getByRole('textbox', { name: label }) as HTMLInputElement;
const result = () => screen.getByRole('status', { name: 'Neto según facturación' });
const example = () => userEvent.click(screen.getByRole('button', { name: 'Probar una facturación de 2.500 €' }));
const restore = () => userEvent.click(screen.getByRole('button', { name: 'Recuperar mi facturación anterior' }));
const check = () => userEvent.click(screen.getByRole('button', { name: 'Estimar neto con esta facturación' }));
const write = (value: string) => fireEvent.change(field(), { target: { value } });

function expectRecoveryFinished() {
  expect(screen.queryByRole('button', { name: 'Recuperar mi facturación anterior' })).not.toBeInTheDocument();
  expect(screen.queryByText(/sustituye los cambios que ves ahora/)).not.toBeInTheDocument();
  expect(screen.getAllByRole('status')).toHaveLength(1);
  expect(result()).toHaveTextContent('Facturación anterior recuperada. Vuelve a estimar el neto para actualizar los resultados.');
  expect(result().querySelector('dl')).toBeNull();
  expect(result()).not.toHaveTextContent('Facturación ficticia');
  expect(result()).not.toHaveTextContent('Revisa la facturación');
  expect(field()).toHaveAttribute('aria-invalid', 'false');
  expect(field()).toHaveFocus();
}

function expectResetPreview() {
  expect(field()).toHaveValue('');
  expect(result()).toBeEmptyDOMElement();
  expect(screen.queryByRole('button', { name: 'Recuperar mi facturación anterior' })).not.toBeInTheDocument();
  expect(screen.queryByText(/sustituye los cambios que ves ahora/)).not.toBeInTheDocument();
}

describe('recover the forecast replaced by the monthly net example', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });
  afterEach(() => vi.restoreAllMocks());

  it('restores an unfinished raw amount without calculating, storing or sending personal data', async () => {
    const storageRead = vi.spyOn(Storage.prototype, 'getItem');
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const storageRemove = vi.spyOn(Storage.prototype, 'removeItem');
    const fetch = vi.spyOn(globalThis, 'fetch');
    const previousUrl = window.location.href;
    render(<Preview reference={reference} />);
    const original = ' 1,,5 € ';
    write(original);
    await example();
    expect(result()).toHaveTextContent('Facturación ficticia');
    const recovery = screen.getByRole('button', { name: 'Recuperar mi facturación anterior' });
    expect(recovery).toHaveAttribute('type', 'button');
    expect(recovery).toHaveAccessibleDescription(/sustituye los cambios que ves ahora/);
    expect(recovery).toHaveAccessibleDescription(/referencia/);
    await restore();

    expect(field()).toHaveValue(original);
    expectRecoveryFinished();
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
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

  it('keeps the first precise amount through repeated examples and valid or invalid estimates', async () => {
    render(<Preview reference={reference} />);
    const original = ' 3250,555 ';
    write(original);
    await example();
    await example();
    write('3500,005');
    await check();
    expect(result()).toHaveTextContent('Neto orientativo con estos supuestos');
    await example();
    write('1,,5');
    await check();
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    expect(result()).toHaveTextContent('Revisa la facturación');
    await restore();

    expect(field()).toHaveValue(original);
    expectRecoveryFinished();
    await check();
    expect(field()).toHaveValue('3250,56');
    expect(result()).toHaveTextContent('Neto orientativo con estos supuestos');
    expect(result()).not.toHaveTextContent('Facturación ficticia');
    expect(result()).not.toHaveTextContent('Facturación anterior recuperada');
  });

  it('does not offer recovery for an empty field or repeated untouched examples', async () => {
    render(<Preview reference={reference} />);
    expectResetPreview();
    await example();
    await example();
    expect(result()).toHaveTextContent('Facturación ficticia');
    expect(screen.queryByRole('button', { name: 'Recuperar mi facturación anterior' })).not.toBeInTheDocument();
  });

  it('recovers a deliberate zero without calculating until explicitly asked, then estimates the deficit', async () => {
    render(<Preview reference={reference} />);
    write('0');
    await example();
    await restore();

    expect(field()).toHaveValue('0');
    expectRecoveryFinished();
    await check();
    expect(field()).toHaveAttribute('aria-invalid', 'false');
    expect(result()).toHaveTextContent('déficit de 620,00');
    expect(result()).toHaveTextContent('ni una devolución');
    expect(result()).not.toHaveTextContent('Facturación ficticia');
  });

  it('consumes recovery and captures the next amount rather than reviving the previous one', async () => {
    render(<Preview reference={reference} />);
    write('3250,55');
    await example();
    await restore();
    expectRecoveryFinished();
    const nextDraft = ' 4100,125 € ';
    write(nextDraft);
    await example();
    await restore();

    expect(field()).toHaveValue(nextDraft);
    expectRecoveryFinished();
  });

  it('retains recovery for an equivalent reference but resets amount, copy and feedback when assumptions change', async () => {
    const { rerender } = render(<Preview reference={reference} />);
    write('3250,555');
    await example();
    rerender(<Preview reference={{ ...reference }} />);
    expect(screen.getByRole('button', { name: 'Recuperar mi facturación anterior' })).toBeInTheDocument();
    rerender(<Preview reference={{ ...reference, monthlyExpenses: 500 }} />);
    expectResetPreview();
    rerender(<Preview reference={reference} />);
    expectResetPreview();

    write('3100');
    await example();
    await restore();
    expectRecoveryFinished();
    rerender(<Preview reference={{ ...reference, irpfMode: 'progressive' }} />);
    expectResetPreview();
    rerender(<Preview reference={reference} />);
    expectResetPreview();
  });
});
