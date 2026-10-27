import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import Guide, { metadata } from '@/app/tarifa-diaria-freelance/page';
import HourlyGuide from '@/app/tarifa-freelance-por-hora/page';
import { getExampleUrl } from '@/lib/scenarioExamples';

vi.mock('next/script', () => ({ default: () => null }));

describe('worked daily-rate guide', () => {
  it('provides the complete arithmetic and a consistent proposal in server-rendered HTML', () => {
    const document = new DOMParser().parseFromString(renderToStaticMarkup(<Guide />), 'text/html');
    const table = document.querySelector('table')!;
    expect(table.textContent).toContain('222,96');
    expect(table.textContent).toContain('55,74');
    expect(table.textContent).toContain('18,58');
    expect(table.textContent).toContain('297,28');
    expect(document.body.textContent).toContain('27,87');
    expect(document.body.textContent).toContain('74,32');
    expect(document.querySelector('blockquote')?.textContent).toContain('297,28');
    expect(document.body.textContent).toContain('Mezclar ambos métodos puede duplicar su coste');
    const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')].map((script) => JSON.parse(script.textContent!));
    expect(schemas.map((schema) => schema['@type'])).toEqual(['Article', 'BreadcrumbList', 'FAQPage']);
    expect(schemas[0].dateModified).toBe('2026-10-27');
    expect(schemas[2].mainEntity).toHaveLength(6);
    for (const item of schemas[2].mainEntity) {
      expect(document.body.textContent).toContain(item.name);
      expect(document.body.textContent).toContain(item.acceptedAnswer.text);
    }
    expect(document.querySelector('time')?.getAttribute('datetime')).toBe('2026-10-27');
    expect(metadata.alternates?.canonical).toBe('/tarifa-diaria-freelance');
    expect(document.querySelectorAll('h1')).toHaveLength(1);
  });

  it('explains the cost-adjusted comparison in initial HTML with a reproducible example', () => {
    render(<Guide />);
    const region = screen.getByRole('region', { name: 'Ejemplo de jornada con costes específicos' });
    expect(region).toHaveAttribute('tabindex', '0');
    for (const value of ['297,28', '90,00', '387,28', '350,00', '260,00', '32,50']) expect(region).toHaveTextContent(value);
    expect(screen.getByText(/Mirar solo/)).toHaveTextContent('43,75');
    expect(screen.getByText(/Mirar solo/)).toHaveTextContent('37,28');
    expect(screen.getByText(/Si ya repartiste el mismo gasto/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Probar el ejemplo con costes' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'AEAT explica los requisitos de deducción del IVA soportado' })).toHaveAttribute('href', 'https://sede.agenciatributaria.gob.es/Sede/iva/que-iva-soportado-puedo-deducir.html');
    expect(screen.getByRole('link', { name: 'plan de caja de tres meses' })).toHaveAttribute('href', '/cuanto-cuesta-ser-autonomo#plan-caja');
  });

  it('joins the monthly calculation, day-rate check and actual-hours record without a signup gate', () => {
    render(<Guide />);
    expect(screen.getByRole('main')).toHaveAttribute('id', 'contenido-principal');
    expect(screen.getByRole('link', { name: 'Comprobar mi jornada' })).toHaveAttribute('href', '#comprobar-jornada');
    expect(screen.getByRole('link', { name: 'Reproducir la base mensual en la calculadora' })).toHaveAttribute('href', getExampleUrl(2000));
    expect(screen.getByRole('link', { name: 'registro de cuatro semanas del kit' })).toHaveAttribute('href', '/kit-tarifa-autonomo#registro-horas');
    expect(screen.queryByRole('textbox', { name: /email/i })).not.toBeInTheDocument();
  });

  it('is reachable from the hourly guide at the actual tool', () => {
    const document = new DOMParser().parseFromString(renderToStaticMarkup(<HourlyGuide />), 'text/html');
    expect(document.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(3);
    render(<HourlyGuide />);
    expect(screen.getByRole('link', { name: 'Comprobar el precio de una jornada' })).toHaveAttribute('href', '/tarifa-diaria-freelance#comprobar-jornada');
    expect(screen.getByRole('link', { name: 'ejemplo de jornada con costes específicos' })).toHaveAttribute('href', '/tarifa-diaria-freelance#costes-jornada');
  });
});
