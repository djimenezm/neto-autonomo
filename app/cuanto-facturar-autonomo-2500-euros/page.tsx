import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LeadMagnetForm from '@/components/LeadMagnetForm';
import { getSiteUrl, siteConfig } from '@/lib/site';

const route = '/cuanto-facturar-autonomo-2500-euros';
const title = 'Cuánto facturar como autónomo para ganar 2500 euros netos';
const description =
  'Guía práctica para estimar cuánto facturar como autónomo o freelance en España si quieres ganar 2500 euros netos al mes teniendo en cuenta cuota, IRPF, IVA, gastos y horas facturables.';

const pageFaqItems = [
  {
    question: '¿Cuánto hay que facturar para ganar 2500 euros netos?',
    answer:
      'Depende de tus gastos, cuota de autónomos, IRPF, IVA y horas facturables. Para conservar 2500 euros netos normalmente necesitas facturar más, porque una parte del ingreso cubre costes, cotización e impuestos.',
  },
  {
    question: '¿2500 euros netos son lo mismo que 2500 euros facturados?',
    answer:
      'No. La facturación es lo que emites antes de restar gastos, cuota y reserva fiscal. El neto es lo que realmente conservas después de hacer esos ajustes.',
  },
  {
    question: '¿Cómo convierto 2500 euros netos en tarifa por hora?',
    answer:
      'Primero calcula la facturación mensual necesaria sin contar el IVA como ingreso real. Después divide esa cifra entre tus horas facturables reales, no entre todas las horas que trabajas.',
  },
] as const;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: route,
  },
  keywords: [
    'cuánto facturar autónomo para ganar 2500 euros',
    'cuánto facturar 2500 euros netos',
    'ganar 2500 euros autónomo',
    'cuánto cobrar freelance 2500 netos',
    'facturación autónomo 2500 euros netos',
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

export default function CuantoFacturarAutonomo2500EurosPage() {
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
        id="cuanto-facturar-2500-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script
        id="cuanto-facturar-2500-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="cuanto-facturar-2500-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Header />

      <section className="hero">
        <div className="container article-layout">
          <div className="text-block">
            <span className="eyebrow">Guía práctica</span>
            <h1>Cuánto facturar como autónomo para ganar 2500 euros netos</h1>
            <p className="lead">
              Si quieres conservar 2500 euros netos al mes, necesitas mirar más allá de la cifra
              que emites en factura. Antes de llegar al neto hay que cubrir gastos, cuota, reserva
              de IRPF, tiempo no facturable y separar el IVA cuando corresponda.
            </p>
            <div className="hero-badges" aria-label="Qué cubre esta guía">
              <span className="hero-badge">2500 euros netos</span>
              <span className="hero-badge">Cuota e IRPF</span>
              <span className="hero-badge">Tarifa por hora</span>
            </div>
            <div className="guide-cta">
              <Link href="/#calculadora" className="primary-button">
                Ir a la calculadora
              </Link>
              <Link href="/cuanto-facturar-autonomo-3000-euros" className="primary-button">
                Ver objetivo de 3000 euros
              </Link>
            </div>
          </div>

          <aside className="feature-card article-summary">
            <h2>Qué vas a aterrizar aquí</h2>
            <ul className="article-list">
              <li>Por qué 2500 euros netos no equivalen a facturar 2500 euros.</li>
              <li>Qué variables cambian la cifra mensual qué necesitas emitir.</li>
              <li>Cómo convertir el objetivo en tarifa por hora o presupuesto.</li>
              <li>Que revisar si tu precio actual no sostiene ese neto.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>El neto deseado es el final de la cuenta</h2>
          <p>
            Cuando piensas en 2500 euros netos, estás pensando en el dinero que quieres conservar
            después de cubrir costes y obligaciones. Si partes de 2500 euros facturados, la tarifa
            resultante suele quedarse corta porque todavía falta descontar varias capas.
          </p>
          <p>
            La forma más clara es trabajar hacia atrás: defines el neto, añades gastos y cuota,
            reservas IRPF, separas IVA si aplica y después conviertes la facturación necesaria en
            horas facturables o presupuestos concretos.
          </p>
          <div className="disclaimer-box">
            <strong>Idea clave:</strong> 2500 euros netos pueden ser una meta muy útil, pero solo
            si los conviertes en una facturación mensual sostenible y en una tarifa defendible.
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container feature-grid" aria-label="Factores que cambian la cifra">
          <article className="feature-card">
            <h2>1. Gastos y cuota</h2>
            <p>
              Software, gestor, herramientas, seguros, colaboraciones y cuota de autónomos reducen
              el margen disponible antes de llegar al neto que quieres conservar.
            </p>
          </article>

          <article className="feature-card">
            <h2>2. Reserva fiscal</h2>
            <p>
              Si no separas una parte para IRPF y confundes el IVA con ingreso real, puedes creer
              que estás llegando al objetivo cuando solo estás aplazando el ajuste.
            </p>
          </article>

          <article className="feature-card">
            <h2>3. Horas vendibles</h2>
            <p>
              La tarifa por hora cambia mucho si facturas 60, 90 o 120 horas al mes. Por eso debes
              dividir entre horas facturables reales, no entre todo tu tiempo de trabajo.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container article-layout">
          <div className="text-block">
            <h2>Cómo bajar 2500 euros netos a una cifra facturable</h2>
            <ol className="article-list article-list-ordered">
              <li>Define 2500 euros como neto mensual que quieres conservar.</li>
              <li>Suma los gastos fijos y variables de tu actividad.</li>
              <li>Incluye una cuota de autónomos realista para tu situación.</li>
              <li>Reserva IRPF antes de contar ese dinero como disponible.</li>
              <li>Separa el IVA si tu actividad lo repercute.</li>
              <li>Divide la facturación objetivo entre horas facturables reales.</li>
              <li>Comprueba si tus tarifas y presupuestos actuales sostienen esa referencia.</li>
            </ol>
            <p>
              Si el resultado te parece más alto de lo esperado, no significa que la cuenta este
              mal. Puede ser una señal de qué necesitas revisar precio, alcance, horas no
              facturables o tipo de cliente.
            </p>
          </div>

          <aside className="feature-card article-summary">
            <h2>Señales de precio corto</h2>
            <ul className="article-list">
              <li>Facturas bastante, pero el neto disponible sigue bajo.</li>
              <li>El IRPF o el IVA te obligan a corregir después.</li>
              <li>Los proyectos cerrados consumen más horas de las previstas.</li>
              <li>No separas tiempo comercial, gestión y seguimiento.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section alt">
        <div className="container text-block">
          <h2>Usa este objetivo como filtro comercial</h2>
          <p>
            Un objetivo de 2500 euros netos sirve para evaluar si tus tarifas, mensualidades o
            proyectos cerrados tienen sentido. Si una propuesta no se acerca a esa referencia,
            quizás no falla tu ambición: puede fallar el precio, el alcance o el tipo de cliente.
          </p>
          <p>
            También puedes usarlo para comparar escenarios: más horas facturables, menos costes,
            proyectos de mayor ticket, servicios recurrentes o una mezcla más equilibrada entre
            clientes pequeños y clientes de mayor margen.
          </p>
          <div className="guide-cta">
            <Link href="/#calculadora" className="primary-button">
              Calcular mi escenario
            </Link>
            <Link href="/tarifa-freelance-por-hora" className="primary-button">
              Pasarlo a tarifa por hora
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <LeadMagnetForm
            source="guia-2500-euros"
            title="Revisa si tu tarifa sostiene 2500 euros netos"
            description="Llévate el kit para contrastar tu tarifa, tus horas facturables y tu margen antes de aceptar un proyecto o subir precios."
            buttonLabel="Quiero revisar mi tarifa"
          />
        </div>
      </section>

      <section className="section" id="faq-2500-euros">
        <div className="container text-block">
          <span className="eyebrow">Preguntas frecuentes</span>
          <h2>Dudas habituales sobre ganar 2500 euros netos como autónomo</h2>
          {pageFaqItems.map((item) => (
            <article className="disclaimer-box" key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section alt">
        <div className="container text-block">
          <span className="eyebrow">Siguiente lectura</span>
          <h2>Compara el objetivo con otras referencias cercanas</h2>
          <p>
            Si 2500 euros netos es tu referencia central, puede ayudarte comparar el salto desde
            2000 euros y hacia 3000 euros para entender cómo cambian tarifa, margen y presión sobre
            tus horas facturables.
          </p>
          <div className="guide-cta">
            <Link href="/cuanto-facturar-autonomo-2000-euros" className="primary-button">
              Ver objetivo de 2000 euros
            </Link>
            <Link href="/cuanto-facturar-autonomo-3000-euros" className="primary-button">
              Ver objetivo de 3000 euros
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
