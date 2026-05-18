import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { getSiteUrl, siteConfig } from '@/lib/site';

const route = '/kit-tarifa-autonomo';
const title = 'Kit de tarifa para autónomos';
const description =
  'Recurso práctico con checklist, estructura de números y guía rápida para revisar una tarifa de autónomo antes de enviar un presupuesto o subir precios.';

const faqItems = [
  {
    question: 'Qué incluye este kit de tarifa para autónomos?',
    answer:
      'Incluye una estructura base para revisar tus números, una checklist de mínimos antes de fijar tarifa y una guía corta para defender mejor el precio ante un cliente.',
  },
  {
    question: 'Este kit sustituye la calculadora?',
    answer:
      'No. La calculadora te da una referencia numérica. El kit te ayuda a revisar si esa referencia está bien aterrizada antes de convertirla en tarifa, presupuesto o cuota mensual.',
  },
  {
    question: 'Puedo adaptarlo a mi actividad?',
    answer:
      'Sí. Está pensado como una estructura editable para que la adaptes a tus gastos, horas, margen, tipo de cliente y forma de trabajar.',
  },
] as const;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: route,
  },
  keywords: [
    'kit tarifa autonomo',
    'checklist tarifa freelance',
    'plantilla tarifa autonomo',
    'como revisar tarifa autonomo',
    'recurso para calcular tarifa freelance',
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

export default function KitTarifaAutonomoPage() {
  const siteUrl = getSiteUrl();
  const pageUrl = new URL(route, siteUrl).toString();
  const downloadUrl = new URL('/recursos/kit-tarifa-autonomo.txt', siteUrl).toString();

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
        id="kit-tarifa-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script
        id="kit-tarifa-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="kit-tarifa-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Header />

      <section className="hero">
        <div className="container article-layout">
          <div className="text-block">
            <span className="eyebrow">Recurso gratuito</span>
            <h1>Kit de tarifa para autónomos</h1>
            <p className="lead">
              Un recurso corto para convertir el resultado de la calculadora en una tarifa más
              defendible. Te ayuda a revisar números, mínimos, margen y señales de que quizá estás
              cobrando por debajo de lo que necesitas.
            </p>
            <div className="hero-badges" aria-label="Qué incluye el kit">
              <span className="hero-badge">Checklist de mínimos</span>
              <span className="hero-badge">Estructura de tarifa</span>
              <span className="hero-badge">Revisión antes de enviar</span>
            </div>
            <div className="guide-cta">
              <a href={downloadUrl} className="primary-button" download>
                Descargar versión en texto
              </a>
              <Link href="/#calculadora" className="primary-button">
                Ir a la calculadora
              </Link>
            </div>
          </div>

          <aside className="feature-card article-summary">
            <h2>Qué te llevas</h2>
            <ul className="article-list">
              <li>Una estructura rápida para revisar tu tarifa mensual y por hora.</li>
              <li>Una checklist para detectar si tu precio está demasiado ajustado.</li>
              <li>Un guion para defender mejor la cifra ante un cliente.</li>
              <li>Una mini revisión para convertir la cifra en presupuesto, cuota o factura.</li>
              <li>Una versión descargable para adaptarla a tu actividad.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>1. Estructura rápida para revisar tu tarifa</h2>
          <ol className="article-list article-list-ordered">
            <li>Neto mensual que quieres conservar.</li>
            <li>Gastos fijos y variables de tu actividad.</li>
            <li>Cuota de autónomos o cotización estimada.</li>
            <li>Reserva de IRPF antes de tocar ese dinero.</li>
            <li>Horas facturables reales, no todas tus horas de trabajo.</li>
            <li>Margen mínimo que quieres proteger.</li>
            <li>IVA separado de tu ingreso real cuando aplique.</li>
          </ol>
        </div>
      </section>

      <section className="section alt">
        <div className="container text-block">
          <h2>2. Señales de que tu tarifa está demasiado ajustada</h2>
          <p>
            Antes de enviar un precio, revisa si se cumple alguna de estas señales. No significan
            que el proyecto sea malo, pero sí que conviene ajustar alcance, plazos o condiciones.
          </p>
          <ol className="article-list article-list-ordered">
            <li>Solo sale rentable si todo va perfecto y sin cambios.</li>
            <li>Necesitas facturar casi todas tus horas disponibles para llegar al neto objetivo.</li>
            <li>No queda margen para reuniones, administración, soporte o imprevistos.</li>
            <li>El IVA o el IRPF se confunden con dinero disponible.</li>
            <li>Te cuesta explicar la cifra sin justificarte demasiado.</li>
            <li>El cliente no tiene claro qué entra, qué no entra y dónde acaba el trabajo.</li>
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>3. Checklist antes de aceptar una tarifa</h2>
          <ol className="article-list article-list-ordered">
            <li>La tarifa cubre gastos, cuota e impuestos antes de hablar de beneficio.</li>
            <li>No depende de facturar todas tus horas disponibles.</li>
            <li>El precio deja margen si el proyecto se alarga un poco.</li>
            <li>El IVA aparece separado y no se confunde con ingreso disponible.</li>
            <li>La cifra se puede explicar con calma y sin pedir disculpas.</li>
            <li>El cliente entiende qué entra, qué no entra y qué se cobraría aparte.</li>
          </ol>
        </div>
      </section>

      <section className="section alt">
        <div className="container text-block">
          <h2>4. Guion corto para defender la cifra</h2>
          <p>
            Cuando presentes una tarifa, intenta unir precio y alcance. No digas solo una cifra:
            explica qué problema resuelves, qué entregas, qué límites tiene el trabajo y qué
            siguiente paso necesita el cliente para avanzar.
          </p>
          <div className="disclaimer-box">
            <strong>Recuerda:</strong> una tarifa sana no es solo una cifra alta. Es una cifra que
            cubre tu realidad, deja margen y puede sostenerse sin depender de trabajar más horas de
            las razonables.
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>5. Convierte la tarifa en una decisión concreta</h2>
          <p>
            Una vez revisada la cifra, decide qué formato necesita: tarifa por hora, precio cerrado,
            cuota mensual o presupuesto por fases. Si todavía no puedes explicarlo en una frase,
            normalmente falta concretar alcance.
          </p>
          <ol className="article-list article-list-ordered">
            <li>Si el trabajo es recurrente, piensa en cuota mensual con límites claros.</li>
            <li>Si el trabajo tiene inicio y fin, bájalo a presupuesto cerrado con fases.</li>
            <li>Si el alcance es incierto, usa bolsa de horas o primera fase de diagnóstico.</li>
            <li>Si ya vas a facturarlo, prepara también cobros, gastos e impuestos.</li>
          </ol>
          <div className="guide-cta">
            <Link href="/mejores-programas-facturacion-autonomos" className="primary-button">
              Ver programas de facturación
            </Link>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container feature-grid" aria-label="Recursos relacionados">
          <article className="feature-card">
            <h2>Calculadora principal</h2>
            <p>
              Si aún no tienes clara la cifra base, vuelve a la calculadora antes de ajustar nada.
            </p>
          </article>

          <article className="feature-card">
            <h2>Tarifa por hora</h2>
            <p>
              Si necesitas bajar tu referencia mensual a horas, revisa la guía de{' '}
              <Link href="/tarifa-freelance-por-hora">tarifa freelance por hora</Link>.
            </p>
          </article>

          <article className="feature-card">
            <h2>Objetivo de 2.000 euros</h2>
            <p>
              Si quieres partir de un objetivo concreto, revisa cuánto facturar para ganar{' '}
              <Link href="/cuanto-facturar-autonomo-2000-euros">2.000 euros netos</Link>.
            </p>
          </article>
        </div>
      </section>

      <section className="section" aria-labelledby="kit-tarifa-faq-title">
        <div className="container text-block">
          <h2 id="kit-tarifa-faq-title">Preguntas frecuentes sobre el kit</h2>

          <div className="faq-list">
            {faqItems.map((item) => (
              <article className="faq-item" key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container text-block">
          <span className="eyebrow">Siguiente paso</span>
          <h2>Descarga el kit o vuelve a calcular tu referencia</h2>
          <p>
            Si ya tienes una tarifa en mente, descarga la versión en texto y úsala como revisión
            rápida. Si todavía no tienes una cifra base, vuelve primero a la calculadora.
          </p>
          <div className="guide-cta">
            <a href={downloadUrl} className="primary-button" download>
              Descargar el kit
            </a>
            <Link href="/#calculadora" className="primary-button">
              Probar la calculadora
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
