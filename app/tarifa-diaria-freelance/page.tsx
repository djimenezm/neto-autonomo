import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { getSiteUrl, siteConfig } from '@/lib/site';

const route = '/tarifa-diaria-freelance';
const title = 'Tarifa diaria freelance: como calcular cuanto cobrar por dia';
const description =
  'Guia practica para calcular una tarifa diaria freelance a partir de tu objetivo mensual, horas facturables, gastos, cuota, IRPF, IVA y margen.';

const pageFaqItems = [
  {
    question: 'Como calculo mi tarifa diaria freelance?',
    answer:
      'Primero calcula tu facturacion mensual objetivo y tu tarifa por hora real. Despues multiplica por las horas utiles de una jornada y ajusta por preparacion, seguimiento, riesgo y si el dia bloquea tu agenda.',
  },
  {
    question: 'Es lo mismo tarifa diaria que ocho horas por mi tarifa por hora?',
    answer:
      'No siempre. Una jornada suele incluir preparacion, contexto, cambios de foco y coste de oportunidad. Si bloqueas un dia entero, la tarifa diaria deberia proteger ese valor, no solo multiplicar horas visibles.',
  },
  {
    question: 'Cuando conviene cobrar por dia en vez de por hora?',
    answer:
      'Encaja bien en consultoria, workshops, auditorias, sesiones intensivas, formacion o bloques cerrados de trabajo donde vender horas sueltas genera demasiada friccion.',
  },
] as const;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: route,
  },
  keywords: [
    'tarifa diaria freelance',
    'cuanto cobrar por dia freelance',
    'day rate freelance espana',
    'tarifa diaria consultor freelance',
    'precio por dia autonomo',
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

export default function TarifaDiariaFreelancePage() {
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
        id="tarifa-diaria-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script
        id="tarifa-diaria-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="tarifa-diaria-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Header />

      <section className="hero">
        <div className="container article-layout">
          <div className="text-block">
            <span className="eyebrow">Tarifa por jornada</span>
            <h1>Tarifa diaria freelance: como calcular cuanto cobrar por dia</h1>
            <p className="lead">
              Cobrar por dia puede ser mas claro que vender horas sueltas, pero la tarifa diaria no
              deberia salir de multiplicar ocho horas sin mas. Debe tener en cuenta tu suelo mensual,
              horas facturables reales, preparacion, seguimiento y coste de oportunidad.
            </p>
            <div className="hero-badges" aria-label="Que cubre esta guia">
              <span className="hero-badge">Day rate</span>
              <span className="hero-badge">Consultoria</span>
              <span className="hero-badge">Bloques de trabajo</span>
            </div>
            <div className="guide-cta">
              <Link href="/#calculadora" className="primary-button">
                Calcular base mensual
              </Link>
              <Link href="/tarifa-freelance-por-hora" className="primary-button">
                Ver tarifa por hora
              </Link>
            </div>
          </div>

          <aside className="feature-card article-summary">
            <h2>Resumen rapido</h2>
            <ul className="article-list">
              <li>Calcula primero tu tarifa por hora real.</li>
              <li>No todas las jornadas equivalen a ocho horas productivas.</li>
              <li>Un dia bloqueado tiene coste de oportunidad.</li>
              <li>La tarifa diaria funciona mejor con alcance y entregable claros.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>La tarifa diaria no es solo una multiplicacion</h2>
          <p>
            Si tu tarifa por hora es 60 euros, puede parecer natural vender un dia por 480 euros.
            A veces encaja, pero no siempre. Una jornada puede incluir preparacion, reunion previa,
            contexto, documentacion, seguimiento posterior y el hecho de reservar una parte grande
            de tu agenda para un solo cliente.
          </p>
          <p>
            Por eso conviene calcular la tarifa diaria desde una base economica real y despues
            ajustar segun el tipo de trabajo: consultoria, ejecucion, auditoria, formacion o
            workshop.
          </p>
          <div className="disclaimer-box">
            <strong>Idea clave:</strong> una tarifa diaria sana protege el tiempo visible y tambien
            el coste de bloquear tu agenda.
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container feature-grid" aria-label="Cuando usar tarifa diaria">
          <article className="feature-card">
            <h2>Consultoria y auditorias</h2>
            <p>
              Cuando vendes criterio, diagnostico o una jornada intensiva de revision, el valor no
              se mide solo por horas ejecutadas.
            </p>
          </article>

          <article className="feature-card">
            <h2>Workshops y formacion</h2>
            <p>
              Preparar, impartir y cerrar una sesion suele implicar mas trabajo que las horas de la
              reunion visible.
            </p>
          </article>

          <article className="feature-card">
            <h2>Bloques cerrados de ejecucion</h2>
            <p>
              Si el cliente necesita reservar tu disponibilidad durante un dia, la tarifa debe
              reflejar esa prioridad.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container article-layout">
          <div className="text-block">
            <h2>Metodo simple para calcular tu tarifa diaria</h2>
            <ol className="article-list article-list-ordered">
              <li>Calcula cuanto necesitas facturar al mes sin contar el IVA como ingreso.</li>
              <li>Divide esa cifra entre tus horas facturables reales.</li>
              <li>Define cuantas horas utiles tiene una jornada vendible para ti.</li>
              <li>Suma preparacion, cierre, seguimiento y documentacion si aplican.</li>
              <li>Anade margen si el dia bloquea tu agenda o exige prioridad.</li>
              <li>Deja claro que incluye la jornada y que se cobra aparte.</li>
            </ol>
            <p>
              Si todavia no tienes una referencia por hora, empieza por la{' '}
              <Link href="/tarifa-freelance-por-hora">guia de tarifa freelance por hora</Link> y
              despues convierte esa base en dia, medio dia o bloque de trabajo.
            </p>
          </div>

          <aside className="feature-card article-summary">
            <h2>Formula orientativa</h2>
            <p>
              Tarifa diaria = tarifa por hora real x horas utiles del dia + preparacion +
              seguimiento + margen por bloqueo de agenda.
            </p>
            <p>
              La cifra final debe revisarse con tu posicionamiento y el tipo de cliente, no solo con
              una cuenta matematica.
            </p>
          </aside>
        </div>
      </section>

      <section className="section alt">
        <div className="container text-block">
          <h2>Errores habituales al cobrar por dia</h2>
          <ol className="article-list article-list-ordered">
            <li>Multiplicar ocho horas sin contar preparacion ni seguimiento.</li>
            <li>Prometer disponibilidad total sin definir horario ni entregable.</li>
            <li>No aclarar si el dia incluye reuniones, documentacion o revision posterior.</li>
            <li>Aplicar descuento por jornada sin compensarlo con alcance cerrado.</li>
            <li>No separar urgencias o desplazamientos si los hay.</li>
          </ol>
          <p>
            Una tarifa diaria puede venderse muy bien, pero debe estar protegida. Si el cliente
            compra un dia, conviene que ambos sepan que ocurre antes, durante y despues de esa
            jornada.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>Como presentar una tarifa diaria en una propuesta</h2>
          <div className="disclaimer-box">
            <p>
              La tarifa diaria incluye una jornada de trabajo de hasta 7 horas utiles, preparacion
              previa basica, una sesion de cierre y un resumen posterior. No incluye nuevas sesiones,
              soporte continuado, desplazamientos, urgencias fuera de horario ni ejecuciones fuera
              del alcance acordado.
            </p>
          </div>
          <p>
            Este tipo de texto evita que una jornada se convierta en disponibilidad indefinida. Si
            el trabajo necesita continuidad, puede tener mas sentido pasar a un presupuesto cerrado o
            una cuota mensual.
          </p>
          <div className="guide-cta">
            <a
              href="https://www.cuantopresupuestar.es?utm_source=cuantofacturar&utm_medium=article-link&utm_campaign=tarifa_diaria"
              className="primary-button"
            >
              Pasarlo a presupuesto
            </a>
            <a
              href="https://www.mantenimientowebmensual.es?utm_source=cuantofacturar&utm_medium=article-link&utm_campaign=tarifa_diaria"
              className="primary-button"
            >
              Valorar cuota mensual
            </a>
          </div>
        </div>
      </section>

      <section className="section alt" id="faq-tarifa-diaria">
        <div className="container text-block">
          <span className="eyebrow">Preguntas frecuentes</span>
          <h2>Dudas habituales sobre tarifa diaria freelance</h2>
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
