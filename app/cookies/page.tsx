import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Política de cookies',
  description: 'Información sobre el uso de cookies en Neto Autónomo.',
};

export default function CookiesPage() {
  return (
    <main className="legal-page container">
      <h1>Política de cookies</h1>
      <div className="legal-card">
        <p>
          Contacto: <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
        </p>
      </div>

      <section className="legal-section">
        <h2>Estado actual del sitio</h2>
        <p>
          En esta versión no se utilizan cookies propias de publicidad, perfilado ni medición avanzada
          configuradas por el titular del sitio. La web usa Vercel Web Analytics para obtener una
          medición agregada del uso del sitio, incluidos eventos básicos de uso de la calculadora.
        </p>
      </section>

      <section className="legal-section">
        <h2>Cookies técnicas</h2>
        <p>
          El funcionamiento básico de la web puede requerir elementos técnicos imprescindibles del
          navegador, del sistema de caché o del proveedor de hosting para servir la página de forma
          segura y estable. Además, la medición básica implantada con Vercel Analytics está pensada
          para trabajar sin cookies propias del sitio y sin crear perfiles comerciales del usuario.
        </p>
      </section>

      <section className="legal-section">
        <h2>Cambios futuros</h2>
        <p>
          Si más adelante se incorporan herramientas de analítica, publicidad, afiliación o servicios
          de terceros que instalen cookies no esenciales, esta política se actualizará para reflejarlo
          con más detalle.
        </p>
      </section>
    </main>
  );
}
