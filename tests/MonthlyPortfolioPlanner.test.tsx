import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Planner from '@/components/MonthlyPortfolioPlanner';
import CalculatorForm from '@/components/CalculatorForm';

const reference = { monthlyBilling: 4149.41, billableHours: 80 };
const status = { name: 'Plan de servicios combinados' };
const field = (group: number, key: 'quantity' | 'price' | 'hours') => screen.getByRole('textbox', { name: key === 'quantity' ? `Cantidad del grupo ${group}` : key === 'price' ? `Precio por servicio del grupo ${group} sin IVA (EUR)` : `Horas por servicio del grupo ${group}` });

describe('monthly portfolio editor', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });

  it('starts with one blank group and focuses invalid input without creating a form', async () => {
    render(<Planner {...reference} />);
    expect(screen.getAllByRole('textbox')).toHaveLength(3);
    for (const input of screen.getAllByRole('textbox')) {
      expect(input).toHaveValue(''); expect(input).not.toHaveAttribute('name');
    }
    expect(document.querySelector('form')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Quitar grupo 1' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Comprobar combinación' }));
    expect(field(1, 'quantity')).toHaveFocus();
    expect(field(1, 'quantity')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('status', status)).toHaveTextContent('Revisa los campos');
  });

  it('adds and removes groups with focus and enforces the visible group limit', async () => {
    const user = userEvent.setup();
    render(<Planner {...reference} />);
    for (let group = 2; group <= 8; group++) {
      await user.click(screen.getByRole('button', { name: 'Añadir otro grupo' }));
      expect(field(group, 'quantity')).toHaveFocus();
    }
    expect(screen.getByRole('button', { name: 'Añadir otro grupo' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Quitar grupo 8' }));
    expect(field(7, 'quantity')).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Añadir otro grupo' })).toBeEnabled();
    expect(screen.getAllByRole('textbox')).toHaveLength(21);
  });

  it('reproduces the mixed example, then clears figures on edit and checks overload with Enter', async () => {
    const user = userEvent.setup();
    render(<Planner {...reference} />);
    await user.click(screen.getByRole('button', { name: 'Probar dos servicios ficticios' }));
    expect(screen.getByRole('status', status)).toHaveTextContent('Precios, cantidades y horas ficticios');
    expect(screen.getByRole('status', status)).toHaveTextContent('4200,00');
    expect(screen.getByRole('status', status)).toHaveTextContent('quedan 12 h');
    fireEvent.change(field(2, 'hours'), { target: { value: '50' } });
    expect(screen.getByRole('status', status)).toBeEmptyDOMElement();
    await user.type(field(2, 'hours'), '{Enter}');
    expect(screen.getByRole('status', status)).toHaveTextContent('faltan 6 h de capacidad');
    expect(screen.getByRole('status', status)).toHaveTextContent('supera el objetivo en 50,59');
    expect(screen.getByRole('status', status)).not.toHaveTextContent('Precios, cantidades y horas ficticios');
  });

  it('keeps the remaining row values when removing a service group and invalidates the old plan', async () => {
    const user = userEvent.setup();
    render(<Planner {...reference} />);
    await user.click(screen.getByRole('button', { name: 'Probar dos servicios ficticios' }));
    await user.click(screen.getByRole('button', { name: 'Quitar grupo 1' }));
    expect(screen.getByRole('status', status)).toBeEmptyDOMElement();
    expect(field(1, 'quantity')).toHaveValue('1');
    expect(field(1, 'price')).toHaveValue('1800');
    expect(field(1, 'hours')).toHaveValue('32');
    expect(field(1, 'quantity')).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Comprobar combinación' }));
    expect(screen.getByRole('status', status)).toHaveTextContent('Faltan 2349,41');
    expect(screen.getByRole('status', status)).toHaveTextContent('quedan 48 h');
  });

  it('accepts Spanish decimals and normalizes unit values before multiplication', async () => {
    const user = userEvent.setup();
    render(<Planner monthlyBilling={0.33} billableHours={3.03} />);
    await user.type(field(1, 'quantity'), '3');
    await user.type(field(1, 'price'), '0,105');
    await user.type(field(1, 'hours'), '1,005{Enter}');
    expect(field(1, 'price')).toHaveValue('0,11');
    expect(field(1, 'hours')).toHaveValue('1,01');
    expect(screen.getByRole('status', status)).toHaveTextContent('La facturación coincide con el objetivo');
    expect(screen.getByRole('status', status)).toHaveTextContent('Cabe por horas, sin holgura');
  });

  it.each([{ monthlyBilling: 5000, billableHours: 80 }, { monthlyBilling: 4149.41, billableHours: 60 }])('resets all groups after a main reference change: %j', async (next) => {
    const { rerender } = render(<Planner {...reference} />);
    await userEvent.click(screen.getByRole('button', { name: 'Probar dos servicios ficticios' }));
    rerender(<Planner {...next} />);
    expect(screen.getAllByRole('textbox')).toHaveLength(3);
    expect(field(1, 'quantity')).toHaveValue('');
    expect(screen.getByRole('status', status)).toBeEmptyDOMElement();
  });

  it('uses the actual result without changing its summary, hours, GET fields or events', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm initiallySubmitted initialValues={{ targetNet: '1500', monthlyExpenses: '150', billableHours: '70', irpfMode: 'manual', irpfRate: '15', selfEmployedFeeMode: 'manual', selfEmployedFee: '320' }} initialShareUrl="https://www.cuantofacturar.es/?targetNet=1500#calculadora" />);
    const summary = (screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value;
    await user.click(screen.getByText('Comprobar cuántos encargos necesito y si caben'));
    await user.click(screen.getByText('Combinar encargos de distintos precios y horas'));
    await user.click(screen.getByRole('button', { name: 'Probar dos servicios ficticios' }));
    expect(screen.getByRole('status', status)).toHaveTextContent('supera el objetivo en 1965,29');
    expect(screen.getByRole('status', status)).toHaveTextContent('quedan 2 h');
    expect((screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value).toBe(summary);
    expect(screen.getByRole('spinbutton', { name: 'Horas facturables al mes' })).toHaveValue(70);
    const row = screen.getByRole('group', { name: 'Grupo 1 de servicios iguales' });
    for (const input of within(row).getAllByRole('textbox')) expect(input).not.toHaveAttribute('name');
    const resultSection = screen.getByRole('heading', { name: 'Tu referencia mensual para presupuestar' }).closest('section');
    expect(resultSection?.querySelectorAll(':scope > details')).toHaveLength(4);
    expect(screen.getByRole('link', { name: 'Ver el ejemplo de servicios combinados' })).toHaveAttribute('href', '/cuanto-facturar-autonomo-3000-euros#combinar-encargos');
    expect(window.va).not.toHaveBeenCalled(); expect(window.gtag).not.toHaveBeenCalled();
  });
});
