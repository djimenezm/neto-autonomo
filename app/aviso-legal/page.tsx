import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Aviso legal',
  description: 'Condiciones de uso y limitacion de responsabilidad de la calculadora Neto Autonomo.',
};

export default function AvisoLegalPage() {
  return (
    <main className="legal-page container">
      <h1>Aviso legal</h1>
      <div className="legal-card">
        <p>
          Titular del sitio: <strong>{siteConfig.ownerName}</strong>
        </p>
        <p>
          Contacto: <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
        </p>
        <p>Ambito de actividad: {siteConfig.country}</p>
      </div>

      <section className="legal-section">
        <h2>Objeto del sitio</h2>
        <p>
          Este sitio ofrece una calculadora orientativa para estimar facturacion, cuota de autonomos,
          IRPF, IVA y tarifa por hora. La informacion se facilita con fines informativos y no sustituye
          el asesoramiento profesional fiscal, laboral, contable o legal.
        </p>
      </section>

      <section className="legal-section">
        <h2>Condiciones de uso</h2>
        <p>
          Al utilizar esta web aceptas hacer un uso adecuado de sus contenidos y no emplearla para
          actividades ilicitas, fraudulentas o que puedan afectar al funcionamiento del servicio.
        </p>
      </section>

      <section className="legal-section">
        <h2>Limitacion de responsabilidad</h2>
        <p>
          Los resultados mostrados son estimaciones basadas en la informacion que introduces y en
          criterios simplificados. El titular no garantiza la ausencia de errores, cambios normativos
          o diferencias respecto a tu situacion real y no asume responsabilidad por decisiones tomadas
          a partir de estas simulaciones.
        </p>
      </section>

      <section className="legal-section">
        <h2>Propiedad intelectual</h2>
        <p>
          Los textos, la estructura de la web y los elementos propios de esta herramienta pertenecen
          a su titular o se usan con autorizacion. No se permite su reproduccion total o parcial con
          fines comerciales sin permiso previo.
        </p>
      </section>
    </main>
  );
}
