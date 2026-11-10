import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Preview from '@/components/MonthlyNetPreview';
import CalculatorForm from '@/components/CalculatorForm';
import { monthlyNetExampleReference as reference } from '@/lib/monthlyNetExample';

const field = () => screen.getByRole('textbox', { name: 'Facturación mensual prevista sin IVA (EUR)' });
const status = () => screen.getByRole('status', { name: 'Neto según facturación' });
const check = () => userEvent.click(screen.getByRole('button', { name: 'Estimar neto con esta facturación' }));
const pendingText = 'Datos modificados. Pulsa «Estimar neto con esta facturación» para actualizar el resultado.';
const errorText = 'Indica una facturación mensual válida de cero o más euros, sin IVA.';
const write = (value: string) => fireEvent.change(field(), { target: { value } });
function expectNoEstimate() {
  expect(within(status()).queryByText('Neto orientativo con estos supuestos')).not.toBeInTheDocument();
  expect(within(status()).queryByText('Facturación prevista sin IVA')).not.toBeInTheDocument();
}

describe('current feedback while editing a monthly net forecast', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    window.va = vi.fn();
    window.gtag = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('keeps an attempted error and its descriptions while a negative or malformed draft is edited without moving focus', async () => {
    const user = userEvent.setup();
    render(<Preview reference={reference} />);
    await user.type(field(), '-100');
    expect(field()).toHaveAttribute('aria-invalid', 'false');
    expect(status()).toBeEmptyDOMElement();
    await check();
    expect(field()).toHaveFocus();
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    expect(field()).toHaveAccessibleDescription(expect.stringContaining(errorText));
    const describedBy = field().getAttribute('aria-describedby');

    await user.clear(field());
    await user.type(field(), '-10');
    expect(field()).toHaveFocus();
    expect(field()).toHaveValue('-10');
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    expect(field()).toHaveAttribute('aria-describedby', describedBy);
    expect(field()).toHaveAccessibleDescription(expect.stringContaining(errorText));
    expect(field()).toHaveAccessibleDescription(/Suma las bases del mes antes de IVA y retenciones/);
    expect(field()).toHaveAccessibleName('Facturación mensual prevista sin IVA (EUR)');
    expect(status()).toHaveTextContent('Revisa la facturación indicada antes de estimar el neto.');
    expect(screen.queryByText(pendingText)).not.toBeInTheDocument();
    await user.clear(field());
    await user.type(field(), '1,,5');
    expect(field()).toHaveFocus();
    expect(field()).toHaveValue('1,,5');
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    expect(field()).toHaveAccessibleDescription(expect.stringContaining(errorText));
    expectNoEstimate();
  });

  it('withdraws old figures on a valid edit and accepts signed zero or raw decimal precision only after explicit Enter', async () => {
    render(<Preview reference={reference} />);
    write('2500');
    await check();
    expect(status()).toHaveTextContent('1598,00');
    field().focus();
    for (const zero of ['+0', '-0']) {
      write(zero);
      expect(field()).toHaveFocus();
      expect(field()).toHaveValue(zero);
      expect(field()).toHaveAttribute('aria-invalid', 'false');
      expect(status()).toHaveTextContent(pendingText);
      expectNoEstimate();
      fireEvent.keyDown(field(), { key: 'Enter' });
      expect(field()).toHaveValue('0');
      expect(status()).toHaveTextContent('déficit de 620,00');
      expect(screen.queryByText(pendingText)).not.toBeInTheDocument();
    }
    write(' 2500,005 € ');
    expect(field()).toHaveFocus();
    expect(field()).toHaveValue(' 2500,005 € ');
    expect(status()).toHaveTextContent(pendingText);
    expectNoEstimate();
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(field()).toHaveValue('2500,01');
    expect(status()).toHaveTextContent('1598,01');
    expect(screen.queryByText(pendingText)).not.toBeInTheDocument();
  });

  it('rejects pasted foreign currency and percentages until the forecast is entered in euros', async () => {
    const user = userEvent.setup();
    render(<Preview reference={reference} />);
    await user.click(field());
    await user.paste('2500 USD');
    await user.click(screen.getByRole('button', { name: 'Estimar neto con esta facturación' }));

    const unitError = /Introduce la facturación en euros/;
    expect(field()).toHaveFocus();
    expect(field()).toHaveValue('2500 USD');
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    expect(field()).toHaveAccessibleDescription(unitError);
    expectNoEstimate();

    await user.clear(field());
    await user.paste('15 %');
    await user.keyboard('{Enter}');
    expect(field()).toHaveFocus();
    expect(field()).toHaveValue('15 %');
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    expect(field()).toHaveAccessibleDescription(unitError);
    expectNoEstimate();

    for (const valid of ['2.500,00 €', 'EUR 2.500,00']) {
      await user.clear(field());
      await user.paste(valid);
      expect(field()).toHaveAttribute('aria-invalid', 'false');
      expect(status()).toHaveTextContent(pendingText);
      expectNoEstimate();
      await user.keyboard('{Enter}');
      expect(field()).toHaveValue('2500');
      expect(status()).toHaveTextContent('1598,00');
    }
  });

  it('resets attempted validation when recovering the raw forecast and when a changed reference starts a new editor', async () => {
    const { rerender } = render(<Preview reference={reference} />);
    const raw = ' -10,125 ';
    write(raw);
    await check();
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Probar una facturación de 2.500 €' }));
    expect(status()).toHaveTextContent('Facturación ficticia');
    write('-1');
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Recuperar mi facturación anterior' }));
    expect(field()).toHaveFocus();
    expect(field()).toHaveValue(raw);
    expect(field()).toHaveAttribute('aria-invalid', 'false');
    expect(field()).not.toHaveAccessibleDescription(expect.stringContaining(errorText));
    expect(status()).toHaveTextContent('Facturación anterior recuperada.');
    expectNoEstimate();
    write('-2');
    expect(field()).toHaveAttribute('aria-invalid', 'false');
    rerender(<Preview reference={{ ...reference }} />);
    expect(field()).toHaveValue('-2');
    expect(field()).toHaveAttribute('aria-invalid', 'false');
    await check();
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    rerender(<Preview reference={{ ...reference, monthlyExpenses: 500 }} />);
    expect(field()).toHaveValue('');
    expect(field()).toHaveAttribute('aria-invalid', 'false');
    expect(status()).toBeEmptyDOMElement();
    expect(screen.queryByRole('button', { name: 'Recuperar mi facturación anterior' })).not.toBeInTheDocument();
  });

  it('keeps current forecast feedback separate from the main calculation, summary, GET values, events and IO', async () => {
    const storageRead = vi.spyOn(Storage.prototype, 'getItem');
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const storageRemove = vi.spyOn(Storage.prototype, 'removeItem');
    const fetch = vi.spyOn(globalThis, 'fetch');
    render(<CalculatorForm initialValues={{ targetNet: '1500', monthlyExpenses: '150', billableHours: '70', irpfMode: 'manual', irpfRate: '15', selfEmployedFeeMode: 'manual', selfEmployedFee: '320' }} />);
    const form = screen.getByRole('form', { name: 'Calculadora de facturación' }) as HTMLFormElement;
    await act(async () => { fireEvent.submit(form); });
    const previousUrl = window.location.href;
    const previousData = Object.fromEntries(new FormData(form));
    const previousSummary = (screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value;
    const history = vi.spyOn(window.history, 'replaceState');
    await userEvent.click(screen.getByText('Estimar qué neto dejaría otra facturación'));
    write('-100');
    await check();
    write('-10');
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    expect(field()).toHaveAccessibleDescription(expect.stringContaining(errorText));
    expectNoEstimate();
    write('2500');
    expect(field()).toHaveAttribute('aria-invalid', 'false');
    expect(status()).toHaveTextContent(pendingText);
    expectNoEstimate();
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(status()).toHaveTextContent('1725,50');
    expect(screen.getByRole('heading', { name: 'Tu referencia mensual para presupuestar' })).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Resumen detallado para compartir' })).toHaveValue(previousSummary);
    expect(Object.fromEntries(new FormData(form))).toEqual(previousData);
    expect(field()).not.toHaveAttribute('name');
    expect(window.location.href).toBe(previousUrl);
    expect(history).not.toHaveBeenCalled();
    expect(window.va).toHaveBeenCalledTimes(1);
    expect(window.gtag).toHaveBeenCalledTimes(2);
    expect(storageRead).not.toHaveBeenCalled();
    expect(storageWrite).not.toHaveBeenCalled();
    expect(storageRemove).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });
});
