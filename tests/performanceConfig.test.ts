import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('performance configuration', () => {
  it('inlines the global stylesheet to avoid a render-blocking CSS request', () => {
    const nextConfig = readFileSync(join(process.cwd(), 'next.config.ts'), 'utf8');

    expect(nextConfig).toMatch(/inlineCss:\s*true/);
  });

  it('does not ship Next browser polyfills for legacy browsers', () => {
    const nextConfig = readFileSync(join(process.cwd(), 'next.config.ts'), 'utf8');
    const noPolyfillsModule = readFileSync(
      join(process.cwd(), 'lib/no-browser-polyfills.ts'),
      'utf8',
    );

    expect(nextConfig).toContain('next/dist/build/polyfills/polyfill-module');
    expect(nextConfig).toContain('./lib/no-browser-polyfills.ts');
    expect(noPolyfillsModule.trim()).toBe('export {};');
  });

  it('serves the homepage without the Next client runtime', () => {
    const indexPage = readFileSync(join(process.cwd(), 'pages/index.tsx'), 'utf8');

    expect(indexPage).toMatch(/unstable_runtimeJS:\s*false/);
    expect(indexPage).toContain('getServerSideProps');
  });

  it('serves the main billing guide without the Next client runtime', () => {
    const guidePage = readFileSync(
      join(process.cwd(), 'pages/cuanto-facturar-autonomo.tsx'),
      'utf8',
    );

    expect(guidePage).toMatch(/unstable_runtimeJS:\s*false/);
    expect(existsSync(join(process.cwd(), 'app/cuanto-facturar-autonomo/page.tsx'))).toBe(false);
  });

  it('keeps the homepage lead compact for LCP', () => {
    const homePage = readFileSync(join(process.cwd(), 'components/HomePage.tsx'), 'utf8');
    const globalStyles = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');
    const leadMatch = homePage.match(/<p className="lead">([\s\S]*?)<\/p>/);
    const leadText = leadMatch?.[1].replace(/\s+/g, ' ').trim() ?? '';

    expect(leadText.length).toBeLessThanOrEqual(130);
    expect(globalStyles).toMatch(/\.lead\s*{[^}]*font-size:\s*1rem/s);
    expect(globalStyles).toMatch(/\.lead\s*{[^}]*line-height:\s*1\.55/s);
  });
});
