import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { siteConfig } from '@/lib/site';

const recommendationCards = [
  {
    id: 'facturacion',
    title: 'Ordenar facturas e impuestos',
    description:
      'Si ya sabes cuanto deberias facturar, el siguiente paso es elegir una forma comoda de emitir facturas, guardar gastos y preparar IVA e IRPF.',
    href: '/mejores-programas-facturacion-autonomos?utm_source=cuantofacturar&utm_medium=thank-you&utm_campaign=affiliate_prepare',
    cta: 'Ver programas de facturacion',
  },
  {
    id: 'presupuestos',
    title: 'Convertir tu tarifa en presupuesto',
    description:
      'Cuando tengas tu precio base, bajalo a un proyecto cerrado con alcance, margen, revisiones y condiciones claras antes de enviarlo.',
    href: 'https://www.cuantopresupuestar.es?utm_source=cuantofacturar&utm_medium=thank-you&utm_campaign=kit_next_step',
    cta: 'Ir a Cuanto Presupuestar',
  },
  {
    id: 'herramientas',
    title: 'Ver el mapa completo de herramientas',
    description:
      'Usa el panel central para moverte entre calculadoras de facturacion, presupuestos, mantenimiento y landing pages sin perder contexto.',
    href: 'https://www.paneldeherramientas.es?utm_source=cuantofacturar&utm_medium=thank-you&utm_campaign=kit_next_step',
    cta: 'Abrir panel de herramientas',
  },
] as const;

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
          <script
            dangerouslySetInnerHTML={{
              __html:
                "window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};window.va('event',{name:'kit_requested',data:{resource:'kit-tarifa-autonomo'}});if(window.gtag){window.gtag('event','kit_requested',{resource:'kit-tarifa-autonomo'});}document.addEventListener('click',function(event){var link=event.target.closest('[data-recommendation-id]');if(!link)return;var id=link.getAttribute('data-recommendation-id');window.va('event',{name:'recommendation_clicked',data:{source:'gracias-kit-tarifa',recommendation:id}});if(window.gtag){window.gtag('event','recommendation_clicked',{source:'gracias-kit-tarifa',recommendation:id});}});",
            }}
          />
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
          <p className="section-lead">
            Primero revisa tu tarifa con el kit. Despues, si tiene sentido para tu caso, estas
            rutas te ayudan a ordenar facturas, presupuestos y herramientas.
          </p>
          <div className="disclaimer-box affiliate-disclosure">
            <strong>Transparencia:</strong> ahora estos enlaces son recomendaciones editoriales.
            Cuando incorporemos enlaces de afiliado o partner, lo indicaremos de forma visible.
          </div>
          <div className="feature-grid" aria-label="Siguientes pasos recomendados">
            {recommendationCards.map((card) => (
              <article className="feature-card commercial-card" key={card.id}>
                <span className="card-kicker">Recomendado</span>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <div className="guide-cta">
                  <a
                    href={card.href}
                    className="primary-button"
                    data-recommendation-id={card.id}
                  >
                    {card.cta}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
