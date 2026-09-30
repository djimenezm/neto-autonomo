import { siteConfig } from '@/lib/site';

const footerGroups = [
  {
    title: 'Calcular',
    links: [
      { href: '/#calculadora', label: 'Calculadora' },
      { href: '/tabla-cuanto-facturar-autonomo', label: 'Tabla' },
      { href: '/cuanto-cuesta-ser-autonomo', label: 'Costes mensuales' },
      { href: '/horas-facturables-freelance', label: 'Horas facturables' },
      { href: '/tarifa-diaria-freelance', label: 'Tarifa diaria' },
    ],
  },
  {
    title: 'Escenarios',
    links: [
      { href: '/cuanto-facturar-autonomo-1500-euros', label: '1500 netos' },
      { href: '/tabla-cuanto-facturar-autonomo#neto-2000', label: '2000 netos' },
      { href: '/tabla-cuanto-facturar-autonomo#neto-2500', label: '2500 netos' },
      { href: '/cuanto-facturar-autonomo-3000-euros', label: '3000 netos' },
    ],
  },
] as const;

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-invite-band">
        <div className="container footer-invite">
          <div>
            <span className="footer-invite-kicker">Tu próxima cifra</span>
            <p>Calcula tu tarifa con criterio.</p>
          </div>
          <a href="/#calculadora" className="footer-invite-link">Hacer el cálculo <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <div className="container footer-shell">
        <div className="footer-main">
          <div className="footer-brand-block">
            <a href="/" className="footer-brand">
              Neto Autónomo
            </a>
            <p>Calcula cuánto facturar y qué tarifa defender antes de enviar un presupuesto.</p>
            <div className="footer-contact">
              <span className="footer-contact-label">Contacto</span>
              <a
                className="footer-contact-link"
                href={`mailto:${siteConfig.contactEmail}`}
                aria-label={`Enviar un correo a ${siteConfig.contactEmail}`}
              >
                {siteConfig.contactEmail}
              </a>
            </div>
          </div>

          <nav className="footer-nav" aria-label="Enlaces del pie de página">
            {footerGroups.map((group) => (
              <div className="footer-group" key={group.title}>
                <p className="footer-group-title">{group.title}</p>
                {group.links.map((link) => (
                  <a href={link.href} key={link.href}>
                    {link.label}
                  </a>
                ))}
              </div>
            ))}
            <div className="footer-group">
              <p className="footer-group-title">Herramientas</p>
              <a
                href="https://www.cuantopresupuestar.es?utm_source=cuantofacturar&utm_medium=ecosystem-footer&utm_campaign=cross_navigation"
                target="_blank"
                rel="noopener noreferrer"
              >
                Presupuestar
              </a>
              <a
                href="https://www.mantenimientowebmensual.es?utm_source=cuantofacturar&utm_medium=ecosystem-footer&utm_campaign=cross_navigation"
                target="_blank"
                rel="noopener noreferrer"
              >
                Mantenimiento web
              </a>
              <a
                href="https://www.cuantocobrarlandingpage.es?utm_source=cuantofacturar&utm_medium=ecosystem-footer&utm_campaign=cross_navigation"
                target="_blank"
                rel="noopener noreferrer"
              >
                Landing pages
              </a>
              <a
                href="https://www.paneldeherramientas.es/precios-freelance?utm_source=cuantofacturar&utm_medium=ecosystem-footer&utm_campaign=pricing_hub"
                target="_blank"
                rel="noopener noreferrer"
              >
                Precios freelance
              </a>
            </div>
          </nav>
        </div>

        <div className="footer-bottom">
          <div className="footer-legal-copy">
            <p>© {new Date().getFullYear()} Neto Autónomo · Titular: {siteConfig.ownerName}</p>
            <p>Herramienta orientativa. No constituye asesoramiento fiscal ni legal.</p>
          </div>
          <nav aria-label="Enlaces legales">
            <a href="/aviso-legal">Aviso legal</a>
            <a href="/privacidad">Privacidad</a>
            <a href="/cookies">Cookies</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
