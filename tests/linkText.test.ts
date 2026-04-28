import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('link text', () => {
  it('keeps homepage guide CTA labels unique', () => {
    const homePage = readFileSync(join(process.cwd(), 'components/HomePage.tsx'), 'utf8');
    const guideCtaLabels = Array.from(
      homePage.matchAll(/<a href="[^"]+" className="primary-button">\s*([^<]+?)\s*<\/a>/g),
      (match) => match[1].replace(/\s+/g, ' ').trim(),
    );

    expect(guideCtaLabels.length).toBeGreaterThan(0);
    expect(new Set(guideCtaLabels).size).toBe(guideCtaLabels.length);
    expect(guideCtaLabels).not.toContain('Leer guía');
    expect(guideCtaLabels).not.toContain('Leer guia');
  });
});
