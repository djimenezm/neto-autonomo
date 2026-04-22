import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { getSiteUrl, siteConfig } from '@/lib/site';

const route = '/cuota-autonomos-2026';
const title = 'Cuota de autónomos 2026: qué pagar y cómo calcularla';
const description =
  'Guía práctica sobre la cuota de autónomos de 2026 en España: tramos, tarifa reducida, cuota manual y cómo influye en cuánto tienes que facturar al mes.';

const pageFaqItems = [
  {
    question: '¿La cuota de autónomos de 2026 es fija para todo el mundo?',
    answer:
      'No. La cuota depende del tramo de rendimientos netos y de la base de cotización que te corresponda dentro del sistema vigente. Por eso una misma cuota fija no representa bien a todos los perfiles.',
  },
  {
    question: '¿Cuándo tiene sentido usar tarifa reducida?',
    answer:
      'Suele tener sentido en nuevas altas o en los supuestos en los que realmente te corresponda. Como referencia orientativa, puede cambiar bastante el cálculo mensual frente a una cuota estándar por tramo.',
  },
  {
    question: '¿Puedo usar una cuota manual en lugar de la estimada?',
    answer:
      'Sí. Si ya sabes qué cuota estás pagando o prefieres simular un escenario concreto, una cuota manual te permite ajustar mejor la referencia mensual y la tarifa por hora resultante.',
  },
] as const;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: route,
  },
  keywords: [
    'cuota autonomos 2026',
    'cuanto paga un autonomo en 2026',
    'tramos autonomos 2026',
    'tarifa reducida autonomos 2026',
    'cuota reta 2026',
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

export default function CuotaAutonomos2026Page() {
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
        id="cuota-autonomos-2026-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script
        id="cuota-autonomos-2026-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="cuota-autonomos-2026-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Header />

      <section className="hero">
        <div className="container article-layout">
          <div className="text-block">
            <span className="eyebrow">Guía práctica</span>
            <h1>Cuota de autónomos 2026: qué pagar y cómo afecta a lo que facturas</h1>
            <p className="lead">
              La cuota de autónomos no es un detalle menor dentro de tu cálculo mensual. Puede
              cambiar de forma visible cuánto necesitas facturar, el margen que te deja cada trabajo
              y la tarifa por hora que tiene sentido para ti.
            </p>
            <div className="hero-badges" aria-label="Qué cubre esta guía">
              <span className="hero-badge">Tramos 2026</span>
              <span className="hero-badge">Tarifa reducida</span>
              <span className="hero-badge">Cuota manual</span>
            </div>
            <div className="guide-cta">
              <Link href="/#calculadora" className="primary-button">
                Probar en la calculadora
              </Link>
            </div>
          </div>

          <aside className="feature-card article-summary">
            <h2>Qué vas a aclarar aquí</h2>
            <ul className="article-list">
              <li>Por qué la cuota de autónomos no se debería tratar como un número fijo universal.</li>
              <li>Cuándo conviene pensar en cuota por tramo, reducida o manual.</li>
              <li>Cómo cambia la cuota el cálculo de facturación mensual y tarifa por hora.</li>
              <li>Qué revisar antes de usar una simulación para presupuestar.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>La cuota de autónomos influye más de lo que parece</h2>
          <p>
            Cuando alguien calcula cuánto tiene que facturar, muchas veces mete una cuota estándar y
            sigue adelante. El problema es que eso simplifica demasiado una variable que puede mover
            tu resultado final de forma importante.
          </p>
          <p>
            Si tu cuota real es más alta de lo que estás usando en la simulación, tu facturación
            objetivo también sube. Y si estás en un escenario de tarifa reducida, tu referencia
            mensual puede cambiar bastante respecto a una cuota por tramo.
          </p>
          <div className="disclaimer-box">
            <strong>Idea clave:</strong> la cuota no es un detalle decorativo dentro del cálculo. Es
            una de las piezas que más condicionan cuánto tienes que facturar para llegar al neto que
            buscas.
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container feature-grid" aria-label="Formas de tratar la cuota en la simulación">
          <article className="feature-card">
            <h2>Cuota estimada por tramo</h2>
            <p>
              Es la opción más útil si quieres una referencia general alineada con tus rendimientos
              netos estimados. Te da una base razonable cuando todavía no sabes qué cuota real pagarás.
            </p>
          </article>

          <article className="feature-card">
            <h2>Tarifa reducida</h2>
            <p>
              Tiene sentido si estás en un supuesto de nueva alta o en un escenario compatible con la
              reducción. Puede cambiar bastante tu resultado mensual durante ese periodo.
            </p>
          </article>

          <article className="feature-card">
            <h2>Cuota manual</h2>
            <p>
              Es la opción más precisa cuando ya conoces tu cuota o quieres simular una situación
              concreta. Te evita presupuestar con una referencia genérica que no encaja contigo.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>Cómo influye la cuota en lo que tienes que facturar</h2>
          <ol className="article-list article-list-ordered">
            <li>Sube o baja la base de costes que tu facturación mensual debe cubrir.</li>
            <li>Afecta a la referencia por hora cuando divides esa facturación entre horas facturables.</li>
            <li>Puede hacer que una propuesta aparentemente rentable deje de serlo.</li>
            <li>En escenarios reducidos, puede darte más margen temporal, pero no siempre estructural.</li>
          </ol>
          <p>
            Por eso conviene probar varios escenarios. Uno con cuota estimada por tramo, otro con
            tarifa reducida si te aplica y, si ya la conoces, otro con cuota manual. Así ves enseguida
            cuánto cambia tu suelo económico.
          </p>
        </div>
      </section>

      <section className="section alt">
        <div className="container feature-grid" aria-label="Errores frecuentes con la cuota de autónomos">
          <article className="feature-card">
            <h2>Usar siempre la misma cuota para todo</h2>
            <p>
              Sirve como aproximación muy grosera, pero puede alejarte bastante de la realidad si tu
              perfil no encaja con esa cifra estándar.
            </p>
          </article>

          <article className="feature-card">
            <h2>Olvidar que la cuota cambia el precio mínimo</h2>
            <p>
              Si sube la cuota y no ajustas tu facturación o tu tarifa, el neto real que te queda se
              reduce aunque sigas trabajando igual.
            </p>
          </article>

          <article className="feature-card">
            <h2>Presupuestar sin comparar escenarios</h2>
            <p>
              Una sola simulación se queda corta. Comparar cuota auto, reducida y manual te ayuda a
              decidir con más criterio qué precio necesitas defender.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>Usa la calculadora para ver el impacto real</h2>
          <p>
            La calculadora ya te permite trabajar con cuota por tramo, tarifa reducida o cuota manual.
            Eso te ayuda a ver rápidamente cómo cambia tu facturación objetivo y tu tarifa por hora
            cuando modificas esa pieza del cálculo.
          </p>
          <div className="guide-cta">
            <Link href="/#calculadora" className="primary-button">
              Simular cuota y facturación
            </Link>
          </div>
        </div>
      </section>

      <section className="section alt" aria-labelledby="cuota-autonomos-faq-title">
        <div className="container text-block">
          <h2 id="cuota-autonomos-faq-title">Preguntas frecuentes sobre la cuota de autónomos 2026</h2>

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
          <span className="eyebrow">Lecturas relacionadas</span>
          <h2>Después de entender la cuota, toca conectarla con tu precio</h2>
          <p>
            La cuota tiene sentido solo cuando la llevas a tu realidad de facturación y a tu tarifa
            por hora. Por eso estas dos guías complementan bien esta página.
          </p>
          <div className="guide-cta">
            <Link href="/cuanto-facturar-autonomo" className="primary-button">
              Ver cuánto facturar
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
