import { render, screen, within } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import Guide, { metadata } from '@/app/tabla-cuanto-facturar-autonomo/page';
import { getExampleUrl } from '@/lib/scenarioExamples';

vi.mock('@/components/LeadMagnetForm', () => ({ default: () => null }));

describe('monthly scenario worked guide', () => {
  it('keeps the four goal anchors and shows isolated and combined changes from the engine', () => {
    render(<Guide />);
    for (const goal of [1500, 2000, 2500, 3000]) expect(document.getElementById(`neto-${goal}`)).not.toBeNull();
    const table = screen.getByRole('region', { name: 'Efecto de gastos y horas con el mismo neto' });
    expect(within(table).getByRole('rowheader', { name: 'Solo menos horas' }).closest('tr')).toHaveTextContent('2972,94');
    expect(within(table).getByRole('rowheader', { name: 'Solo menos horas' }).closest('tr')).toHaveTextContent('49,55');
    expect(within(table).getByRole('rowheader', { name: 'Ambos cambios' }).closest('tr')).toHaveTextContent('3122,94');
    expect(within(table).getByRole('rowheader', { name: 'Ambos cambios' }).closest('tr')).toHaveTextContent('52,05');
    expect(screen.getByRole('link', { name: 'ajusta primero tu cálculo' })).toHaveAttribute('href', getExampleUrl(2000));
    expect(screen.getByRole('button', { name: 'Comparar escenarios' })).toBeVisible();
  });

  it('renders the example and matching structured data in initial HTML', () => {
    const doc = new DOMParser().parseFromString(renderToStaticMarkup(<Guide />), 'text/html');
    const schemas = [...doc.querySelectorAll('script[type="application/ld+json"]')].map((script) => JSON.parse(script.textContent!));
    expect(schemas.map((schema) => schema['@type'])).toEqual(['Article', 'BreadcrumbList', 'FAQPage']);
    expect(schemas[0].dateModified).toBe('2026-11-24');
    expect(schemas[2].mainEntity).toHaveLength(4);
    expect(doc.querySelector('main')?.getAttribute('id')).toBe('contenido-principal');
    expect(doc.querySelectorAll('h1')).toHaveLength(1);
    expect(doc.body.textContent).toContain('52,05');
    const workedExample = doc.querySelector('section[aria-labelledby="comparar-escenarios"]');
    expect(workedExample?.querySelector('h2')?.textContent).toBe('Cuánto facturar para ganar 2.000 € netos al mes');
    expect(workedExample?.textContent).toMatch(/2972,94\s€ al mes sin IVA/);
    expect(workedExample?.textContent).toMatch(/37,16\s€\/h/);
    expect(workedExample?.querySelector('.guide-cta a')?.getAttribute('href')).toBe(getExampleUrl(2000));
    expect(metadata.alternates?.canonical).toBe('/tabla-cuanto-facturar-autonomo');
  });
});
