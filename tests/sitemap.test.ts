import sitemap from '@/app/sitemap';

describe('sitemap', () => {
  it('only reports documented substantive content updates', () => {
    const updatedRoutes = Object.fromEntries(
      sitemap()
        .filter((entry) => entry.lastModified !== undefined)
        .map((entry) => [new URL(entry.url).pathname, entry.lastModified]),
    );

    expect(updatedRoutes).toEqual({
      '/': '2026-10-27',
      '/mejores-programas-facturacion-autonomos': '2026-10-02',
      '/horas-facturables-freelance': '2026-10-26',
      '/cuanto-facturar-autonomo-1500-euros': '2026-10-27',
      '/tarifa-freelance-por-hora': '2026-10-27',
      '/cuanto-facturar-autonomo': '2026-10-27',
      '/kit-tarifa-autonomo': '2026-10-27',
      '/tarifa-diaria-freelance': '2026-10-26',
      '/cuanto-cuesta-ser-autonomo': '2026-10-27',
      '/cuanto-facturar-autonomo-3000-euros': '2026-10-27',
      '/tabla-cuanto-facturar-autonomo': '2026-10-27',
      '/cuota-autonomos-2026': '2026-10-27',
    });
  });

  it('includes the main indexable routes and excludes conversion-only pages', () => {
    const urls = sitemap().map((entry) => new URL(entry.url));
    const paths = urls.map((url) => url.pathname);

    urls.forEach((url) => expect(url.origin).toBe('https://www.cuantofacturar.es'));
    expect(paths).toContain('/');
    expect(paths).toContain('/cuanto-facturar-autonomo');
    expect(paths).toContain('/tabla-cuanto-facturar-autonomo');
    expect(paths).toContain('/cuanto-facturar-autonomo-1500-euros');
    expect(paths).not.toContain('/cuanto-facturar-autonomo-2000-euros');
    expect(paths).not.toContain('/cuanto-facturar-autonomo-2500-euros');
    expect(paths).toContain('/cuanto-facturar-autonomo-3000-euros');
    expect(paths).toContain('/horas-facturables-freelance');
    expect(paths).toContain('/kit-tarifa-autonomo');
    expect(paths).toContain('/mejores-programas-facturacion-autonomos');
    expect(paths).toContain('/tarifa-freelance-por-hora');
    expect(paths).toContain('/tarifa-diaria-freelance');
    expect(paths).toContain('/cuota-autonomos-2026');
    expect(paths).toContain('/cuanto-cuesta-ser-autonomo');
    expect(paths).not.toContain('/gracias-kit-tarifa');
  });
});
