import { render, screen, within } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import Guide, { metadata } from '@/app/cuanto-facturar-autonomo-3000-euros/page';
import { getExampleUrl } from '@/lib/scenarioExamples';

vi.mock('@/components/LeadMagnetForm', () => ({ default: () => null }));

describe('3000-euro goal and capacity guide', () => {
  it('leads with a numeric answer and reproduces both project-time scenarios', () => {
    render(<Guide />);
    const lead = screen.getByText(/Con los supuestos ficticios de esta guía/);
    expect(lead).toHaveTextContent('4149,41');
    expect(lead).toHaveTextContent('51,87');
    const comparison = screen.getByRole('region', { name: 'Encargos necesarios y capacidad de 80 horas' });
    expect(within(comparison).getByRole('rowheader', { name: '40 h' }).closest('tr')).toHaveTextContent('4200,00');
    const slowRow = within(comparison).getByRole('rowheader', { name: '60 h' }).closest('tr')!;
    expect(within(slowRow).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['2', '120 h', '1', '2100,00 €']);
    expect(screen.getByText(/Con 40 horas por encargo/)).toHaveTextContent('2049,41');
    expect(screen.getByRole('link', { name: 'Ajustar este ejemplo a mis datos' })).toHaveAttribute('href', getExampleUrl(3000));
    expect(screen.getByRole('link', { name: 'Comprobar encargos y horas' })).toHaveAttribute('href', '#plan-encargos');
    expect(screen.getByRole('link', { name: 'registro de cuatro semanas' })).toHaveAttribute('href', '/kit-tarifa-autonomo#registro-horas');
  });

  it('keeps the worked method and matching schemas in initial HTML without needing registration', () => {
    const document = new DOMParser().parseFromString(renderToStaticMarkup(<Guide />), 'text/html');
    const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')].map((script) => JSON.parse(script.textContent!));
    expect(schemas.map((schema) => schema['@type'])).toEqual(['Article', 'BreadcrumbList', 'FAQPage']);
    expect(schemas[0].dateModified).toBe('2026-10-27');
    expect(schemas[2].mainEntity).toHaveLength(5);
    for (const item of schemas[2].mainEntity) {
      expect(document.body.textContent).toContain(item.name);
      expect(document.body.textContent).toContain(item.acceptedAnswer.text);
    }
    expect(document.body.textContent).toContain('por encima del objetivo son facturación adicional, no beneficio neto');
    expect(document.querySelector('main')?.getAttribute('id')).toBe('contenido-principal');
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    expect(metadata.alternates?.canonical).toBe('/cuanto-facturar-autonomo-3000-euros');
  });

  it('explains a combination that fits, one that overloads capacity and one below target in initial HTML', () => {
    render(<Guide />);
    const region = screen.getByRole('region', { name: 'Ejemplo ficticio de servicios combinados' });
    const total = within(region).getByRole('rowheader', { name: 'Total del mes' }).closest('tr')!;
    expect(total).toHaveTextContent('4200,00'); expect(total).toHaveTextContent('68 h');
    expect(within(region).getByRole('rowheader', { name: 'Cuotas mensuales' }).closest('tr')).toHaveTextContent('2400,00');
    const section = region.closest('section')!;
    expect(section).toHaveTextContent('86 h');
    expect(section).toHaveTextContent('faltan 6 h');
    expect(section).toHaveTextContent('3400,00');
    expect(section).toHaveTextContent('749,41');
    expect(region).toHaveAttribute('tabindex', '0');
    expect(section).toHaveTextContent('no copies el precio completo en todos los meses');
    expect(screen.getByRole('link', { name: 'combinación de servicios del mismo mes' })).toHaveAttribute('href', '#combinar-encargos');
  });

  it('explains how to recover the combination replaced by the first example in initial HTML', () => {
    const document = new DOMParser().parseFromString(renderToStaticMarkup(<Guide />), 'text/html');
    const text = document.querySelector('section[aria-labelledby="combinar-encargos"]')?.textContent;
    expect(text).toContain('antes del primer ejemplo con «Recuperar mi combinación anterior»');
    expect(text).toContain('Recuperarla sustituye los cambios actuales: vuelve a comprobarla para obtener el resultado');
    expect(text).toContain('La copia solo dura mientras usas esta página y se pierde al salir o cambiar la referencia mensual');
  });
});
