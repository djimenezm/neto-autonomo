import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Politica de cookies',
  description: 'Informacion sobre el uso de cookies en Neto Autonomo.',
};

export default function CookiesPage() {
  return (
    <main className="legal-page container">
      <h1>Politica de cookies</h1>
      <div className="legal-card">
        <p>
          Contacto: <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
        </p>
      </div>

      <section className="legal-section">
        <h2>Estado actual del sitio</h2>
        <p>
          En esta version no se utilizan cookies propias de publicidad, perfilado ni medicion avanzada
          configuradas por el titular del sitio.
        </p>
      </section>

      <section className="legal-section">
        <h2>Cookies tecnicas</h2>
        <p>
          El funcionamiento basico de la web puede requerir elementos tecnicos imprescindibles del
          navegador, del sistema de cache o del proveedor de hosting para servir la pagina de forma
          segura y estable. Estas funciones tienen caracter tecnico y no se usan para crear perfiles
          comerciales del usuario.
        </p>
      </section>

      <section className="legal-section">
        <h2>Cambios futuros</h2>
        <p>
          Si mas adelante se incorporan herramientas de analitica, publicidad, afiliacion o servicios
          de terceros que instalen cookies no esenciales, esta politica se actualizara para reflejarlo
          con mas detalle.
        </p>
      </section>
    </main>
  );
}
