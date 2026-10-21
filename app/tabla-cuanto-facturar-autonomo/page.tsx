import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LeadMagnetForm from '@/components/LeadMagnetForm';
import { calculateExample, exampleAssumptions, formatEuro, getExampleUrl } from '@/lib/scenarioExamples';
import { getSiteUrl, siteConfig } from '@/lib/site';

const route = '/tabla-cuanto-facturar-autonomo';
const title = 'Tabla orientativa para saber cuánto facturar como autónomo';
const description =
  'Tabla práctica para comparar objetivos netos de 1500, 2000, 2500 y 3000 euros y entender cómo convertirlos en facturación mensual, tarifa por hora y precios defendibles.';

const netGoals = [1500, 2000, 2500, 3000] as const;

const pageFaqItems = [
  {
    question: '¿Existe una tabla exacta de cuánto facturar como autónomo?',
    answer:
      'No hay una cifra universal. Esta tabla usa los mismos supuestos para comparar cuatro objetivos; cambia los gastos, la cuota, el IRPF y las horas en la calculadora para ver tu caso.',
  },
  {
    question: '¿Por qué el neto objetivo no coincide con la facturación?',
    answer:
      'Porque antes de llegar al neto hay que cubrir gastos, cuota de autónomos, reserva fiscal y separar el IVA cuando aplique. La facturación es la entrada; el neto es lo que conservas después.',
  },
  {
    question: '¿Cómo uso esta tabla si cobro por proyecto?',
    answer:
      'Úsala como referencia mensual. Divide la facturación objetivo entre los proyectos que puedes entregar y comprueba que cada presupuesto cubre también el trabajo no facturable.',
  },
] as const;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: route,
  },
  keywords: [
    'tabla cuánto facturar autónomo',
    'cuánto facturar autónomo tabla',
    'cuánto facturar para ganar neto',
    'facturación autónomo objetivo neto',
    'tabla tarifa autónomo freelance',
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
            <h1>Tabla para saber cuánto facturar como autónomo según tu objetivo neto</h1>
            <p className="lead">
              Cuatro objetivos netos, los mismos gastos y horas en todos los casos. Compara cuánto
              habría que facturar y abre cualquier fila en la calculadora para ajustar los datos.
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
            <h2>Un ejemplo, no una cuota para todos</h2>
            <ul className="article-list">
              <li>{formatEuro(exampleAssumptions.monthlyExpenses)} de gastos al mes.</li>
              <li>{formatEuro(exampleAssumptions.selfEmployedFee)} de cuota mensual supuesta.</li>
              <li>{exampleAssumptions.billableHours} horas facturables al mes.</li>
              <li>Reserva de IRPF hipotética del {exampleAssumptions.irpfRate} %.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Tabla de objetivos netos para autónomos y freelancers</h2>
          <p>
            Las cifras se calculan con el mismo motor que la calculadora. Mantener fijos los demás
            datos permite ver cuánto cambia la facturación al subir el neto deseado.
          </p>
          <div className="scenario-table-scroll" role="region" aria-label="Comparativa de facturación" tabIndex={0}>
            <table className="scenario-table">
              <caption>Ejemplo mensual: {formatEuro(exampleAssumptions.monthlyExpenses)} de gastos, {formatEuro(exampleAssumptions.selfEmployedFee)} de cuota, {exampleAssumptions.billableHours} horas facturables y una reserva de IRPF del {exampleAssumptions.irpfRate} %.</caption>
              <thead>
                <tr>
                  <th scope="col">Neto deseado</th>
                  <th scope="col">Facturación sin IVA</th>
                  <th scope="col">Reserva IRPF</th>
                  <th scope="col">Tarifa por hora</th>
                  <th scope="col">Tu cálculo</th>
                </tr>
              </thead>
              <tbody>
                {netGoals.map((goal) => {
                  const result = calculateExample(goal);

                  return (
                    <tr id={`neto-${goal}`} key={goal}>
                      <th scope="row">{formatEuro(goal)}</th>
                      <td>{formatEuro(result.billingWithoutVAT)}</td>
                      <td>{formatEuro(result.estimatedIRPF)}</td>
                      <td>{formatEuro(result.hourlyRate)}/h</td>
                      <td><Link href={getExampleUrl(goal)}>Ajustar datos</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="scenario-note">
            La cuota y el 15 % de IRPF son supuestos de este ejemplo, no importes aplicables a
            cualquier autónomo. El IVA se añade, si corresponde, a la factura pero no se cuenta
            como ingreso disponible. Las cifras son orientativas y están redondeadas.
          </p>
          <div className="guide-cta">
            <Link href="/cuanto-facturar-autonomo-1500-euros" className="primary-button">Caso de 1.500 €</Link>
            <Link href="/cuanto-facturar-autonomo-3000-euros" className="primary-button">Caso de 3.000 €</Link>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container article-layout">
          <div className="text-block">
            <h2>Qué variables cambian la facturación necesaria</h2>
            <ol className="article-list article-list-ordered">
              <li>El neto mensual que quieres conservar.</li>
              <li>Los gastos deducibles y herramientas que necesitas para trabajar.</li>
              <li>La cuota de autónomos aplicable a tu situación.</li>
              <li>La reserva de IRPF que deberías separar antes de gastar.</li>
              <li>Si repercutes IVA y debes tratarlo como dinero ajeno.</li>
              <li>Las horas facturables reales que puedes vender sin quemarte.</li>
            </ol>
          </div>

          <aside className="feature-card article-summary">
            <h2>Señal de alerta</h2>
            <p>
              Si tu tarifa solo funciona cuando facturas casi todas tus horas disponibles, tienes
              poco margen para ventas, administración, descansos, formación o imprevistos.
            </p>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>Cómo pasar de la tabla a una tarifa o presupuesto</h2>
          <p>
            En este ejemplo, para conservar 2.000 € netos harían falta {formatEuro(calculateExample(2000).billingWithoutVAT)}
            {' '}de facturación mensual sin IVA. Dividido entre 80 horas facturables son{' '}
            {formatEuro(calculateExample(2000).hourlyRate)}/h. Si solo puedes vender 60 horas,
            el objetivo mensual no cambia, pero la tarifa mínima por hora sube.
            {' '}Antes de usar esa referencia, contrástala con los{' '}
            <Link href="/horas-facturables-freelance">ejemplos de agendas y horas facturables</Link>.
          </p>
          <p>
            Puedes comprobar la cuenta: 2.000 € de neto + 300 € de gastos + 320 € de cuota +{' '}
            {formatEuro(calculateExample(2000).estimatedIRPF)} de reserva de IRPF ={' '}
            {formatEuro(calculateExample(2000).billingWithoutVAT)}. La reserva resulta de aplicar
            el 15 % hipotético al beneficio antes de IRPF, no de tomar el 15 % de la facturación.
          </p>
          <p>
            Si trabajas por proyecto, no necesitas enseñar la tabla al cliente. Puedes usarla por
            dentro para validar que el precio cerrado encaja con tu negocio y después presentar una
            propuesta clara con alcance, entregables, revisiones y precio final.
          </p>
          <div className="disclaimer-box">
            <strong>Regla práctica:</strong> la tabla te orienta, pero la calculadora debe cerrar el
            número con tus propios gastos, cuota, impuestos y horas facturables.
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
            title="Llévate el kit para revisar tu tarifa con más criterio"
            description="Te enviamos una guía rápida para revisar neto objetivo, horas facturables, margen, impuestos e IVA antes de aceptar un precio."
            buttonLabel="Quiero revisar mi tarifa"
          />
        </div>
      </section>

      <section className="section" id="faq-tabla-cuanto-facturar">
        <div className="container text-block">
          <span className="eyebrow">Preguntas frecuentes</span>
          <h2>Dudas habituales sobre tablas de facturación para autónomos</h2>
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
