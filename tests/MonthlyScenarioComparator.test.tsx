import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Comparator from '@/components/MonthlyScenarioComparator';
import CalculatorForm from '@/components/CalculatorForm';
import { monthlyScenarioInput } from '@/lib/monthlyScenarioExample';

const costLabel = 'Gastos deducibles del escenario alternativo (EUR/mes)';
const hoursLabel = 'Horas facturables del escenario alternativo (mes)';

describe('monthly scenario comparator', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });

  it('starts empty and focuses the first invalid field', async () => {
    render(<Comparator reference={monthlyScenarioInput} />);
    const costs = screen.getByRole('textbox', { name: costLabel });
    expect(costs).toHaveValue('');
    await userEvent.click(screen.getByRole('button', { name: 'Comparar escenarios' }));
    expect(costs).toHaveFocus();
    expect(costs).toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByRole('link', { name: 'Abrir la alternativa en la calculadora' })).not.toBeInTheDocument();
  });

  it('loads the starting values on request and identifies an identical alternative', async () => {
    render(<Comparator reference={monthlyScenarioInput} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cargar los datos de partida' }));
    await userEvent.click(screen.getByRole('button', { name: 'Comparar escenarios' }));
    expect(screen.getByRole('status')).toHaveTextContent('Facturación: sin cambios');
    expect(screen.getByRole('status')).toHaveTextContent('Tarifa: sin cambios');
  });

  it('shows the alternative and removes it, including its link, after editing', async () => {
    const user = userEvent.setup();
    render(<Comparator reference={monthlyScenarioInput} />);
    await user.type(screen.getByRole('textbox', { name: costLabel }), '450,00');
    await user.type(screen.getByRole('textbox', { name: hoursLabel }), '60{Enter}');
    expect(screen.getByRole('status', { name: 'Comparación de escenarios' })).toHaveTextContent('3122,94');
    expect(screen.getByRole('status')).toHaveTextContent('52,05');
    expect(screen.getByRole('status')).toHaveTextContent('sube 14,89');
    expect(screen.getByRole('link', { name: 'Abrir la alternativa en la calculadora' })).toHaveAttribute('href', expect.stringContaining('billableHours=60'));
    fireEvent.change(screen.getByRole('textbox', { name: hoursLabel }), { target: { value: '80' } });
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    expect(screen.queryByRole('link', { name: 'Abrir la alternativa en la calculadora' })).not.toBeInTheDocument();
  });

  it('displays the rounded amount used for the calculation and rejects fractional hours', async () => {
    const user = userEvent.setup();
    render(<Comparator reference={monthlyScenarioInput} />);
    await user.type(screen.getByRole('textbox', { name: costLabel }), '1,005');
    await user.type(screen.getByRole('textbox', { name: hoursLabel }), '60{Enter}');
    expect(screen.getByRole('textbox', { name: costLabel })).toHaveValue('1,01');
    await user.clear(screen.getByRole('textbox', { name: hoursLabel }));
    await user.type(screen.getByRole('textbox', { name: hoursLabel }), '1,5{Enter}');
    expect(screen.getByRole('textbox', { name: hoursLabel })).toHaveAttribute('aria-invalid', 'true');
  });

  it('clears the fields, comparison and alternative link when the main reference changes', async () => {
    const { rerender } = render(<Comparator reference={monthlyScenarioInput} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cargar los datos de partida' }));
    await userEvent.click(screen.getByRole('button', { name: 'Comparar escenarios' }));
    rerender(<Comparator reference={{ ...monthlyScenarioInput, targetNet: 2500 }} />);
    expect(screen.getByRole('textbox', { name: costLabel })).toHaveValue('');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    expect(screen.queryByRole('link', { name: 'Abrir la alternativa en la calculadora' })).not.toBeInTheDocument();
  });

  it('keeps the main result, GET controls, summary and tracking unchanged', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm initiallySubmitted initialValues={{ targetNet: '2000', monthlyExpenses: '300', billableHours: '80', irpfMode: 'manual', irpfRate: '15', selfEmployedFeeMode: 'manual', selfEmployedFee: '320' }} initialShareUrl="https://www.cuantofacturar.es/?targetNet=2000#calculadora" />);
    const before = (screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value;
    await user.click(screen.getByText('Comparar cambios en mis gastos y horas'));
    const group = screen.getByRole('group', { name: 'Los dos datos que quieres comparar' });
    expect(within(group).getAllByRole('textbox').every((field) => !field.hasAttribute('name'))).toBe(true);
    await user.type(within(group).getByRole('textbox', { name: costLabel }), '450');
    await user.type(within(group).getByRole('textbox', { name: hoursLabel }), '60{Enter}');
    expect(screen.getByRole('status', { name: 'Comparación de escenarios' })).toHaveTextContent('3122,94');
    expect((screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value).toBe(before);
    expect(screen.getByRole('spinbutton', { name: /Horas facturables al mes/ })).toHaveValue(80);
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });
});
