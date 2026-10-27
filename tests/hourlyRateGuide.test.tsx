import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import Guide, { metadata } from '@/app/tarifa-freelance-por-hora/page';
import { getExampleUrl } from '@/lib/scenarioExamples';

vi.mock('next/script', () => ({ default: () => null }));

describe('the worked hourly-rate guide', () => {
  it('provides the worked calculation and both exact calculator scenarios without registration', () => {
    render(<Guide />);
    expect(screen.getByRole('main')).toHaveAttribute('id', 'contenido-principal');
    expect(screen.getByRole('link', { name: 'Ajustar este ejemplo a mis datos' })).toHaveAttribute('href', getExampleUrl(2000));
    expect(screen.getByRole('link', { name: 'Probar el caso de 40 horas' })).toHaveAttribute('href', getExampleUrl(2000, { billableHours: 40 }));
    expect(screen.getByRole('region', { name: 'De lo facturado a tu neto' })).toHaveTextContent('− 352,94');
    expect(screen.getByText('Neto objetivo tras estas partidas').nextElementSibling).toHaveTextContent('= 2000,00');
    expect(screen.getByText(/Con el mismo objetivo y los mismos costes/)).toHaveTextContent('74,32');
    expect(screen.getByText(/no es un precio de mercado/)).toBeVisible();
    expect(screen.queryByRole('textbox', { name: /email/i })).not.toBeInTheDocument();
  });

  it('keeps the explanation in server-rendered HTML and links the tax distinction to its primary source', () => {
    const html = renderToStaticMarkup(<Guide />);
    expect(html).toContain('Neto objetivo tras estas partidas');
    expect(html).toContain('3597,26');
    expect(metadata.alternates?.canonical).toBe('/tarifa-freelance-por-hora');
    render(<Guide />);
    expect(screen.getByRole('link', { name: 'régimen general del IVA de la AEAT' })).toHaveAttribute('href', 'https://sede.agenciatributaria.gob.es/Sede/iva/regimenes-tributacion-iva/regimen-general.html');
    expect(screen.getByText('28 de octubre de 2026')).toHaveAttribute('datetime', '2026-10-28');
  });
});
