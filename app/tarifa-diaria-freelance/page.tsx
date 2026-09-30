import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { getSiteUrl, siteConfig } from '@/lib/site';

const route = '/tarifa-diaria-freelance';
const title = 'Tarifa diaria freelance: cómo calcular cuánto cobrar por día';
const description =
  'Guía práctica para calcular una tarifa diaria freelance a partir de tu objetivo mensual, horas facturables, gastos, cuota, IRPF, IVA y margen.';

const pageFaqItems = [
  {
    question: '¿Cómo cálculo mi tarifa diaria freelance?',
    answer:
      'Primero calcula tu facturación mensual objetivo y tu tarifa por hora real. Después multiplica por las horas útiles de una jornada y ajusta por preparación, seguimiento, riesgo y si el día bloquea tu agenda.',
  },
  {
    question: '¿Es lo mismo tarifa diaria que ocho horas por mi tarifa por hora?',
    answer:
      'No siempre. Una jornada suele incluir preparación, contexto, cambios de foco y coste de oportunidad. Si bloqueas un día entero, la tarifa diaria debería proteger ese valor, no solo multiplicar horas visibles.',
  },
  {
    question: '¿Cuándo conviene cobrar por día en vez de por hora?',
    answer:
      'Encaja bien en consultoría, workshops, auditorías, sesiones intensivas, formación o bloques cerrados de trabajo donde vender horas sueltas genera demasiada fricción.',
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
    'cuánto cobrar por día freelance',
    'day rate freelance españa',
    'tarifa diaria consultor freelance',
    'precio por día autónomo',
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
            <h1>Tarifa diaria freelance: cómo calcular cuánto cobrar por día</h1>
            <p className="lead">
              Cobrar por día puede ser más claro que vender horas sueltas, pero la tarifa diaria no
              debería salir de multiplicar ocho horas sin más. Debe tener en cuenta tu suelo mensual,
              horas facturables reales, preparación, seguimiento y coste de oportunidad.
            </p>
            <div className="hero-badges" aria-label="Qué cubre esta guía">
              <span className="hero-badge">Day rate</span>
              <span className="hero-badge">Consultoría</span>
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
            <h2>Resumen rápido</h2>
            <ul className="article-list">
              <li>Calcula primero tu tarifa por hora real.</li>
              <li>No todas las jornadas equivalen a ocho horas productivas.</li>
              <li>Un día bloqueado tiene coste de oportunidad.</li>
              <li>La tarifa diaria funciona mejor con alcance y entregable claros.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>La tarifa diaria no es solo una multiplicación</h2>
          <p>
            Si tu tarifa por hora es 60 euros, puede parecer natural vender un día por 480 euros.
            A veces encaja, pero no siempre. Una jornada puede incluir preparación, reunión previa,
            contexto, documentación, seguimiento posterior y el hecho de reservar una parte grande
            de tu agenda para un solo cliente.
          </p>
          <p>
            Por eso conviene calcular la tarifa diaria desde una base económica real y después
            ajustar según el tipo de trabajo: consultoría, ejecución, auditoría, formación o
            workshop.
          </p>
          <div className="disclaimer-box">
            <strong>Idea clave:</strong> una tarifa diaria sana protege el tiempo visible y también
            el coste de bloquear tu agenda.
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container feature-grid" aria-label="Cuándo usar tarifa diaria">
          <article className="feature-card">
            <h2>Consultoría y auditorías</h2>
            <p>
              Cuando vendes criterio, diagnóstico o una jornada intensiva de revisión, el valor no
              se mide solo por horas ejecutadas.
            </p>
          </article>

          <article className="feature-card">
            <h2>Workshops y formación</h2>
            <p>
              Preparar, impartir y cerrar una sesión suele implicar más trabajo que las horas de la
              reunión visible.
            </p>
          </article>

          <article className="feature-card">
            <h2>Bloques cerrados de ejecución</h2>
            <p>
              Si el cliente necesita reservar tu disponibilidad durante un día, la tarifa debe
              reflejar esa prioridad.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container article-layout">
          <div className="text-block">
            <h2>Método simple para calcular tu tarifa diaria</h2>
            <ol className="article-list article-list-ordered">
              <li>Calcula cuánto necesitas facturar al mes sin contar el IVA como ingreso.</li>
              <li>Divide esa cifra entre tus horas facturables reales.</li>
              <li>Define cuántas horas útiles tiene una jornada vendible para ti.</li>
              <li>Suma preparación, cierre, seguimiento y documentación si aplican.</li>
              <li>Añade margen si el día bloquea tu agenda o exige prioridad.</li>
              <li>Deja claro qué incluye la jornada y que se cobra aparte.</li>
            </ol>
            <p>
              Si todavía no tienes una referencia por hora, empieza por la{' '}
              <Link href="/tarifa-freelance-por-hora">guía de tarifa freelance por hora</Link> y
              después convierte esa base en día, medio día o bloque de trabajo.
            </p>
          </div>

          <aside className="feature-card article-summary">
            <h2>Fórmula orientativa</h2>
            <p>
              Tarifa diaria = tarifa por hora real x horas útiles del día + preparación +
              seguimiento + margen por bloqueo de agenda.
            </p>
            <p>
              La cifra final debe revisarse con tu posicionamiento y el tipo de cliente, no solo con
              una cuenta matemática.
            </p>
          </aside>
        </div>
      </section>

      <section className="section alt">
        <div className="container text-block">
          <h2>Errores habituales al cobrar por día</h2>
          <ol className="article-list article-list-ordered">
            <li>Multiplicar ocho horas sin contar preparación ni seguimiento.</li>
            <li>Prometer disponibilidad total sin definir horario ni entregable.</li>
            <li>No aclarar si el día incluye reuniones, documentación o revisión posterior.</li>
            <li>Aplicar descuento por jornada sin compensarlo con alcance cerrado.</li>
            <li>No separar urgencias o desplazamientos si los hay.</li>
          </ol>
          <p>
            Una tarifa diaria puede venderse muy bien, pero debe estar protegida. Si el cliente
            compra un día, conviene que ambos sepan qué ocurre antes, durante y después de esa
            jornada.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>Cómo presentar una tarifa diaria en una propuesta</h2>
          <div className="disclaimer-box">
            <p>
              La tarifa diaria incluye una jornada de trabajo de hasta 7 horas útiles, preparación
              previa básica, una sesión de cierre y un resumen posterior. No incluye nuevas sesiones,
              soporte continuado, desplazamientos, urgencias fuera de horario ni ejecuciones fuera
              del alcance acordado.
            </p>
          </div>
          <p>
            Este tipo de texto evita que una jornada se convierta en disponibilidad indefinida. Si
            el trabajo necesita continuidad, puede tener más sentido pasar a un presupuesto cerrado o
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
