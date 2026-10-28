import { render, screen, within } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import Guide from '@/components/CuantoFacturarAutonomoPage';
import Home from '@/components/HomePage';
import Header from '@/components/Header';
import HoursGuide from '@/app/horas-facturables-freelance/page';
import CostGuide from '@/app/cuanto-cuesta-ser-autonomo/page';
import AnnualGuide from '@/app/cuanto-facturar-autonomo-1500-euros/page';
import PortfolioGuide from '@/app/cuanto-facturar-autonomo-3000-euros/page';
import HourlyGuide from '@/app/tarifa-freelance-por-hora/page';
import DayGuide from '@/app/tarifa-diaria-freelance/page';
import Kit from '@/app/kit-tarifa-autonomo/page';
import { config } from '@/pages/cuanto-facturar-autonomo';

vi.mock('@/components/LeadMagnetForm', () => ({ default: () => null }));

function documentOf(content: React.ReactNode) {
  return new DOMParser().parseFromString(renderToStaticMarkup(content), 'text/html');
}

describe('choosing an existing tool by the decision to make', () => {
  it('offers eight decisions in server HTML, with no form or JavaScript interaction to choose', () => {
    const doc = documentOf(<Guide />);
    const chooser = doc.querySelector('section[aria-labelledby="elegir-herramienta"]')!;
    expect(chooser).not.toBeNull();
    expect(chooser.querySelectorAll('article')).toHaveLength(8);
    expect(chooser.querySelectorAll('h3')).toHaveLength(4);
    expect(chooser.querySelectorAll('input,select,button,form,script')).toHaveLength(0);
    expect(chooser.querySelectorAll('[data-result-kit-cta],[data-share-channel],[onclick]')).toHaveLength(0);
    expect(config.unstable_runtimeJS).toBe(false);
    const schemas = [...doc.querySelectorAll('script[type="application/ld+json"]')].map((node) => JSON.parse(node.textContent!));
    expect(schemas.map((schema) => schema['@type'])).toEqual(['Article', 'BreadcrumbList', 'FAQPage']);
    expect(schemas[0].dateModified).toBe('2026-10-28');
    expect(doc.querySelector('time')?.getAttribute('datetime')).toBe(schemas[0].dateModified);
    expect(schemas[2].mainEntity).toHaveLength(4);
    for (const faq of schemas[2].mainEntity) {
      expect(doc.body.textContent).toContain(faq.name);
      expect(doc.body.textContent).toContain(faq.acceptedAnswer.text);
    }
  });

  it('links to real sections in the actual rendered destination pages, including the group shortcuts', () => {
    const pages = new Map([
      ['/cuanto-facturar-autonomo', documentOf(<Guide />)],
      ['/', documentOf(<Home />)],
      ['/horas-facturables-freelance', documentOf(<HoursGuide />)],
      ['/cuanto-cuesta-ser-autonomo', documentOf(<CostGuide />)],
      ['/cuanto-facturar-autonomo-1500-euros', documentOf(<AnnualGuide />)],
      ['/cuanto-facturar-autonomo-3000-euros', documentOf(<PortfolioGuide />)],
      ['/tarifa-freelance-por-hora', documentOf(<HourlyGuide />)],
      ['/tarifa-diaria-freelance', documentOf(<DayGuide />)],
      ['/kit-tarifa-autonomo', documentOf(<Kit />)],
    ]);
    const doc = pages.get('/cuanto-facturar-autonomo')!;
    const links = [...doc.querySelectorAll('section[aria-labelledby="elegir-herramienta"] a[href]')];
    expect(links.length).toBeGreaterThanOrEqual(12);
    for (const link of links) {
      const url = new URL(link.getAttribute('href')!, 'https://www.cuantofacturar.es/cuanto-facturar-autonomo');
      expect(url.origin).toBe('https://www.cuantofacturar.es');
      expect(url.search).toBe('');
      const destination = pages.get(url.pathname);
      expect(destination, `Destination for ${url.pathname}`).toBeDefined();
      expect(destination!.getElementById(decodeURIComponent(url.hash.slice(1))), `Anchor for ${url.pathname}${url.hash}`).not.toBeNull();
    }
    const ids = [...doc.querySelectorAll('[id]')].map((node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('makes the chooser reachable from the home page, persistent navigation and guide introduction', () => {
    const { unmount } = render(<Home />);
    expect(screen.getByRole('link', { name: 'Elegir una ayuda según mi duda' })).toHaveAttribute('href', '/cuanto-facturar-autonomo#elegir-herramienta');
    expect(screen.getByRole('link', { name: 'Calcular mi cifra' })).toHaveAttribute('href', '#calculadora');
    unmount();
    const header = render(<Header />);
    expect(within(screen.getByRole('navigation', { name: 'Navegación principal' })).getByRole('link', { name: 'Herramientas' })).toHaveAttribute('href', '/cuanto-facturar-autonomo#elegir-herramienta');
    header.unmount();
    render(<Guide />);
    expect(screen.getByRole('link', { name: 'Elegir una ayuda para mi duda' })).toHaveAttribute('href', '#elegir-herramienta');
  });
});
