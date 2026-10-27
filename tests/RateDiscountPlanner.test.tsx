import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Planner from '@/components/RateDiscountPlanner';

const result = () => screen.getByRole('status', { name: 'Rebaja de tarifa y capacidad' });
const capacity = () => screen.getByRole('textbox', { name: 'Capacidad mensual para facturar horas (horas)' });
const discount = () => screen.getByRole('textbox', { name: 'Rebaja que quieres comprobar (%)' });
const example = () => userEvent.click(screen.getByRole('button', { name: 'Probar la rebaja ficticia del 10 %' }));
const calculate = () => userEvent.click(screen.getByRole('button', { name: 'Comprobar rebaja de tarifa' }));

describe('rate discount planner', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });

  it('starts empty outside a form, validates every field and focuses the first error', async () => {
    const { container } = render(<Planner />);
    expect(screen.getAllByRole('textbox')).toHaveLength(4);
    for (const input of screen.getAllByRole('textbox')) {
      expect(input).toHaveValue('');
      expect(input).not.toHaveAttribute('name');
    }
    expect(container.querySelector('form')).toBeNull();
    await calculate();
    expect(screen.getAllByRole('textbox')[0]).toHaveFocus();
    expect(screen.getAllByRole('textbox').every((input) => input.getAttribute('aria-invalid') === 'true')).toBe(true);
    expect(result()).toHaveTextContent('Revisa los datos');
    expect(result()).not.toHaveTextContent('2880,00');
  });

  it('identifies the example, explains its loss and clears stale results on edit', async () => {
    render(<Planner />);
    await example();
    expect(result()).toHaveTextContent('Tarifa, rebaja y horas ficticias');
    expect(result()).toHaveTextContent('2880,00');
    expect(result()).toHaveTextContent('320,00');
    expect(result()).toHaveTextContent('88,89 h × 36,00');
    expect(result()).toHaveTextContent('3200,04');
    expect(result()).toHaveTextContent('No cabe en esa capacidad: faltan 8,89 h');
    fireEvent.change(capacity(), { target: { value: '100' } });
    expect(result()).toBeEmptyDOMElement();
    fireEvent.keyDown(capacity(), { key: 'Enter' });
    expect(result()).toHaveTextContent('Cabe por horas; quedarían 11,11 h');
    expect(result()).toHaveTextContent('Vender esas horas adicionales sigue siendo un supuesto');
    expect(result()).not.toHaveTextContent('horas ficticias');
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('accepts and normalizes Spanish decimals, with consistent rounded figures', async () => {
    render(<Planner />);
    const values = ['37,16', '12,345', '8,235', '10,234'];
    screen.getAllByRole('textbox').forEach((input, i) => fireEvent.change(input, { target: { value: values[i] } }));
    await calculate();
    expect(discount()).toHaveValue('12,35');
    expect(capacity()).toHaveValue('10,23');
    expect(result()).toHaveTextContent('32,57');
    expect(result()).toHaveTextContent('9,41 h');
    await calculate();
    expect(result()).toHaveTextContent('9,41 h');
  });

  it('handles zero rate, zero capacity and a starting load that already exceeds capacity', async () => {
    render(<Planner />);
    await example();
    fireEvent.change(discount(), { target: { value: '100' } });
    await calculate();
    expect(result()).toHaveTextContent('No se recupera con tarifa cero');
    expect(result()).toHaveTextContent('No aplicable');
    expect(result()).not.toHaveTextContent(/Infinity|NaN/);
    fireEvent.change(discount(), { target: { value: '0' } });
    fireEvent.change(capacity(), { target: { value: '0' } });
    await calculate();
    expect(result()).toHaveTextContent('Las horas de partida ya superan la capacidad');
    expect(result()).toHaveTextContent('faltan 80 h');
  });

  it('does not claim the rate changed when a small reduction rounds back to the original cent', async () => {
    render(<Planner />);
    await example();
    fireEvent.change(screen.getByRole('textbox', { name: 'Tarifa actual por hora sin IVA (EUR)' }), { target: { value: '0,01' } });
    await calculate();
    expect(result()).toHaveTextContent('no cambia la tarifa al redondearla a céntimos');
    const loss = within(result()).getByText('Reducción de facturación con las mismas horas');
    expect(loss.nextElementSibling).toHaveTextContent('0,00');
  });
});
