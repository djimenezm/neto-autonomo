import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Preview from '@/components/MonthlyNetPreview';
import CalculatorForm from '@/components/CalculatorForm';
import { monthlyNetExampleReference as reference } from '@/lib/monthlyNetExample';

const label = 'Facturación mensual prevista sin IVA (EUR)';
const status = { name: 'Neto según facturación' };

describe('monthly net preview', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });

  it('starts empty with no form or named field and focuses the invalid input', async () => {
    render(<Preview reference={reference} />);
    const field = screen.getByRole('textbox', { name: label });
    expect(field).toHaveValue(''); expect(field).not.toHaveAttribute('name');
    expect(document.querySelector('form')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Estimar neto con esta facturación' }));
    expect(field).toHaveFocus(); expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('status', status)).toHaveTextContent('Revisa la facturación');
  });

  it('reproduces the example and removes old figures and the fictional marker after editing', async () => {
    const user = userEvent.setup();
    render(<Preview reference={reference} />);
    await user.click(screen.getByRole('button', { name: 'Probar una facturación de 2.500 €' }));
    expect(screen.getByRole('status', status)).toHaveTextContent('Facturación ficticia');
    expect(screen.getByRole('status', status)).toHaveTextContent('1598,00');
    expect(screen.getByRole('status', status)).toHaveTextContent('402,00');
    fireEvent.change(screen.getByRole('textbox', { name: label }), { target: { value: '3500' } });
    expect(screen.getByRole('status', status)).toBeEmptyDOMElement();
    await user.click(screen.getByRole('button', { name: 'Estimar neto con esta facturación' }));
    expect(screen.getByRole('status', status)).toHaveTextContent('2448,00');
    expect(screen.getByRole('status', status)).toHaveTextContent('448,00');
    expect(screen.getByRole('status', status)).not.toHaveTextContent('Facturación ficticia');
  });

  it('accepts Spanish decimals and Enter, keeping displayed precision consistent with the result', async () => {
    const user = userEvent.setup();
    render(<Preview reference={reference} />);
    await user.type(screen.getByRole('textbox', { name: label }), '2500,005{Enter}');
    expect(screen.getByRole('textbox', { name: label })).toHaveValue('2500,01');
    expect(screen.getByRole('status', status)).toHaveTextContent('1598,01');
  });

  it('accepts zero and explains a deficit without implying a tax refund', async () => {
    const user = userEvent.setup();
    render(<Preview reference={reference} />);
    await user.type(screen.getByRole('textbox', { name: label }), '0{Enter}');
    expect(screen.getByRole('status', status)).toHaveTextContent('déficit de 620,00');
    expect(screen.getByRole('status', status)).toHaveTextContent('ni una devolución');
  });

  it('uses the progressive schedule and makes the fixed contribution and annualization visible', async () => {
    render(<Preview reference={{ ...reference, irpfMode: 'progressive', selfEmployedFeeMode: 'auto' }} />);
    expect(screen.getByText(/IRPF: usamos la misma estimación progresiva/)).toHaveTextContent('Territorio común');
    expect(screen.getByText(/Proyectamos doce meses iguales/)).toHaveTextContent('cuota indicada permanece fija');
    await userEvent.click(screen.getByRole('button', { name: 'Probar una facturación de 2.500 €' }));
    expect(screen.getByRole('status', status)).toHaveTextContent('1556,75');
    expect(screen.getByRole('status', status)).toHaveTextContent('323,25');
  });

  it.each([{ ...reference, monthlyExpenses: 500 }, { ...reference, selfEmployedFee: 450 }, { ...reference, targetNet: 3000 }])('resets after the main reference changes: %j', async (next) => {
    const { rerender } = render(<Preview reference={reference} />);
    await userEvent.click(screen.getByRole('button', { name: 'Probar una facturación de 2.500 €' }));
    rerender(<Preview reference={next} />);
    expect(screen.getByRole('textbox', { name: label })).toHaveValue('');
    expect(screen.getByRole('status', status)).toBeEmptyDOMElement();
  });

  it('uses the actual result and leaves its summary, main values and events intact', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm initiallySubmitted initialValues={{ targetNet: '1500', monthlyExpenses: '150', billableHours: '70', irpfMode: 'manual', irpfRate: '15', selfEmployedFeeMode: 'manual', selfEmployedFee: '320' }} initialShareUrl="https://www.cuantofacturar.es/?targetNet=1500#calculadora" />);
    const summary = (screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value;
    await user.click(screen.getByText('Ver cómo se reparte la facturación'));
    await user.click(screen.getByText('Estimar qué neto dejaría otra facturación'));
    await user.click(screen.getByRole('button', { name: 'Probar una facturación de 2.500 €' }));
    expect(screen.getByRole('status', status)).toHaveTextContent('1725,50');
    expect(screen.getByRole('status', status)).toHaveTextContent('225,50');
    expect((screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value).toBe(summary);
    expect(screen.getByRole('spinbutton', { name: 'Neto mensual deseado (EUR)' })).toHaveValue(1500);
    expect(screen.getByRole('textbox', { name: label })).not.toHaveAttribute('name');
    expect(screen.getByRole('link', { name: 'Ver el ejemplo de neto según facturación' })).toHaveAttribute('href', '/tarifa-freelance-por-hora#neto-segun-facturacion');
    expect(window.va).not.toHaveBeenCalled(); expect(window.gtag).not.toHaveBeenCalled();
  });
});
