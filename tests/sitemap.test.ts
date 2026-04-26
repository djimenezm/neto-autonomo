import sitemap from '@/app/sitemap';

describe('sitemap', () => {
  it('includes the main indexable routes and excludes conversion-only pages', () => {
    const paths = sitemap().map((entry) => new URL(entry.url).pathname);

    expect(paths).toContain('/');
    expect(paths).toContain('/cuanto-facturar-autonomo');
    expect(paths).toContain('/cuanto-facturar-autonomo-2000-euros');
    expect(paths).toContain('/cuanto-facturar-autonomo-3000-euros');
    expect(paths).toContain('/kit-tarifa-autonomo');
    expect(paths).toContain('/mejores-programas-facturacion-autonomos');
    expect(paths).toContain('/tarifa-freelance-por-hora');
    expect(paths).toContain('/cuota-autonomos-2026');
    expect(paths).not.toContain('/gracias-kit-tarifa');
  });
});
