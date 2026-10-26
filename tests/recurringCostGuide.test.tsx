import { render, screen, within } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import Guide, { metadata } from '@/app/cuanto-cuesta-ser-autonomo/page';

describe('recurring-cost guide', () => {
  it('shows a reproducible example using the same initial payments as the calculator', () => {
    render(<Guide />);
    const region = screen.getByRole('region', { name: 'Ejemplo de costes con varias frecuencias' });
    const software = within(region).getByRole('rowheader', { name: 'Software y herramientas' }).closest('tr')!;
    expect(within(software).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['420,00 €', '1', '420,00 €', '35,00 €']);
    expect(within(region).getByRole('rowheader', { name: 'Total del ejemplo' }).closest('tr')).toHaveTextContent('5760,00');
    expect(screen.getByRole('link', { name: 'Ajustar pagos y frecuencias' })).toHaveAttribute('href', '#costes-mensuales');
    expect(screen.getByText(/Estos son los datos ficticios/)).toBeVisible();
    expect(screen.getByText(/Repartir 420 EUR entre 12 meses/)).toHaveTextContent('no cubre por sí sola el pago próximo');
    expect(screen.getByRole('link', { name: 'régimen general del IVA' })).toHaveAttribute('href', 'https://sede.agenciatributaria.gob.es/Sede/iva/regimenes-tributacion-iva/regimen-general.html');
  });

  it('renders the method and structured data in initial HTML without a signup gate', () => {
    const document = new DOMParser().parseFromString(renderToStaticMarkup(<Guide />), 'text/html');
    const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')].map((script) => JSON.parse(script.textContent!));
    expect(schemas.map((schema) => schema['@type'])).toEqual(['WebPage', 'BreadcrumbList', 'FAQPage']);
    expect(schemas[0].dateModified).toBe('2026-10-27');
    expect(schemas[2].mainEntity).toHaveLength(4);
    expect(document.body.textContent).toContain('Conservamos los 100 EUR en el total anual');
    expect(document.querySelector('input[type="email"]')).toBeNull();
    expect(metadata.alternates?.canonical).toBe('/cuanto-cuesta-ser-autonomo');
    expect(document.querySelectorAll('h1')).toHaveLength(1);
  });
});
