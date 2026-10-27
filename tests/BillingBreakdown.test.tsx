import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BillingBreakdown from '@/components/BillingBreakdown';
import CalculatorForm from '@/components/CalculatorForm';
import { calculateExample } from '@/lib/scenarioExamples';

describe('understanding the calculator result', () => {
  beforeEach(() => {
    window.va = vi.fn();
    window.gtag = vi.fn();
  });

  it('uses the actual calculation and opens without another conversion event', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm initialValues={{ targetNet: '2000', monthlyExpenses: '300', billableHours: '80', irpfMode: 'manual', irpfRate: '15', selfEmployedFeeMode: 'manual', selfEmployedFee: '320' }} />);
    await user.click(screen.getByRole('button', { name: 'Calcular mi tarifa orientativa' }));
    const callsBeforeOpening = vi.mocked(window.va!).mock.calls.length;
    await user.click(screen.getByText('Ver cómo se reparte la facturación'));
    const region = screen.getByRole('region', { name: 'De lo facturado a tu neto' });
    expect(within(region).getByText('Neto objetivo tras estas partidas').nextElementSibling).toHaveTextContent('= 2000,00');
    expect(within(region).getByText('Reserva estimada de IRPF').nextElementSibling).toHaveTextContent('− 352,94');
    expect(within(region).getByText(/de IVA =/)).toHaveTextContent('3597,26');
    expect(within(region).getByText(/Esa suma no es tu neto\./)).toBeVisible();
    expect(window.va).toHaveBeenCalledTimes(callsBeforeOpening);
    expect(screen.getByRole('link', { name: 'Ver un ejemplo completo de tarifa por hora' })).toHaveAttribute('href', '/tarifa-freelance-por-hora#ejemplo-tarifa');
  });

  it('shows other costs and distinguishes the simulation without VAT', () => {
    render(<BillingBreakdown result={calculateExample(2000, { monthlyNonDeductibleExpenses: 80, hasIVA: false })} hasIVA={false} headingId="test-breakdown" />);
    expect(screen.getByText('Costes no deducibles').nextElementSibling).toHaveTextContent('− 80,00');
    expect(screen.getByText(/Esta simulación no añade IVA/)).toBeVisible();
    expect(screen.queryByText(/de IVA =/)).not.toBeInTheDocument();
  });

  it('only displays a rounding adjustment when needed and keeps its sign', () => {
    render(<BillingBreakdown result={{ ...calculateExample(2000), billingWithoutVAT: 2972.95 }} hasIVA headingId="test-rounding" />);
    expect(screen.getByText('Ajuste de redondeo').nextElementSibling).toHaveTextContent('− 0,01');
  });
});
