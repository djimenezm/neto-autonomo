import { readStyles } from './readStyles';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('focused home calculator', () => {
  it('uses the approved photographic calculator-first structure', () => {
    const homePage = readFileSync(join(process.cwd(), 'components/HomePage.tsx'), 'utf8');
    const styles = readStyles();

    expect(homePage).toContain('className="cost-landing"');
    expect(homePage).toContain('src="/images/cost-hero-autonomo.webp"');
    expect(homePage).toContain('cost-calculator-shell');
    expect(homePage).toContain('className="cost-mini-strip"');
    expect(homePage).not.toContain('<FAQ />');
    expect(styles).toMatch(/\.cost-hero\s*{[^}]*min-height:\s*\d+svh/s);
    expect(styles).toMatch(/\.cost-calculator-shell\s*{[^}]*grid-template-columns:/s);
  });
});
