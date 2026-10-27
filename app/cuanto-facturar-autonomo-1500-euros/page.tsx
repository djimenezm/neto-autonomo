import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LeadMagnetForm from '@/components/LeadMagnetForm';
import AnnualBillingPlanner from '@/components/AnnualBillingPlanner';
import { annualBaselineScenario as leanScenario, annualBaselineResult as leanResult, annualBillingExamples } from '@/lib/annualBillingExample';
import { formatNumber } from '@/lib/format';
import { calculateExample, exampleAssumptions, formatEuro, getExampleUrl } from '@/lib/scenarioExamples';
import { getSiteUrl, siteConfig } from '@/lib/site';
import styles from './annualGuide.module.css';

const route = '/cuanto-facturar-autonomo-1500-euros';
const title = 'Cuánto facturar como autónomo para ganar 1500 euros netos';
const description =
  'Calcula cuánto facturar para conservar 1500 euros netos. Compara costes y horas, reparte el objetivo anual entre meses activos y comprueba los meses sin facturación.';

const higherCostsScenario = { monthlyExpenses: 500, billableHours: 90 };
const higherCostsResult = calculateExample(1500, higherCostsScenario);
const leanExampleUrl = getExampleUrl(1500, leanScenario);

const pageFaqItems = [
  {
    question: '¿Cuánto hay que facturar para ganar 1500 euros netos?',
    answer:
      `En el ejemplo de estructura ligera, la facturación es ${formatEuro(leanResult.billingWithoutVAT)} al mes sin IVA: 1500 euros netos, ${formatEuro(leanScenario.monthlyExpenses)} de gastos, ${formatEuro(exampleAssumptions.selfEmployedFee)} de cuota y una reserva orientativa de IRPF del ${exampleAssumptions.irpfRate} %. Son supuestos hipotéticos, no una estimación de tu fiscalidad real.`,
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
  {
    question: '¿Qué ocurre si solo facturo diez meses al año?',
    answer:
      `Si mantienes el mismo neto y costes durante doce meses, la necesidad anual del ejemplo ligero es ${formatEuro(annualBillingExamples[0].annualTarget)} sin IVA. Repartida entre diez meses activos son ${formatEuro(annualBillingExamples[1].billingPerActiveMonth)} por mes, redondeados al alza. Introduce las horas de cada mes activo, no una media que ya reste las vacaciones.`,
  },
] as const;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: route,
  },
  keywords: [
    'cuánto facturar autónomo para ganar 1500 euros',
    'cuánto facturar 1500 euros netos',
    'ganar 1500 euros autónomo',
    'cuánto cobrar freelance 1500 netos',
    'facturación autónomo 1500 euros netos',
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
    dateModified: '2026-10-27',
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
        id="cuanto-facturar-1500-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema).replace(/</g, '\\u003c') }}
      />
      <script
        id="cuanto-facturar-1500-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }}
      />
      <script
        id="cuanto-facturar-1500-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
      />

      <Header />

      <section className="hero income-target-hero">
        <div className="container">
          <div className="text-block">
            <span className="eyebrow">Guía práctica</span>
            <h1>Cuánto facturar como autónomo para ganar 1500 euros netos</h1>
            <p className="lead">
              Ejemplo hipotético: <strong>{formatEuro(leanResult.billingWithoutVAT)} al mes sin IVA</strong>
              {' '}dejan 1500 euros netos tras gastos, cuota y una reserva orientativa de IRPF.
            </p>
            <div className="hero-badges" role="group" aria-label="Supuestos del ejemplo inicial">
              <span className="hero-badge">Gastos: {formatEuro(leanScenario.monthlyExpenses)}/mes</span>
              <span className="hero-badge">Cuota: {formatEuro(exampleAssumptions.selfEmployedFee)}/mes</span>
              <span className="hero-badge">Reserva IRPF: {exampleAssumptions.irpfRate} %</span>
              <span className="hero-badge">{leanScenario.billableHours} h facturables/mes</span>
            </div>
            <div className="guide-cta">
              <Link href={leanExampleUrl} className="primary-button">
                Ver y ajustar este ejemplo
              </Link>
              <Link href="#ejemplos-1500" className="text-link">
                Comparar los dos casos
              </Link>
              <a href="#meses-sin-facturar" className="text-link">Planificar meses sin facturar</a>
            </div>
          </div>

        </div>
      </section>

      <section className="section" aria-labelledby="ejemplos-1500">
        <div className="container">
          <p className="scenario-note">
            Actualizado el <time dateTime="2026-10-27">27 de octubre de 2026</time>.
          </p>
          <span className="eyebrow">Dos situaciones distintas</span>
          <h2 id="ejemplos-1500">El mismo neto puede exigir tarifas diferentes</h2>
          <p>
            Ambos casos usan una cuota de {formatEuro(exampleAssumptions.selfEmployedFee)} al mes
            {' '}y una reserva de IRPF del {exampleAssumptions.irpfRate} %. Cambian los gastos y las horas
            {' '}facturables; el objetivo sigue siendo 1500 euros netos. Son supuestos hipotéticos,
            no una cuota ni un tipo fiscal aplicables a todo el mundo. El IVA queda fuera de la
            facturación mostrada.
          </p>
          <div className="scenario-table-scroll" role="region" aria-label="Dos ejemplos para 1.500 euros netos" tabIndex={0}>
            <table className="scenario-table">
              <caption>Objetivo de 1.500 € netos mensuales con distintos gastos y horas facturables.</caption>
              <thead>
                <tr>
                  <th scope="col">Situación</th>
                  <th scope="col">Gastos/mes</th>
                  <th scope="col">Horas/mes</th>
                  <th scope="col">Facturación sin IVA</th>
                  <th scope="col">Tarifa por hora</th>
                  <th scope="col">Probar</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Estructura ligera</th>
                  <td>{formatEuro(leanScenario.monthlyExpenses)}</td>
                  <td>{leanScenario.billableHours}</td>
                  <td>{formatEuro(leanResult.billingWithoutVAT)}</td>
                  <td>{formatEuro(leanResult.hourlyRate)}/h</td>
                  <td><Link href={getExampleUrl(1500, leanScenario)}>Ajustar</Link></td>
                </tr>
                <tr>
                  <th scope="row">Más costes, más horas</th>
                  <td>{formatEuro(higherCostsScenario.monthlyExpenses)}</td>
                  <td>{higherCostsScenario.billableHours}</td>
                  <td>{formatEuro(higherCostsResult.billingWithoutVAT)}</td>
                  <td>{formatEuro(higherCostsResult.hourlyRate)}/h</td>
                  <td><Link href={getExampleUrl(1500, higherCostsScenario)}>Ajustar</Link></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="scenario-note">
            En el primer caso: {formatEuro(leanResult.billingWithoutVAT)} de facturación menos
            {' '}{formatEuro(leanScenario.monthlyExpenses)} de gastos, {formatEuro(leanResult.selfEmployedFee)}
            {' '}de cuota y {formatEuro(leanResult.estimatedIRPF)} de reserva de IRPF = {formatEuro(leanResult.targetNet)}.
          </p>
          <p className="scenario-note">
            En el segundo caso necesitas facturar {formatEuro(higherCostsResult.billingWithoutVAT - leanResult.billingWithoutVAT)}
            {' '}más al mes, pero vender 20 horas adicionales reduce la tarifa media necesaria.
            La dificultad real es comprobar si esas horas adicionales se pueden vender de forma estable.
          </p>
        </div>
      </section>

      <section className="section alt" aria-labelledby="meses-sin-facturar">
        <div className="container text-block">
          <h2 id="meses-sin-facturar">Si no facturas todos los meses, reparte el año completo</h2>
          <p>
            Partimos del caso ligero: {formatEuro(leanResult.billingWithoutVAT)} al mes sin IVA.
            {' '}Mantenemos 1500 EUR netos, {formatEuro(leanScenario.monthlyExpenses)} de gastos,
            {' '}{formatEuro(exampleAssumptions.selfEmployedFee)} de cuota y la misma reserva manual del {exampleAssumptions.irpfRate} % durante doce meses,
            también si no hay facturación. La necesidad anual de este reparto es
            {' '}{formatEuro(leanResult.billingWithoutVAT)} × 12 = <strong>{formatEuro(annualBillingExamples[0].annualTarget)} sin IVA</strong>.
          </p>
          <div className="scenario-table-scroll" role="region" aria-label="Facturación anual repartida entre meses activos" tabIndex={0}>
            <table className="scenario-table">
              <caption>Casos ficticios con el mismo objetivo anual. Los importes mensuales y por hora se redondean al alza a céntimos.</caption>
              <thead><tr><th scope="col">Calendario</th><th scope="col">Meses activos</th><th scope="col">Horas/mes activo</th><th scope="col">Horas/año</th><th scope="col">Facturación/mes activo sin IVA</th><th scope="col">Referencia/h sin IVA</th></tr></thead>
              <tbody>{annualBillingExamples.map((plan) => (
                <tr key={plan.label}>
                  <th scope="row">{plan.label}</th><td>{plan.activeMonths}</td>
                  <td>{formatNumber(plan.hoursPerActiveMonth)} h</td><td>{formatNumber(plan.annualHours)} h</td>
                  <td>{formatEuro(plan.billingPerActiveMonth)}</td><td>{formatEuro(plan.hourlyRate)}/h</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <p>
            Diez meses de 70 horas suman 700 h/año: hay menos horas para sostener la misma necesidad anual.
            {' '}Diez meses de 84 horas suman 840 h/año, igual que doce de 70. Si realmente puedes dedicar
            esas 84 horas a encargos, mantienes las horas anuales: la referencia por hora coincide en esas dos filas.
            El redondeo al alza puede diferir un céntimo del redondeo habitual de la calculadora mensual.
          </p>
          <p>
            Si ya obtuviste una media mensual de una <Link href="/horas-facturables-freelance#agenda-anual-title">agenda anual con semanas de descanso</Link>,
            no la multipliques otra vez por los meses activos para descontar vacaciones de nuevo.
            Primero recupera las horas anuales y repártelas entre los meses en que trabajarás.
          </p>
          <h3 id="comprobar-plan-anual">Comprueba tus meses activos sobre este ejemplo</h3>
          <p>Esta ayuda usa la facturación del caso ligero. Para usar tus propios costes y neto, ajusta el cálculo y abre «Planificar los meses sin facturación» en tu resultado.</p>
          <AnnualBillingPlanner monthlyBilling={leanResult.billingWithoutVAT} />
          <p>
            El reparto no fija fechas de cobro ni reserva dinero para los meses sin facturar.
            Revisa por separado los vencimientos y cambios de gastos: la <a href="https://www.finanzasparatodos.es/como-elaborar-un-presupuesto">guía de presupuestos de Finanzas para Todos</a>
            {' '}explica cómo anotar ingresos, gastos y fechas de pago. Si cambian cuota o costes entre periodos, este supuesto de doce meses iguales deja de representar tu caso.
          </p>
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
            <Link href={leanExampleUrl} className="primary-button">
              Ajustar el ejemplo de 1500 euros
            </Link>
            <Link href="/tabla-cuanto-facturar-autonomo#neto-2000" className="primary-button">
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
