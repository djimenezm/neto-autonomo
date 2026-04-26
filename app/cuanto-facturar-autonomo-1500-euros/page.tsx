import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LeadMagnetForm from '@/components/LeadMagnetForm';
import { getSiteUrl, siteConfig } from '@/lib/site';

const route = '/cuanto-facturar-autonomo-1500-euros';
const title = 'Cuánto facturar como autónomo para ganar 1500 euros netos';
const description =
  'Guía práctica para estimar cuánto facturar como autónomo o freelance en España si quieres llegar a 1500 euros netos al mes teniendo en cuenta cuota, IRPF, IVA, gastos y horas facturables.';

const pageFaqItems = [
  {
    question: '¿Cuánto hay que facturar para ganar 1500 euros netos?',
    answer:
      'Depende de tus gastos, cuota de autónomos, reserva de IRPF, IVA y horas facturables. Para conservar 1500 euros netos normalmente tendrás que facturar más que esa cifra, porque antes debes cubrir costes e impuestos.',
  },
  {
    question: '¿1500 euros netos equivalen a 1500 euros facturados?',
    answer:
      'No. Lo facturado es el ingreso bruto de la actividad, mientras que el neto es lo que conservas después de gastos, cuota e impuestos. Por eso conviene calcularlo hacia atrás.',
  },
  {
    question: '¿Tiene sentido fijar 1500 euros netos como primer objetivo?',
    answer:
      'Puede tener sentido si estás empezando, validando una actividad o reduciendo riesgo, pero conviene convertirlo en facturación mensual y tarifa por hora para no trabajar por debajo de tu suelo.',
  },
] as const;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: route,
  },
  keywords: [
    'cuanto facturar autonomo para ganar 1500 euros',
    'cuanto facturar 1500 euros netos',
    'ganar 1500 euros autonomo',
    'cuanto cobrar freelance 1500 netos',
    'facturacion autonomo 1500 euros netos',
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

export default function CuantoFacturarAutonomo1500EurosPage() {
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
        id="cuanto-facturar-1500-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script
        id="cuanto-facturar-1500-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="cuanto-facturar-1500-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Header />

      <section className="hero">
        <div className="container article-layout">
          <div className="text-block">
            <span className="eyebrow">Guía práctica</span>
            <h1>Cuánto facturar como autónomo para ganar 1500 euros netos</h1>
            <p className="lead">
              Si quieres quedarte con 1500 euros netos al mes, no basta con emitir facturas por
              1500 euros. Antes tienes que cubrir cuota, gastos, reserva de IRPF y separar el IVA
              cuando corresponda.
            </p>
            <div className="hero-badges" aria-label="Qué cubre esta guía">
              <span className="hero-badge">1500 euros netos</span>
              <span className="hero-badge">Cuota e IRPF</span>
              <span className="hero-badge">Primer objetivo</span>
            </div>
            <div className="guide-cta">
              <Link href="/#calculadora" className="primary-button">
                Ir a la calculadora
              </Link>
              <Link href="/cuanto-facturar-autonomo-2000-euros" className="primary-button">
                Ver objetivo de 2000 euros
              </Link>
            </div>
          </div>

          <aside className="feature-card article-summary">
            <h2>Qué vas a aterrizar aquí</h2>
            <ul className="article-list">
              <li>Por qué 1500 euros netos no son 1500 euros facturados.</li>
              <li>Qué costes pueden comerse el margen si no los separas.</li>
              <li>Cómo convertir este objetivo en una tarifa por hora mínima.</li>
              <li>Cuándo tiene sentido subir hacia 2000 euros netos.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>1500 euros netos pueden ser un buen primer suelo, pero hay que calcularlos bien</h2>
          <p>
            Para muchos autónomos y freelancers, 1500 euros netos al mes son una primera referencia
            razonable: permite validar si la actividad empieza a sostenerse sin exigir todavía una
            facturación muy alta. El problema aparece cuando esa cifra se confunde con lo que hay
            que facturar.
          </p>
          <p>
            La facturación mensual debe absorber gastos, cuota, impuestos y horas no facturables.
            Si no haces esa cuenta, puedes creer que estás llegando al objetivo mientras tu margen
            real sigue siendo demasiado bajo.
          </p>
          <div className="disclaimer-box">
            <strong>Idea clave:</strong> 1500 euros netos pueden ser un objetivo prudente, pero solo
            funcionan como referencia si los conviertes en facturación, tarifa y presupuestos
            defendibles.
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container feature-grid" aria-label="Factores que cambian la cifra">
          <article className="feature-card">
            <h2>1. Cuota de autónomos</h2>
            <p>
              Aunque tengas tarifa reducida o una cuota baja al principio, esa cantidad reduce el
              margen disponible. Si sube la cuota, también sube lo que necesitas facturar.
            </p>
          </article>

          <article className="feature-card">
            <h2>2. Gastos de actividad</h2>
            <p>
              Herramientas, gestoría, software, seguros, equipos o colaboraciones deben entrar en
              la cuenta antes de decidir si esos 1500 euros son realmente netos.
            </p>
          </article>

          <article className="feature-card">
            <h2>3. Horas facturables</h2>
            <p>
              Vender 80 horas al mes no es lo mismo que trabajar 160. Administración, ventas,
              reuniones y soporte también consumen tiempo, aunque no siempre se facturen.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container article-layout">
          <div className="text-block">
            <h2>Fórmula rápida para estimar tu facturación objetivo</h2>
            <ol className="article-list article-list-ordered">
              <li>Define 1500 euros como neto mensual que quieres conservar.</li>
              <li>Suma tus gastos fijos y variables de actividad.</li>
              <li>Añade una cuota de autónomos realista para tu caso.</li>
              <li>Reserva IRPF antes de considerar ese dinero disponible.</li>
              <li>Separa el IVA si tu actividad lo repercute.</li>
              <li>Divide la facturación necesaria entre tus horas facturables reales.</li>
            </ol>
            <p>
              Esta cuenta no pretende sustituir a una gestoría, pero sí te ayuda a detectar si una
              tarifa o presupuesto se queda corto antes de aceptar el trabajo.
            </p>
          </div>

          <aside className="feature-card article-summary">
            <h2>Señales de que debes revisar precio</h2>
            <ul className="article-list">
              <li>Ingresas cerca de 1500 euros, pero no separas IRPF ni IVA.</li>
              <li>Tus gastos mensuales crecen y no has subido tarifa.</li>
              <li>Vendes muchas horas, pero sigues sin margen para descanso o imprevistos.</li>
              <li>Cualquier baja, retraso o cliente perdido te desestabiliza.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section alt">
        <div className="container text-block">
          <h2>Cuándo pasar de 1500 a 2000 euros netos</h2>
          <p>
            Cuando el objetivo de 1500 euros ya se sostiene con cierta estabilidad, el siguiente
            paso útil es revisar si puedes subir precios, vender proyectos de mayor margen o
            aumentar la parte recurrente de tus ingresos. Ahí empieza a tener sentido mirar un
            objetivo de 2000 euros netos.
          </p>
          <p>
            No tiene que ser un salto brusco. Puedes usar la calculadora para comparar escenarios:
            más horas facturables, menos gastos, tickets más altos o una tarifa por hora más
            alineada con el valor real de tu trabajo.
          </p>
          <div className="guide-cta">
            <Link href="/#calculadora" className="primary-button">
              Calcular mi escenario
            </Link>
            <Link href="/cuanto-facturar-autonomo-2000-euros" className="primary-button">
              Ver objetivo de 2000 euros
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <LeadMagnetForm
            source="guia-1500-euros"
            title="Revisa si tu tarifa sostiene 1500 euros netos"
            description="Llévate el kit para contrastar tu tarifa, tus horas facturables, tu cuota, tus impuestos y tu margen antes de aceptar un precio."
            buttonLabel="Quiero revisar mi tarifa"
          />
        </div>
      </section>

      <section className="section" id="faq-1500-euros">
        <div className="container text-block">
          <span className="eyebrow">Preguntas frecuentes</span>
          <h2>Dudas habituales sobre ganar 1500 euros netos como autónomo</h2>
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
          <h2>Convierte ese suelo mensual en una tarifa defendible</h2>
          <p>
            Si ya tienes claro tu objetivo neto, el siguiente paso es bajarlo a una tarifa por hora
            o a presupuestos por proyecto. Así puedes detectar rápido si cada cliente te acerca o te
            aleja de tu suelo mensual.
          </p>
          <div className="guide-cta">
            <Link href="/tarifa-freelance-por-hora" className="primary-button">
              Leer guía sobre tarifa por hora
            </Link>
            <Link href="/cuanto-facturar-autonomo" className="primary-button">
              Volver a la guía general
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
