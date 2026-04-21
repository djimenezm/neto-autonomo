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
            <h1>Calculadora de autonomos: cuanto debes facturar para ganar tu neto mensual</h1>
            <p className="lead">
              Calcula cuanto facturar como autonomo o freelance en Espana con una referencia clara
              de cuota, IRPF, IVA y tarifa por hora. Pensada para ayudarte a poner precios y cerrar
              presupuestos con mas criterio.
            </p>
            <ul className="hero-points">
              <li>Calcula tu facturacion mensual y tu tarifa por hora</li>
              <li>Incluye cuota de autonomos, IRPF e IVA en la simulacion</li>
              <li>Orientada a freelancers, consultores y profesionales por servicios</li>
            </ul>
          </div>

          <CalculatorForm />
        </div>
      </section>

      <section className="section">
        <div className="container feature-grid" aria-label="Puntos clave de la herramienta">
          <article className="feature-card">
            <h2>Que calcula en menos de un minuto</h2>
            <p>
              Neto objetivo, gastos deducibles, horas facturables, cuota de autonomos, IRPF e IVA
              para darte una referencia clara de cuanto deberias facturar al mes.
            </p>
          </article>

          <article className="feature-card">
            <h2>Cuando mas te ayuda</h2>
            <p>
              Para fijar precios, calcular tu tarifa freelance, comparar escenarios y aterrizar de
              forma rapida si un presupuesto te deja el neto que realmente buscas.
            </p>
          </article>

          <article className="feature-card">
            <h2>Que conviene revisar aparte</h2>
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

      <FAQ />
      <Footer />
    </main>
  );
}
