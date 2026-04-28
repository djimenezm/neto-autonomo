import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('performance configuration', () => {
  it('inlines the global stylesheet to avoid a render-blocking CSS request', () => {
    const nextConfig = readFileSync(join(process.cwd(), 'next.config.ts'), 'utf8');

    expect(nextConfig).toMatch(/inlineCss:\s*true/);
  });
});
