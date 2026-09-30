import { readStyles } from './readStyles';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('footer accessibility', () => {
  it('keeps the contact email visually distinguishable beyond color', () => {
    const footer = readFileSync(join(process.cwd(), 'components/Footer.tsx'), 'utf8');
    const styles = readStyles();

    expect(footer).toContain('className="footer-contact"');
    expect(footer).toContain('className="footer-contact-label"');
    expect(footer).toContain('className="footer-contact-link"');
    expect(footer).toContain('aria-label={`Enviar un correo a ${siteConfig.contactEmail}`}');
    expect(styles).toMatch(/\.footer-contact\s*{[^}]*border-left:\s*2px solid/s);
    expect(styles).toMatch(/\.footer-contact-link\s*{[^}]*overflow-wrap:\s*anywhere/s);
    expect(styles).toMatch(/\.footer-contact-link:hover,[\s\S]*text-decoration:\s*underline/s);
    expect(styles).toMatch(/\.footer-contact-link\s*{[^}]*font-weight:\s*700/s);
  });
});
