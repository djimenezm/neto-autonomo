import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Planner from '@/components/AnnualBillingPlanner';
import CalculatorForm from '@/components/CalculatorForm';

const months = 'Meses completos con facturación en el año';
const hours = 'Horas facturables en cada mes activo';
const status = { name: 'Plan anual de facturación' };

describe('annual billing planner', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });

  it('starts empty and focuses invalid calendar data', async () => {
    render(<Planner monthlyBilling={1200} />);
    const field = screen.getByRole('textbox', { name: months });
    expect(field).toHaveValue('');
    await userEvent.click(screen.getByRole('button', { name: 'Comprobar plan anual' }));
    expect(field).toHaveFocus();
    expect(field).toHaveAttribute('aria-invalid', 'true');
  });

  it('identifies the fictional calendar and clears a plan after editing', async () => {
    render(<Planner monthlyBilling={2234.71} />);
    await userEvent.click(screen.getByRole('button', { name: 'Probar 10 meses de 70 horas' }));
    expect(screen.getByRole('status', status)).toHaveTextContent('Calendario ficticio');
    expect(screen.getByRole('status', status)).toHaveTextContent('2681,66');
    expect(screen.getByRole('status', status)).toHaveTextContent('38,31');
    fireEvent.change(screen.getByRole('textbox', { name: hours }), { target: { value: '84' } });
    expect(screen.getByRole('status', status)).toBeEmptyDOMElement();
    await userEvent.click(screen.getByRole('button', { name: 'Comprobar plan anual' }));
    expect(screen.getByRole('status', status)).toHaveTextContent('31,93');
    expect(screen.getByRole('status', status)).not.toHaveTextContent('Calendario ficticio');
  });

  it('accepts Spanish decimal hours and Enter, and normalizes visible inputs', async () => {
    const user = userEvent.setup();
    render(<Planner monthlyBilling={1200} />);
    await user.type(screen.getByRole('textbox', { name: months }), '10');
    await user.type(screen.getByRole('textbox', { name: hours }), '80,125{Enter}');
    expect(screen.getByRole('textbox', { name: hours })).toHaveValue('80,13');
    expect(screen.getByRole('status', status)).toHaveTextContent('801,3 h');
  });

  it('resets the calendar when the main billing reference changes', async () => {
    const { rerender } = render(<Planner monthlyBilling={1200} />);
    await userEvent.click(screen.getByRole('button', { name: 'Probar 10 meses de 70 horas' }));
    rerender(<Planner monthlyBilling={2000} />);
    expect(screen.getByRole('textbox', { name: months })).toHaveValue('');
    expect(screen.getByRole('status', status)).toBeEmptyDOMElement();
  });

  it('uses the actual billing reference without changing the summary, main hours or tracking', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm initiallySubmitted initialValues={{ targetNet: '1500', monthlyExpenses: '150', billableHours: '70', irpfMode: 'manual', irpfRate: '15', selfEmployedFeeMode: 'manual', selfEmployedFee: '320' }} initialShareUrl="https://www.cuantofacturar.es/?targetNet=1500#calculadora" />);
    const before = (screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value;
    await user.click(screen.getByText('Planificar los meses sin facturación'));
    expect(screen.getByRole('textbox', { name: months })).not.toHaveAttribute('name');
    expect(screen.getByRole('textbox', { name: hours })).not.toHaveAttribute('name');
    await user.click(screen.getByRole('button', { name: 'Probar 10 meses de 70 horas' }));
    expect(screen.getByRole('status', status)).toHaveTextContent('26.816,52');
    expect((screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value).toBe(before);
    expect(screen.getByRole('spinbutton', { name: 'Horas facturables al mes' })).toHaveValue(70);
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });
});
