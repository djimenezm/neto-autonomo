import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DayRatePlanner from '@/components/DayRatePlanner';
import { dayRateCostExample, dayRateExample } from '@/lib/dayRateExample';

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
    await user.type(screen.getByRole('textbox', { name: 'Horas de cierre y seguimiento' }), '0,5');
    await user.type(screen.getByRole('textbox', { name: 'Costes específicos que debe cubrir el precio (EUR)' }), '0{Enter}');
    expect(screen.getByRole('status')).toHaveTextContent('6 h');
    expect(screen.getByRole('status')).toHaveTextContent('303,00');
    expect(screen.queryByText('Por hora tras esos costes')).not.toBeInTheDocument();
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

  it('subtracts only specific costs before comparing hourly amounts, and clears edited results', async () => {
    render(<DayRatePlanner example={dayRateExample} costExample={dayRateCostExample} />);
    await userEvent.click(screen.getByRole('button', { name: 'Probar el ejemplo con costes' }));
    const status = screen.getByRole('status', { name: 'Comprobación de jornada y costes' });
    for (const value of ['387,28', '260,00', '32,50', 'Faltan 37,28', 'no es sueldo neto']) expect(status).toHaveTextContent(value);
    const costs = screen.getByRole('textbox', { name: 'Costes específicos que debe cubrir el precio (EUR)' });
    fireEvent.change(costs, { target: { value: '0' } });
    expect(status).toBeEmptyDOMElement();
    await userEvent.click(screen.getByRole('button', { name: 'Comprobar jornada' }));
    expect(status).toHaveTextContent('Supera tu referencia en 52,72');
    expect(status).toHaveTextContent('43,75');
    expect(status).not.toHaveTextContent('Ejemplo hipotético');
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('requires a deliberate zero for costs and reports prices below the outlay', async () => {
    render(<DayRatePlanner example={dayRateExample} costExample={dayRateCostExample} />);
    await userEvent.click(screen.getByRole('button', { name: 'Probar el ejemplo con costes' }));
    const costs = screen.getByRole('textbox', { name: 'Costes específicos que debe cubrir el precio (EUR)' });
    fireEvent.change(costs, { target: { value: '' } });
    await userEvent.click(screen.getByRole('button', { name: 'Comprobar jornada' }));
    expect(costs).toHaveFocus();
    expect(costs).toHaveAttribute('aria-invalid', 'true');
    fireEvent.change(costs, { target: { value: '90' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Precio que estás valorando sin IVA (EUR, opcional)' }), { target: { value: '60' } });
    await userEvent.click(screen.getByRole('button', { name: 'Comprobar jornada' }));
    expect(screen.getByRole('status')).toHaveTextContent('El precio ni siquiera cubre los costes específicos: faltan 30,00');
    expect(screen.getByRole('status')).toHaveTextContent('-3,75');
  });

  it('normalizes entered decimal values before presenting a reproducible comparison', async () => {
    render(<DayRatePlanner example={dayRateExample} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cargar el ejemplo de la guía' }));
    const costs = screen.getByRole('textbox', { name: 'Costes específicos que debe cubrir el precio (EUR)' });
    fireEvent.change(costs, { target: { value: '1,005' } });
    fireEvent.submit(screen.getByRole('form', { name: 'Comprobar una tarifa diaria' }));
    expect(costs).toHaveValue('1,01');
    expect(screen.getByRole('status')).toHaveTextContent('298,29');
    expect(screen.getByRole('status')).toHaveTextContent('Faltan 75,33');
    expect(screen.getAllByRole('textbox')).toHaveLength(6);
    expect(screen.getAllByRole('textbox').every((input) => !input.hasAttribute('name'))).toBe(true);
  });
});
