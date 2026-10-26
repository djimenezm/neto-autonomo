import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DayRatePlanner from '@/components/DayRatePlanner';
import { dayRateExample } from '@/lib/dayRateExample';

describe('day-rate planner', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });

  it('starts empty, requires explicit zeroes and focuses the first invalid field', async () => {
    render(<DayRatePlanner example={dayRateExample} />);
    expect(screen.getAllByRole('textbox').every((input) => input.getAttribute('value') === '')).toBe(true);
    await userEvent.click(screen.getByRole('button', { name: 'Comprobar jornada' }));
    const rate = screen.getByRole('textbox', { name: 'Tu referencia por hora sin IVA (EUR)' });
    expect(rate).toHaveFocus();
    expect(rate).toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByRole('heading', { name: 'Lo que supone esta jornada' })).not.toBeInTheDocument();
  });

  it('loads the clearly marked example without conversion events or stale results after editing', async () => {
    render(<DayRatePlanner example={dayRateExample} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cargar el ejemplo de la guía' }));
    expect(screen.getByRole('status')).toHaveTextContent('297,28');
    expect(screen.getByRole('status')).toHaveTextContent('27,87');
    expect(screen.getByRole('status')).toHaveTextContent('Faltan 74,32');
    expect(screen.getByRole('status')).toHaveTextContent('Ejemplo hipotético');
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole('textbox', { name: 'Horas de preparación de este servicio' }), { target: { value: '2' } });
    expect(screen.queryByRole('heading', { name: 'Lo que supone esta jornada' })).not.toBeInTheDocument();
  });

  it('accepts Spanish decimals, calculates with Enter, and leaves comparison optional', async () => {
    const user = userEvent.setup();
    render(<DayRatePlanner example={dayRateExample} />);
    await user.type(screen.getByRole('textbox', { name: 'Tu referencia por hora sin IVA (EUR)' }), '50,50');
    await user.type(screen.getByRole('textbox', { name: 'Horas de jornada con el cliente' }), '4');
    await user.type(screen.getByRole('textbox', { name: 'Horas de preparación de este servicio' }), '1,5');
    await user.type(screen.getByRole('textbox', { name: 'Horas de cierre y seguimiento' }), '0,5{Enter}');
    expect(screen.getByRole('status')).toHaveTextContent('6 h');
    expect(screen.getByRole('status')).toHaveTextContent('303,00');
    expect(screen.queryByText('Ingreso por cada hora dedicada')).not.toBeInTheDocument();
    expect(screen.getAllByRole('textbox').every((input) => !input.hasAttribute('name'))).toBe(true);
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('shows equality and a higher quote without presenting the difference as net profit', async () => {
    render(<DayRatePlanner example={dayRateExample} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cargar el ejemplo de la guía' }));
    const price = screen.getByRole('textbox', { name: 'Precio que estás valorando sin IVA (EUR, opcional)' });
    fireEvent.change(price, { target: { value: '297,28' } });
    await userEvent.click(screen.getByRole('button', { name: 'Comprobar jornada' }));
    expect(screen.getByRole('status')).toHaveTextContent('El precio coincide');
    fireEvent.change(price, { target: { value: '350' } });
    await userEvent.click(screen.getByRole('button', { name: 'Comprobar jornada' }));
    expect(screen.getByRole('status')).toHaveTextContent('Supera tu referencia en 52,72');
    expect(screen.getByRole('status')).toHaveTextContent('No calcula beneficio neto');
  });
});
