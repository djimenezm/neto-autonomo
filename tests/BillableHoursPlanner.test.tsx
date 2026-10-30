import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CalculatorForm from '@/components/CalculatorForm';
import { formatCurrency } from '@/lib/format';

async function openPlanner() {
  const user = userEvent.setup();
  await user.click(screen.getByText('Estimar mis horas con mi agenda'));
  return user;
}

describe('billable-hours helper in the main calculator', () => {
  beforeEach(() => {
    window.va = vi.fn();
    window.gtag = vi.fn();
    window.history.replaceState(null, '', '/');
  });

  it('requires a complete agenda and leaves the main calculator alone on invalid input', async () => {
    render(<CalculatorForm />);
    const user = await openPlanner();
    const days = screen.getByRole('textbox', { name: 'Días de trabajo por semana' });
    expect(days).toHaveValue('');
    await user.click(screen.getByRole('button', { name: 'Estimar horas' }));
    expect(days).toHaveAttribute('aria-invalid', 'true');
    expect(days).toHaveFocus();
    expect(screen.getByRole('spinbutton', { name: 'Horas facturables al mes' })).toHaveValue(80);
    expect(screen.queryByRole('button', { name: /Usar .* horas al mes/ })).not.toBeInTheDocument();
    expect(window.va).not.toHaveBeenCalled();
  });

  it('applies only whole hours, preserves the other values and renews the result on explicit submission', async () => {
    render(<CalculatorForm initiallySubmitted initialValues={{ targetNet: '2500', monthlyExpenses: '475', hasIVA: false, irpfMode: 'manual', irpfRate: '22', selfEmployedFeeMode: 'manual', selfEmployedFee: '350' }} />);
    const user = await openPlanner();
    await user.click(screen.getByRole('button', { name: 'Probar un ejemplo' }));
    expect(screen.getByText(/Capacidad media:/)).toHaveTextContent('107,3 h/mes');
    await user.click(screen.getByRole('button', { name: 'Usar 107 horas al mes' }));

    const hours = screen.getByRole('spinbutton', { name: 'Horas facturables al mes' });
    expect(hours).toHaveValue(107);
    expect(hours).toHaveFocus();
    expect(screen.getByRole('spinbutton', { name: 'Neto mensual deseado (EUR)' })).toHaveValue(2500);
    expect(screen.getByRole('spinbutton', { name: 'Gastos mensuales deducibles (EUR)' })).toHaveValue(475);
    expect(screen.getByRole('spinbutton', { name: 'Cuota manual de autónomos (EUR)' })).toHaveValue(350);
    expect(screen.getByRole('combobox', { name: /Cómo quieres estimar el IRPF/ })).toHaveValue('manual');
    expect(screen.getByRole('radio', { name: 'No' })).toBeChecked();
    expect(screen.getByRole('status')).toHaveTextContent('Aplicadas 107 h/mes');
    expect(screen.queryByRole('heading', { name: 'Tu referencia mensual para presupuestar' })).not.toBeInTheDocument();
    expect(window.va).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Calcular mi tarifa orientativa' }));
    expect(screen.getByRole('heading', { name: 'Tu referencia mensual para presupuestar' })).toBeVisible();
    const query = new URLSearchParams(window.location.search);
    expect(Object.fromEntries(query)).toMatchObject({ targetNet: '2500', monthlyExpenses: '475', billableHours: '107', irpfRate: '22', selfEmployedFee: '350', hasIVA: 'no' });
    expect(query.has('weeksOff')).toBe(false);
    expect(query.has('daysPerWeek')).toBe(false);
    expect(within(screen.getByRole('group', { name: 'Tu agenda de trabajo' })).getAllByRole('textbox').every((input) => !input.hasAttribute('name'))).toBe(true);
  });

  it('accepts Spanish decimals and Enter estimates the agenda without submitting the main form', async () => {
    render(<CalculatorForm />);
    const user = await openPlanner();
    await user.type(screen.getByRole('textbox', { name: 'Días de trabajo por semana' }), '4,5');
    await user.type(screen.getByRole('textbox', { name: 'Horas de trabajo por día' }), '6,5');
    await user.type(screen.getByRole('textbox', { name: 'Horas no facturables por semana' }), '8,25');
    await user.type(screen.getByRole('textbox', { name: 'Semanas sin actividad al año' }), '5,5{Enter}');
    expect(screen.getByRole('button', { name: 'Usar 81 horas al mes' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Tu referencia mensual para presupuestar' })).not.toBeInTheDocument();
    expect(window.va).not.toHaveBeenCalled();
    expect(window.location.search).toBe('');
  });

  it('applies all 42 exact monthly hours from a decimal agenda to the result and shared link', async () => {
    render(<CalculatorForm initialValues={{ irpfMode: 'manual', irpfRate: '15', selfEmployedFeeMode: 'manual', selfEmployedFee: '320' }} />);
    const user = await openPlanner();
    await user.type(screen.getByRole('textbox', { name: 'Días de trabajo por semana' }), '4');
    await user.type(screen.getByRole('textbox', { name: 'Horas de trabajo por día' }), '4');
    await user.type(screen.getByRole('textbox', { name: 'Horas no facturables por semana' }), '4,8');
    await user.type(screen.getByRole('textbox', { name: 'Semanas sin actividad al año' }), '7{Enter}');

    expect(screen.getByText(/Capacidad media:/)).toHaveTextContent('42 h/mes');
    await user.click(screen.getByRole('button', { name: 'Usar 42 horas al mes' }));
    expect(screen.getByRole('spinbutton', { name: 'Horas facturables al mes' })).toHaveValue(42);
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
    expect(window.location.search).toBe('');

    await user.click(screen.getByRole('button', { name: 'Calcular mi tarifa orientativa' }));
    expect(new URLSearchParams(window.location.search).get('billableHours')).toBe('42');
    const summary = (screen.getByLabelText('Resumen detallado para compartir') as HTMLTextAreaElement).value;
    expect(summary).toContain('Horas facturables usadas: 42 al mes');
    expect(summary).toContain(`Tarifa media orientativa: ${formatCurrency(54.4)}/h`);
  });

  it('clears stale capacity after edits and does not apply zero-capacity plans', async () => {
    render(<CalculatorForm />);
    const user = await openPlanner();
    await user.click(screen.getByRole('button', { name: 'Probar un ejemplo' }));
    const weeks = screen.getByRole('textbox', { name: 'Semanas sin actividad al año' });
    fireEvent.change(weeks, { target: { value: '52' } });
    expect(screen.queryByRole('button', { name: 'Usar 107 horas al mes' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Estimar horas' }));
    expect(screen.getByText(/No hay una hora mensual completa disponible/)).toBeVisible();
    expect(screen.queryByRole('button', { name: /Usar .* horas al mes/ })).not.toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: 'Horas facturables al mes' })).toHaveValue(80);
  });
});
