import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { getSiteUrl, siteConfig } from '@/lib/site';

const route = '/tarifa-freelance-por-hora';
const title = 'Tarifa freelance por hora: cómo calcularla bien';
const description =
  'Guía práctica para calcular tu tarifa freelance por hora en España sin quedarte corto. Entiende horas facturables, gastos, cuota, IRPF, IVA y cómo usar tu referencia mensual para presupuestar mejor.';

const pageFaqItems = [
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
    'como calcular tarifa por hora freelance',
    'cuanto cobrar por hora freelance',
    'precio por hora autonomo',
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
    dateModified: '2026-04-22',
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
              Una tarifa por hora útil no sale de coger un número al azar ni de copiar lo que cobra
              otra persona. Tiene que salir de tu realidad: cuánto necesitas facturar al mes, cuántas
              horas puedes vender de verdad y cuánto se te va en gastos, cuota, IRPF e IVA.
            </p>
            <div className="hero-badges" aria-label="Qué cubre esta guía">
              <span className="hero-badge">Horas facturables</span>
              <span className="hero-badge">Precio por proyecto</span>
              <span className="hero-badge">Margen real</span>
            </div>
            <div className="guide-cta">
              <Link href="/#calculadora" className="primary-button">
                Calcular mi tarifa
              </Link>
            </div>
          </div>

          <aside className="feature-card article-summary">
            <h2>Qué vas a sacar de esta guía</h2>
            <ul className="article-list">
              <li>Cómo pasar de una referencia mensual a una tarifa por hora defendible.</li>
              <li>Qué errores suelen hundir la rentabilidad aunque el precio parezca bueno.</li>
              <li>Cómo usar la tarifa por hora incluso si presupuestas por proyecto.</li>
              <li>Qué mirar antes de aceptar una propuesta aparentemente atractiva.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>Tu tarifa por hora no depende solo de las horas</h2>
          <p>
            El error más común es pensar que una tarifa por hora se calcula dividiendo lo que quieres
            ganar entre el número de horas que trabajas. En realidad deberías dividir entre tus horas
            facturables y, antes de hacerlo, haber sumado todos los costes que tu actividad necesita
            cubrir.
          </p>
          <p>
            Eso incluye gastos, cuota de autónomos, una reserva razonable de IRPF y el hecho de que no
            todas tus horas se cobran. Hay tiempo comercial, administrativo y de coordinación que
            también existe, aunque el cliente no lo vea en la factura.
          </p>
          <div className="disclaimer-box">
            <strong>Idea clave:</strong> una tarifa aparentemente correcta puede ser mala si parte de
            demasiadas horas vendibles o si ignora impuestos y costes fijos.
          </div>
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
              asumir una agenda imposible de sostener.
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
