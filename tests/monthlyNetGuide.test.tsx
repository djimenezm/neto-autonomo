import { render, screen, within } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import Guide from '@/app/tarifa-freelance-por-hora/page';
import { netPreviewSources } from '@/lib/monthlyNet';

describe('monthly net explanation', () => {
  it('keeps three comparable worked cases and the fixed-cost limits in the initial HTML', () => {
    render(<Guide />);
    const region = screen.getByRole('region', { name: 'Ejemplo de neto según facturación con costes constantes' });
    const low = within(region).getByRole('rowheader', { name: /^2500,00\s€$/ }).closest('tr')!;
    expect(within(low).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['1880,00 €', '− 282,00 €', '1598,00 €']);
    const high = within(region).getByRole('rowheader', { name: /^3500,00\s€$/ }).closest('tr')!;
    expect(high).toHaveTextContent('2448,00');
    expect(region).toHaveAttribute('tabindex', '0');
    expect(region.closest('section')).toHaveTextContent('cuota se mantiene como supuesto');
    expect(screen.getByRole('link', { name: 'cálculo del rendimiento a partir de ingresos y gastos deducibles' })).toHaveAttribute('href', netPreviewSources.incomeAndExpenses);
    expect(screen.getByRole('link', { name: 'regularización de cuotas según los rendimientos anuales' })).toHaveAttribute('href', netPreviewSources.contributionReview);
  });

  it('keeps Article and visible FAQ consistent without adding a registration requirement', () => {
    const doc = new DOMParser().parseFromString(renderToStaticMarkup(<Guide />), 'text/html');
    const schemas = [...doc.querySelectorAll('script[type="application/ld+json"]')].map((node) => JSON.parse(node.textContent!));
    expect(schemas.map((schema) => schema['@type'])).toEqual(['Article', 'BreadcrumbList', 'FAQPage']);
    expect(schemas[2].mainEntity).toHaveLength(7);
    for (const item of schemas[2].mainEntity) {
      expect(doc.body.textContent).toContain(item.name);
      expect(doc.body.textContent).toContain(item.acceptedAnswer.text);
    }
    expect(doc.querySelector('#neto-segun-facturacion')?.textContent).toContain('Qué neto dejaría');
    expect(doc.querySelectorAll('form')).toHaveLength(0);
    expect(doc.querySelectorAll('input[name]')).toHaveLength(0);
  });
});
