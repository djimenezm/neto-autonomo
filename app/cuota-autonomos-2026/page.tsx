import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { getSiteUrl, siteConfig } from '@/lib/site';
import { ANNUAL_SMI_2026, REDUCED_FEE_2026, reducedFeeSources } from '@/lib/reducedFee2026';
import { reducedFeeExamples } from '@/lib/reducedFeeExamples';
import { getScenarioPath } from '@/lib/monthlyScenarios';
import { formatCurrency, formatNumber } from '@/lib/format';
import styles from './reducedFeeGuide.module.css';

const route = '/cuota-autonomos-2026';
const title = 'Cuota de autónomos 2026: qué pagar y cómo calcularla';
const description =
  'Cuota reducida con MEI y prórroga comparada con el SMI anual de 2026. Ejemplos con sus supuestos, enlaces al cálculo y fuentes de Importass y BOE.';

const pageFaqItems = [
  {
    question: '¿La cuota reducida de 80 euros incluye el MEI?',
    answer:
      'Importass indica que al importe de la tarifa plana se añade el MEI y publica un total de 88,64 EUR al mes. Esta calculadora usa ese total como referencia, revisado el 27 de octubre de 2026. Si tu recibo es distinto, indica el importe completo mediante la cuota manual.',
  },
  {
    question: '¿Qué SMI se usa para revisar la prórroga?',
    answer:
      'El requisito económico se refiere a rendimientos netos anuales inferiores al SMI anual. La referencia de 2026 es 17.094 EUR. No se compara la facturación ni el neto deseado con los 1.221 EUR mensuales del SMI.',
  },
  {
    question: '¿Estar por debajo del límite en la simulación concede la prórroga?',
    answer:
      'No. La comparación solo revisa el límite económico dentro del modelo. Hay que comprobar los rendimientos reales, solicitar la prórroga antes del segundo periodo y cumplir los demás requisitos. El caso general no cubre todas las situaciones personales.',
  },
  {
    question: '¿Qué ocurre si la prórroga abarca dos años naturales?',
    answer:
      'El requisito se debe cumplir en cada año natural. Esta calculadora anualiza doce meses iguales y usa la referencia de 2026; no valida otro ejercicio ni reparte un periodo entre años.',
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
    'cuota autónomos 2026',
    'cuánto paga un autónomo en 2026',
    'tramos autónomos 2026',
    'tarifa reducida autónomos 2026',
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
    dateModified: '2026-10-27',
    accountablePerson: { '@type': 'Person', name: siteConfig.ownerName },
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
    <main id="contenido-principal" className={styles.guide}>
      <script
        id="cuota-autonomos-2026-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema).replace(/</g, '\\u003c') }}
      />
      <script
        id="cuota-autonomos-2026-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }}
      />
      <script
        id="cuota-autonomos-2026-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
      />

      <Header />

      <section className="hero">
        <div className="container article-layout">
          <div className="text-block">
            <span className="eyebrow">Guía práctica</span>
            <h1>Cuota de autónomos 2026: qué pagar y cómo afecta a lo que facturas</h1>
            <p className="lead">
              La simulación de cuota reducida usa <strong>{formatCurrency(REDUCED_FEE_2026)} al mes con MEI incluido</strong>,
              {' '}según el total publicado por Importass. Para revisar la prórroga, la referencia es
              {' '}el <strong>SMI anual de {formatCurrency(ANNUAL_SMI_2026)}</strong> en 2026. El importe de tu recibo y los requisitos personales se comprueban aparte.
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
              <a href="#prorroga-anual" className="link-button">Ver ejemplos de la prórroga</a>
            </div>
          </div>

          <aside className="feature-card article-summary">
            <h2>Qué vas a aclarar aquí</h2>
            <ul className="article-list">
              <li>Qué incluye la cuota reducida usada en el cálculo.</li>
              <li>Cómo comparar rendimientos y SMI en la misma unidad anual.</li>
              <li>Dos ejemplos que puedes reproducir con todos sus supuestos.</li>
              <li>Cómo contrastar el resultado con una cuota ordinaria o tu recibo.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <p className="scenario-note">Revisada el 27 de octubre de 2026. Responsable: {siteConfig.ownerName}.</p>
          <h2>Qué importe de cuota estás usando</h2>
          <p>
            En su <a href={reducedFeeSources.importass}>guía de trabajo autónomo, Importass</a> publica
            {' '}un total de {formatCurrency(REDUCED_FEE_2026)} con MEI para la tarifa plana.
            {' '}La calculadora usa ese importe publicado, no solo los 80 EUR de la reducción.
            Si conoces un recibo completo distinto, trasládalo al modo de cuota manual.
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

      <section className="section alt" aria-labelledby="prorroga-anual">
        <div className="container text-block">
          <h2 id="prorroga-anual">La prórroga se contrasta con el SMI anual</h2>
          <p>
            El <a href={reducedFeeSources.extension}>artículo 38 ter del Estatuto del trabajo autónomo</a>
            {' '}exige rendimientos netos anuales inferiores al SMI anual para este segundo periodo.
            {' '}El <a href={reducedFeeSources.smi}>Real Decreto 126/2026</a> fija la referencia anual en
            {' '}{formatCurrency(ANNUAL_SMI_2026)}: 1221 EUR × 14, equivalente a {formatCurrency(ANNUAL_SMI_2026 / 12)} si se reparte entre doce meses.
          </p>
          <p>
            El neto que quieres conservar y la facturación no son los rendimientos netos para cotización.
            {' '}En nuestro modelo general, estos últimos se estiman aplicando la deducción genérica del 7 %
            al beneficio previo a IRPF. Se usa el valor anual sin multiplicar una cifra mensual ya redondeada.
            Es una aproximación para el caso general, no una comprobación de tu declaración ni de situaciones especiales.
          </p>
          <div className="scenario-table-scroll" role="region" aria-label="Ejemplos de comparación con el SMI anual" tabIndex={0}>
            <table className="scenario-table">
              <caption>Casos ficticios de doce meses iguales: gastos de 200 EUR/mes, 80 h facturables/mes, reserva manual de IRPF del 15 %, cuota reducida con prórroga seleccionada.</caption>
              <thead><tr><th scope="col">Neto objetivo/mes</th><th scope="col">Rendimientos estimados/año</th><th scope="col">Comparación con SMI anual</th><th scope="col">Reproducir</th></tr></thead>
              <tbody>{reducedFeeExamples.map(({ input, result }) => (
                <tr key={input.targetNet}>
                  <th scope="row">{formatCurrency(input.targetNet)}</th>
                  <td>{formatCurrency(result.annualEstimatedNetReturnsForContributions)}</td>
                  <td>{result.reducedFeeExtensionEligible ? 'Por debajo; faltan los demás requisitos' : 'No queda por debajo'}</td>
                  <td><Link href={getScenarioPath(input)}>Probar caso de {formatNumber(input.targetNet)} EUR</Link></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <p>
            En el primer caso: 1200 ÷ 0,85 × 0,93 × 12 = {formatCurrency(reducedFeeExamples[0].result.annualEstimatedNetReturnsForContributions)}.
            {' '}Su media mensual estimada es {formatCurrency(reducedFeeExamples[0].result.estimatedNetReturnsForContributions)}, superior a 1221 EUR,
            {' '}pero la comparación correcta sigue quedando por debajo de {formatCurrency(ANNUAL_SMI_2026)} al año.
            {' '}Ese límite económico no concede por sí solo la prórroga.
          </p>
          <div className="disclaimer-box">
            <strong>Antes de usar el precio:</strong> si la estimación no queda por debajo del SMI anual,
            el resultado avisa al principio y mantiene visible que has seleccionado una cuota reducida.
            {' '}El enlace «Ver el mismo cálculo con cuota ordinaria» permite contrastar cuánto tendrías que facturar sin ella.
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="limites-prorroga">
        <div className="container text-block">
          <h2 id="limites-prorroga">Qué queda fuera de esta comprobación</h2>
          <p>
            No se aprueba ni se tramita la prórroga desde aquí. Hay que solicitarla antes del segundo periodo,
            comprobar los rendimientos reales y los demás requisitos. Si abarca dos años naturales,
            la condición económica debe cumplirse en ambos. Esta simulación solo usa la referencia de 2026.
          </p>
          <p>
            Revisa el recibo, las fechas de disfrute y tu situación en Importass. Para nuevos importes
            confirmados utiliza la cuota manual; para entender cómo se reparte tu facturación, consulta
            {' '}el <Link href="/tarifa-freelance-por-hora#ejemplo-tarifa">ejemplo de tarifa por hora</Link>.
          </p>
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
              reducción. Puede cambiar bastante tu resultado mensual durante ese período.
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
