import type { Metadata } from 'next';
import LegalShell from '@/components/LegalShell';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Política de cookies',
  description: 'Información sobre el uso de cookies en Neto Autónomo.',
  alternates: {
    canonical: '/cookies',
  },
};

export default function CookiesPage() {
  return (
    <LegalShell>
      <h1>Política de cookies</h1>
      <div className="legal-card">
        <p>
          Contacto: <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
        </p>
      </div>

      <section className="legal-section">
        <h2>Estado actual del sitio</h2>
        <p>
          La web usa Vercel Web Analytics para obtener medición agregada y Google Ads para medir de
          forma limitada cuándo se completa la calculadora. El consentimiento publicitario se inicia
          como denegado, por lo que Google no debe utilizar cookies publicitarias ni personalización
          mientras no exista una elección válida del usuario.
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
          La infraestructura para mostrar publicidad de Google AdSense permanece desactivada. Antes de
          activarla se deberá configurar una plataforma de consentimiento admitida por Google y
          actualizar esta política con los proveedores, finalidades y opciones disponibles.
        </p>
      </section>
    </LegalShell>
  );
}
