import Script from 'next/script';
import CalculatorForm from '@/components/CalculatorForm';
import FAQ, { faqItems } from '@/components/FAQ';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
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
      'Calculadora de facturacion para autonomos',
      'Estimacion de cuota por tramo 2026',
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
            <h1>Calculadora de autonomos para saber cuanto facturar y cuanto cobrar por hora</h1>
            <p className="lead">
              Calcula cuanto facturar como autonomo o freelance en Espana con una referencia clara
              de cuota, IRPF, IVA y tarifa por hora. Pensada para ayudarte a poner precio con mas
              criterio, defender mejor tus presupuestos y detectar si estas cobrando por debajo de
              lo que necesitas.
            </p>
            <div className="hero-badges" aria-label="Ventajas principales">
              <span className="hero-badge">Sin registro</span>
              <span className="hero-badge">Resultado en menos de 1 minuto</span>
              <span className="hero-badge">IVA siempre aparte</span>
            </div>
            <ul className="hero-points">
              <li>Calcula una cifra mensual orientativa y una tarifa por hora defendible</li>
              <li>Incluye cuota de autonomos, IRPF e IVA para que no te quedes corto al presupuestar</li>
              <li>Util para freelancers, consultores y profesionales que venden su tiempo o sus proyectos</li>
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
            <h2>Que resuelves rapido</h2>
            <p>
              Neto objetivo, gastos deducibles, horas facturables, cuota de autonomos, IRPF e IVA
              para darte una referencia clara de cuanto deberias facturar al mes sin perderte en una
              hoja de calculo.
            </p>
          </article>

          <article className="feature-card">
            <h2>Cuando mas valor te da</h2>
            <p>
              Para fijar precios, calcular tu tarifa freelance, comparar escenarios y aterrizar de
              forma rapida si un presupuesto te deja el neto que realmente buscas antes de aceptar
              un cliente o cerrar una propuesta.
            </p>
          </article>

          <article className="feature-card">
            <h2>Donde poner el filtro final</h2>
            <p>
              Bonificaciones especiales, deducciones personales, casuisticas familiares o revisiones
              fiscales completas. Si el importe es importante, conviene contrastarlo con una
              gestoria.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>Como calcular cuanto facturar como autonomo</h2>
          <p>
            La herramienta parte del neto mensual que quieres conservar y estima que beneficio
            previo necesitarias antes de IRPF para conseguirlo. A partir de ahi suma gastos
            deducibles y una cuota de autonomos orientativa para calcular la facturacion mensual
            necesaria sin IVA.
          </p>
          <p>
            Para el IRPF puedes elegir entre una estimacion progresiva simplificada por tramos o un
            porcentaje manual. La opcion progresiva usa una referencia estatal y te deja elegir
            entre Territorio comun, Madrid, Cataluna, Andalucia y Comunitat Valenciana para afinar
            la parte autonomica. Sigue siendo una simulacion orientativa, pero es bastante mas util
            que un porcentaje fijo para hacerte una idea rapida.
          </p>
          <p>
            Puedes elegir entre estimar la cuota segun los tramos oficiales de rendimientos netos
            de 2026, aplicar una tarifa reducida para nuevas altas o indicar una cuota manual. En
            el modo de tarifa reducida puedes distinguir entre los primeros 12 meses y la prorroga
            estandar, que solo suele encajar si sigues por debajo del SMI. Si tu actividad suele
            llevar IVA, ese importe se calcula aparte para no mezclarlo con tu ingreso real. Es una
            simulacion orientativa: no sustituye el criterio de una gestoria o asesor fiscal, pero
            si te da una referencia util para tomar decisiones rapidas.
          </p>
          <p>
            Si trabajas por proyectos o por horas, esta calculadora de autonomos te ayuda a pasar
            de una idea difusa de precio a una cifra mas defendible para presupuestos, tarifas
            mensuales o precio por hora.
          </p>

          <div className="disclaimer-box">
            <strong>Antes de publicar una tarifa o cerrar un presupuesto:</strong> usa esta
            calculadora como punto de partida, no como cierre fiscal definitivo. El objetivo es que
            puedas pensar mejor tus precios sin perderte en una hoja de calculo compleja.
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container conversion-grid">
          <div className="conversion-copy">
            <h2>No uses la cifra como techo: usala como suelo orientativo</h2>
            <p>
              La simulacion te da una referencia para no presupuestar a ciegas. Si tu tarifa actual
              esta por debajo, tienes una señal clara para revisar precio, horas o alcance antes de
              comprometerte con un cliente.
            </p>
            <p>
              La idea no es fijar una tarifa exacta al centimo, sino llegar a una cifra que te ayude
              a negociar con mas criterio y a detectar encargos poco rentables antes de aceptarlos.
            </p>
          </div>

          <div className="conversion-steps" aria-label="Como aprovechar mejor el resultado">
            <article className="conversion-step">
              <h3>1. Compara</h3>
              <p>Contrasta el resultado con tu precio actual y mira si te deja margen real.</p>
            </article>

            <article className="conversion-step">
              <h3>2. Ajusta</h3>
              <p>Prueba escenarios cambiando horas, gastos o cuota para ver donde esta tu minimo razonable.</p>
            </article>

            <article className="conversion-step">
              <h3>3. Presupuesta mejor</h3>
              <p>Usa la cifra final como base para pasar a tarifa por hora, mensualidad o presupuesto cerrado.</p>
            </article>
          </div>
        </div>
      </section>

      <FAQ />
      <Footer />
    </main>
  );
}
