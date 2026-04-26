import Link from 'next/link';
import Script from 'next/script';
import CalculatorForm from '@/components/CalculatorForm';
import FAQ, { faqItems } from '@/components/FAQ';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LeadMagnetForm from '@/components/LeadMagnetForm';
import { siteConfig } from '@/lib/site';

export default function HomePage() {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: siteConfig.name,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    inLanguage: 'es',
    isAccessibleForFree: true,
    description: siteConfig.description,
    url: siteConfig.url,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    featureList: [
      'Calculadora de facturación para autónomos',
      'Estimación de cuota por tramo 2026',
      'IRPF progresivo simplificado o manual',
      'IVA aparte y tarifa por hora',
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <main>
      <Script
        id="webapp-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Header />

      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">Herramienta gratuita</span>
            <h1>Calculadora de autónomos para saber cuánto facturar y cuánto cobrar por hora</h1>
            <p className="lead">
              Calcula cuánto facturar como autónomo o freelance en España con una referencia clara
              de cuota, IRPF, IVA y tarifa por hora. Pensada para ayudarte a poner precio con más
              criterio, defender mejor tus presupuestos y detectar si estás cobrando por debajo de
              lo que necesitas.
            </p>
            <div className="hero-badges" aria-label="Ventajas principales">
              <span className="hero-badge">Sin registro</span>
              <span className="hero-badge">Resultado en menos de 1 minuto</span>
              <span className="hero-badge">IVA siempre aparte</span>
            </div>
            <ul className="hero-points">
              <li>Calcula una cifra mensual orientativa y una tarifa por hora defendible</li>
              <li>Incluye cuota de autónomos, IRPF e IVA para que no te quedes corto al presupuestar</li>
              <li>Útil para freelancers, consultores y profesionales que venden su tiempo o sus proyectos</li>
            </ul>
            <p className="hero-cta-note">
              Si ya tienes una tarifa en mente, compárala con esta referencia antes de enviar tu
              siguiente presupuesto.
            </p>
          </div>

          <CalculatorForm />
        </div>
      </section>

      <section className="section">
        <div className="container feature-grid" aria-label="Puntos clave de la herramienta">
          <article className="feature-card">
            <h2>Qué resuelves rápido</h2>
            <p>
              Neto objetivo, gastos deducibles, horas facturables, cuota de autónomos, IRPF e IVA
              para darte una referencia clara de cuánto deberías facturar al mes sin perderte en una
              hoja de cálculo.
            </p>
          </article>

          <article className="feature-card">
            <h2>Cuándo más valor te da</h2>
            <p>
              Para fijar precios, calcular tu tarifa freelance, comparar escenarios y aterrizar de
              forma rápida si un presupuesto te deja el neto que realmente buscas antes de aceptar
              un cliente o cerrar una propuesta.
            </p>
          </article>

          <article className="feature-card">
            <h2>Dónde poner el filtro final</h2>
            <p>
              Bonificaciones especiales, deducciones personales, casuísticas familiares o revisiones
              fiscales completas. Si el importe es importante, conviene contrastarlo con una
              gestoría.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>Cómo calcular cuánto facturar como autónomo</h2>
          <p>
            La herramienta parte del neto mensual que quieres conservar y estima qué beneficio
            previo necesitarías antes de IRPF para conseguirlo. A partir de ahí suma gastos
            deducibles y una cuota de autónomos orientativa para calcular la facturación mensual
            necesaria sin IVA.
          </p>
          <p>
            Para el IRPF puedes elegir entre una estimación progresiva simplificada por tramos o un
            porcentaje manual. La opción progresiva usa una referencia estatal y te deja elegir
            entre Territorio común, Madrid, Cataluña, Andalucía y Comunitat Valenciana para afinar
            la parte autonómica. Sigue siendo una simulación orientativa, pero es bastante más útil
            que un porcentaje fijo para hacerte una idea rápida.
          </p>
          <p>
            Puedes elegir entre estimar la cuota según los tramos oficiales de rendimientos netos
            de 2026, aplicar una tarifa reducida para nuevas altas o indicar una cuota manual. En
            el modo de tarifa reducida puedes distinguir entre los primeros 12 meses y la prórroga
            estándar, que solo suele encajar si sigues por debajo del SMI. Si tu actividad suele
            llevar IVA, ese importe se calcula aparte para no mezclarlo con tu ingreso real. Es una
            simulación orientativa: no sustituye el criterio de una gestoría o asesor fiscal, pero
            sí te da una referencia útil para tomar decisiones rápidas.
          </p>
          <p>
            Si trabajas por proyectos o por horas, esta calculadora de autónomos te ayuda a pasar
            de una idea difusa de precio a una cifra más defendible para presupuestos, tarifas
            mensuales o precio por hora.
          </p>

          <div className="disclaimer-box">
            <strong>Antes de publicar una tarifa o cerrar un presupuesto:</strong> usa esta
            calculadora como punto de partida, no como cierre fiscal definitivo. El objetivo es que
            puedas pensar mejor tus precios sin perderte en una hoja de cálculo compleja.
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container conversion-grid">
          <div className="conversion-copy">
            <h2>No uses la cifra como techo: úsala como suelo orientativo</h2>
            <p>
              La simulación te da una referencia para no presupuestar a ciegas. Si tu tarifa actual
              está por debajo, tienes una señal clara para revisar precio, horas o alcance antes de
              comprometerte con un cliente.
            </p>
            <p>
              La idea no es fijar una tarifa exacta al céntimo, sino llegar a una cifra que te ayude
              a negociar con más criterio y a detectar encargos poco rentables antes de aceptarlos.
            </p>
          </div>

          <div className="conversion-steps" aria-label="Cómo aprovechar mejor el resultado">
            <article className="conversion-step">
              <h3>1. Compara</h3>
              <p>Contrasta el resultado con tu precio actual y mira si te deja margen real.</p>
            </article>

            <article className="conversion-step">
              <h3>2. Ajusta</h3>
              <p>Prueba escenarios cambiando horas, gastos o cuota para ver dónde está tu mínimo razonable.</p>
            </article>

            <article className="conversion-step">
              <h3>3. Presupuesta mejor</h3>
              <p>Usa la cifra final como base para pasar a tarifa por hora, mensualidad o presupuesto cerrado.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <LeadMagnetForm
            source="home"
            title="Llévate el kit para revisar tu tarifa antes de enviarla"
            description="Una guía rápida para convertir el resultado de la calculadora en una tarifa más defendible: mínimos, margen, horas facturables y checklist antes de aceptar un precio."
            buttonLabel="Quiero revisar mi tarifa"
          />
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <span className="eyebrow">Guías útiles</span>
          <h2>Empieza por la duda que más te esté bloqueando</h2>
          <p>
            Hemos preparado tres guías prácticas para ayudarte a aterrizar mejor tus números antes
            de usar la calculadora: una sobre cuánto facturar como autónomo, otra sobre cómo
            calcular una tarifa freelance por hora y una tercera centrada en la cuota de autónomos
            de 2026.
          </p>
          <div className="feature-grid" aria-label="Guías relacionadas">
            <article className="feature-card">
              <h3>Cuánto facturar como autónomo</h3>
              <p>
                Entiende cómo pasar de tu neto deseado a una cifra mensual razonable teniendo en
                cuenta cuota, IRPF, IVA y gastos.
              </p>
              <div className="guide-cta">
                <Link href="/cuanto-facturar-autonomo" className="primary-button">
                  Leer guía
                </Link>
              </div>
            </article>

            <article className="feature-card">
              <h3>Cuanto facturar para ganar 2000 euros</h3>
              <p>
                Baja un objetivo muy concreto a una cifra mensual mas realista teniendo en cuenta
                cuota, gastos, IRPF, IVA y horas facturables.
              </p>
              <div className="guide-cta">
                <Link href="/cuanto-facturar-autonomo-2000-euros" className="primary-button">
                  Leer guia
                </Link>
              </div>
            </article>

            <article className="feature-card">
              <h3>Tarifa freelance por hora</h3>
              <p>
                Aprende a convertir esa referencia mensual en una tarifa por hora útil para
                presupuestos, propuestas y proyectos cerrados.
              </p>
              <div className="guide-cta">
                <Link href="/tarifa-freelance-por-hora" className="primary-button">
                  Leer guía
                </Link>
              </div>
            </article>

            <article className="feature-card">
              <h3>Cuota de autónomos 2026</h3>
              <p>
                Revisa cómo funciona la cuota por tramos, cuándo encaja la tarifa reducida y qué
                papel juega la cuota en tu cálculo mensual.
              </p>
              <div className="guide-cta">
                <Link href="/cuota-autonomos-2026" className="primary-button">
                  Leer guía
                </Link>
              </div>
            </article>

            <article className="feature-card">
              <h3>Mejores programas de facturacion</h3>
              <p>
                Compara opciones para autonomos en Espana y revisa cuando compensa una solucion
                gratis o una plataforma mas completa.
              </p>
              <div className="guide-cta">
                <Link href="/mejores-programas-facturacion-autonomos" className="primary-button">
                  Ver comparativa
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>
      <section className="section alt">
        <div className="container text-block">
          <span className="eyebrow">Otra herramienta</span>
          <h2>Si cobras por proyecto, prueba tambien Cuanto Presupuestar</h2>
          <p>
            Neto Autonomo te ayuda a saber cuanto necesitas facturar para sostener tu actividad. Si
            quieres llevar esa referencia a un presupuesto cerrado, tambien puedes usar{' '}
            <a href="https://www.cuantopresupuestar.es">Cuanto Presupuestar</a> para convertir tu
            objetivo mensual en un precio por proyecto mas defendible.
          </p>
          <p>
            Y si quieres ver el ecosistema completo, en{' '}
            <a href="https://www.paneldeherramientas.es">Panel de Herramientas</a> tienes reunidas
            todas las calculadoras para enlazar facturacion, presupuestos, mantenimiento y precios
            por servicio.
          </p>
        </div>
      </section>

      <FAQ />
      <Footer />
    </main>
  );
}


