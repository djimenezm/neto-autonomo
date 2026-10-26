import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import MonthlyCostCalculator from '@/components/MonthlyCostCalculator';

describe('MonthlyCostCalculator', () => {
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

  it('does not show a misleading total for invalid amounts or zero hours', async () => {
    const user = userEvent.setup();

    render(<MonthlyCostCalculator />);

    const hoursInput = screen.getByRole('textbox', { name: /horas facturables al mes/i });
    await user.clear(hoursInput);
    await user.type(hoursInput, '0');

    expect(screen.getByRole('alert')).toHaveTextContent(/al menos una hora/i);
    expect(screen.queryByText(/480,00/)).not.toBeInTheDocument();
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
