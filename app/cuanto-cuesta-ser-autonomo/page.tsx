import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LeadMagnetForm from '@/components/LeadMagnetForm';
import { getSiteUrl, siteConfig } from '@/lib/site';

const route = '/cuanto-cuesta-ser-autonomo';
const title = 'Cuanto cuesta ser autonomo: costes que debes cubrir';
const description =
  'Guia practica para entender cuanto cuesta ser autonomo en Espana y convertir cuota, impuestos, gastos y horas en una facturacion minima orientativa.';

const calculatorHref =
  '/?targetNet=1500&monthlyExpenses=300&billableHours=80&irpfMode=progressive&autonomousCommunity=common&hasIVA=yes&selfEmployedFeeMode=auto#calculadora';

const pageFaqItems = [
  {
    question: 'Cuanto cuesta ser autonomo al mes?',
    answer:
      'No hay una cifra unica que valga para todos. El coste depende de cuota, gastos, impuestos, herramientas, gestoria, seguros y de si estas empezando o ya tienes una actividad estable.',
  },
  {
    question: 'La cuota de autonomos es el unico coste importante?',
    answer:
      'No. La cuota pesa mucho, pero no deberia mirarse sola. Tambien hay que contar gastos de actividad, impuestos, horas no facturables y margen para imprevistos.',
  },
  {
    question: 'Como paso de costes a cuanto facturar?',
    answer:
      'Primero separa lo que quieres conservar como neto, lo que cuesta mantener la actividad y las horas que realmente puedes facturar. Despues calcula que facturacion mensual cubre todo eso.',
  },
] as const;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: route,
  },
  keywords: [
    'cuanto cuesta ser autonomo',
    'coste autonomo españa',
    'cuanto paga un autonomo al mes',
    'calculadora autonomo españa',
    'cuanto facturar para cubrir gastos autonomo',
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

export default function CuantoCuestaSerAutonomoPage() {
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
    datePublished: '2026-07-01',
    dateModified: '2026-07-01',
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
        id="cuanto-cuesta-ser-autonomo-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script
        id="cuanto-cuesta-ser-autonomo-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="cuanto-cuesta-ser-autonomo-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Header />

      <section className="hero">
        <div className="container article-layout">
          <div className="text-block">
            <span className="eyebrow">Guia practica</span>
            <h1>Cuanto cuesta ser autonomo y cuanto necesitas facturar para cubrirlo</h1>
            <p className="lead">
              El coste de ser autonomo no es solo la cuota. Tambien cuentan impuestos, gastos,
              herramientas, gestoria, horas no facturables y margen. La pregunta util no es solo
              cuanto pagas, sino cuanto debes facturar para que todo eso no se coma tu neto.
            </p>
            <div className="hero-badges" aria-label="Que cubre esta guia">
              <span className="hero-badge">Cuota y gastos</span>
              <span className="hero-badge">Impuestos aparte</span>
              <span className="hero-badge">Facturacion minima</span>
            </div>
            <div className="guide-cta">
              <Link href={calculatorHref} className="primary-button">
                Calcular mi facturacion minima
              </Link>
              <a href="#costes-kit" className="link-button">
                Recibir checklist
              </a>
            </div>
          </div>

          <aside className="feature-card article-summary">
            <h2>Que vas a aclarar</h2>
            <ul className="article-list">
              <li>Que costes deberias mirar antes de poner precio a tu trabajo.</li>
              <li>Por que una cuota mensual no explica todo tu coste real.</li>
              <li>Como pasar de coste mensual a facturacion minima.</li>
              <li>Que revisar antes de aceptar un precio demasiado ajustado.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>El coste real no cabe en una sola cifra</h2>
          <p>
            Cuando buscas cuanto cuesta ser autonomo, lo normal es pensar primero en la cuota. Es
            importante, pero se queda corta si quieres tomar decisiones de precio. Una actividad
            tambien tiene gastos, impuestos, tiempo de gestion, herramientas y periodos en los que no
            todo el trabajo se puede facturar.
          </p>
          <p>
            Por eso conviene usar esa busqueda como punto de partida, no como final. Si solo sabes lo
            que pagas, aun falta la parte clave: cuanto necesitas ingresar para cubrirlo sin tocar el
            neto que quieres conservar.
          </p>
          <div className="disclaimer-box">
            <strong>Idea clave:</strong> el coste mensual te dice lo que sale de la caja. La
            facturacion minima te dice lo que debe entrar para que la actividad tenga sentido.
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container feature-grid" aria-label="Costes habituales de un autonomo">
          <article className="feature-card">
            <h2>Cuota y cotizacion</h2>
            <p>
              Es el coste mas visible, pero puede variar por tramo, situacion y periodo. No conviene
              convertirla en la unica referencia de precio.
            </p>
          </article>

          <article className="feature-card">
            <h2>Impuestos y reservas</h2>
            <p>
              IRPF e IVA no deberian mezclarse con dinero disponible. Si no los separas, tu margen
              parece mejor de lo que realmente es.
            </p>
          </article>

          <article className="feature-card">
            <h2>Gastos de actividad</h2>
            <p>
              Herramientas, software, gestoria, telefono, formacion, seguros o desplazamientos pueden
              parecer pequenos por separado y pesar mucho juntos.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>Como convertir costes en facturacion minima</h2>
          <ol className="article-list article-list-ordered">
            <li>Define el neto mensual que quieres conservar.</li>
            <li>Suma gastos fijos y variables de la actividad.</li>
            <li>Incluye una cuota realista o una cuota manual si ya sabes la que pagas.</li>
            <li>Reserva IRPF y separa el IVA cuando aplique.</li>
            <li>Divide la facturacion necesaria entre horas facturables reales, no horas totales.</li>
          </ol>
          <p>
            La cifra final no es una verdad fiscal absoluta. Es una referencia para no presupuestar a
            ciegas y detectar si una propuesta te deja margen o solo te mantiene ocupado.
          </p>
          <div className="guide-cta">
            <Link href={calculatorHref} className="primary-button">
              Probar con mis numeros
            </Link>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container feature-grid" aria-label="Senales de una tarifa demasiado baja">
          <article className="feature-card">
            <h2>Solo sale si todo va perfecto</h2>
            <p>
              Si cualquier cambio, reunion extra o retraso elimina el margen, el precio esta
              demasiado justo.
            </p>
          </article>

          <article className="feature-card">
            <h2>No cuenta horas no facturables</h2>
            <p>
              Ventas, gestion, soporte, revision y administracion tambien consumen tiempo aunque no
              aparezcan como linea en la factura.
            </p>
          </article>

          <article className="feature-card">
            <h2>Confunde ingreso con caja libre</h2>
            <p>
              Facturar mas no siempre significa ganar mas. Primero hay que separar impuestos, gastos
              y reservas.
            </p>
          </article>
        </div>
      </section>

      <section className="section" id="costes-kit">
        <div className="container">
          <LeadMagnetForm
            source="cuanto-cuesta-ser-autonomo"
            title="Recibe una checklist para revisar costes y tarifa"
            description="Te enviamos el kit gratuito para revisar si tus costes, cuota, horas e impuestos estan bien reflejados antes de aceptar una tarifa o enviar un presupuesto."
            buttonLabel="Quiero revisar mis costes"
          />
        </div>
      </section>

      <section className="section alt" aria-labelledby="cuanto-cuesta-faq-title">
        <div className="container text-block">
          <h2 id="cuanto-cuesta-faq-title">Preguntas frecuentes</h2>

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
          <span className="eyebrow">Siguiente paso</span>
          <h2>Ahora lleva el coste a precio</h2>
          <p>
            Si ya tienes una idea de tus costes, usa la calculadora para convertirlos en una
            facturacion mensual y una tarifa por hora orientativa. Si despues quieres profundizar,
            revisa tambien la cuota de autonomos y la guia de tarifa freelance por hora.
          </p>
          <div className="guide-cta">
            <Link href={calculatorHref} className="primary-button">
              Calcular cuanto facturar
            </Link>
            <Link href="/cuota-autonomos-2026" className="primary-button">
              Leer cuota 2026
            </Link>
            <Link href="/tarifa-freelance-por-hora" className="primary-button">
              Ver tarifa por hora
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
