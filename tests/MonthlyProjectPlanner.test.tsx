import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Planner from '@/components/MonthlyProjectPlanner';
import CalculatorForm from '@/components/CalculatorForm';
import { projectCapacityExample } from '@/lib/projectCapacityExample';

describe('monthly project capacity planner', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });

  it('starts with empty inputs, validates them and focuses the first error', async () => {
    render(<Planner {...projectCapacityExample} />);
    const price = screen.getByRole('textbox', { name: 'Precio por encargo sin IVA (EUR)' });
    expect(price).toHaveValue('');
    await userEvent.click(screen.getByRole('button', { name: 'Comprobar encargos' }));
    expect(price).toHaveFocus();
    expect(price).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('status')).not.toHaveTextContent('Encargos completos para alcanzar');
  });

  it('marks the fictional example and clears an old plan when effort changes', async () => {
    render(<Planner {...projectCapacityExample} />);
    await userEvent.click(screen.getByRole('button', { name: 'Probar un encargo ficticio' }));
    expect(screen.getByRole('status')).toHaveTextContent('Precio y horas del encargo ficticios');
    expect(screen.getByRole('status')).toHaveTextContent('4200,00');
    expect(screen.getByRole('status')).toHaveTextContent('Cabe por horas, sin holgura');
    const effort = screen.getByRole('textbox', { name: 'Horas totales por encargo' });
    fireEvent.change(effort, { target: { value: '60' } });
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    await userEvent.click(screen.getByRole('button', { name: 'Comprobar encargos' }));
    expect(screen.getByRole('status')).toHaveTextContent('Ese volumen no cabe: faltan 40 horas');
    expect(screen.getByRole('status')).toHaveTextContent('2049,41');
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('accepts Spanish decimals and Enter, with no named controls added to the main GET', async () => {
    const user = userEvent.setup();
    render(<Planner monthlyBilling={100} billableHours={4.5} />);
    await user.type(screen.getByRole('textbox', { name: 'Precio por encargo sin IVA (EUR)' }), '50');
    await user.type(screen.getByRole('textbox', { name: 'Horas totales por encargo' }), '1,5{Enter}');
    expect(screen.getByRole('status')).toHaveTextContent('Coincide con el objetivo');
    expect(screen.getByRole('status')).toHaveTextContent('quedan 1,5 h');
    expect(screen.getAllByRole('textbox').every((input) => !input.hasAttribute('name'))).toBe(true);
  });

  it('uses a changed monthly reference rather than retaining results for the previous one', async () => {
    const { rerender } = render(<Planner {...projectCapacityExample} />);
    await userEvent.click(screen.getByRole('button', { name: 'Probar un encargo ficticio' }));
    rerender(<Planner monthlyBilling={5000} billableHours={80} />);
    expect(screen.getByRole('status')).toHaveTextContent('3 × 2100,00');
    expect(screen.getByRole('status')).toHaveTextContent('Faltarían 800,00');
  });

  it('integrates with the actual result and leaves that result and its link intact', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm initiallySubmitted initialValues={{ targetNet: '3000', monthlyExpenses: '300', irpfMode: 'manual', irpfRate: '15', selfEmployedFeeMode: 'manual', selfEmployedFee: '320' }} initialShareUrl="https://www.cuantofacturar.es/?targetNet=3000#calculadora" />);
    const before = (screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value;
    await user.click(screen.getByText('Comprobar cuántos encargos necesito y si caben'));
    const group = screen.getByRole('group', { name: 'El encargo que quieres repetir' });
    expect(within(group).getAllByRole('textbox')).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: 'Probar un encargo ficticio' }));
    expect(screen.getByRole('status')).toHaveTextContent('4200,00');
    expect((screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value).toBe(before);
    expect(screen.getByRole('heading', { name: 'Tu referencia mensual para presupuestar' })).toBeVisible();
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });
});
