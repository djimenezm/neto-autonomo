import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MonthlyCostCalculator from '@/components/MonthlyCostCalculator';
import CalculatorForm from '@/components/CalculatorForm';
import { getServerSideProps } from '@/pages/index';

describe('MonthlyCostCalculator', () => {
  beforeEach(() => {
    window.va = vi.fn();
    window.gtag = vi.fn();
  });

  it('previews the same rounded cost split and canonical hours that arrive in the main calculator', async () => {
    const user = userEvent.setup();
    window.va = vi.fn();
    window.gtag = vi.fn();
    const { container, unmount } = render(<MonthlyCostCalculator />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Otros gastos de actividad' }), { target: { value: '80' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Horas facturables al mes' }), { target: { value: '80,00' } });
    fireEvent.change(screen.getByRole('textbox', { name: /Gastos deducibles, sin incluir la cuota/ }), { target: { value: '128,075' } });

    const form = container.querySelector('form')!;
    expect(form.querySelector('[name="monthlyExpenses"]')).toHaveValue('128.08');
    expect(form.querySelector('[name="monthlyNonDeductibleExpenses"]')).toHaveValue('71.92');
    expect(form.querySelector('[name="billableHours"]')).toHaveValue('80');
    expect(screen.getByRole('status', { name: 'Datos que se trasladarán a la tarifa' }))
      .toHaveTextContent('128,08');
    expect(screen.getByRole('status', { name: 'Datos que se trasladarán a la tarifa' }))
      .toHaveTextContent('71,92');
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
    const query = Object.fromEntries(new FormData(form));
    const response = await getServerSideProps({ query, res: { setHeader: vi.fn() } } as unknown as Parameters<typeof getServerSideProps>[0]);
    if (!('props' in response)) throw new Error('El traslado debe devolver los datos de la calculadora.');
    const props = await response.props;
    unmount();
    render(<CalculatorForm initialValues={props.calculatorInitialValues} importedFromCosts={props.importedFromCosts} initiallySubmitted={props.calculatorInitiallySubmitted} />);
    expect(screen.getByRole('spinbutton', { name: 'Horas facturables al mes' })).toHaveValue(80);
    expect(screen.getByRole('spinbutton', { name: /Gastos mensuales deducibles/ })).toHaveValue(128.08);
    expect(screen.getByRole('spinbutton', { name: /Gastos mensuales no deducibles/ })).toHaveValue(71.92);
    expect(screen.getByRole('spinbutton', { name: /Cuota manual de autónomos/ })).toHaveValue(320);
    expect(screen.queryByRole('heading', { name: 'Tu referencia mensual para presupuestar' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Calcular mi tarifa orientativa' }));
    const shared = new URL(window.location.href);
    expect(shared.searchParams.get('billableHours')).toBe('80');
    expect(shared.searchParams.get('monthlyExpenses')).toBe('128.08');
    expect(shared.searchParams.get('monthlyNonDeductibleExpenses')).toBe('71.92');
  });

  it.each([' 80 ', '80,00', '1.000'])('transfers accepted hours %j in canonical numeric notation', (hours) => {
    const { container } = render(<MonthlyCostCalculator />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Horas facturables al mes' }), { target: { value: hours } });
    fireEvent.change(screen.getByRole('textbox', { name: /Gastos deducibles, sin incluir la cuota/ }), { target: { value: '100' } });
    expect(container.querySelector('[name="billableHours"]')).toHaveValue(hours === '1.000' ? '1000' : '80');
  });

  it('rejects a deductible amount whose rounded cents exceed the available costs', async () => {
    const user = userEvent.setup();
    const { container } = render(<MonthlyCostCalculator />);
    for (const name of ['Gestoría o asesoría', 'Software y herramientas', 'Seguros']) {
      fireEvent.change(screen.getByRole('textbox', { name }), { target: { value: '0' } });
    }
    fireEvent.change(screen.getByRole('textbox', { name: 'Otros gastos de actividad' }), { target: { value: '10,07' } });
    fireEvent.change(screen.getByRole('textbox', { name: /Gastos deducibles, sin incluir la cuota/ }), { target: { value: '10,075' } });
    expect(container.querySelector('[name="monthlyExpenses"]')).toHaveValue('');
    await user.click(screen.getByRole('button', { name: /Usar estos datos en mi tarifa/ }));
    expect(screen.getByRole('alert')).toHaveTextContent('10,07');
    expect(screen.queryByRole('status', { name: 'Datos que se trasladarán a la tarifa' })).not.toBeInTheDocument();
  });

  it('shows a cost-only breakdown and updates it when an expense changes', async () => {
    const user = userEvent.setup();

    render(<MonthlyCostCalculator />);

    expect(screen.getByText('Media mensual antes de pagarte').parentElement).toHaveTextContent('480,00');
    expect(screen.getByText(/5760,00/)).toBeInTheDocument();
    expect(screen.getByText(/6,00/)).toBeInTheDocument();

    const softwareInput = screen.getByRole('textbox', { name: /software y herramientas/i });
    await user.selectOptions(screen.getByRole('combobox', { name: /frecuencia de software/i }), 'monthly');
    await user.clear(softwareInput);
    await user.type(softwareInput, '65');

    expect(screen.getByText(/510,00/)).toBeInTheDocument();
    expect(screen.getByText(/6,38/)).toBeInTheDocument();
  });

  it.each(['', '0', '-2', '1,,50'])('keeps valid costs and the open breakdown while hours %j prevent transfer', async (invalidHours) => {
    const user = userEvent.setup();
    const { container } = render(<MonthlyCostCalculator />);
    const previousUrl = window.location.href;
    const deductible = screen.getByRole('textbox', { name: /Gastos deducibles, sin incluir la cuota/ });
    await user.type(deductible, '100');
    const summary = screen.getByText('Ver cómo se reparte el coste anual');
    await user.click(summary);
    const hoursInput = screen.getByRole('textbox', { name: /horas facturables al mes/i });
    fireEvent.change(hoursInput, { target: { value: invalidHours } });

    expect(screen.getByText('Media mensual antes de pagarte').parentElement).toHaveTextContent('480,00');
    expect(screen.getByText('Al año según las frecuencias').nextElementSibling).toHaveTextContent('5760,00');
    expect(summary.closest('details')).toHaveAttribute('open');
    expect(screen.getByRole('region', { name: 'Desglose de pagos de actividad' })).toBeVisible();
    expect(deductible).toBeVisible();
    expect(deductible).toHaveValue('100');
    expect(screen.queryByText('Por hora facturable')).not.toBeInTheDocument();
    expect(screen.queryByRole('status', { name: 'Datos que se trasladarán a la tarifa' })).not.toBeInTheDocument();
    if (invalidHours === '') {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(hoursInput).toHaveAttribute('aria-invalid', 'false');
    }

    const form = container.querySelector('form')!;
    expect(fireEvent.submit(form)).toBe(false);
    expect(hoursInput).toHaveAttribute('aria-invalid', 'true');
    expect(hoursInput).toHaveAttribute('aria-describedby', expect.stringContaining('monthly-cost-hours-error'));
    expect(hoursInput).toHaveAccessibleDescription(/Indica un número válido de horas mayor que cero/);
    expect(screen.getByRole('alert')).toHaveTextContent('Indica un número válido de horas mayor que cero.');
    expect(hoursInput).toHaveFocus();
    expect(form.querySelector('[name="monthlyExpenses"]')).toHaveValue('100.00');
    expect(form.querySelector('[name="monthlyNonDeductibleExpenses"]')).toHaveValue('60.00');
    expect(window.location.href).toBe(previousUrl);
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();

    fireEvent.change(hoursInput, { target: { value: '60' } });
    expect(screen.getByText('Por hora facturable').nextElementSibling).toHaveTextContent('8,00');
    expect(screen.getByRole('status', { name: 'Datos que se trasladarán a la tarifa' })).toHaveTextContent('60 h/mes');
    expect(hoursInput).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(summary.closest('details')).toHaveAttribute('open');
    expect(deductible).toHaveValue('100');
    expect(form.querySelector('[name="monthlyExpenses"]')).toHaveValue('100.00');
    expect(form.querySelector('[name="monthlyNonDeductibleExpenses"]')).toHaveValue('60.00');
    expect(form.querySelector('[name="billableHours"]')).toHaveValue('60');
    expect(window.location.href).toBe(previousUrl);
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('updates totals and the cost split when payments change before hours are known', async () => {
    const user = userEvent.setup();
    const { container } = render(<MonthlyCostCalculator />);
    const previousUrl = window.location.href;
    await user.type(screen.getByRole('textbox', { name: /Gastos deducibles, sin incluir la cuota/ }), '100');
    const summary = screen.getByText('Ver cómo se reparte el coste anual');
    await user.click(summary);
    await user.clear(screen.getByRole('textbox', { name: /horas facturables al mes/i }));
    await user.selectOptions(screen.getByRole('combobox', { name: /frecuencia de software/i }), 'monthly');
    fireEvent.change(screen.getByRole('textbox', { name: /software y herramientas/i }), { target: { value: '65' } });

    expect(screen.getByText('Media mensual antes de pagarte').parentElement).toHaveTextContent('510,00');
    expect(screen.getByText('Al año según las frecuencias').nextElementSibling).toHaveTextContent('6120,00');
    expect(summary.closest('details')).toHaveAttribute('open');
    expect(screen.getByRole('region', { name: 'Desglose de pagos de actividad' })).toHaveTextContent('780,00');
    expect(container.querySelector('[name="monthlyExpenses"]')).toHaveValue('100.00');
    expect(container.querySelector('[name="monthlyNonDeductibleExpenses"]')).toHaveValue('90.00');
    expect(screen.queryByText('Por hora facturable')).not.toBeInTheDocument();
    expect(screen.queryByRole('status', { name: 'Datos que se trasladarán a la tarifa' })).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(window.location.href).toBe(previousUrl);
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('keeps the quotient for positive fractional hours but requires whole hours for transfer', async () => {
    const { container } = render(<MonthlyCostCalculator />);
    const previousUrl = window.location.href;
    fireEvent.change(screen.getByRole('textbox', { name: /Gastos deducibles, sin incluir la cuota/ }), { target: { value: '100' } });
    const hours = screen.getByRole('textbox', { name: /horas facturables al mes/i });
    fireEvent.change(hours, { target: { value: '1,5' } });

    expect(screen.getByText('Media mensual antes de pagarte').parentElement).toHaveTextContent('480,00');
    expect(screen.getByText('Por hora facturable').nextElementSibling).toHaveTextContent('320,00');
    expect(screen.queryByRole('status', { name: 'Datos que se trasladarán a la tarifa' })).not.toBeInTheDocument();
    expect(fireEvent.submit(container.querySelector('form')!)).toBe(false);
    expect(hours).toHaveAttribute('aria-invalid', 'true');
    expect(hours).toHaveAttribute('aria-describedby', expect.stringContaining('monthly-cost-hours-error'));
    expect(hours).toHaveAccessibleDescription(/Usa un número entero de horas mayor que cero para trasladar este cálculo/);
    expect(screen.getByRole('alert')).toHaveTextContent('Usa un número entero de horas mayor que cero para trasladar este cálculo.');
    expect(hours).toHaveFocus();
    expect(window.location.href).toBe(previousUrl);
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it.each(['-1', '1,,50'])('still withdraws totals and transfer controls for an invalid payment %j', (amount) => {
    render(<MonthlyCostCalculator />);
    const hours = screen.getByRole('textbox', { name: /horas facturables al mes/i });
    fireEvent.change(hours, { target: { value: '' } });
    fireEvent.change(screen.getByRole('textbox', { name: /software y herramientas/i }), { target: { value: amount } });

    expect(screen.queryByText('Media mensual antes de pagarte')).not.toBeInTheDocument();
    expect(screen.queryByText('Al año según las frecuencias')).not.toBeInTheDocument();
    expect(screen.queryByText('Ver cómo se reparte el coste anual')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /usar estos datos en mi tarifa/i })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /software y herramientas/i })).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent(/importe/i);
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('keeps the fee separate and splits other costs before transferring', async () => {
    const user = userEvent.setup();
    const { container } = render(<MonthlyCostCalculator />);

    await user.click(screen.getByRole('button', { name: /usar estos datos en mi tarifa/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/indica un importe deducible/i);

    await user.type(screen.getByRole('textbox', { name: /gastos deducibles, sin incluir la cuota/i }), '100');

    const form = container.querySelector('form');
    expect(form).toHaveAttribute('method', 'get');
    expect(form).toHaveAttribute('action', '/#calculadora');
    expect(form?.querySelector('[name="monthlyExpenses"]')).toHaveValue('100.00');
    expect(form?.querySelector('[name="monthlyNonDeductibleExpenses"]')).toHaveValue('60.00');
    expect(form?.querySelector('[name="selfEmployedFeeMode"]')).toHaveValue('manual');
    expect(form?.querySelector('[name="selfEmployedFee"]')).toHaveValue('320.00');
    expect(form?.querySelector('[name="billableHours"]')).toHaveValue('80');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('rejects deductible costs above the non-fee total', async () => {
    const user = userEvent.setup();
    render(<MonthlyCostCalculator />);

    await user.type(screen.getByRole('textbox', { name: /gastos deducibles, sin incluir la cuota/i }), '200');
    await user.click(screen.getByRole('button', { name: /usar estos datos en mi tarifa/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/entre 0 y 160,00/i);
  });

  it('uses the amount of each payment and updates the monthly transfer when its frequency changes', async () => {
    const user = userEvent.setup();
    const { container } = render(<MonthlyCostCalculator />);
    window.va = vi.fn();
    window.gtag = vi.fn();

    const software = screen.getByRole('textbox', { name: /software y herramientas/i });
    expect(software).toHaveValue('420');
    const period = screen.getByRole('combobox', { name: /frecuencia de software/i });
    expect(period).toHaveValue('annual');
    await user.selectOptions(period, 'quarterly');
    expect(software).toHaveValue('420');
    expect(screen.getByText(/585,00/)).toBeInTheDocument();
    expect(screen.getByText(/7020,00/)).toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: /gastos deducibles, sin incluir la cuota/i }), '100');
    expect(container.querySelector('[name="monthlyExpenses"]')).toHaveValue('100.00');
    expect(container.querySelector('[name="monthlyNonDeductibleExpenses"]')).toHaveValue('165.00');
    expect(container.querySelector('[name="selfEmployedFee"]')).toHaveValue('320.00');
    await user.click(screen.getByText('Ver cómo se reparte el coste anual'));
    expect(screen.getByRole('region', { name: 'Desglose de pagos de actividad' })).toHaveTextContent('1680,00');
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('revalidates the deductible split after reducing a cost and rejects negative sub-cent amounts', async () => {
    const user = userEvent.setup();
    const { container } = render(<MonthlyCostCalculator />);
    const deductible = screen.getByRole('textbox', { name: /gastos deducibles, sin incluir la cuota/i });
    await user.type(deductible, '160');
    const software = screen.getByRole('textbox', { name: /software y herramientas/i });
    await user.clear(software);
    await user.type(software, '0');
    await user.click(screen.getByRole('button', { name: /usar estos datos en mi tarifa/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('125,00');
    expect(container.querySelector('[name="monthlyExpenses"]')).toHaveValue('');

    await user.clear(deductible);
    await user.type(deductible, '-0,001');
    expect(deductible).toHaveAttribute('aria-invalid', 'true');
    expect(container.querySelector('[name="monthlyNonDeductibleExpenses"]')).toHaveValue('');
  });
});
