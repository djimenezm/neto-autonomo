import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Planner from '@/components/CashFlowPlanner';

const status = { name: 'Plan de caja de tres meses' };
const label = 'Saldo inicial de la cuenta (EUR)';
const field = (kind: 'Cobros' | 'Pagos', month: number) => screen.getByRole('textbox', { name: `${kind} previstos del mes ${month} (EUR)` });

describe('cash flow planner', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });

  it('starts with seven blank unnamed fields, no form, and focuses the first incomplete amount', async () => {
    const user = userEvent.setup();
    render(<Planner />);
    expect(screen.getAllByRole('textbox')).toHaveLength(7);
    for (const input of screen.getAllByRole('textbox')) { expect(input).toHaveValue(''); expect(input).not.toHaveAttribute('name'); }
    expect(document.querySelector('form')).toBeNull();
    expect(screen.getByRole('link', { name: 'Revisar cobros y pagos por fecha' })).toHaveAttribute('href', '#vencimientos-caja');
    await user.click(screen.getByRole('button', { name: 'Comprobar plan de caja' }));
    expect(screen.getByRole('textbox', { name: label })).toHaveFocus();
    expect(screen.getByRole('textbox', { name: label })).toHaveAttribute('aria-invalid', 'true');
    await user.type(screen.getByRole('textbox', { name: label }), '0');
    await user.click(screen.getByRole('button', { name: 'Comprobar plan de caja' }));
    expect(field('Cobros', 1)).toHaveFocus();
  });

  it('reproduces the fictional example and exposes an earlier deficit despite a positive final balance', async () => {
    render(<Planner />);
    await userEvent.click(screen.getByRole('button', { name: 'Probar tres meses ficticios' }));
    const result = screen.getByRole('status', status);
    expect(result).toHaveTextContent('Saldos, cobros y pagos ficticios');
    expect(within(result).getByText('Saldo al cierre del tercer mes').nextElementSibling).toHaveTextContent('700,00');
    expect(within(result).getByText('Saldo mínimo entre el inicio y los cierres').nextElementSibling).toHaveTextContent('-800,00');
    expect(result).toHaveTextContent('Cierre del mes 1');
    expect(result).toHaveTextContent('puede hacer falta más saldo');
    expect(within(result).getByRole('region', { name: 'Saldos previstos del plan de caja' })).toHaveAttribute('tabindex', '0');
    expect(window.va).not.toHaveBeenCalled(); expect(window.gtag).not.toHaveBeenCalled();
  });

  it('removes stale figures after editing and keeps the final balance while exposing a delayed receipt', async () => {
    const user = userEvent.setup();
    render(<Planner />);
    await user.click(screen.getByRole('button', { name: 'Probar tres meses ficticios' }));
    fireEvent.change(field('Cobros', 2), { target: { value: '0' } });
    expect(screen.getByRole('status', status)).toBeEmptyDOMElement();
    fireEvent.change(field('Cobros', 3), { target: { value: '5400' } });
    await user.type(field('Cobros', 3), '{Enter}');
    const result = screen.getByRole('status', status);
    expect(within(result).getByText('Saldo al cierre del tercer mes').nextElementSibling).toHaveTextContent('700,00');
    expect(within(result).getByText('Saldo mínimo entre el inicio y los cierres').nextElementSibling).toHaveTextContent('-2600,00');
    expect(result).not.toHaveTextContent('Saldos, cobros y pagos ficticios');
  });

  it('accepts Spanish decimals and Enter and displays the exact normalized inputs used', async () => {
    const user = userEvent.setup();
    render(<Planner />);
    await user.type(screen.getByRole('textbox', { name: label }), '1,005');
    await user.type(field('Cobros', 1), '0,105'); await user.type(field('Pagos', 1), '0,015');
    for (const month of [2, 3]) { await user.type(field('Cobros', month), '0'); await user.type(field('Pagos', month), '0'); }
    await user.type(field('Pagos', 3), '{Enter}');
    expect(screen.getByRole('textbox', { name: label })).toHaveValue('1,01');
    expect(field('Cobros', 1)).toHaveValue('0,11'); expect(field('Pagos', 1)).toHaveValue('0,02');
    const result = screen.getByRole('status', status);
    expect(within(result).getByText('Saldo al cierre del tercer mes').nextElementSibling).toHaveTextContent('1,10');
    expect(result).toHaveTextContent('No hay saldos negativos al inicio ni en los cierres calculados');
  });

  it('identifies a negative starting balance even with no movements', async () => {
    const user = userEvent.setup();
    render(<Planner />);
    await user.type(screen.getByRole('textbox', { name: label }), '-100');
    for (const month of [1, 2, 3]) { await user.type(field('Cobros', month), '0'); await user.type(field('Pagos', month), '0'); }
    await user.click(screen.getByRole('button', { name: 'Comprobar plan de caja' }));
    const result = screen.getByRole('status', status);
    expect(within(result).getByText('Primer saldo negativo entre inicio y cierres').nextElementSibling).toHaveTextContent('Saldo inicial');
    expect(result).toHaveTextContent('100,00');
  });
});
