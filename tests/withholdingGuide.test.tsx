import { render, screen, within } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import HourlyGuide from '@/app/tarifa-freelance-por-hora/page';
import GeneralGuide from '@/components/CuantoFacturarAutonomoPage';
import { withholdingSource } from '@/lib/withholdingPreview';

describe('worked withholding explanation', () => {
  it('compares the same base with and without withholding and links its primary source', () => {
    render(<HourlyGuide />);
    const region = screen.getByRole('region', { name: 'Ejemplo de base, IVA, retención y cobro' });
    expect(within(region).getByRole('rowheader', { name: 'Retención del 0 %' }).closest('tr')).toHaveTextContent('1210,00');
    expect(within(region).getByRole('rowheader', { name: 'Retención del 15 %' }).closest('tr')).toHaveTextContent('1060,00');
    expect(screen.getByRole('link', { name: 'retenciones son anticipos del impuesto' })).toHaveAttribute('href', withholdingSource);
    expect(screen.getByRole('textbox', { name: 'Retención que quieres comprobar (%)' })).toHaveValue('');
  });

  it('keeps the worked numbers, limits and matching FAQ in initial HTML', () => {
    const doc = new DOMParser().parseFromString(renderToStaticMarkup(<HourlyGuide />), 'text/html');
    expect(doc.body.textContent).toContain('1060,00');
    expect(doc.body.textContent).toContain('no se vuelve a restar del neto objetivo');
    const schemas = [...doc.querySelectorAll('script[type="application/ld+json"]')].map((script) => JSON.parse(script.textContent!));
    expect(schemas[0].dateModified).toBe('2026-10-28');
    expect(schemas[2].mainEntity).toHaveLength(8);
  });

  it('links from the general guide without adding an interactive control to that script-free route', () => {
    render(<GeneralGuide />);
    expect(screen.getByRole('link', { name: 'ejemplo y comprobador de base, IVA y retención' })).toHaveAttribute('href', '/tarifa-freelance-por-hora#ejemplo-cobro');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
