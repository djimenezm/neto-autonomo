import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectReview from '@/components/ProjectReview';
import CalculatorForm from '@/components/CalculatorForm';

const status = { name: 'Revisión del encargo' };
const labels = ['Tu referencia por hora sin IVA (EUR)', 'Precio final pactado sin IVA (EUR)', 'Horas previstas del encargo', 'Horas reales registradas'];

describe('completed project review editor', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });

  it('starts empty, keeps fields out of forms, and focuses the first invalid value', async () => {
    render(<ProjectReview />);
    for (const label of labels) {
      expect(screen.getByRole('textbox', { name: label })).toHaveValue('');
      expect(screen.getByRole('textbox', { name: label })).not.toHaveAttribute('name');
    }
    expect(document.querySelector('form')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Revisar encargo' }));
    expect(screen.getByRole('textbox', { name: labels[0] })).toHaveFocus();
    expect(screen.getByRole('textbox', { name: labels[0] })).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('status', status)).toHaveTextContent('Revisa los campos');
  });

  it('reproduces the worked example and removes stale figures and its fictional label on edit', async () => {
    const user = userEvent.setup();
    render(<ProjectReview />);
    await user.click(screen.getByRole('button', { name: 'Probar el ejemplo de 400 €' }));
    expect(screen.getByRole('status', status)).toHaveTextContent('Ejemplo ficticio');
    expect(screen.getByRole('status', status)).toHaveTextContent('33,33');
    expect(screen.getByRole('status', status)).toHaveTextContent('80,00');
    fireEvent.change(screen.getByRole('textbox', { name: labels[3] }), { target: { value: '6' } });
    expect(screen.getByRole('status', status)).toBeEmptyDOMElement();
    await user.click(screen.getByRole('button', { name: 'Revisar encargo' }));
    expect(screen.getByRole('status', status)).toHaveTextContent('66,67');
    expect(screen.getByRole('status', status)).toHaveTextContent('-2 h');
    expect(screen.getByRole('status', status)).toHaveTextContent('supera en 160,00');
    expect(screen.getByRole('status', status)).not.toHaveTextContent('Ejemplo ficticio');
  });

  it('accepts Spanish decimals, normalizes displayed precision and calculates with Enter', async () => {
    const user = userEvent.setup();
    render(<ProjectReview />);
    await user.type(screen.getByRole('textbox', { name: labels[0] }), '20');
    await user.type(screen.getByRole('textbox', { name: labels[1] }), '20,195');
    await user.type(screen.getByRole('textbox', { name: labels[2] }), '1,005');
    await user.type(screen.getByRole('textbox', { name: labels[3] }), '1,005{Enter}');
    expect(screen.getByRole('textbox', { name: labels[1] })).toHaveValue('20,2');
    expect(screen.getByRole('textbox', { name: labels[3] })).toHaveValue('1,01');
    expect(screen.getByRole('status', status)).toHaveTextContent('coincide con el importe');
    expect(screen.getByRole('status', status)).toHaveTextContent('no es beneficio neto ni acredita el cobro');
  });

  it('accepts an explicit free project and performs no tracking', async () => {
    const user = userEvent.setup();
    render(<ProjectReview />);
    await user.click(screen.getByRole('button', { name: 'Probar el ejemplo de 400 €' }));
    fireEvent.change(screen.getByRole('textbox', { name: labels[1] }), { target: { value: '0' } });
    await user.click(screen.getByRole('button', { name: 'Revisar encargo' }));
    expect(screen.getByRole('status', status)).toHaveTextContent('0,00');
    expect(screen.getByRole('status', status)).toHaveTextContent('480,00');
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('links from the actual result without adding another calculation, marketing attributes or changing its summary', () => {
    render(<CalculatorForm initiallySubmitted initialValues={{ targetNet: '1500', monthlyExpenses: '150', billableHours: '70', irpfMode: 'manual', irpfRate: '15', selfEmployedFeeMode: 'manual', selfEmployedFee: '320' }} initialShareUrl="https://www.cuantofacturar.es/?targetNet=1500#calculadora" />);
    const link = screen.getByRole('link', { name: 'Revisar un encargo con mis horas reales' });
    expect(link).toHaveAttribute('href', '/kit-tarifa-autonomo#revision-encargo');
    expect(link).not.toHaveAttribute('data-result-kit-cta');
    expect(link).not.toHaveAttribute('data-share-channel');
    expect(screen.queryByRole('textbox', { name: labels[3] })).not.toBeInTheDocument();
    expect((screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value).not.toContain('Horas reales');
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });
});
