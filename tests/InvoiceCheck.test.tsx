import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InvoiceCheck from '@/components/InvoiceCheck';

const labels = ['Base de la factura sin IVA (EUR)', 'IVA que quieres comprobar (%)', 'Retención que quieres comprobar (%)'];
const result = () => screen.getByRole('status', { name: 'Comprobación de una factura' });
const calculate = () => userEvent.click(screen.getByRole('button', { name: 'Comprobar esta factura' }));
const example = () => userEvent.click(screen.getByRole('button', { name: 'Probar la factura ficticia de 1000 €' }));

describe('editable single invoice check', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });

  it('requires three explicit inputs outside a form and focuses the first error', async () => {
    render(<InvoiceCheck />);
    for (const label of labels) {
      expect(screen.getByRole('textbox', { name: label })).toHaveValue('');
      expect(screen.getByRole('textbox', { name: label })).not.toHaveAttribute('name');
    }
    expect(document.querySelector('form')).toBeNull();
    await calculate();
    expect(screen.getByRole('textbox', { name: labels[0] })).toHaveFocus();
    expect(screen.getAllByRole('textbox').every((input) => input.getAttribute('aria-invalid') === 'true')).toBe(true);
    expect(result()).toHaveTextContent('Revisa los campos');
    fireEvent.change(screen.getByRole('textbox', { name: labels[0] }), { target: { value: '1000' } });
    await calculate();
    expect(screen.getByRole('textbox', { name: labels[1] })).toHaveFocus();
  });

  it('identifies the fictional scenario, reconciles the receipt and withdraws stale output when the base changes', async () => {
    render(<InvoiceCheck />);
    await example();
    expect(result()).toHaveTextContent('Base y porcentajes ficticios');
    expect(result()).toHaveTextContent('1000,00 € + 210,00 € − 150,00 € = 1060,00 €');
    expect(result()).toHaveTextContent('no es tu neto disponible');
    await calculate();
    expect(result()).toHaveTextContent('Base y porcentajes ficticios');
    fireEvent.change(screen.getByRole('textbox', { name: labels[0] }), { target: { value: '2000' } });
    expect(result()).toBeEmptyDOMElement();
    fireEvent.keyDown(screen.getByRole('textbox', { name: labels[0] }), { key: 'Enter' });
    expect(result()).toHaveTextContent('= 2120,00');
    expect(result()).not.toHaveTextContent('porcentajes ficticios');
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('supports Spanish amounts, normalizes displayed precision and remains stable when checked again', async () => {
    render(<InvoiceCheck />);
    const values = ['1,005', '21,005', '15,005'];
    labels.forEach((label, i) => fireEvent.change(screen.getByRole('textbox', { name: label }), { target: { value: values[i] } }));
    await calculate();
    expect(screen.getByRole('textbox', { name: labels[0] })).toHaveValue('1,01');
    expect(screen.getByRole('textbox', { name: labels[1] })).toHaveValue('21,01');
    expect(screen.getByRole('textbox', { name: labels[2] })).toHaveValue('15,01');
    expect(result()).toHaveTextContent('= 1,07');
    await calculate();
    expect(result()).toHaveTextContent('= 1,07');
  });

  it('allows explicit zero taxes and a zero receipt with full withholding, with no infinite values', async () => {
    render(<InvoiceCheck />);
    await example();
    fireEvent.change(screen.getByRole('textbox', { name: labels[1] }), { target: { value: '0' } });
    fireEvent.change(screen.getByRole('textbox', { name: labels[2] }), { target: { value: '0' } });
    await calculate();
    expect(result()).toHaveTextContent('1000,00 € + 0,00 € − 0,00 € = 1000,00 €');
    fireEvent.change(screen.getByRole('textbox', { name: labels[2] }), { target: { value: '100' } });
    await calculate();
    const receipt = within(result()).getByText('Importe a cobrar con estos datos');
    expect(receipt.nextElementSibling).toHaveTextContent('= 0,00');
    expect(result()).not.toHaveTextContent(/Infinity|NaN/);
  });
});
