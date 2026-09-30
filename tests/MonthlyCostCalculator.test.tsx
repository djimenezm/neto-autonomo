import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import MonthlyCostCalculator from '@/components/MonthlyCostCalculator';

describe('MonthlyCostCalculator', () => {
  it('shows a cost-only breakdown and updates it when an expense changes', async () => {
    const user = userEvent.setup();

    render(<MonthlyCostCalculator />);

    expect(screen.getByText(/480,00/)).toBeInTheDocument();
    expect(screen.getByText(/5760,00/)).toBeInTheDocument();
    expect(screen.getByText(/6,00/)).toBeInTheDocument();

    const softwareInput = screen.getByRole('textbox', { name: /software y herramientas/i });
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
});
