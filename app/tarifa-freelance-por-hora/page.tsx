import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import BillingBreakdown from '@/components/BillingBreakdown';
import { calculateExample, exampleAssumptions, formatEuro, getExampleUrl } from '@/lib/scenarioExamples';
import { getSiteUrl, siteConfig } from '@/lib/site';

const route = '/tarifa-freelance-por-hora';
const title = 'Tarifa freelance por hora: cómo calcularla bien';
const description =
  'Calcula tu tarifa freelance por hora con un ejemplo desglosado: de la facturación al neto, gastos, cuota, reserva de IRPF e IVA separado. Ajusta los mismos datos en la calculadora.';

const targetNet = 2000;
const example = calculateExample(targetNet);
const fewerHours = exampleAssumptions.billableHours / 2;
const fewerHoursExample = calculateExample(targetNet, { billableHours: fewerHours });

const pageFaqItems = [
  {
    question: '¿La tarifa por hora es lo que gano limpio?',
    answer:
      `No. En el ejemplo hipotético, ${formatEuro(example.hourlyRate)}/h sin IVA permiten facturar ${formatEuro(example.billingWithoutVAT)} con ${exampleAssumptions.billableHours} horas mensuales. De ahí se cubren gastos, cuota y reserva de IRPF para conservar ${formatEuro(targetNet)} netos. No es una tarifa de mercado ni una estimación de tu fiscalidad real.`,
  },
  {
    question: '¿Cómo sé si mi tarifa por hora es demasiado baja?',
    answer:
      'Si después de cubrir gastos, cuota, impuestos y horas no facturables tu tarifa no te deja el neto que buscas, seguramente está por debajo de tu mínimo razonable. La referencia útil no es solo lo que el mercado paga, sino lo que tu actividad necesita para sostenerse.',
  },
  {
    question: '¿Debo presupuestar siempre por hora?',
    answer:
      'No. Muchos profesionales prefieren presupuestar por proyecto o por mensualidad. Aun así, tener una referencia por hora sigue siendo muy útil para validar si ese proyecto o esa cuota mensual te dejan margen real.',
  },
  {
    question: '¿Cuántas horas facturables son realistas al mes?',
    answer:
      'Depende de tu actividad, pero suele ser bastante menos de las horas totales que trabajas. Reuniones, administración, ventas, revisión, formación y soporte también consumen tiempo aunque no siempre se facturen directamente.',
  },
] as const;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: route,
  },
  keywords: [
    'tarifa freelance por hora',
    'cómo calcular tarifa por hora freelance',
    'cuánto cobrar por hora freelance',
    'precio por hora autónomo',
    'tarifa consultor freelance',
  ],
  openGraph: {
    title: `${title} | ${siteConfig.name}`,
    description,
    url: route,
    type: 'article',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - ${title}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${title} | ${siteConfig.name}`,
    description,
    images: ['/opengraph-image'],
  },
};

export default function TarifaFreelancePorHoraPage() {
  const siteUrl = getSiteUrl();
  const pageUrl = new URL(route, siteUrl).toString();

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    inLanguage: 'es',
    mainEntityOfPage: pageUrl,
    author: {
      '@type': 'Organization',
      name: siteConfig.name,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
    },
    datePublished: '2026-04-22',
    dateModified: '2026-10-26',
    accountablePerson: { '@type': 'Person', name: siteConfig.ownerName },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: new URL('/', siteUrl).toString(),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: title,
        item: pageUrl,
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pageFaqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <main id="contenido-principal">
      <Script
        id="tarifa-freelance-por-hora-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script
        id="tarifa-freelance-por-hora-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="tarifa-freelance-por-hora-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Header />

      <section className="hero">
        <div className="container article-layout">
          <div className="text-block">
            <span className="eyebrow">Guía práctica</span>
            <h1>Tarifa freelance por hora: cómo calcularla sin quedarte corto</h1>
            <p className="lead">
              Ejemplo hipotético: <strong>{formatEuro(example.hourlyRate)}/h sin IVA</strong> con
              {' '}{exampleAssumptions.billableHours} horas facturables al mes para conservar
              {' '}{formatEuro(targetNet)} netos. La cuenta depende de tus gastos, cuota e impuestos;
              no es un precio de mercado.
            </p>
            <div className="hero-badges" aria-label="Qué cubre esta guía">
              <span className="hero-badge">Horas facturables</span>
              <span className="hero-badge">Precio por proyecto</span>
              <span className="hero-badge">Margen real</span>
            </div>
            <div className="guide-cta">
              <Link href={getExampleUrl(targetNet)} className="primary-button">
                Ajustar este ejemplo a mis datos
              </Link>
            </div>
          </div>

          <aside className="feature-card article-summary">
            <h2>Supuestos del ejemplo</h2>
            <ul className="article-list">
              <li>Gastos deducibles: {formatEuro(exampleAssumptions.monthlyExpenses)}/mes.</li>
              <li>Cuota manual: {formatEuro(exampleAssumptions.selfEmployedFee)}/mes.</li>
              <li>Reserva manual de IRPF: {exampleAssumptions.irpfRate} %.</li>
              <li>Horas facturables: {exampleAssumptions.billableHours}/mes.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section" aria-labelledby="ejemplo-tarifa">
        <div className="container text-block">
          <h2 id="ejemplo-tarifa">Una tarifa de {formatEuro(example.hourlyRate)} no es un sueldo de {formatEuro(example.hourlyRate)} por hora</h2>
          <p>
            Para conservar {formatEuro(targetNet)} al mes con estos supuestos necesitas facturar
            {' '}{formatEuro(example.billingWithoutVAT)} sin IVA. Esta es la resta completa: la reserva
            de IRPF se cuenta una sola vez y el IVA queda fuera del reparto.
          </p>
          <BillingBreakdown result={example} hasIVA={exampleAssumptions.hasIVA} headingId="guide-billing-breakdown-title" />
          <p>
            Después divides {formatEuro(example.billingWithoutVAT)} entre
            {' '}{exampleAssumptions.billableHours} h: <strong>{formatEuro(example.hourlyRate)}/h sin IVA</strong>.
            {' '}No hemos añadido un margen comercial extra ni costes específicos de un proyecto.
            La reserva del {exampleAssumptions.irpfRate} % y la cuota manual son supuestos elegidos
            para el ejemplo, no tipos ni cuotas aplicables a todas las personas.
          </p>
          <div className="disclaimer-box">
            Con el mismo objetivo y los mismos costes, si solo puedes vender {fewerHours} h al mes,
            la tarifa de cobertura sube a <strong>{formatEuro(fewerHoursExample.hourlyRate)}/h sin IVA</strong>.
            {' '}La facturación mensual necesaria sigue siendo {formatEuro(fewerHoursExample.billingWithoutVAT)}.
            {' '}<Link href={getExampleUrl(targetNet, { billableHours: fewerHours })}>Probar el caso de {fewerHours} horas</Link>.
          </div>
          <p className="scenario-note">
            Método: simulación aritmética con el mismo motor de la calculadora, no una encuesta de
            precios. Responsable del sitio: <Link href="/aviso-legal">{siteConfig.ownerName}</Link>.
            {' '}Actualizada el <time dateTime="2026-10-26">26 de octubre de 2026</time>.
          </p>
        </div>
      </section>

      <section className="section alt" aria-labelledby="iva-y-reserva">
        <div className="container text-block">
          <h2 id="iva-y-reserva">IVA añadido y reserva de IRPF son cuentas diferentes</h2>
          <p>
            El selector de esta calculadora añade un 21 % de IVA cuando lo activas; no comprueba
            el régimen ni el tipo que corresponde a tu actividad. El IVA añadido se muestra aparte
            y no aumenta el neto objetivo del ejemplo.
          </p>
          <p>
            La Agencia Tributaria explica que, en el régimen general, la liquidación tiene en cuenta
            la diferencia entre el IVA repercutido y el soportado deducible. Por eso el IVA que ves
            aquí no equivale por sí solo a lo que ingresarás a Hacienda. Consulta la explicación
            oficial del <a href="https://sede.agenciatributaria.gob.es/Sede/iva/regimenes-tributacion-iva/regimen-general.html" className="text-link">régimen general del IVA de la AEAT</a>.
          </p>
          <p>
            La reserva de IRPF del ejemplo se estima sobre el beneficio del modelo, no sobre el total
            con IVA. Tampoco calcula una retención en factura ni descuenta pagos a cuenta ya
            realizados: sirve para planificar el objetivo, no para rellenar una declaración.
          </p>
        </div>
      </section>

      <section className="section alt">
        <div className="container feature-grid" aria-label="Qué entra en una tarifa freelance por hora">
          <article className="feature-card">
            <h2>1. Tu objetivo mensual</h2>
            <p>
              Necesitas saber cuánto quieres conservar al mes y cuánto debes facturar para llegar a
              esa cifra sin depender de la intuición.
            </p>
          </article>

          <article className="feature-card">
            <h2>2. Tus horas facturables reales</h2>
            <p>
              No cuentan solo las horas que trabajas. Cuenta el tiempo que realmente puedes vender sin
              asumir una agenda imposible de sostener. Puedes calcular esa disponibilidad con los{' '}
              <Link href="/horas-facturables-freelance">ejemplos de horas facturables mensuales</Link>.
            </p>
          </article>

          <article className="feature-card">
            <h2>3. El margen que te deja cada encargo</h2>
            <p>
              Tu tarifa por hora tiene que ayudarte a decidir si un proyecto, una bolsa de horas o una
              mensualidad te compensa de verdad.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>Cómo calcular una tarifa por hora más defendible</h2>
          <ol className="article-list article-list-ordered">
            <li>Calcula primero tu facturación mensual objetivo.</li>
            <li>Descarta horas que no vas a poder facturar realmente.</li>
            <li>Divide la facturación sin IVA entre esas horas facturables.</li>
            <li>Comprueba si esa tarifa sigue teniendo sentido para tu mercado y tu posicionamiento.</li>
            <li>Úsala como referencia base, no como techo fijo para todos los trabajos.</li>
          </ol>
          <p>
            Si el resultado te parece alto, no significa automáticamente que esté mal. Puede indicar
            que estabas infravalorando tus costes, tus tiempos no vendibles o el margen mínimo que
            necesita tu actividad para ser sostenible.
          </p>
        </div>
      </section>

      <section className="section alt">
        <div className="container feature-grid" aria-label="Cuándo usar la tarifa por hora">
          <article className="feature-card">
            <h2>Para validar presupuestos cerrados</h2>
            <p>
              Aunque presupuestes por proyecto, tu referencia por hora te ayuda a comprobar si el
              importe final está alineado con el esfuerzo esperado.
            </p>
          </article>

          <article className="feature-card">
            <h2>Para negociar alcance</h2>
            <p>
              Cuando un cliente ajusta presupuesto, tu tarifa por hora te ayuda a decidir si conviene
              bajar precio o reducir entregables.
            </p>
          </article>

          <article className="feature-card">
            <h2>Para detectar encargos poco rentables</h2>
            <p>
              Si un proyecto te deja por debajo de esa referencia, ya tienes una señal clara para
              revisar precio, tiempos o condiciones antes de aceptar.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>Usa la calculadora para aterrizar tu número</h2>
          <p>
            La calculadora te permite probar distintos escenarios con neto mensual, gastos, cuota de
            autónomos, IRPF, IVA y horas facturables. Así obtienes una referencia por hora que te
            sirve tanto para trabajar con precio/hora como para convertirla en un presupuesto por
            proyecto más defendible.
          </p>
          <div className="guide-cta">
            <Link href="/#calculadora" className="primary-button">
              Ir a la calculadora
            </Link>
          </div>
        </div>
      </section>

      <section className="section alt" aria-labelledby="tarifa-freelance-faq-title">
        <div className="container text-block">
          <h2 id="tarifa-freelance-faq-title">Preguntas frecuentes sobre tarifa freelance por hora</h2>

          <div className="faq-list">
            {pageFaqItems.map((item) => (
              <article className="faq-item" key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <span className="eyebrow">Lectura relacionada</span>
          <h2>Antes de fijar tu tarifa, conviene entender cuánto tienes que facturar</h2>
          <p>
            Si todavía no has trabajado tu referencia mensual, esta guía te ayudará a pasar del neto
            que buscas a una facturación más realista antes de bajar el cálculo a precio por hora.
          </p>
          <p>
            Y si quieres afinar mejor la parte de cotización, también te conviene revisar cómo
            funciona la cuota de autónomos de 2026 y cuándo cambia de forma significativa.
          </p>
          <div className="guide-cta">
            <Link href="/cuanto-facturar-autonomo" className="primary-button">
              Leer guía sobre cuánto facturar
            </Link>
            <Link href="/tarifa-diaria-freelance" className="primary-button">
              Ver tarifa diaria freelance
            </Link>
            <Link href="/cuota-autonomos-2026" className="primary-button">
              Leer guía sobre cuota 2026
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
