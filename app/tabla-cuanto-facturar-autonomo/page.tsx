import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LeadMagnetForm from '@/components/LeadMagnetForm';
import { getSiteUrl, siteConfig } from '@/lib/site';

const route = '/tabla-cuanto-facturar-autonomo';
const title = 'Tabla orientativa para saber cuanto facturar como autonomo';
const description =
  'Tabla practica para comparar objetivos netos de 1500, 2000, 2500 y 3000 euros y entender como convertirlos en facturacion mensual, tarifa por hora y precios defendibles.';

const netGoals = [
  {
    amount: '1500 euros netos',
    href: '/cuanto-facturar-autonomo-1500-euros',
    summary: 'Primer objetivo para validar suelo minimo, gastos, cuota y horas facturables.',
  },
  {
    amount: '2000 euros netos',
    href: '/cuanto-facturar-autonomo-2000-euros',
    summary: 'Referencia habitual para revisar si una tarifa freelance empieza a sostenerse.',
  },
  {
    amount: '2500 euros netos',
    href: '/cuanto-facturar-autonomo-2500-euros',
    summary: 'Meta intermedia para comprobar margen, tipo de cliente y proyectos actuales.',
  },
  {
    amount: '3000 euros netos',
    href: '/cuanto-facturar-autonomo-3000-euros',
    summary: 'Objetivo alto para revisar posicionamiento, tickets y capacidad real de facturacion.',
  },
] as const;

const pageFaqItems = [
  {
    question: 'Existe una tabla exacta de cuanto facturar como autonomo?',
    answer:
      'No hay una tabla universal, porque cada caso cambia por gastos, cuota, IRPF, IVA y horas facturables. Una tabla orientativa sirve para ordenar objetivos y despues simular tu situacion concreta.',
  },
  {
    question: 'Por que el neto objetivo no coincide con la facturacion?',
    answer:
      'Porque antes de llegar al neto hay que cubrir gastos, cuota de autonomos, reserva fiscal y separar el IVA cuando aplique. La facturacion es la entrada; el neto es lo que conservas despues.',
  },
  {
    question: 'Como uso esta tabla si cobro por proyecto?',
    answer:
      'Usala como referencia mensual. Primero calcula cuanto necesitas facturar al mes y despues lleva esa cifra a tus presupuestos cerrados, tarifas por hora o cuotas recurrentes.',
  },
] as const;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: route,
  },
  keywords: [
    'tabla cuanto facturar autonomo',
    'cuanto facturar autonomo tabla',
    'cuanto facturar para ganar neto',
    'facturacion autonomo objetivo neto',
    'tabla tarifa autonomo freelance',
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

export default function TablaCuantoFacturarAutonomoPage() {
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
    datePublished: '2026-04-26',
    dateModified: '2026-04-26',
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
        id="tabla-cuanto-facturar-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script
        id="tabla-cuanto-facturar-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="tabla-cuanto-facturar-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Header />

      <section className="hero">
        <div className="container article-layout">
          <div className="text-block">
            <span className="eyebrow">Tabla orientativa</span>
            <h1>Tabla para saber cuanto facturar como autonomo segun tu objetivo neto</h1>
            <p className="lead">
              No existe una cifra universal para todos los autonomos, pero si puedes ordenar tus
              objetivos netos y convertirlos en una referencia mas clara de facturacion mensual,
              tarifa por hora y precios minimos defendibles.
            </p>
            <div className="hero-badges" aria-label="Objetivos cubiertos">
              <span className="hero-badge">1500 netos</span>
              <span className="hero-badge">2000 netos</span>
              <span className="hero-badge">2500 y 3000 netos</span>
            </div>
            <div className="guide-cta">
              <Link href="/#calculadora" className="primary-button">
                Usar calculadora
              </Link>
              <Link href="/tarifa-freelance-por-hora" className="primary-button">
                Ver tarifa por hora
              </Link>
            </div>
          </div>

          <aside className="feature-card article-summary">
            <h2>Como usar esta tabla</h2>
            <ul className="article-list">
              <li>Elige primero el neto que quieres conservar cada mes.</li>
              <li>Revisa la guia especifica de ese objetivo.</li>
              <li>Simula tu caso con gastos, cuota, IRPF, IVA y horas reales.</li>
              <li>Usa el resultado como suelo para tarifas y presupuestos.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>Tabla de objetivos netos para autonomos y freelancers</h2>
          <p>
            La comparativa no intenta darte una cifra magica. Su objetivo es ayudarte a elegir el
            punto de partida correcto antes de calcular. Facturar para conservar 1500 euros netos no
            exige la misma estructura que sostener 3000 euros netos de forma estable.
          </p>
          <div className="feature-grid" aria-label="Objetivos netos recomendados">
            {netGoals.map((goal) => (
              <article className="feature-card" key={goal.amount}>
                <h3>{goal.amount}</h3>
                <p>{goal.summary}</p>
                <div className="guide-cta">
                  <Link href={goal.href} className="primary-button">
                    Ver guia
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container article-layout">
          <div className="text-block">
            <h2>Que variables cambian la facturacion necesaria</h2>
            <ol className="article-list article-list-ordered">
              <li>El neto mensual que quieres conservar.</li>
              <li>Los gastos deducibles y herramientas que necesitas para trabajar.</li>
              <li>La cuota de autonomos aplicable a tu situacion.</li>
              <li>La reserva de IRPF que deberias separar antes de gastar.</li>
              <li>Si repercutes IVA y debes tratarlo como dinero ajeno.</li>
              <li>Las horas facturables reales que puedes vender sin quemarte.</li>
            </ol>
          </div>

          <aside className="feature-card article-summary">
            <h2>Senal de alerta</h2>
            <p>
              Si tu tarifa solo funciona cuando facturas casi todas tus horas disponibles, tienes
              poco margen para ventas, administracion, descansos, formacion o imprevistos.
            </p>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>Como pasar de la tabla a una tarifa o presupuesto</h2>
          <p>
            Primero usa la tabla para elegir objetivo neto. Despues calcula tu facturacion mensual
            necesaria y dividela entre horas facturables reales. Esa tarifa interna te ayuda a
            decidir si un proyecto, una mensualidad o un servicio cerrado te deja margen.
          </p>
          <p>
            Si trabajas por proyecto, no necesitas ensenar la tabla al cliente. Puedes usarla por
            dentro para validar que el precio cerrado encaja con tu negocio y despues presentar una
            propuesta clara con alcance, entregables, revisiones y precio final.
          </p>
          <div className="disclaimer-box">
            <strong>Regla practica:</strong> la tabla te orienta, pero la calculadora debe cerrar el
            numero con tus propios gastos, cuota, impuestos y horas facturables.
          </div>
          <div className="guide-cta">
            <Link href="/#calculadora" className="primary-button">
              Calcular mi caso
            </Link>
            <a
              href="https://www.cuantopresupuestar.es?utm_source=cuantofacturar&utm_medium=article-link&utm_campaign=tabla_objetivos_netos"
              className="primary-button"
            >
              Pasarlo a presupuesto
            </a>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <LeadMagnetForm
            source="tabla-cuanto-facturar-autonomo"
            title="Llevate el kit para revisar tu tarifa con mas criterio"
            description="Te enviamos una guia rapida para revisar neto objetivo, horas facturables, margen, impuestos e IVA antes de aceptar un precio."
            buttonLabel="Quiero revisar mi tarifa"
          />
        </div>
      </section>

      <section className="section" id="faq-tabla-cuanto-facturar">
        <div className="container text-block">
          <span className="eyebrow">Preguntas frecuentes</span>
          <h2>Dudas habituales sobre tablas de facturacion para autonomos</h2>
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
