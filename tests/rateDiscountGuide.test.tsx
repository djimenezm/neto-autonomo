import { render, screen, within } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import Guide from '@/app/tarifa-freelance-por-hora/page';
import Planner from '@/components/MonthlyProjectPlanner';

describe('worked tariff-discount guide', () => {
  it('publishes the alternatives and rounding method in the initial HTML', () => {
    render(<Guide />);
    const region = screen.getByRole('region', { name: 'Ejemplo de rebajas de tarifa y horas necesarias' });
    expect(region).toHaveAttribute('tabindex', '0');
    const rows = within(region).getAllByRole('row').slice(1).map((row) => [...row.querySelectorAll('th,td')].map((cell) => cell.textContent));
    expect(rows).toEqual([
      ['0 %', '40,00 €/h', '3200,00 €', '80 h'],
      ['10 %', '36,00 €/h', '2880,00 €', '88,89 h'],
      ['20 %', '32,00 €/h', '2560,00 €', '100 h'],
    ]);
    const section = region.closest('section')!;
    expect(section).toHaveTextContent('aproximadamente un 11,11 % más de tiempo');
    expect(section).toHaveTextContent('antes de redondear la facturación');
    expect(section).toHaveTextContent('no incorpora costes adicionales');
    expect(within(section).getByRole('link', { name: 'estimación de neto según facturación' })).toHaveAttribute('href', '#neto-segun-facturacion');
    expect(screen.getByRole('link', { name: 'Comprobar una rebaja de tarifa' })).toHaveAttribute('href', '#descuento-tarifa');
  });

  it('keeps the worked example, date and matching FAQ available without JavaScript or registration', () => {
    const doc = new DOMParser().parseFromString(renderToStaticMarkup(<Guide />), 'text/html');
    const schemas = [...doc.querySelectorAll('script[type="application/ld+json"]')].map((node) => JSON.parse(node.textContent!));
    expect(schemas[0].dateModified).toBe('2026-10-28');
    expect(schemas[2].mainEntity).toHaveLength(7);
    for (const faq of schemas[2].mainEntity) {
      expect(doc.body.textContent).toContain(faq.name);
      expect(doc.body.textContent).toContain(faq.acceptedAnswer.text);
    }
    expect(doc.querySelector('#descuento-tarifa')?.textContent).toContain('Antes de rebajar tu tarifa');
    expect(doc.querySelector('noscript')?.textContent).toContain('tabla');
    expect(doc.querySelectorAll('input[name],form')).toHaveLength(0);
  });

  it('makes the guide reachable from the existing monthly capacity helper', () => {
    render(<Planner monthlyBilling={3200} billableHours={80} />);
    expect(screen.getByRole('link', { name: 'comprobar una rebaja de tarifa y las horas necesarias' })).toHaveAttribute('href', '/tarifa-freelance-por-hora#descuento-tarifa');
  });
});
