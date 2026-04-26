import robots from '@/app/robots';

describe('robots', () => {
  it('points crawlers to the production sitemap', () => {
    const config = robots();
    const sitemap = Array.isArray(config.sitemap) ? config.sitemap[0] : config.sitemap;

    expect(config.rules).toEqual({
      userAgent: '*',
      allow: '/',
    });
    expect(config.host).toBe('https://www.cuantofacturar.es');
    expect(sitemap).toBe('https://www.cuantofacturar.es/sitemap.xml');
  });
});
