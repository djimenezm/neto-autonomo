import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const files = ['components/Footer.tsx', 'app/gracias-kit-tarifa/page.tsx'];

describe('ecosystem links', () => {
  it('keeps cross-domain links tagged with UTM parameters', () => {
    const content = files
      .map((file) => readFileSync(join(process.cwd(), file), 'utf8'))
      .join('\n');

    const externalLinks = Array.from(content.matchAll(/href="(https:\/\/www\.[^"]+)"/g)).map(
      ([, href]) => href,
    );

    expect(externalLinks.length).toBeGreaterThan(0);
    externalLinks.forEach((href) => {
      expect(href).toContain('utm_source=cuantofacturar');
      expect(href).toContain('utm_campaign=');
    });
  });
});
