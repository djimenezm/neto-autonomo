import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Preview from '@/components/WithholdingPreview';
import CalculatorForm from '@/components/CalculatorForm';
import { withholdingExample } from '@/lib/withholdingPreview';

const label = 'Retención que quieres comprobar (%)';
const status = { name: 'Importe a cobrar con retención' };

describe('withholding preview', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });

  it('starts empty and focuses an invalid percentage', async () => {
    render(<Preview {...withholdingExample} context="example" />);
    const field = screen.getByRole('textbox', { name: label });
    expect(field).toHaveValue('');
    await userEvent.click(screen.getByRole('button', { name: 'Comprobar importe a cobrar' }));
    expect(field).toHaveFocus();
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('status', status)).not.toHaveTextContent('Importe a cobrar con este supuesto');
  });

  it('identifies the fictional percentage and clears the preview immediately after editing', async () => {
    render(<Preview {...withholdingExample} context="example" />);
    await userEvent.click(screen.getByRole('button', { name: 'Probar una retención ficticia del 15 %' }));
    expect(screen.getByRole('status', status)).toHaveTextContent('Retención ficticia del 15 %');
    expect(screen.getByRole('status', status)).toHaveTextContent('− 150,00');
    expect(screen.getByRole('status', status)).toHaveTextContent('= 1060,00');
    fireEvent.change(screen.getByRole('textbox', { name: label }), { target: { value: '0' } });
    expect(screen.getByRole('status', status)).toBeEmptyDOMElement();
  });

  it('accepts Spanish decimals and Enter, displaying the exact rounded rate used', async () => {
    const user = userEvent.setup();
    render(<Preview {...withholdingExample} context="example" />);
    await user.type(screen.getByRole('textbox', { name: label }), '15,005{Enter}');
    expect(screen.getByRole('textbox', { name: label })).toHaveValue('15,01');
    expect(screen.getByRole('status', status)).toHaveTextContent('− 150,10');
    expect(screen.getByRole('status', status)).toHaveTextContent('= 1059,90');
    expect(screen.getByRole('status', status)).not.toHaveTextContent('Retención ficticia');
  });

  it('clears both input and preview when the main base or VAT changes', async () => {
    const { rerender } = render(<Preview {...withholdingExample} context="monthly" />);
    await userEvent.click(screen.getByRole('button', { name: 'Probar una retención ficticia del 15 %' }));
    rerender(<Preview baseAmount={2000} vatAmount={420} context="monthly" />);
    expect(screen.getByRole('textbox', { name: label })).toHaveValue('');
    expect(screen.getByRole('status', status)).toBeEmptyDOMElement();
  });

  it('uses the real monthly result and keeps its summary, GET fields and tracking intact', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm initiallySubmitted initialValues={{ targetNet: '2000', monthlyExpenses: '300', billableHours: '80', irpfMode: 'manual', irpfRate: '15', selfEmployedFeeMode: 'manual', selfEmployedFee: '320' }} initialShareUrl="https://www.cuantofacturar.es/?targetNet=2000#calculadora" />);
    const before = (screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value;
    await user.click(screen.getByText('Ver cómo se reparte la facturación'));
    await user.click(screen.getByText('Comprobar el cobro si hay retención'));
    const field = screen.getByRole('textbox', { name: label });
    expect(field).toHaveValue(''); // Never copied from the main 15% IRPF reserve.
    expect(field).not.toHaveAttribute('name');
    await user.type(field, '15{Enter}');
    expect(screen.getByRole('status', status)).toHaveTextContent('− 445,94');
    expect(screen.getByRole('status', status)).toHaveTextContent('= 3151,32');
    expect((screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value).toBe(before);
    expect(screen.getByText(/toda esta base mensual lleva el mismo porcentaje/)).toBeVisible();
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });
});
