import { render, screen, within } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import Guide from '@/app/cuanto-facturar-autonomo-1500-euros/page';

vi.mock('@/components/LeadMagnetForm', () => ({ default: () => null }));

describe('annual billing guide', () => {
  it('compares fewer annual hours with redistribution of the same annual capacity', () => {
    render(<Guide />);
    const region = screen.getByRole('region', { name: 'Facturación anual repartida entre meses activos' });
    const reduced = within(region).getByRole('rowheader', { name: 'Diez meses, mismas horas por mes activo' }).closest('tr')!;
    expect(reduced).toHaveTextContent('700 h');
    expect(reduced).toHaveTextContent('2681,66');
    expect(reduced).toHaveTextContent('38,31');
    const sameHours = within(region).getByRole('rowheader', { name: 'Diez meses, mismas horas anuales' }).closest('tr')!;
    expect(sameHours).toHaveTextContent('840 h');
    expect(sameHours).toHaveTextContent('31,93');
    expect(screen.getByRole('button', { name: 'Comprobar plan anual' })).toBeVisible();
  });

  it('renders the worked plan and schemas in initial HTML without registration', () => {
    const doc = new DOMParser().parseFromString(renderToStaticMarkup(<Guide />), 'text/html');
    expect(doc.body.textContent).toContain('26.816,52');
    expect(doc.body.textContent).toContain('no fija fechas de cobro ni reserva dinero');
    const schemas = [...doc.querySelectorAll('script[type="application/ld+json"]')].map((s) => JSON.parse(s.textContent!));
    expect(schemas.map((s) => s['@type'])).toEqual(['Article', 'BreadcrumbList', 'FAQPage']);
    expect(schemas[0].dateModified).toBe('2026-10-27');
    expect(schemas[2].mainEntity).toHaveLength(4);
    expect(doc.querySelectorAll('h1')).toHaveLength(1);
    expect(doc.querySelector('a[href="/horas-facturables-freelance#agenda-anual-title"]')).not.toBeNull();
  });
});
