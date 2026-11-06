import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import InvoiceCheck from '@/components/InvoiceCheck';
import MonthlyCostCalculator from '@/components/MonthlyCostCalculator';
import CashDatePlanner from '@/components/CashDatePlanner';
import CalculatorForm from '@/components/CalculatorForm';
import WithholdingPreview from '@/components/WithholdingPreview';

const multicellHint = 'Has pegado varias celdas. Introduce un solo número.';
const change = (input: HTMLElement, value: string) => fireEvent.change(input, { target: { value } });
const textbox = (name: string) => screen.getByRole('textbox', { name }) as HTMLInputElement;
type User = ReturnType<typeof userEvent.setup>;
async function paste(user: User, input: HTMLInputElement, text: string) {
  await user.click(input);
  input.select();
  await user.paste(text);
}
function explanation(input: HTMLElement) {
  const ids = input.getAttribute('aria-describedby')?.split(/\s+/) ?? [];
  const message = ids.map(id => document.getElementById(id)).find(node => node?.textContent === multicellHint);
  if (!message) throw new Error('The pasted input should describe its visible explanation.');
  expect(message).toBeVisible();
  expect(message).toHaveAttribute('role', 'alert');
  expect(input).toHaveAccessibleDescription(expect.stringContaining(multicellHint));
  expect(input).toHaveAttribute('aria-invalid', 'true');
  return message;
}
const costNames = { fee: 'Cuota de autónomos', software: 'Software y herramientas', hours: 'Horas facturables al mes', deductible: 'Gastos deducibles, sin incluir la cuota' } as const;
const cost = (key: keyof typeof costNames) => textbox(costNames[key]);

describe('visible multicell explanations in real numeric helpers', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    window.va = vi.fn();
    window.gtag = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('explains each pasted invoice field before checking and keeps the other explanation while correcting only one', async () => {
    const user = userEvent.setup();
    render(<InvoiceCheck />);
    const base = textbox('Base de la factura sin IVA (EUR)');
    const vat = textbox('IVA que quieres comprobar (%)');
    change(textbox('Retención que quieres comprobar (%)'), '15');
    await paste(user, base, '1000\t2000');
    const baseMessage = explanation(base);
    await paste(user, vat, '21\n10');
    const vatMessage = explanation(vat);
    expect(baseMessage.id).not.toBe(vatMessage.id);
    expect(base).toHaveValue('1000 ⇥ 2000');
    expect(vat).toHaveValue('21 ↵ 10');
    expect(base).toHaveAccessibleName('Base de la factura sin IVA (EUR)');
    expect(vat).toHaveAccessibleDescription(/Indica el porcentaje que hayas comprobado/);
    await user.click(screen.getByRole('button', { name: 'Comprobar esta factura' }));
    expect(base).toHaveFocus();
    expect(explanation(base)).toBe(baseMessage);
    expect(explanation(vat)).toBe(vatMessage);
    expect(base).toHaveAccessibleDescription(/al menos 0,01 EUR/);
    expect(vat).toHaveAccessibleDescription(/porcentaje entre 0 y 100/);

    await user.clear(base);
    await user.type(base, '1000');
    expect(base).toHaveFocus();
    expect(baseMessage).not.toBeInTheDocument();
    expect(base).toHaveAttribute('aria-invalid', 'false');
    expect(explanation(vat)).toBe(vatMessage);
    await user.clear(vat);
    await user.type(vat, '21');
    expect(vatMessage).not.toBeInTheDocument();
    expect(screen.queryByText('Importe a cobrar con estos datos')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Comprobar esta factura' }));
    expect(screen.getByText('Importe a cobrar con estos datos').nextElementSibling).toHaveTextContent('1060,00');
  });

  it('adds the paste reason beside a cost payment without replacing its model error, unit or canonical transfer', async () => {
    const user = userEvent.setup();
    const { container } = render(<MonthlyCostCalculator />);
    change(cost('deductible'), '100');
    const before = Object.fromEntries(new FormData(container.querySelector('form')!));
    const software = cost('software');
    await paste(user, software, '420\t50');
    const message = explanation(software);
    expect(software).toHaveFocus();
    expect(software).toHaveAccessibleName('Software y herramientas');
    expect(software).toHaveAccessibleDescription(/Revisa el importe y la frecuencia de este gasto/);
    expect(document.getElementById('monthly-cost-software-payment-error')).toBeVisible();
    const unit = within(software.parentElement!).getByText('€ / pago');
    expect(unit).toHaveAttribute('aria-hidden', 'true');
    expect(software.parentElement).toContainElement(message);
    expect(screen.queryByText('Media mensual antes de pagarte')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Usar estos datos en mi tarifa' })).not.toBeInTheDocument();

    await user.clear(software);
    await user.type(software, '420');
    expect(software).toHaveFocus();
    expect(message).not.toBeInTheDocument();
    expect(document.getElementById('monthly-cost-software-payment-error')).not.toBeInTheDocument();
    expect(software).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByRole('combobox', { name: 'Frecuencia de software y herramientas' })).toHaveValue('annual');
    expect(screen.getByText('Media mensual antes de pagarte').parentElement).toHaveTextContent('480,00');
    expect(Object.fromEntries(new FormData(container.querySelector('form')!))).toEqual(before);
  });

  it('keeps separate hours and deductible explanations alongside their transfer errors and retains each unit', async () => {
    const user = userEvent.setup();
    const { container } = render(<MonthlyCostCalculator />);
    await paste(user, cost('hours'), '80\n90');
    const hoursMessage = explanation(cost('hours'));
    await paste(user, cost('deductible'), '100\t50');
    const deductibleMessage = explanation(cost('deductible'));
    expect(hoursMessage.id).not.toBe(deductibleMessage.id);
    expect(within(cost('hours').parentElement!).getByText('h / mes')).toHaveAttribute('aria-hidden', 'true');
    expect(within(cost('deductible').parentElement!).getByText('€ / mes')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Media mensual antes de pagarte').parentElement).toHaveTextContent('480,00');
    await user.click(screen.getByRole('button', { name: 'Usar estos datos en mi tarifa' }));
    expect(cost('hours')).toHaveFocus();
    expect(cost('hours')).toHaveAccessibleDescription(/Indica un número válido de horas mayor que cero/);
    expect(cost('deductible')).toHaveAccessibleDescription(/Indica un importe deducible entre 0 y 160,00/);
    expect(cost('deductible')).toHaveAccessibleDescription(/Escribe 0 si ninguno es deducible/);
    await user.clear(cost('hours'));
    await user.type(cost('hours'), '80');
    expect(hoursMessage).not.toBeInTheDocument();
    expect(explanation(cost('deductible'))).toBe(deductibleMessage);
    await user.clear(cost('deductible'));
    await user.type(cost('deductible'), '100');
    expect(deductibleMessage).not.toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Datos que se trasladarán a la tarifa' })).toHaveTextContent('80 h/mes');
    expect(Object.fromEntries(new FormData(container.querySelector('form')!))).toEqual({ source: 'monthly-costs', monthlyExpenses: '100.00', monthlyNonDeductibleExpenses: '60.00', billableHours: '80', selfEmployedFeeMode: 'manual', selfEmployedFee: '320.00' });
  });

  it('restores the raw deleted movement with its own explanation while the surviving movement keeps the right message after renumbering', async () => {
    const user = userEvent.setup();
    render(<CashDatePlanner />);
    const amount = (row: number) => textbox(`Importe (EUR) del movimiento ${row}`);
    change(textbox('Saldo antes del primer movimiento (EUR)'), '100');
    for (let row = 1; row <= 3; row++) {
      change(screen.getByLabelText(`Fecha del movimiento ${row}`), `2026-12-0${row}`);
      change(screen.getByLabelText(`Tipo del movimiento ${row}`), 'receipt');
      change(amount(row), '0');
    }
    await paste(user, amount(1), '10\t20');
    await paste(user, amount(2), '30\n40');
    const firstInputId = amount(1).id;
    const survivingInputId = amount(2).id;
    const survivingMessage = explanation(amount(2));
    await user.click(screen.getByRole('button', { name: 'Comprobar vencimientos' }));
    await user.click(screen.getByRole('button', { name: 'Eliminar movimiento 1' }));
    expect(amount(1)).toHaveAttribute('id', survivingInputId);
    expect(amount(1)).toHaveValue('30 ↵ 40');
    expect(explanation(amount(1))).toBe(survivingMessage);
    await user.click(screen.getByRole('button', { name: 'Deshacer la última eliminación' }));
    expect(screen.getByLabelText('Fecha del movimiento 1')).toHaveFocus();
    expect(amount(1)).toHaveAttribute('id', firstInputId);
    expect(amount(1)).toHaveValue('10 ⇥ 20');
    expect(explanation(amount(1)).id).not.toBe(survivingMessage.id);
    expect(explanation(amount(2))).toBe(survivingMessage);
    expect(amount(1)).toHaveAccessibleName('Importe (EUR) del movimiento 1');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Guardar este plan en un archivo' })).not.toBeInTheDocument();
    change(amount(1), '10');
    change(amount(2), '30');
    await user.click(screen.getByRole('button', { name: 'Comprobar vencimientos' }));
    expect(screen.queryByText(multicellHint)).not.toBeInTheDocument();
    expect(screen.getByText('Saldo tras la última fecha').nextElementSibling).toHaveTextContent('140,00');
  });

  it('explains the agenda paste inside the main form without changing its calculated summary, GET data, URL or events', async () => {
    const user = userEvent.setup();
    const storageRead = vi.spyOn(Storage.prototype, 'getItem');
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const fetch = vi.spyOn(globalThis, 'fetch');
    render(<CalculatorForm initialValues={{ targetNet: '1800', monthlyExpenses: '250', monthlyNonDeductibleExpenses: '0', billableHours: '100', irpfMode: 'manual', irpfRate: '15', selfEmployedFeeMode: 'manual', selfEmployedFee: '320' }} />);
    const form = screen.getByRole('form', { name: 'Calculadora de facturación' }) as HTMLFormElement;
    await act(async () => { fireEvent.submit(form); });
    const beforeQuery = window.location.href;
    const beforeData = Object.fromEntries(new FormData(form));
    const beforeSummary = (screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value;
    const history = vi.spyOn(window.history, 'replaceState');
    await user.click(screen.getByText('Estimar mis horas con mi agenda'));
    change(textbox('Días de trabajo por semana'), '5');
    change(textbox('Horas de trabajo por día'), '8');
    change(textbox('Horas no facturables por semana'), '12');
    const weeks = textbox('Semanas sin actividad al año');
    await paste(user, weeks, '4\t5');
    const message = explanation(weeks);
    expect(weeks).toHaveFocus();
    expect(weeks).toHaveAccessibleDescription(/Vacaciones, festivos y otras ausencias/);
    await user.click(screen.getByRole('button', { name: 'Estimar horas' }));
    expect(weeks).toHaveFocus();
    expect(explanation(weeks)).toBe(message);
    await user.clear(weeks);
    await user.type(weeks, '4');
    expect(message).not.toBeInTheDocument();
    fireEvent.keyDown(weeks, { key: 'Enter' });
    expect(screen.getByRole('button', { name: 'Usar 112 horas al mes' })).toBeVisible();
    expect(Object.fromEntries(new FormData(form))).toEqual(beforeData);
    expect((screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value).toBe(beforeSummary);
    expect(window.location.href).toBe(beforeQuery);
    expect(history).not.toHaveBeenCalled();
    expect(window.va).toHaveBeenCalledTimes(1);
    expect(window.gtag).toHaveBeenCalledTimes(2);
    expect(storageRead).not.toHaveBeenCalled();
    expect(storageWrite).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('keeps the withholding explanation beside the live draft until correction and requires checking before showing a new receivable', async () => {
    const user = userEvent.setup();
    render(<WithholdingPreview baseAmount={1000} vatAmount={210} context="monthly" />);
    const rate = textbox('Retención que quieres comprobar (%)');
    await paste(user, rate, '7\n15');
    const message = explanation(rate);
    expect(rate).toHaveAccessibleDescription(/No se copia de la reserva estimada de IRPF/);
    await user.click(screen.getByRole('button', { name: 'Comprobar importe a cobrar' }));
    expect(rate).toHaveFocus();
    expect(explanation(rate)).toBe(message);
    expect(rate).toHaveValue('7 ↵ 15');
    await user.clear(rate);
    await user.type(rate, '15');
    expect(rate).toHaveFocus();
    expect(rate).toHaveAttribute('aria-invalid', 'false');
    expect(message).not.toBeInTheDocument();
    expect(screen.queryByText('Importe a cobrar con este supuesto')).not.toBeInTheDocument();
    fireEvent.keyDown(rate, { key: 'Enter' });
    expect(screen.getByText('Importe a cobrar con este supuesto').nextElementSibling).toHaveTextContent('1060,00');
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });
});
