import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LeadMagnetForm from '@/components/LeadMagnetForm';
import MonthlyScenarioComparator from '@/components/MonthlyScenarioComparator';
import { monthlyScenarioExamples, monthlyScenarioInput } from '@/lib/monthlyScenarioExample';
import { calculateExample, exampleAssumptions, formatEuro, getExampleUrl } from '@/lib/scenarioExamples';
import { getSiteUrl, siteConfig } from '@/lib/site';
import styles from './scenarios.module.css';

const route = '/tabla-cuanto-facturar-autonomo';
const title = 'Tabla orientativa para saber cuánto facturar como autónomo';
const description =
  'Compara objetivos netos de 1500 a 3000 euros y comprueba cómo cambian la facturación y la tarifa al variar tus gastos y horas. Incluye un ejemplo y un comparador.';

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
      'Úsala como referencia mensual y comprueba cuántos encargos completos alcanzan ese importe y si sus horas caben en el mes. La guía de 3000 euros incluye esa cuenta. No basta con dividir entre proyectos si no puedes entregarlos.',
  },
  {
    question: '¿Bajar mis horas facturables reduce lo que necesito facturar?',
    answer:
      'Si conservas el mismo neto y costes, no. En este ejemplo se siguen necesitando 2972,94 EUR sin IVA al mes: pasar de 80 a 60 horas eleva la tarifa de 37,16 a 49,55 EUR/h. El comparador permite cambiar por separado gastos y horas.',
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
        id="tabla-cuanto-facturar-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema).replace(/</g, '\\u003c') }}
      />
      <script
        id="tabla-cuanto-facturar-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }}
      />
      <script
        id="tabla-cuanto-facturar-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
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
              <a href="#comparar-escenarios" className="link-button">Comparar cambios en gastos y horas</a>
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

      <section className="section alt" aria-labelledby="comparar-escenarios">
        <div className="container text-block">
          <p className="scenario-note">Actualizada el 27 de octubre de 2026. Responsable: {siteConfig.ownerName}.</p>
          <h2 id="comparar-escenarios">Mismo neto, más gastos o menos horas: qué cambia</h2>
          <p>
            Conservamos el objetivo ficticio de 2000 EUR netos, la cuota manual de 320 EUR y la
            reserva manual del 15 %. Primero cambiamos una sola variable; después combinamos ambas.
            Son supuestos del ejemplo, no importes fiscales universales.
          </p>
          <div className="scenario-table-scroll" role="region" aria-label="Efecto de gastos y horas con el mismo neto" tabIndex={0}>
            <table className="scenario-table">
              <caption>Cuatro escenarios para 2000 EUR netos al mes. Todos los importes de facturación y tarifa se muestran sin IVA.</caption>
              <thead><tr><th scope="col">Escenario</th><th scope="col">Gastos deducibles/mes</th><th scope="col">Horas/mes</th><th scope="col">Facturación/mes</th><th scope="col">Tarifa/h</th></tr></thead>
              <tbody>
                {monthlyScenarioExamples.map((scenario) => (
                  <tr key={scenario.label}>
                    <th scope="row">{scenario.label}</th>
                    <td>{formatEuro(scenario.monthlyExpenses)}</td><td>{scenario.billableHours} h</td>
                    <td>{formatEuro(scenario.proposed.billingWithoutVAT)}</td><td>{formatEuro(scenario.proposed.hourlyRate)}/h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Al pasar de 80 a 60 horas, la facturación mensual no baja: sigue en {formatEuro(monthlyScenarioExamples[0].current.billingWithoutVAT)}.
            {' '}La tarifa sube de {formatEuro(monthlyScenarioExamples[0].current.hourlyRate)} a {formatEuro(monthlyScenarioExamples[1].proposed.hourlyRate)}/h.
            {' '}Si además los gastos deducibles pasan de 300 a 450 EUR, hacen falta {formatEuro(monthlyScenarioExamples[3].proposed.billingWithoutVAT)} al mes
            {' '}y {formatEuro(monthlyScenarioExamples[3].proposed.hourlyRate)}/h. El objetivo neto permanece en 2000 EUR.
          </p>
          <p>
            Aumentar un coste no es un ahorro. Este ejemplo solo muestra cuánto tendrías que facturar
            para conservar el mismo neto según el motor de la calculadora. Comprueba qué gastos
            cumplen los <a href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-ayuda-presentacion/irpf-2025/7-cumplimentacion-irpf/7_4-rendimientos-actividades-economicas/7_4_2-regimen-estimacion-directa/7_4_2_3-gastos-fiscalmente-deducibles.html">requisitos de deducibilidad de la AEAT</a>;
            {' '}tener un pago no basta para clasificarlo como deducible.
          </p>
          <p>
            Revisa el total mensual en la <Link href="/cuanto-cuesta-ser-autonomo#cost-calculator-heading">calculadora de costes</Link>
            {' '}y contrasta tus horas con el <Link href="/kit-tarifa-autonomo#registro-horas">registro de cuatro semanas</Link>.
            {' '}Para comprobar entregas completas, usa el <Link href="/cuanto-facturar-autonomo-3000-euros#plan-encargos">comprobador de encargos y capacidad mensual</Link>.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="comparador-mensual">
        <div className="container text-block">
          <h2 id="comparador-mensual">Prueba otros gastos y horas sobre este ejemplo</h2>
          <p>
            La partida es el escenario ficticio de 2000 EUR de esta página. Introduce 450 EUR de gastos
            y 60 horas para reproducir la última fila. Para comparar con tus propios impuestos y cuota,
            {' '}<Link href={getExampleUrl(2000)}>ajusta primero tu cálculo</Link> y abre «Comparar cambios en mis gastos y horas» en el resultado.
          </p>
          <MonthlyScenarioComparator reference={monthlyScenarioInput} />
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
