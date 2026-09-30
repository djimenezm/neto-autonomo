import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LeadMagnetForm from '@/components/LeadMagnetForm';
import { calculateExample, formatEuro, getExampleUrl } from '@/lib/scenarioExamples';
import { getSiteUrl, siteConfig } from '@/lib/site';

const route = '/cuanto-facturar-autonomo-3000-euros';
const title = 'Cuánto facturar como autónomo para ganar 3000 euros netos';
const description =
  'Guía práctica para estimar cuánto facturar como autónomo o freelance en España si quieres llegar a 3000 euros netos al mes teniendo en cuenta cuota, IRPF, IVA, gastos y horas facturables.';

const hourScenarios = [60, 80, 120] as const;
const eightyHourResult = calculateExample(3000);

const pageFaqItems = [
  {
    question: '¿Cuánto habría que facturar con 80 horas vendibles?',
    answer:
      `En el ejemplo de esta página, ${formatEuro(eightyHourResult.billingWithoutVAT)} al mes sin IVA, unos ${formatEuro(eightyHourResult.hourlyRate)} por hora facturable. Cambia los gastos, la cuota y la reserva fiscal para obtener tu referencia.`,
  },
  {
    question: '¿Basta con vender más horas para llegar al objetivo?',
    answer:
      'Solo si esas horas son facturables de verdad. Revisa cuánto tiempo dedicas a captación, gestión y revisiones antes de asumir 120 horas vendidas cada mes.',
  },
  {
    question: '¿Qué ocurre si un proyecto consume más horas de las previstas?',
    answer:
      'Tu tarifa efectiva baja. Registra las horas reales de cada encargo y revisa precio, alcance o número de revisiones antes de repetir un presupuesto similar.',
  },
] as const;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: route,
  },
  keywords: [
    'cuánto facturar autónomo para ganar 3000 euros',
    'cuánto facturar 3000 euros netos',
    'ganar 3000 euros autónomo',
    'cuánto cobrar freelance 3000 netos',
    'facturación autónomo 3000 euros netos',
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

export default function CuantoFacturarAutonomo3000EurosPage() {
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
    dateModified: '2026-09-22',
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
        id="cuanto-facturar-3000-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script
        id="cuanto-facturar-3000-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="cuanto-facturar-3000-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Header />

      <section className="hero">
        <div className="container article-layout">
          <div className="text-block">
            <span className="eyebrow">Guía práctica</span>
            <h1>Cuánto facturar como autónomo para ganar 3000 euros netos</h1>
            <p className="lead">
              Llegar a 3000 euros netos al mes como autónomo no significa facturar 3000 euros. La
              cifra qué necesitas emitir suele ser mayor porque antes debes cubrir gastos, cuota,
              IRPF, tiempo no facturable y separar el IVA cuando corresponda.
            </p>
            <div className="hero-badges" aria-label="Qué cubre esta guía">
              <span className="hero-badge">3000 euros netos</span>
              <span className="hero-badge">Tarifa por hora</span>
              <span className="hero-badge">Margen real</span>
            </div>
            <div className="guide-cta">
              <Link href="/#calculadora" className="primary-button">
                Ir a la calculadora
              </Link>
              <Link href="/tabla-cuanto-facturar-autonomo#neto-2000" className="primary-button">
                Ver objetivo de 2000 euros
              </Link>
            </div>
          </div>

          <aside className="feature-card article-summary">
            <h2>Qué vas a aterrizar aquí</h2>
            <ul className="article-list">
              <li>Por qué el objetivo neto no coincide con lo que facturas.</li>
              <li>Qué variables empujan la facturación necesaria hacia arriba.</li>
              <li>Cómo convertir 3000 euros netos en tarifa por hora o presupuesto.</li>
              <li>Que revisar antes de subir precios o aceptar nuevos clientes.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>El reto es sostener la capacidad que promete tu tarifa</h2>
          <p>
            Con los supuestos de esta página, conservar 3.000 € netos exige facturar{' '}
            {formatEuro(eightyHourResult.billingWithoutVAT)} al mes sin IVA. Si puedes vender 80
            horas, la referencia es {formatEuro(eightyHourResult.hourlyRate)}/h. Pero una agenda de
            80 horas disponibles no equivale necesariamente a 80 horas cobradas.
          </p>
          <p>
            Antes de subir el objetivo, mira tus últimos proyectos: horas presupuestadas, horas
            reales, revisiones no cobradas y tiempo invertido en captar al siguiente cliente.
            La diferencia entre esas cifras decide si el precio puede sostenerse mes tras mes.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="ejemplos-3000">
        <div className="container">
          <span className="eyebrow">Capacidad de trabajo</span>
          <h2 id="ejemplos-3000">El objetivo mensual es el mismo; la presión por hora no</h2>
          <p>
            Ejemplo con 300 € de gastos, una cuota mensual supuesta de 320 € y una reserva de IRPF
            hipotética del 15 %. Compara las horas que realmente puedes facturar, no toda tu jornada.
          </p>
          <div className="scenario-table-scroll" role="region" aria-label="Comparación de horas para 3.000 euros netos" tabIndex={0}>
            <table className="scenario-table">
              <caption>Objetivo de 3.000 € netos mensuales con 60, 80 y 120 horas facturables.</caption>
              <thead>
                <tr>
                  <th scope="col">Horas facturables/mes</th>
                  <th scope="col">Facturación sin IVA</th>
                  <th scope="col">Tarifa por hora</th>
                  <th scope="col">Probar</th>
                </tr>
              </thead>
              <tbody>
                {hourScenarios.map((hours) => {
                  const result = calculateExample(3000, { billableHours: hours });

                  return (
                    <tr key={hours}>
                      <th scope="row">{hours} h</th>
                      <td>{formatEuro(result.billingWithoutVAT)}</td>
                      <td>{formatEuro(result.hourlyRate)}/h</td>
                      <td><Link href={getExampleUrl(3000, { billableHours: hours })}>Ajustar</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="scenario-note">
            La facturación no cambia porque el neto y los costes son los mismos. Con menos horas
            vendibles, cada hora debe soportar una parte mayor. El IVA no se trata como ingreso
            disponible y estas cifras no sustituyen una liquidación fiscal real.
          </p>
        </div>
      </section>

      <section className="section alt">
        <div className="container article-layout">
          <div className="text-block">
            <h2>Comprueba si tus proyectos cubren el mes</h2>
            <ol className="article-list article-list-ordered">
              <li>Cuenta solo las horas que has cobrado durante los tres últimos meses.</li>
              <li>Divide la facturación mensual objetivo entre los proyectos que puedes entregar sin solaparlos.</li>
              <li>Compara horas previstas y reales; añade margen para cambios y revisiones.</li>
              <li>Vuelve a calcular si cambian tus gastos, tu cuota o tu reserva fiscal.</li>
            </ol>
            <p>
              Por ejemplo, con dos proyectos de 40 horas al mes, cada presupuesto tendría que
              rondar {formatEuro(eightyHourResult.billingWithoutVAT / 2)} sin IVA bajo estos
              supuestos. Si uno requiere 60 horas, el otro no cabe en el mismo mes sin aumentar
              capacidad o ajustar el plan.
            </p>
          </div>

          <aside className="feature-card article-summary">
            <h2>Cuando el cálculo deja de encajar</h2>
            <ul className="article-list">
              <li>Las revisiones convierten 40 horas previstas en 55 reales.</li>
              <li>La captación te deja menos horas vendibles de las calculadas.</li>
              <li>Necesitas un volumen de proyectos que no puedes entregar con calidad.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section alt">
        <div className="container text-block">
          <h2>Cómo usar este objetivo para presupuestar mejor</h2>
          <p>
            Un objetivo de 3000 euros netos puede servirte como filtro comercial. Si una propuesta,
            una tarifa por hora o una mensualidad no te acercan a esa referencia, necesitas ajustar
            precio, alcance o tipo de cliente antes de comprometerte.
          </p>
          <p>
            También puedes usarlo para comparar escenarios: más horas facturables, menos gastos,
            tickets de proyecto más altos, servicios recurrentes o una mezcla más equilibrada entre
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
            source="guia-3000-euros"
            title="Revisa si tu tarifa sostiene 3000 euros netos"
            description="Llévate el kit para contrastar tu tarifa, tus horas facturables y tu margen antes de aceptar un proyecto o subir precios."
            buttonLabel="Quiero revisar mi tarifa"
          />
        </div>
      </section>

      <section className="section" id="faq-3000-euros">
        <div className="container text-block">
          <span className="eyebrow">Preguntas frecuentes</span>
          <h2>Dudas habituales sobre ganar 3000 euros netos como autónomo</h2>
          {pageFaqItems.map((item) => (
            <article className="disclaimer-box" key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
