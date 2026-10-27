import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LeadMagnetForm from '@/components/LeadMagnetForm';
import MonthlyProjectPlanner from '@/components/MonthlyProjectPlanner';
import { calculateExample, exampleAssumptions, formatEuro, getExampleUrl } from '@/lib/scenarioExamples';
import { projectCapacityExample, projectCapacityResult, projectMonthlyExample, slowerProjectResult } from '@/lib/projectCapacityExample';
import { getSiteUrl, siteConfig } from '@/lib/site';
import styles from './capacityGuide.module.css';

const route = '/cuanto-facturar-autonomo-3000-euros';
const title = 'Cuánto facturar como autónomo para ganar 3000 euros netos';
const description =
  'Ejemplo para conservar 3000 euros netos: facturación desglosada en encargos, horas necesarias y capacidad mensual. Comprueba si el precio y el trabajo previsto encajan.';

const hourScenarios = [60, 80, 120] as const;
const eightyHourResult = projectMonthlyExample;

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
      'Con el ejemplo de esta guía, dos encargos de 2100 EUR requieren 80 horas si cada uno ocupa 40. Si cada uno pasa a 60 horas, necesitarías 120 horas. Con un límite mensual de 80 solo cabe un encargo completo y su facturación de 2100 EUR no alcanza el objetivo del ejemplo.',
  },
  {
    question: '¿El comprobador garantiza que alcanzaré 3000 euros netos?',
    answer: 'No. Compara precio y tiempo de encargos iguales con una referencia de facturación ya calculada. No comprueba ventas, cobros, fechas ni todos tus impuestos. El resultado depende de que los costes y las horas reflejen tu actividad; los números de la guía son ficticios.',
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
  const regular = projectCapacityResult;
  const slower = slowerProjectResult;
  if (!regular.valid || !slower.valid) throw new Error('Invalid editorial project-capacity example');
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
        id="cuanto-facturar-3000-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema).replace(/</g, '\\u003c') }}
      />
      <script
        id="cuanto-facturar-3000-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }}
      />
      <script
        id="cuanto-facturar-3000-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
      />

      <Header />

      <section className="hero">
        <div className="container article-layout">
          <div className="text-block">
            <span className="eyebrow">Guía práctica</span>
            <h1>Cuánto facturar como autónomo para ganar 3000 euros netos</h1>
            <p className="lead">
              Con los supuestos ficticios de esta guía, conservar 3000 euros netos requiere
              {' '}<strong>{formatEuro(eightyHourResult.billingWithoutVAT)} al mes sin IVA</strong>:
              {' '}{formatEuro(eightyHourResult.hourlyRate)}/h con 80 horas facturables. El siguiente
              paso es comprobar cuántos encargos cubren ese importe y si caben en tu mes.
            </p>
            <div className="hero-badges" aria-label="Qué cubre esta guía">
              <span className="hero-badge">3000 euros netos</span>
              <span className="hero-badge">Tarifa por hora</span>
              <span className="hero-badge">Capacidad mensual</span>
            </div>
            <div className="guide-cta">
              <Link href={getExampleUrl(3000)} className="primary-button">
                Ajustar este ejemplo a mis datos
              </Link>
              <Link href="#plan-encargos" className="primary-button">
                Comprobar encargos y horas
              </Link>
            </div>
          </div>

          <aside className="feature-card article-summary">
            <h2>Qué vas a aterrizar aquí</h2>
            <ul className="article-list">
              <li>La facturación necesaria con los supuestos del ejemplo.</li>
              <li>Cuántos encargos completos permiten alcanzarla.</li>
              <li>Qué ocurre si cada encargo exige más horas.</li>
              <li>Cómo contrastarlo con tu trabajo registrado.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section" aria-labelledby="ejemplo-encargos">
        <div className="container text-block">
          <p className="article-meta">Actualizada el <time dateTime="2026-10-27">27 de octubre de 2026</time>. Responsable: {siteConfig.ownerName}.</p>
          <h2 id="ejemplo-encargos">Dos encargos pueden cubrir el importe y superar tu capacidad</h2>
          <p>
            Partimos de {formatEuro(exampleAssumptions.monthlyExpenses)} de gastos deducibles,
            {' '}cuota manual de {formatEuro(exampleAssumptions.selfEmployedFee)}, reserva manual
            {' '}de IRPF del {exampleAssumptions.irpfRate}% y {exampleAssumptions.billableHours} horas
            {' '}mensuales dedicadas a encargos. Son supuestos inventados, no cuotas ni tipos universales.
            {' '}El motor de la calculadora obtiene {formatEuro(eightyHourResult.billingWithoutVAT)}
            {' '}sin IVA para el objetivo de 3000 euros netos.
          </p>
          <p>
            Ahora suponemos encargos iguales de {formatEuro(projectCapacityExample.pricePerProject)} sin IVA.
            {' '}Uno no alcanza esa facturación; hacen falta {regular.requiredProjects} completos:
            {' '}{regular.requiredProjects} × {formatEuro(projectCapacityExample.pricePerProject)} =
            {' '}{formatEuro(regular.plannedBilling)}. Los {formatEuro(regular.billingDifference)}
            {' '}por encima del objetivo son facturación adicional, no beneficio neto calculado.
          </p>
          <div className="scenario-table-scroll" role="region" aria-label="Encargos necesarios y capacidad de 80 horas" tabIndex={0}>
            <table className="scenario-table">
              <caption>Mismo precio y objetivo; cambia el tiempo completo de cada encargo.</caption>
              <thead><tr><th scope="col">Horas por encargo</th><th scope="col">Encargos necesarios</th><th scope="col">Horas necesarias</th><th scope="col">Encargos que caben</th><th scope="col">Facturación que cabe sin IVA</th></tr></thead>
              <tbody>{[regular, slower].map((plan) => <tr key={plan.hoursPerProject}><th scope="row">{plan.hoursPerProject} h</th><td>{plan.requiredProjects}</td><td>{plan.plannedHours} h</td><td>{plan.maxProjects}</td><td>{formatEuro(plan.capacityBilling)}</td></tr>)}</tbody>
            </table>
          </div>
          <p>Con 40 horas por encargo, dos ocupan las {regular.plannedHours} horas: caben sin holgura. Si cada uno consume 60 horas, los dos requieren {slower.plannedHours} horas, {Math.abs(slower.remainingHours)} más de las disponibles. Solo cabe un encargo completo de {formatEuro(slower.capacityBilling)} y faltan {formatEuro(-slower.capacityDifference)} para la facturación objetivo.</p>
          <p>Cuenta preparación, reuniones, ejecución, revisiones y cierre dentro de las horas de cada encargo. La captación y gestión general ya deben reducir tu capacidad mensual. No vuelvas a sumar o restar la misma hora.</p>
          <p>El cálculo supone encargos completos y facturados en el mismo mes. No comprueba fechas, ventas ni cobros. Para proyectos repartidos entre varios meses hace falta otro calendario de trabajo y facturación.</p>
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

      <section className="section alt" aria-labelledby="plan-encargos">
        <div className="container text-block">
          <h2 id="plan-encargos">Comprueba tu precio y tus horas por encargo</h2>
          <p>Aquí usamos la referencia del ejemplo. Para obtener la tuya, <Link href={getExampleUrl(3000)}>ajusta los datos en la calculadora</Link> y abre «Comprobar cuántos encargos necesito y si caben» en tu resultado.</p>
          <MonthlyProjectPlanner monthlyBilling={eightyHourResult.billingWithoutVAT} billableHours={exampleAssumptions.billableHours} />
        </div>
      </section>

      <section className="section alt">
        <div className="container text-block">
          <h2>Qué revisar cuando el plan no encaja</h2>
          <p>
            Contrasta las horas estimadas con el <Link href="/kit-tarifa-autonomo#registro-horas">registro de cuatro semanas</Link>.
            {' '}Una revisión adicional puede cambiar cuántos encargos caben, aunque no cambie su precio.
            {' '}Si el servicio tiene fases que continúan otro mes, reparte también su facturación en ese periodo.
          </p>
          <p>
            Revisa qué entregable puedes comprometer, cuánto trabajo exige y qué precio estás valorando.
            {' '}Para una jornada concreta, el <Link href="/tarifa-diaria-freelance#comprobar-jornada">comprobador de tarifa diaria</Link>
            {' '}ayuda a contar preparación y cierre. Este límite de horas no reserva fechas ni convierte una estimación en encargos vendidos.
          </p>
          <p>Comparamos importes sin IVA y no recalculamos el neto del volumen de encargos. La <a href="https://sede.agenciatributaria.gob.es/Sede/iva/regimenes-tributacion-iva/regimen-general.html">explicación del régimen general del IVA de la AEAT</a> distingue IVA repercutido y soportado deducible; esta ayuda no calcula esa liquidación.</p>
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
