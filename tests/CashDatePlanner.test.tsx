import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Planner from '@/components/CashDatePlanner';

const status = () => screen.getByRole('status', { name: 'Caja por fechas' });
const field = (label: string, index: number) => screen.getByLabelText(`${label} del movimiento ${index}`);
const example = () => userEvent.click(screen.getByRole('button', { name: 'Probar las fechas ficticias' }));
const check = () => userEvent.click(screen.getByRole('button', { name: 'Comprobar vencimientos' }));

describe('cash date planner', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });

  it('starts empty with unnamed controls and focuses each first invalid field', async () => {
    render(<Planner />);
    expect(document.querySelectorAll('input')).toHaveLength(7);
    expect(screen.getAllByRole('combobox')).toHaveLength(3);
    for (const input of document.querySelectorAll('input,select')) { expect(input).toHaveValue(''); expect(input).not.toHaveAttribute('name'); }
    expect(document.querySelector('form')).toBeNull();
    await check();
    const initial = screen.getByLabelText('Saldo antes del primer movimiento (EUR)');
    expect(initial).toHaveFocus();
    fireEvent.change(initial, { target: { value: '0' } });
    await check();
    expect(field('Fecha', 1)).toHaveFocus();
    fireEvent.change(field('Fecha', 1), { target: { value: '2026-11-05' } });
    await check();
    expect(field('Tipo', 1)).toHaveFocus();
    await userEvent.selectOptions(field('Tipo', 1), 'receipt');
    await check();
    expect(field('Importe (EUR)', 1)).toHaveFocus();
    expect(field('Importe (EUR)', 1)).toHaveAttribute('aria-invalid', 'true');
  });

  it('reproduces the example and a negative interim balance despite a positive final one', async () => {
    render(<Planner />); await example();
    expect(status()).toHaveTextContent('movimientos ficticios');
    expect(within(status()).getByText('Saldo tras la última fecha').nextElementSibling).toHaveTextContent('700,00');
    expect(within(status()).getByText('Saldo mínimo con este orden supuesto').nextElementSibling).toHaveTextContent('-800,00');
    expect(within(status()).getByText('Primer punto negativo').nextElementSibling).toHaveTextContent('05/11/2026');
    expect(within(status()).getByRole('region', { name: 'Saldos por fecha con pagos antes de cobros' })).toHaveAttribute('tabindex', '0');
    expect(status()).toHaveTextContent('No es beneficio neto');
    expect(window.va).not.toHaveBeenCalled(); expect(window.gtag).not.toHaveBeenCalled();
  });

  it('clears edited results and groups a same-date receipt after its payments even when its closing is positive', async () => {
    render(<Planner />); await example();
    fireEvent.change(field('Fecha', 2), { target: { value: '2026-11-05' } });
    expect(status()).toBeEmptyDOMElement();
    await userEvent.type(field('Importe (EUR)', 2), '{Enter}');
    const row = within(status()).getByRole('rowheader', { name: '05/11/2026' }).closest('tr')!;
    expect(row).toHaveTextContent('-800,00'); expect(row).toHaveTextContent('1600,00');
    expect(within(status()).getAllByRole('rowheader')).toHaveLength(2);
    expect(status()).not.toHaveTextContent('movimientos ficticios');
    expect(status()).toHaveTextContent('pagos antes de cobros en una misma fecha');
    fireEvent.change(field('Fecha', 2), { target: { value: '2026-11-01' } });
    await check();
    expect(within(status()).getByText('Saldo mínimo con este orden supuesto').nextElementSibling).toHaveTextContent('700,00');
    expect(within(status()).getByText('Primer punto negativo').nextElementSibling).toHaveTextContent('Ninguno');
  });

  it('adds and removes rows while clearing old results and keeping focus in the remaining controls', async () => {
    render(<Planner />); await example();
    await userEvent.click(screen.getByRole('button', { name: 'Añadir movimiento' }));
    expect(status()).toBeEmptyDOMElement();
    expect(field('Fecha', 4)).toHaveFocus();
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar movimiento 2' }));
    expect(screen.getAllByRole('combobox')).toHaveLength(3);
    expect(field('Fecha', 2)).toHaveValue('2026-11-25');
    expect(field('Fecha', 2)).toHaveFocus();
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar movimiento 3' }));
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar movimiento 2' }));
    expect(screen.getByRole('button', { name: 'Eliminar movimiento 1' })).toBeDisabled();
    expect(field('Fecha', 1)).toHaveFocus();
  });

  it('accepts negative initial balances and Spanish half-cent amounts and normalizes the inputs', async () => {
    render(<Planner />);
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar movimiento 3' }));
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar movimiento 2' }));
    await userEvent.type(screen.getByLabelText('Saldo antes del primer movimiento (EUR)'), '-1,005');
    fireEvent.change(field('Fecha', 1), { target: { value: '2026-11-05' } });
    await userEvent.selectOptions(field('Tipo', 1), 'receipt');
    await userEvent.type(field('Importe (EUR)', 1), '2,005{Enter}');
    expect(screen.getByLabelText('Saldo antes del primer movimiento (EUR)')).toHaveValue('-1,01');
    expect(field('Importe (EUR)', 1)).toHaveValue('2,01');
    expect(within(status()).getByText('Saldo tras la última fecha').nextElementSibling).toHaveTextContent('1,00');
    expect(within(status()).getByText('Primer punto negativo').nextElementSibling).toHaveTextContent('Saldo inicial');
    expect(window.va).not.toHaveBeenCalled(); expect(window.gtag).not.toHaveBeenCalled();
  });

  it('prevents adding more than twenty movements and allows adding again after removing one', async () => {
    render(<Planner />);
    const add = screen.getByRole('button', { name: 'Añadir movimiento' });
    for (let i = 3; i < 20; i++) fireEvent.click(add);
    expect(screen.getAllByRole('combobox')).toHaveLength(20);
    expect(screen.getByRole('button', { name: 'Añadir movimiento' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar movimiento 20' }));
    expect(screen.getByRole('button', { name: 'Añadir movimiento' })).toBeEnabled();
    expect(field('Fecha', 19)).toHaveFocus();
  });
});
