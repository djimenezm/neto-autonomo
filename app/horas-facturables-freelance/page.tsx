import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LeadMagnetForm from '@/components/LeadMagnetForm';
import { getSiteUrl, siteConfig } from '@/lib/site';

const route = '/horas-facturables-freelance';
const title = 'Horas facturables freelance: cuántas puedes vender al mes';
const description =
  'Guía práctica para calcular horas facturables freelance al mes y evitar tarifas demasiado bajas al estimar facturación, precio por hora y presupuestos.';

const pageFaqItems = [
  {
    question: '¿Cuántas horas facturables tiene un freelance al mes?',
    answer:
      'Depende de la actividad, pero suele ser bastante menos que las horas trabajadas. Una referencia prudente puede estar entre 70 y 110 horas facturables mensuales si también haces ventas, gestión, reuniones y administración.',
  },
  {
    question: '¿Por qué no puedo contar todas mis horas de trabajo?',
    answer:
      'Porque no todas generan factura directa. Hay tiempo comercial, administrativo, formación, coordinación, soporte, propuestas y seguimiento que sostiene el negocio aunque no aparezca como una línea facturada.',
  },
  {
    question: '¿Cómo afectan las horas facturables a mi tarifa?',
    answer:
      'Cuantas menos horas facturables reales tengas, más alta debe ser tu tarifa para sostener el mismo objetivo mensual. Por eso estimarlas mal puede hacer que cobres por debajo de tu suelo.',
  },
] as const;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: route,
  },
  keywords: [
    'horas facturables freelance',
    'horas facturables autónomo',
    'cuantas horas facturables al mes',
    'calcular horas facturables freelance',
    'tarifa freelance horas facturables',
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

export default function HorasFacturablesFreelancePage() {
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
    datePublished: '2026-04-27',
    dateModified: '2026-04-27',
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
    <main>
      <Script
        id="horas-facturables-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script
        id="horas-facturables-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="horas-facturables-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Header />

      <section className="hero">
        <div className="container article-layout">
          <div className="text-block">
            <span className="eyebrow">Base de cálculo</span>
            <h1>Horas facturables freelance: cuántas puedes vender al mes</h1>
            <p className="lead">
              Tu tarifa no se calcula dividiendo tu objetivo mensual entre todas las horas que
              trabajas. Se calcula sobre las horas que realmente puedes facturar. La diferencia
              parece pequeña en una hoja de cálculo, pero en tu margen mensual es un pequeño dragón.
            </p>
            <div className="hero-badges" aria-label="Qué cubre esta guía">
              <span className="hero-badge">Horas vendibles</span>
              <span className="hero-badge">Trabajo invisible</span>
              <span className="hero-badge">Tarifa por hora</span>
            </div>
            <div className="guide-cta">
              <Link href="/#calculadora" className="primary-button">
                Calcular mi tarifa
              </Link>
              <Link href="/tarifa-freelance-por-hora" className="primary-button">
                Ver tarifa por hora
              </Link>
            </div>
          </div>

          <aside className="feature-card article-summary">
            <h2>Resumen rápido</h2>
            <ul className="article-list">
              <li>No todas tus horas de trabajo son horas facturables.</li>
              <li>Ventas, gestión, propuestas y soporte también consumen agenda.</li>
              <li>Menos horas facturables implican una tarifa mínima más alta.</li>
              <li>La estimación debe ser prudente si quieres sostener margen.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>Qué son las horas facturables</h2>
          <p>
            Las horas facturables son las horas que puedes cobrar directamente a un cliente. Pueden
            aparecer como trabajo por hora, estar dentro de un presupuesto cerrado o formar parte de
            una cuota mensual, pero tienen algo en común: generan ingresos directos.
          </p>
          <p>
            El resto de horas también son necesarias, aunque no siempre se facturen. Preparar
            presupuestos, responder correos, hacer seguimiento comercial, ordenar facturas, aprender,
            revisar procesos o gestionar la agenda sostiene el negocio, pero no debería contarse como
            tiempo vendible.
          </p>
          <div className="disclaimer-box">
            <strong>Idea clave:</strong> si divides tu objetivo mensual entre demasiadas horas,
            obtendrás una tarifa artificialmente baja.
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container feature-grid" aria-label="Tipos de horas en un negocio freelance">
          <article className="feature-card">
            <h2>Horas facturables</h2>
            <p>
              Producción, consultoría, soporte contratado, reuniones incluidas en un proyecto o
              entregables que forman parte de una propuesta aceptada.
            </p>
          </article>

          <article className="feature-card">
            <h2>Horas no facturables</h2>
            <p>
              Administración, ventas, propuestas, seguimiento, formación, reuniones exploratorias,
              investigación interna y mejora de procesos.
            </p>
          </article>

          <article className="feature-card">
            <h2>Horas de margen</h2>
            <p>
              Espacio para imprevistos, descanso, huecos entre proyectos, clientes lentos y semanas
              donde no todo sale con la precisión de un reloj suizo.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container article-layout">
          <div className="text-block">
            <h2>Cómo estimar tus horas facturables mensuales</h2>
            <ol className="article-list article-list-ordered">
              <li>Calcula tus horas de trabajo disponibles al mes.</li>
              <li>Resta administración, ventas, propuestas y seguimiento.</li>
              <li>Resta reuniones no cobradas y tiempos de coordinación.</li>
              <li>Reserva margen para imprevistos, formación y descanso.</li>
              <li>Usa el resultado como base para calcular tu tarifa por hora.</li>
              <li>Revisa el dato cada trimestre según tu agenda real.</li>
            </ol>
            <p>
              Un error habitual es usar 160 horas mensuales como si fueran todas vendibles. En la
              práctica, muchos freelancers trabajan bastante, pero facturan muchas menos horas
              directas. Por eso la tarifa mínima sube cuando el cálculo se vuelve realista.
            </p>
          </div>

          <aside className="feature-card article-summary">
            <h2>Rangos orientativos</h2>
            <ul className="article-list">
              <li>70 a 90 horas: agenda con mucha venta, gestión o proyectos variables.</li>
              <li>90 a 110 horas: escenario razonable para servicios profesionales estables.</li>
              <li>110 a 130 horas: posible, pero exige procesos claros y poca dispersión.</li>
              <li>Más de 130 horas: revísalo con cuidado; puede esconder sobrecarga.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section alt">
        <div className="container text-block">
          <h2>Ejemplo rápido: por qué cambia tanto la tarifa</h2>
          <p>
            Imagina qué necesitas facturar 4.000 EUR al mes sin IVA para sostener tu actividad. Si
            divides esa cifra entre 160 horas, la referencia sale a 25 EUR/h. Pero si solo puedes
            facturar 90 horas reales, la referencia sube a 44,44 EUR/h.
          </p>
          <p>
            La diferencia no es un capricho: es el tiempo no vendible apareciendo por fin en el
            cálculo. Si no lo incluyes, lo pagas tú con agenda, margen o cansancio.
          </p>
          <div className="feature-grid" aria-label="Comparativa de horas facturables">
            <article className="feature-card">
              <h3>160 horas</h3>
              <p>Referencia baja, pero poco realista para muchas actividades freelance.</p>
            </article>

            <article className="feature-card">
              <h3>110 horas</h3>
              <p>Mejor si tienes procesos, clientes estables y poca carga comercial.</p>
            </article>

            <article className="feature-card">
              <h3>90 horas</h3>
              <p>Más prudente si haces venta, propuestas, gestión y varios proyectos a la vez.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>Cómo usar este dato en la calculadora</h2>
          <p>
            En la calculadora, el campo de horas facturables es uno de los más importantes. Si lo
            ajustas bien, la tarifa por hora resultante será mucho más útil para presupuestos,
            jornadas, bolsas de horas o proyectos cerrados.
          </p>
          <p>
            Si después quieres convertir esa referencia a un formato distinto, puedes revisar la{' '}
            <Link href="/tarifa-freelance-por-hora">guía de tarifa freelance por hora</Link> o la{' '}
            <Link href="/tarifa-diaria-freelance">guía de tarifa diaria freelance</Link>.
          </p>
          <div className="guide-cta">
            <Link href="/#calculadora" className="primary-button">
              Calcular con mis horas reales
            </Link>
            <Link href="/tabla-cuanto-facturar-autonomo" className="primary-button">
              Ver tabla de objetivos
            </Link>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <LeadMagnetForm
            source="horas-facturables-freelance"
            title="Llévate el kit para revisar tu tarifa con horas reales"
            description="Recibe una guía rápida para revisar mínimos, margen, horas facturables y señales de que una tarifa se queda corta antes de enviar una propuesta."
            buttonLabel="Quiero revisar mi tarifa"
          />
        </div>
      </section>

      <section className="section" id="faq-horas-facturables">
        <div className="container text-block">
          <span className="eyebrow">Preguntas frecuentes</span>
          <h2>Dudas habituales sobre horas facturables freelance</h2>
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

      <Footer />
    </main>
  );
}
