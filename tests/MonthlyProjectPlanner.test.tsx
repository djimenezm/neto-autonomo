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

  it('compares one offer before the monthly plan, using the full reference rather than its rounded hourly display', async () => {
    render(<Planner monthlyBilling={2687.65} billableHours={100} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Precio por encargo sin IVA (EUR)' }), { target: { value: '600' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Horas totales por encargo' }), { target: { value: '30' } });
    await userEvent.click(screen.getByRole('button', { name: 'Comprobar encargos' }));

    const result = screen.getByRole('status');
    expect(within(result).getAllByRole('heading').map((heading) => heading.textContent)).toEqual([
      'Qué supone este encargo', 'Si repites encargos iguales durante el mes',
    ]);
    expect(within(result).getByText('Precio por hora del encargo').nextElementSibling).toHaveTextContent('20,00');
    expect(within(result).getByText('Referencia para estas horas sin IVA').nextElementSibling).toHaveTextContent('806,30');
    expect(within(result).getByText('Horas que cubre este precio a tu referencia').nextElementSibling).toHaveTextContent('22,32 h');
    expect(result).toHaveTextContent('Las horas previstas superan este límite en 7,68 h');
    expect(result).toHaveTextContent('Revisa el alcance o el precio');
    expect(result).toHaveTextContent('redondeamos hacia abajo a centésimas');
    expect(result).toHaveTextContent('El precio queda 206,30');
    expect(result).toHaveTextContent('por debajo de la referencia para estas horas');
    expect(result).toHaveTextContent('no añade costes específicos');
    expect(result).toHaveTextContent('faltan 50 horas');

    fireEvent.change(screen.getByRole('textbox', { name: 'Horas totales por encargo' }), { target: { value: '40' } });
    expect(result).toHaveTextContent('Datos modificados. Pulsa «Comprobar encargos» para actualizar el resultado.');
    expect(within(result).queryByRole('heading', { name: 'Qué supone este encargo' })).not.toBeInTheDocument();
  });

  it('shows the offer hourly price without inventing a reference when monthly capacity is zero', async () => {
    render(<Planner monthlyBilling={2687.65} billableHours={0} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Precio por encargo sin IVA (EUR)' }), { target: { value: '600' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Horas totales por encargo' }), { target: { value: '30' } });
    await userEvent.click(screen.getByRole('button', { name: 'Comprobar encargos' }));

    const result = screen.getByRole('status');
    expect(within(result).getByText('Precio por hora del encargo').nextElementSibling).toHaveTextContent('20,00');
    expect(result).toHaveTextContent('Sin horas facturables disponibles');
    expect(within(result).queryByText('Referencia para estas horas sin IVA')).not.toBeInTheDocument();
    expect(within(result).queryByText('Horas que cubre este precio a tu referencia')).not.toBeInTheDocument();
    expect(result).not.toHaveTextContent('Infinity');
    expect(result).not.toHaveTextContent('NaN');
  });

  it('distinguishes a covered scope from capacity and removes the time limit while editing', async () => {
    render(<Planner monthlyBilling={100} billableHours={4.5} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Precio por encargo sin IVA (EUR)' }), { target: { value: '50' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Horas totales por encargo' }), { target: { value: '1,5' } });
    await userEvent.click(screen.getByRole('button', { name: 'Comprobar encargos' }));
    const result = screen.getByRole('status');
    expect(within(result).getByText('Horas que cubre este precio a tu referencia').nextElementSibling).toHaveTextContent('2,25 h');
    expect(result).toHaveTextContent('Las horas previstas no superan este límite');
    expect(result).toHaveTextContent('no reserva hueco en tu agenda');
    expect(result).not.toHaveTextContent('Las horas previstas superan este límite');
    fireEvent.change(screen.getByRole('textbox', { name: 'Precio por encargo sin IVA (EUR)' }), { target: { value: '25' } });
    expect(result).toHaveTextContent('Datos modificados. Pulsa «Comprobar encargos» para actualizar el resultado.');
    expect(within(result).queryByRole('heading', { name: 'Qué supone este encargo' })).not.toBeInTheDocument();
  });

  it('explains a price that does not cover a hundredth of an hour instead of suggesting free work', async () => {
    render(<Planner monthlyBilling={0.02} billableHours={0.01} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Precio por encargo sin IVA (EUR)' }), { target: { value: '0,01' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Horas totales por encargo' }), { target: { value: '0,01' } });
    await userEvent.click(screen.getByRole('button', { name: 'Comprobar encargos' }));
    const result = screen.getByRole('status');
    expect(result).toHaveTextContent('El precio no cubre ni 0,01 h a tu referencia');
    expect(result).toHaveTextContent('Revisa el alcance o el precio');
    expect(result).not.toHaveTextContent('Las horas previstas no superan este límite');
  });

  it('keeps the comparison and monthly plan when only the new time limit is beyond the precise range', async () => {
    render(<Planner monthlyBilling={0.01} billableHours={100} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Precio por encargo sin IVA (EUR)' }), { target: { value: '10000000000000' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Horas totales por encargo' }), { target: { value: '100' } });
    await userEvent.click(screen.getByRole('button', { name: 'Comprobar encargos' }));
    const result = screen.getByRole('status');
    expect(result).toHaveTextContent('No podemos mostrar con precisión las horas que cubre este precio');
    expect(within(result).queryByText('Horas que cubre este precio a tu referencia')).not.toBeInTheDocument();
    expect(within(result).getByText('Referencia para estas horas sin IVA').nextElementSibling).toHaveTextContent('0,01');
    expect(result).toHaveTextContent('Encargos completos para alcanzar el importe');
    expect(result).not.toHaveTextContent('Infinity');
  });

  it('marks the fictional example and clears an old plan when effort changes', async () => {
    render(<Planner {...projectCapacityExample} />);
    await userEvent.click(screen.getByRole('button', { name: 'Probar un encargo ficticio' }));
    expect(screen.getByRole('status')).toHaveTextContent('Precio y horas del encargo ficticios');
    expect(screen.getByRole('status')).toHaveTextContent('4200,00');
    expect(screen.getByRole('status')).toHaveTextContent('Cabe por horas, sin holgura');
    const effort = screen.getByRole('textbox', { name: 'Horas totales por encargo' });
    fireEvent.change(effort, { target: { value: '60' } });
    expect(screen.getByRole('status')).toHaveTextContent('Datos modificados. Pulsa «Comprobar encargos» para actualizar el resultado.');
    expect(screen.queryByRole('heading', { name: 'Qué supone este encargo' })).not.toBeInTheDocument();
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
    expect(screen.getByRole('status')).toHaveTextContent('Las horas previstas superan este límite en 6,4 h');
  });

  it('integrates with the actual result and leaves that result and its link intact', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm initiallySubmitted initialValues={{ targetNet: '3000', monthlyExpenses: '300', irpfMode: 'manual', irpfRate: '15', selfEmployedFeeMode: 'manual', selfEmployedFee: '320' }} initialShareUrl="https://www.cuantofacturar.es/?targetNet=3000#calculadora" />);
    const before = (screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value;
    await user.click(screen.getByText('Comprobar cuántos encargos necesito y si caben'));
    const group = screen.getByRole('group', { name: 'El encargo que quieres valorar' });
    expect(within(group).getAllByRole('textbox')).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: 'Probar un encargo ficticio' }));
    expect(within(group.parentElement!).getByRole('status')).toHaveTextContent('4200,00');
    expect((screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value).toBe(before);
    expect(screen.getByRole('heading', { name: 'Tu referencia mensual para presupuestar' })).toBeVisible();
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });
});
