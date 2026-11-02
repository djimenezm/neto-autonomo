import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CalculatorForm from '@/components/CalculatorForm';

const labels = {
  targetNet: 'Neto mensual deseado (EUR)',
  monthlyExpenses: 'Gastos mensuales deducibles (EUR)',
  monthlyNonDeductibleExpenses: 'Gastos mensuales no deducibles (EUR)',
  billableHours: 'Horas facturables al mes',
  irpfRate: 'Reserva de IRPF para la simulación (%)',
  selfEmployedFee: 'Cuota manual de autónomos (EUR)',
};
const numeric = (name: keyof typeof labels) => screen.getByRole('spinbutton', { name: new RegExp(`^${labels[name].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`) });
const calculate = () => userEvent.click(screen.getByRole('button', { name: 'Calcular mi tarifa orientativa' }));
const invalidValues = { targetNet: '0', monthlyExpenses: '-1', monthlyNonDeductibleExpenses: '-2', irpfMode: 'manual' as const, irpfRate: '15', selfEmployedFeeMode: 'manual' as const, selfEmployedFee: '0' };
const referenceValues = { targetNet: '2000', monthlyExpenses: '300', monthlyNonDeductibleExpenses: '0', billableHours: '80', irpfMode: 'manual' as const, irpfRate: '15', selfEmployedFeeMode: 'manual' as const, selfEmployedFee: '320' };

describe('stable names and separate help in the main calculator', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });

  it('names all six numeric controls using only their visible labels before errors', () => {
    render(<CalculatorForm initialValues={referenceValues} />);

    for (const name of Object.keys(labels) as (keyof typeof labels)[]) {
      expect(numeric(name)).toHaveAccessibleName(labels[name]);
      expect(numeric(name)).toHaveAttribute('name', name);
    }
    expect(numeric('monthlyNonDeductibleExpenses')).toHaveAccessibleDescription(/Costes que pagas pero no descuentas en esta estimación de IRPF/);
    expect(numeric('billableHours')).toHaveAccessibleDescription(/Horas que prevés cobrar, no toda tu jornada/);
    expect(numeric('irpfRate')).toHaveAccessibleDescription(/no la retención de una factura/);
  });

  it('keeps names unchanged with several errors and focuses the first field while preserving non-deductible help', async () => {
    render(<CalculatorForm initialValues={invalidValues} updateUrlOnSubmit={false} />);
    const previousUrl = window.location.href;
    const fields = Object.fromEntries(Object.entries(labels).map(([name]) => [name, numeric(name as keyof typeof labels)]));
    await calculate();

    await waitFor(() => expect(fields.targetNet).toHaveFocus());
    for (const name of ['targetNet', 'monthlyExpenses', 'monthlyNonDeductibleExpenses', 'selfEmployedFee'] as const) {
      expect(fields[name]).toHaveAccessibleName(labels[name]);
      expect(fields[name]).toHaveAttribute('aria-invalid', 'true');
      expect(fields[name]).toHaveAccessibleDescription();
    }
    expect(fields.monthlyNonDeductibleExpenses).toHaveAccessibleDescription(/Costes que pagas pero no descuentas en esta estimación de IRPF/);
    expect(fields.monthlyNonDeductibleExpenses).toHaveAccessibleDescription(/Los gastos no deducibles no pueden ser negativos/);
    expect(numeric('billableHours')).toHaveAccessibleName(labels.billableHours);
    expect(numeric('irpfRate')).toHaveAccessibleName(labels.irpfRate);
    expect(screen.queryByRole('heading', { name: 'Tu referencia mensual para presupuestar' })).not.toBeInTheDocument();
    expect(window.location.href).toBe(previousUrl);
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('removes each error without renaming the control or moving focus and retains the existing successful submission', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm initialValues={invalidValues} updateUrlOnSubmit={false} initialShareUrl="https://www.cuantofacturar.es/?targetNet=2000#calculadora" />);
    await calculate();
    for (const [name, value] of [['targetNet', '2000'], ['monthlyExpenses', '300'], ['monthlyNonDeductibleExpenses', '0'], ['selfEmployedFee', '320']] as const) {
      const field = numeric(name);
      await user.clear(field);
      await user.type(field, value);
      expect(field).toHaveFocus();
      expect(field).toHaveAccessibleName(labels[name]);
      expect(field).toHaveAttribute('aria-invalid', 'false');
    }
    expect(numeric('monthlyNonDeductibleExpenses')).toHaveAccessibleDescription(/Escribe 0 si no tienes/);
    expect(numeric('monthlyNonDeductibleExpenses')).not.toHaveAccessibleDescription(/no pueden ser negativos/);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
    await calculate();

    expect(screen.getByRole('heading', { name: 'Tu referencia mensual para presupuestar' })).toBeVisible();
    expect((screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value).toContain('2972,94');
    expect(window.va).toHaveBeenCalledTimes(1);
    expect(window.va).toHaveBeenCalledWith('event', expect.objectContaining({ name: 'calculator_completed' }));
    expect(window.gtag).toHaveBeenCalledTimes(2);
    await calculate();
    expect(window.va).toHaveBeenCalledTimes(1);
    expect(window.gtag).toHaveBeenCalledTimes(2);
  });

  it('keeps the name and hint while explaining a rejected multi-cell paste and its correction', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm />);
    const field = numeric('monthlyNonDeductibleExpenses');
    await user.click(field);
    await user.paste('100\t200');

    expect(field).toHaveAccessibleName(labels.monthlyNonDeductibleExpenses);
    expect(field).toHaveValue(null);
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAccessibleDescription(/Costes que pagas pero no descuentas en esta estimación de IRPF/);
    expect(field).toHaveAccessibleDescription(/Pega un solo número y revisa los separadores/);
    await calculate();
    await waitFor(() => expect(field).toHaveFocus());
    await user.type(field, '0');
    expect(field).toHaveFocus();
    expect(field).toHaveAccessibleName(labels.monthlyNonDeductibleExpenses);
    expect(field).toHaveAttribute('aria-invalid', 'false');
    expect(field).toHaveAccessibleDescription(/Escribe 0 si no tienes/);
    expect(field).not.toHaveAccessibleDescription(/Pega un solo número/);
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('keeps selector names separate from help as tax, community, fee and reduced-period options change', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm />);
    const irpf = screen.getByRole('combobox', { name: /^Cómo quieres estimar el IRPF/ });
    const community = screen.getByRole('combobox', { name: /^Comunidad autónoma para el IRPF/ });
    const feeMode = screen.getByRole('combobox', { name: /^Cómo quieres calcular la cuota de autónomos/ });
    expect(irpf).toHaveAccessibleName('Cómo quieres estimar el IRPF');
    expect(irpf).toHaveAccessibleDescription(/Usamos una estimación anual por tramos/);
    expect(community).toHaveAccessibleName('Comunidad autónoma para el IRPF');
    expect(community).toHaveAccessibleDescription(/Territorio común mantiene una aproximación general/);
    await user.selectOptions(community, 'madrid');
    expect(community).toHaveAccessibleName('Comunidad autónoma para el IRPF');
    expect(feeMode).toHaveAccessibleName('Cómo quieres calcular la cuota de autónomos');
    expect(feeMode).toHaveAccessibleDescription(/Estimamos una cuota mínima orientativa/);
    await user.selectOptions(irpf, 'manual');
    expect(irpf).toHaveAccessibleName('Cómo quieres estimar el IRPF');
    expect(irpf).toHaveAccessibleDescription(/Usaremos la reserva de IRPF que indiques/);
    expect(screen.queryByRole('combobox', { name: /^Comunidad autónoma para el IRPF/ })).not.toBeInTheDocument();
    await user.selectOptions(feeMode, 'reduced');
    expect(feeMode).toHaveAccessibleName('Cómo quieres calcular la cuota de autónomos');
    expect(feeMode).toHaveAccessibleDescription(/con MEI incluido/);
    const period = screen.getByRole('combobox', { name: /^Período de la tarifa reducida/ });
    expect(period).toHaveAccessibleName('Período de la tarifa reducida');
    expect(period).toHaveAccessibleDescription(/Comparamos rendimientos anuales estimados con el SMI de 2026/);
    await user.selectOptions(period, 'extended');
    expect(period).toHaveAccessibleName('Período de la tarifa reducida');
    expect(period).toHaveAccessibleDescription(/No es el neto que deseas conservar ni tu facturación/);
    await user.selectOptions(feeMode, 'manual');
    expect(feeMode).toHaveAccessibleName('Cómo quieres calcular la cuota de autónomos');
    expect(feeMode).toHaveAccessibleDescription(/Usaremos exactamente la cuota que indiques/);
    expect(numeric('selfEmployedFee')).toHaveAccessibleName(labels.selfEmployedFee);
    expect(screen.queryByRole('combobox', { name: /^Período de la tarifa reducida/ })).not.toBeInTheDocument();
    await user.selectOptions(irpf, 'progressive');
    expect(irpf).toHaveAccessibleDescription(/Usamos una estimación anual por tramos/);
    expect(screen.getByRole('combobox', { name: 'Comunidad autónoma para el IRPF' })).toHaveValue('madrid');
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('includes working label and help bindings in server HTML and preserves the calculated scenario while correcting it', async () => {
    const props = { initialValues: referenceValues, initiallySubmitted: true, enableResultCopy: false, updateUrlOnSubmit: false, initialShareUrl: 'https://www.cuantofacturar.es/?targetNet=2000#calculadora' };
    const markup = document.createElement('div');
    markup.innerHTML = renderToString(<CalculatorForm {...props} />);
    const serverForm = markup.querySelector('form[aria-label="Calculadora de facturación"]')!;
    for (const [name, label] of Object.entries(labels)) {
      const input = serverForm.querySelector(`[name="${name}"]`)!;
      const ids = input.getAttribute('aria-labelledby')?.split(/\s+/) ?? [];
      expect(ids).not.toHaveLength(0);
      expect(ids.map(id => markup.querySelector(`[id="${id}"]`)?.textContent).join(' ')).toBe(label);
    }
    for (const name of ['irpfMode', 'selfEmployedFeeMode']) {
      const select = serverForm.querySelector(`select[name="${name}"]`)!;
      const ids = select.getAttribute('aria-describedby')?.split(/\s+/) ?? [];
      expect(ids).not.toHaveLength(0);
      for (const id of ids) expect(markup.querySelector(`[id="${id}"]`)).not.toBeEmptyDOMElement();
    }
    expect(serverForm).toHaveAttribute('action', '/#calculadora');
    expect(serverForm).toHaveAttribute('method', 'get');
    const serverData = [...new FormData(serverForm as HTMLFormElement).entries()];

    render(<CalculatorForm {...props} />);
    const form = screen.getByRole('form', { name: 'Calculadora de facturación' }) as HTMLFormElement;
    const originalSummary = (screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value;
    expect([...new FormData(form).entries()]).toEqual(serverData);
    const field = numeric('monthlyNonDeductibleExpenses');
    fireEvent.change(field, { target: { value: '-1' } });
    expect(field).toHaveAccessibleName(labels.monthlyNonDeductibleExpenses);
    expect(field).toHaveAccessibleDescription(/Los gastos no deducibles no pueden ser negativos/);
    expect(screen.queryByRole('heading', { name: 'Tu referencia mensual para presupuestar' })).not.toBeInTheDocument();
    fireEvent.change(field, { target: { value: '0' } });
    expect(field).toHaveAccessibleName(labels.monthlyNonDeductibleExpenses);
    expect(screen.getByRole('heading', { name: 'Tu referencia mensual para presupuestar' })).toBeVisible();
    expect([...new FormData(form).entries()]).toEqual(serverData);
    expect((screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value).toBe(originalSummary);
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });
});
