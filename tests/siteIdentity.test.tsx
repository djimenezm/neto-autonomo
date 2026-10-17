import { renderToStaticMarkup } from 'react-dom/server';
import Footer from '@/components/Footer';
import Legal from '@/app/aviso-legal/page';
import Privacy from '@/app/privacidad/page';
import { siteConfig } from '@/lib/site';

describe('site responsibility', () => {
  it.each([['footer', Footer], ['legal notice', Legal], ['privacy', Privacy]] as const)(
    'identifies the same real owner in the %s', (_, Component) => {
      expect(siteConfig.ownerName).toBe('Diego Antonio Jiménez Moreno');
      const html = renderToStaticMarkup(<Component />);
      expect(html).toContain(siteConfig.ownerName);
      expect(html).not.toContain('Equipo de Cuánto Facturar');
    },
  );
});
