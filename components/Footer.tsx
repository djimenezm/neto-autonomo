import { siteConfig } from '@/lib/site';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-copy">
          <p>Copyright {new Date().getFullYear()} Neto Autónomo</p>
          <p>
            Titular: {siteConfig.ownerName} · Contacto:{' '}
            <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
          </p>
          <p className="footer-note">Herramienta orientativa. No constituye asesoramiento fiscal ni legal.</p>
        </div>
        <div className="footer-links">
          <a href="/tabla-cuanto-facturar-autonomo">Tabla</a>
          <a href="/cuanto-facturar-autonomo-1500-euros">1500 netos</a>
          <a href="/cuanto-facturar-autonomo-2000-euros">2000 netos</a>
          <a href="/cuanto-facturar-autonomo-2500-euros">2500 netos</a>
          <a href="/cuanto-facturar-autonomo-3000-euros">3000 netos</a>
          <a href="/horas-facturables-freelance">Horas facturables</a>
          <a href="/tarifa-diaria-freelance">Tarifa diaria</a>
          <a href="https://www.cuantopresupuestar.es?utm_source=cuantofacturar&utm_medium=ecosystem-footer&utm_campaign=cross_navigation">
            Presupuestar
          </a>
          <a href="https://www.mantenimientowebmensual.es?utm_source=cuantofacturar&utm_medium=ecosystem-footer&utm_campaign=cross_navigation">
            Mantenimiento web
          </a>
          <a href="https://www.cuantocobrarlandingpage.es?utm_source=cuantofacturar&utm_medium=ecosystem-footer&utm_campaign=cross_navigation">
            Landing pages
          </a>
          <a href="https://www.paneldeherramientas.es/precios-freelance?utm_source=cuantofacturar&utm_medium=ecosystem-footer&utm_campaign=pricing_hub">
            Precios freelance
          </a>
          <a href="https://www.paneldeherramientas.es?utm_source=cuantofacturar&utm_medium=ecosystem-footer&utm_campaign=cross_navigation">
            Panel
          </a>
          <a href="/aviso-legal">Aviso legal</a>
          <a href="/privacidad">Privacidad</a>
          <a href="/cookies">Cookies</a>
        </div>
      </div>
    </footer>
  );
}
