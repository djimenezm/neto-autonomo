import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('accessibility styles', () => {
  it('does not rely on color alone for footer and text links', () => {
    const globalStyles = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');

    expect(globalStyles).toMatch(/\.site-footer a\s*{[^}]*text-decoration:\s*underline/s);
    expect(globalStyles).toMatch(/\.legal-page a\s*{[^}]*text-decoration:\s*underline/s);
    expect(globalStyles).toMatch(
      /\.text-block a:not\(\.primary-button\)\s*{[^}]*text-decoration:\s*underline/s,
    );
    expect(globalStyles).toMatch(/text-underline-offset:\s*0\.18em/);
  });

  it('keeps the skip link available on focus without taking visible page space', () => {
    const globalStyles = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');

    expect(globalStyles).toMatch(/\.skip-link\s*{[^}]*position:\s*fixed/s);
    expect(globalStyles).toMatch(/\.skip-link\s*{[^}]*transform:\s*translateY\(-160%\)/s);
    expect(globalStyles).toMatch(/\.skip-link:focus\s*{[^}]*transform:\s*translateY\(0\)/s);
  });
});
