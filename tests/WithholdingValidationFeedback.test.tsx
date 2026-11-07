import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Preview from '@/components/WithholdingPreview';
import CalculatorForm from '@/components/CalculatorForm';
import { withholdingExample } from '@/lib/withholdingPreview';

const reference = { ...withholdingExample, context: 'monthly' as const };
const field = () => screen.getByRole('textbox', { name: 'Retención que quieres comprobar (%)' });
const result = () => screen.getByRole('status', { name: 'Importe a cobrar con retención' });
const check = () => userEvent.click(screen.getByRole('button', { name: 'Comprobar importe a cobrar' }));
const pendingText = 'Datos modificados. Pulsa «Comprobar importe a cobrar» para actualizar el resultado.';
const errorText = 'Indica un porcentaje entre 0 y 100. Usa 0 si no hay retención.';
const write = (value: string) => fireEvent.change(field(), { target: { value } });
function expectNoReceipt() {
  expect(within(result()).queryByText('Importe a cobrar con este supuesto')).not.toBeInTheDocument();
  expect(within(result()).queryByText('Base sin IVA')).not.toBeInTheDocument();
}

describe('current feedback while editing a withholding percentage', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    window.va = vi.fn();
    window.gtag = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('retains attempted validation for negative, excessive and malformed percentages without moving focus or dropping the hint', async () => {
    const user = userEvent.setup();
    render(<Preview {...reference} />);
    await user.type(field(), '-1');
    expect(field()).toHaveAttribute('aria-invalid', 'false');
    expect(result()).toBeEmptyDOMElement();
    await check();
    expect(field()).toHaveFocus();
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    const describedBy = field().getAttribute('aria-describedby');
    for (const invalid of ['-2', '101', '1,,5']) {
      await user.clear(field());
      await user.type(field(), invalid);
      expect(field()).toHaveFocus();
      expect(field()).toHaveValue(invalid);
      expect(field()).toHaveAttribute('aria-invalid', 'true');
      expect(field()).toHaveAttribute('aria-describedby', describedBy);
      expect(field()).toHaveAccessibleName('Retención que quieres comprobar (%)');
      expect(field()).toHaveAccessibleDescription(expect.stringContaining(errorText));
      expect(field()).toHaveAccessibleDescription(/No se copia de la reserva estimada de IRPF/);
      expect(result()).toHaveTextContent(errorText);
      expect(screen.queryByText(pendingText)).not.toBeInTheDocument();
      expectNoReceipt();
    }
  });

  it('removes stale figures on a valid edit and waits for Enter before accepting zero, 100 or rounded Spanish precision', async () => {
    render(<Preview {...reference} />);
    write('15');
    await check();
    expect(result()).toHaveTextContent('= 1060,00');
    field().focus();
    for (const [rate, receivable] of [['0', '1210,00'], ['100', '210,00']]) {
      write(rate);
      expect(field()).toHaveFocus();
      expect(field()).toHaveValue(rate);
      expect(field()).toHaveAttribute('aria-invalid', 'false');
      expect(result()).toHaveTextContent(pendingText);
      expectNoReceipt();
      fireEvent.keyDown(field(), { key: 'Enter' });
      expect(result()).toHaveTextContent(`= ${receivable}`);
      expect(screen.queryByText(pendingText)).not.toBeInTheDocument();
    }
    write(' 15,005 % ');
    expect(field()).toHaveFocus();
    expect(field()).toHaveValue(' 15,005 % ');
    expect(result()).toHaveTextContent(pendingText);
    expectNoReceipt();
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(field()).toHaveValue('15,01');
    expect(result()).toHaveTextContent('− 150,10');
    expect(result()).toHaveTextContent('= 1059,90');
    expect(result()).not.toHaveTextContent('Retención ficticia');
  });

  it('resets attempted validation on raw recovery or a changed reference while an equivalent reference retains the draft', async () => {
    const { rerender } = render(<Preview {...reference} />);
    const raw = ' -1,125 % ';
    write(raw);
    await check();
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Probar una retención ficticia del 15 %' }));
    expect(result()).toHaveTextContent('Retención ficticia del 15 %');
    write('-2');
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Recuperar mi retención anterior' }));
    expect(field()).toHaveFocus();
    expect(field()).toHaveValue(raw);
    expect(field()).toHaveAttribute('aria-invalid', 'false');
    expect(field()).not.toHaveAccessibleDescription(expect.stringContaining(errorText));
    expect(result()).toHaveTextContent('Retención anterior recuperada.');
    expectNoReceipt();
    write('-3');
    expect(field()).toHaveAttribute('aria-invalid', 'false');
    rerender(<Preview {...reference} />);
    expect(field()).toHaveValue('-3');
    await check();
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    rerender(<Preview {...reference} vatAmount={0} />);
    expect(field()).toHaveValue('');
    expect(field()).toHaveAttribute('aria-invalid', 'false');
    expect(result()).toBeEmptyDOMElement();
    expect(screen.queryByRole('button', { name: 'Recuperar mi retención anterior' })).not.toBeInTheDocument();
  });

  it('keeps current withholding feedback separate from the main result, GET fields, summary, URL, events and IO', async () => {
    const storageRead = vi.spyOn(Storage.prototype, 'getItem');
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const storageRemove = vi.spyOn(Storage.prototype, 'removeItem');
    const fetch = vi.spyOn(globalThis, 'fetch');
    render(<CalculatorForm initialValues={{ targetNet: '2000', monthlyExpenses: '300', billableHours: '80', irpfMode: 'manual', irpfRate: '15', selfEmployedFeeMode: 'manual', selfEmployedFee: '320' }} />);
    const form = screen.getByRole('form', { name: 'Calculadora de facturación' }) as HTMLFormElement;
    await act(async () => { fireEvent.submit(form); });
    const previousUrl = window.location.href;
    const previousData = Object.fromEntries(new FormData(form));
    const previousSummary = (screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value;
    const history = vi.spyOn(window.history, 'replaceState');
    await userEvent.click(screen.getByText('Ver cómo se reparte la facturación'));
    await userEvent.click(screen.getByText('Comprobar el cobro si hay retención'));
    expect(field()).toHaveValue('');
    write('-1');
    await check();
    write('-2');
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    expect(field()).toHaveAccessibleDescription(expect.stringContaining(errorText));
    expectNoReceipt();
    write('15');
    expect(field()).toHaveAttribute('aria-invalid', 'false');
    expect(result()).toHaveTextContent(pendingText);
    expectNoReceipt();
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(result()).toHaveTextContent('= 3151,32');
    expect(result()).not.toHaveTextContent('Retención ficticia');
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
