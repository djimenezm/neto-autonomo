import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Gracias por pedir el kit',
  description: `Confirmación de interés en el kit de tarifa para autónomos de ${siteConfig.name}.`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function GraciasKitTarifaPage() {
  return (
    <main>
      <Header />

      <section className="hero">
        <div className="container text-block">
          <span className="eyebrow">Todo correcto</span>
          <h1>Gracias por pedir el kit de tarifa para autónomos</h1>
          <p className="lead">
            Ya hemos recibido tu solicitud. Acabas de desbloquear el kit con estructura para revisar
            tu tarifa, checklist de mínimos y una guía corta para defender mejor tus números.
          </p>
          <div className="disclaimer-box">
            <strong>Nota:</strong> también deberías recibir un email con el acceso directo al kit.
            Si no lo ves, revisa spam o promociones.
          </div>
          <div className="guide-cta">
            <Link href="/kit-tarifa-autonomo" className="primary-button">
              Abrir el kit
            </Link>
            <Link href="/" className="primary-button">
              Volver a la calculadora
            </Link>
            <Link href="/recursos/kit-tarifa-autonomo.txt" className="primary-button">
              Descargar versión en texto
            </Link>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <span className="eyebrow">Siguiente paso</span>
          <h2>Convierte esa tarifa en decisiones concretas</h2>
          <div className="feature-grid" aria-label="Siguientes pasos recomendados">
            <article className="feature-card">
              <h3>Presupuesto cerrado</h3>
              <p>
                Si ya sabes tu suelo mensual, transforma esa referencia en un precio por proyecto
                con margen, buffer y alcance claro.
              </p>
              <div className="guide-cta">
                <a href="https://www.cuantopresupuestar.es" className="primary-button">
                  Ir a Cuanto Presupuestar
                </a>
              </div>
            </article>

            <article className="feature-card">
              <h3>Mantenimiento mensual</h3>
              <p>
                Si vendes soporte recurrente, calcula una cuota mensual que no se coma tus horas
                ni tu margen.
              </p>
              <div className="guide-cta">
                <a href="https://www.mantenimientowebmensual.es" className="primary-button">
                  Calcular cuota
                </a>
              </div>
            </article>

            <article className="feature-card">
              <h3>Ver todas las herramientas</h3>
              <p>
                Usa el panel central para moverte entre calculadoras de facturacion, presupuestos,
                mantenimiento y landing pages.
              </p>
              <div className="guide-cta">
                <a href="https://www.paneldeherramientas.es" className="primary-button">
                  Abrir panel
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
