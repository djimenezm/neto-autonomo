import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('footer accessibility', () => {
  it('keeps the contact email visually distinguishable beyond color', () => {
    const footer = readFileSync(join(process.cwd(), 'components/Footer.tsx'), 'utf8');
    const styles = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');

    expect(footer).toContain('className="footer-contact-row"');
    expect(footer).toContain('className="footer-contact-link"');
    expect(footer).toContain('Contacto: {siteConfig.contactEmail}');
    expect(footer).not.toContain('Contacto:{');
    expect(styles).toMatch(/\.footer-contact-link\s*{[^}]*display:\s*inline-flex/s);
    expect(styles).toMatch(/\.footer-contact-link\s*{[^}]*border:\s*1px solid/s);
    expect(styles).toMatch(/\.footer-contact-link\s*{[^}]*background:\s*#eef6ff/s);
    expect(styles).toMatch(/\.footer-contact-link\s*{[^}]*text-decoration:\s*underline/s);
    expect(styles).toMatch(/\.footer-contact-link\s*{[^}]*font-weight:\s*700/s);
  });
});
