import { render, screen, within } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import Guide from '@/app/tarifa-freelance-por-hora/page';
import Chooser from '@/components/ToolChooser';
import { invoiceVatSource } from '@/lib/invoiceCheck';

describe('single invoice check in the hourly guide', () => {
  it('offers editable base, VAT and withholding while retaining the existing example and anchors', () => {
    render(<Guide />);
    expect(document.getElementById('ejemplo-cobro')).not.toBeNull();
    expect(document.getElementById('comprobar-cobro')).not.toBeNull();
    const editor = document.getElementById('comprobar-factura')!;
    const fields = within(editor).getAllByRole('textbox');
    expect(fields).toHaveLength(3);
    expect(fields.every((field) => (field as HTMLInputElement).value === '' && !field.hasAttribute('name'))).toBe(true);
    const table = screen.getByRole('region', { name: 'Ejemplo de base, IVA, retención y cobro' });
    expect(within(table).getByRole('rowheader', { name: 'Retención del 15 %' }).closest('tr')).toHaveTextContent('1060,00');
    expect(editor).toHaveTextContent('2000,00 € + 200,00 € − 140,00 € = 2060,00 € a cobrar');
    expect(editor).toHaveTextContent('redondeamos cada importe por separado');
    expect(screen.getByRole('link', { name: 'calcular el IVA repercutido' })).toHaveAttribute('href', invoiceVatSource);
  });

  it('retains the worked accounts and matching visible FAQ in server HTML without any form', () => {
    const doc = new DOMParser().parseFromString(renderToStaticMarkup(<Guide />), 'text/html');
    const schemas = [...doc.querySelectorAll('script[type="application/ld+json"]')].map((node) => JSON.parse(node.textContent!));
    expect(schemas[2].mainEntity).toHaveLength(8);
    for (const faq of schemas[2].mainEntity) {
      expect(doc.body.textContent).toContain(faq.name);
      expect(doc.body.textContent).toContain(faq.acceptedAnswer.text);
    }
    expect(doc.querySelector('#comprobar-factura')?.textContent).toContain('2060,00');
    expect(doc.querySelectorAll('form,input[name]')).toHaveLength(0);
  });

  it('updates the selector to promise actual editable inputs and link directly to them', () => {
    render(<Chooser />);
    const card = screen.getByRole('article', { name: 'Quiero comprobar base, IVA y retención' });
    expect(within(card).getByRole('link', { name: 'Comprobar una factura con mis datos' })).toHaveAttribute('href', '/tarifa-freelance-por-hora#comprobar-factura');
    expect(card).toHaveTextContent('Introduce tus tres datos');
    expect(card).not.toHaveTextContent('Solo cambia la retención');
  });
});
