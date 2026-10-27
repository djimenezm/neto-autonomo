import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import DayRatePlanner from '@/components/DayRatePlanner';
import { dayRateCostExample, dayRateCostExampleResult, dayRateExample, dayRateExampleResult, dayRateMonthlyExample } from '@/lib/dayRateExample';
import { exampleAssumptions, formatEuro, getExampleUrl } from '@/lib/scenarioExamples';
import { getSiteUrl, siteConfig } from '@/lib/site';
import styles from './dailyRate.module.css';

const route = '/tarifa-diaria-freelance';
const title = 'Tarifa diaria freelance: calcula la jornada completa';
const description = 'Comprueba una jornada freelance con preparación, cierre y costes específicos. Compara el precio con las horas y los gastos sin duplicar los costes habituales.';

const pageFaqItems = [
  {
    question: '¿Cómo calculo mi tarifa diaria freelance?',
    answer: 'Multiplica tu referencia por hora sin IVA por todo el tiempo específico del servicio: jornada con el cliente, preparación y cierre. Añade solo los costes específicos que aún no cubra esa referencia. Cuenta cada hora y cada coste una sola vez; después revisa el alcance y las condiciones.',
  },
  {
    question: '¿Qué costes específicos tengo que sumar a la jornada?',
    answer: 'Solo los importes que deba cubrir ese servicio y que no estén ya incluidos en tu referencia por hora, por ejemplo un alquiler puntual de equipo. Usa cero si no hay. Si ya repartiste el mismo gasto entre tus costes mensuales, no lo vuelvas a sumar. El comprobador no decide su deducibilidad ni calcula el IVA recuperable.',
  },
  {
    question: '¿El precio menos esos costes es mi sueldo neto?',
    answer: 'No. Ese importe aún debe cubrir los gastos habituales, la cuota y la reserva fiscal contemplados en tu referencia por hora. En el ejemplo, 350 EUR de precio menos 90 EUR de costes específicos dejan 260 EUR para ocho horas, o 32,50 EUR/h; no son 260 EUR de sueldo neto.',
  },
  {
    question: '¿Tengo que multiplicar siempre por ocho horas?',
    answer: 'No. En el ejemplo de esta guía hay seis horas de sesión, una y media de preparación y media de cierre: ocho horas en total. Si preparación y cierre ya están dentro del bloque vendido, no se añaden otra vez.',
  },
  {
    question: '¿Debo volver a sumar la administración y las vacaciones?',
    answer: 'No si ya las has contemplado al estimar tus horas facturables mensuales. En esta cuenta se suman las tareas específicas del cliente que quedan fuera de la jornada, no otra bolsa de gastos generales ni vacaciones.',
  },
  {
    question: '¿El comprobador me da una tarifa de mercado o mi beneficio neto?',
    answer: 'No. Contrasta el precio con la referencia por hora que introduces. No añade impuestos ni un margen automático por urgencia o reserva de agenda, y no garantiza que vendas todas tus jornadas.',
  },
] as const;

export const metadata: Metadata = {
  title, description,
  alternates: { canonical: route },
  keywords: ['tarifa diaria freelance', 'cuánto cobrar por día freelance', 'tarifa diaria consultor freelance', 'precio por día autónomo'],
  openGraph: {
    title: `${title} | ${siteConfig.name}`, description, url: route, type: 'article',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: `${siteConfig.name} - ${title}` }],
  },
  twitter: { card: 'summary_large_image', title: `${title} | ${siteConfig.name}`, description, images: ['/opengraph-image'] },
};

export default function TarifaDiariaFreelancePage() {
  const siteUrl = getSiteUrl();
  const pageUrl = new URL(route, siteUrl).toString();
  const result = dayRateExampleResult;
  const costResult = dayRateCostExampleResult;
  if (!result.valid || !costResult.valid) throw new Error('Invalid editorial day-rate example');
  const schemas = [
    {
      '@context': 'https://schema.org', '@type': 'Article', headline: title, description,
      inLanguage: 'es', mainEntityOfPage: pageUrl,
      author: { '@type': 'Organization', name: siteConfig.name },
      publisher: { '@type': 'Organization', name: siteConfig.name },
      accountablePerson: { '@type': 'Person', name: siteConfig.ownerName },
      datePublished: '2026-04-27', dateModified: '2026-10-27',
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: new URL('/', siteUrl).toString() },
        { '@type': 'ListItem', position: 2, name: title, item: pageUrl },
      ],
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: pageFaqItems.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
    },
  ];

  return (
    <main id="contenido-principal" className={styles.guide}>
      {schemas.map((schema) => <script key={schema['@type']} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />)}
      <Header />
      <section className="hero">
        <div className="container article-layout">
          <div className="text-block">
            <span className="eyebrow">De tu hora a tu jornada</span>
            <h1>Tarifa diaria freelance: cuenta también el trabajo fuera de la sesión</h1>
            <p className="lead">
              Una sesión de 6 horas puede ocupar 8 horas de tu trabajo. En este ejemplo hipotético,
              {' '}a {formatEuro(dayRateExample.hourlyRate)}/h, la referencia es <strong>{formatEuro(result.referencePrice)} sin IVA</strong>,
              {' '}incluyendo preparación y cierre. No es una tarifa de mercado.
            </p>
            <div className="guide-cta">
              <Link href="#comprobar-jornada" className="primary-button">Comprobar mi jornada</Link>
              <Link href="#ejemplo-jornada" className={styles.heroLink}>Ver la cuenta del ejemplo</Link>
            </div>
          </div>
          <aside className="feature-card article-summary">
            <h2>Antes de poner precio</h2>
            <ul className="article-list">
              <li>Parte de tu referencia por hora.</li>
              <li>Cuenta cada tarea una sola vez.</li>
              <li>Compara el precio con todo el tiempo dedicado.</li>
              <li>Define qué termina al cerrar la jornada.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section" aria-labelledby="ejemplo-jornada">
        <div className="container text-block">
          <p className="article-meta">Actualizada el <time dateTime="2026-10-27">27 de octubre de 2026</time>. Responsable del contenido: {siteConfig.ownerName}.</p>
          <h2 id="ejemplo-jornada">Una sesión de 6 horas, un servicio de 8</h2>
          <p>
            Usamos el mismo supuesto que en la <Link href="/tarifa-freelance-por-hora#ejemplo-tarifa">guía de tarifa por hora</Link>:
            {' '}{formatEuro(2000)} de neto mensual objetivo, {formatEuro(exampleAssumptions.monthlyExpenses)} de gastos,
            {' '}cuota manual de {formatEuro(exampleAssumptions.selfEmployedFee)}, reserva manual de IRPF del {exampleAssumptions.irpfRate}%
            {' '}y {exampleAssumptions.billableHours} horas mensuales dedicadas a servicios de clientes.
            {' '}La calculadora obtiene {formatEuro(dayRateMonthlyExample.billingWithoutVAT)} de facturación sin IVA y
            {' '}{formatEuro(dayRateExample.hourlyRate)}/h. La cuota y el porcentaje son supuestos ficticios.
          </p>
          <p>Para esta jornada usamos esa tarifa mostrada, redondeada a céntimos, y añadimos dos tareas que ocurren fuera de la sesión:</p>
          <div className="scenario-table-scroll" role="region" aria-label="Horas e importes del ejemplo de jornada" tabIndex={0}>
            <table className="scenario-table">
              <caption>Ejemplo hipotético. Todos los importes son sin IVA.</caption>
              <thead><tr><th scope="col">Trabajo específico del cliente</th><th scope="col">Horas</th><th scope="col">A {formatEuro(dayRateExample.hourlyRate)}/h</th></tr></thead>
              <tbody>
                <tr><th scope="row">Sesión o bloque de trabajo</th><td>6 h</td><td>{formatEuro(dayRateExample.proposedPrice)}</td></tr>
                <tr><th scope="row">Preparación previa</th><td>1,5 h</td><td>{formatEuro(dayRateExample.hourlyRate * dayRateExample.preparationHours)}</td></tr>
                <tr><th scope="row">Resumen y cierre posterior</th><td>0,5 h</td><td>{formatEuro(dayRateExample.hourlyRate * dayRateExample.followUpHours)}</td></tr>
                <tr><th scope="row">Servicio completo</th><td>8 h</td><td><strong>{formatEuro(result.referencePrice)} sin IVA</strong></td></tr>
              </tbody>
            </table>
          </div>
          <p>
            La cuenta es (6 + 1,5 + 0,5) × {formatEuro(dayRateExample.hourlyRate)} = {formatEuro(result.referencePrice)}.
            {' '}Si cobras solo {formatEuro(dayRateExample.proposedPrice)} por las seis horas visibles, las mismas ocho
            {' '}horas de trabajo dejan {formatEuro(result.effectiveHourlyRate!)}/h, antes de gastos e impuestos.
            {' '}Faltan {formatEuro(-result.priceDifference!)} para alcanzar la referencia del ejemplo.
          </p>
          <p>Este primer caso supone cero costes específicos adicionales. No añade IVA ni retenciones, ni convierte el precio en beneficio neto. El siguiente ejemplo añade un coste que solo corresponde a ese servicio.</p>
          <div className="guide-cta"><Link href={getExampleUrl(2000)} className="primary-button">Reproducir la base mensual en la calculadora</Link></div>
        </div>
      </section>

      <section className="section alt" aria-labelledby="costes-jornada">
        <div className="container text-block">
          <h2 id="costes-jornada">Un precio de 350 € puede quedarse corto con 90 € de costes</h2>
          <p>Seguimos con las mismas {costResult.totalHours} horas y {formatEuro(costResult.hourlyRate)}/h. Añadimos un alquiler puntual de equipo de {formatEuro(costResult.serviceCosts)} que debe cubrir este servicio y que no estaba en los gastos mensuales de la referencia. Todos los datos están inventados; no son precios de mercado ni gastos deducibles confirmados.</p>
          <div className="scenario-table-scroll" role="region" aria-label="Ejemplo de jornada con costes específicos" tabIndex={0}>
            <table className="scenario-table">
              <caption>Ejemplo ficticio. Precio y referencia sin IVA; el coste es el importe que se quiere cubrir, sin cálculo fiscal.</caption>
              <thead><tr><th scope="col">Concepto</th><th scope="col">Cuenta</th><th scope="col">Resultado</th></tr></thead>
              <tbody>
                <tr><th scope="row">Tiempo a tu referencia</th><td>{costResult.totalHours} h × {formatEuro(costResult.hourlyRate)}/h</td><td>{formatEuro(costResult.referencePrice)}</td></tr>
                <tr><th scope="row">Coste específico adicional</th><td>Alquiler puntual no incluido antes</td><td>{formatEuro(costResult.serviceCosts)}</td></tr>
                <tr><th scope="row">Referencia total de horas y costes</th><td>{formatEuro(costResult.referencePrice)} + {formatEuro(costResult.serviceCosts)}</td><td><strong>{formatEuro(costResult.totalReferencePrice)}</strong></td></tr>
                <tr><th scope="row">Precio que se está valorando</th><td>Supuesto ficticio</td><td>{formatEuro(costResult.proposedPrice!)}</td></tr>
                <tr><th scope="row">Precio menos ese coste</th><td>{formatEuro(costResult.proposedPrice!)} − {formatEuro(costResult.serviceCosts)}</td><td>{formatEuro(costResult.availableForTime!)}</td></tr>
                <tr><th scope="row">Por hora tras ese coste</th><td>{formatEuro(costResult.availableForTime!)} ÷ {costResult.totalHours} h</td><td>{formatEuro(costResult.availableHourlyRate!)}/h</td></tr>
              </tbody>
            </table>
          </div>
          <p>Mirar solo {formatEuro(costResult.proposedPrice!)} ÷ {costResult.totalHours} h da {formatEuro(costResult.effectiveHourlyRate!)}/h y parece superar los {formatEuro(costResult.hourlyRate)}/h. Tras cubrir el alquiler quedan {formatEuro(costResult.availableHourlyRate!)}/h. Faltan <strong>{formatEuro(-costResult.priceDifference!)}</strong> para la referencia total de {formatEuro(costResult.totalReferencePrice)} sin IVA.</p>
          <h3>Cómo elegir el coste sin contarlo dos veces</h3>
          <ul className="article-list">
            <li>Separa lo habitual de lo específico. La gestoría, la cuota o una licencia ya repartida entre tus gastos mensuales siguen cubiertas por la referencia por hora.</li>
            <li>Escribe solo el coste adicional que debe cubrir tu precio. Si el cliente contrata y paga el alquiler directamente, no lo sumes a tu precio ni lo restes después.</li>
            <li>Comprueba el tratamiento del IVA antes de elegir ese importe. La <a href="https://sede.agenciatributaria.gob.es/Sede/iva/que-iva-soportado-puedo-deducir.html">AEAT explica los requisitos de deducción del IVA soportado</a>; esta herramienta no determina qué parte puedes recuperar.</li>
          </ul>
          <p>Los {formatEuro(costResult.availableForTime!)} restantes aún deben cubrir tus gastos habituales, cuota y reserva fiscal: no son sueldo neto. Este plan tampoco comprueba cuándo se cobra o paga; para eso puedes usar el <Link href="/cuanto-cuesta-ser-autonomo#plan-caja">plan de caja de tres meses</Link>.</p>
          <Link href="#comprobar-jornada" className="text-link">Probar esta jornada con costes</Link>
        </div>
      </section>

      <section className="section" aria-labelledby="comprobar-jornada">
        <div className="container text-block">
          <span className="eyebrow">Tus horas y tu precio</span>
          <h2 id="comprobar-jornada">Comprueba una jornada antes de ofrecerla</h2>
          <p>Introduce una referencia por hora que incluya tus costes habituales. Si aún no la tienes, <Link href="/#calculadora">calcúlala con tu objetivo mensual</Link>. Indica cero si no hay costes específicos adicionales. El precio a comparar es opcional.</p>
          <DayRatePlanner example={dayRateExample} costExample={dayRateCostExample} />
        </div>
      </section>

      <section className="section" aria-labelledby="sin-duplicar-horas">
        <div className="container text-block">
          <h2 id="sin-duplicar-horas">Qué horas sumar y cuáles no repetir</h2>
          <ol className="article-list article-list-ordered">
            <li><strong>Usa la misma definición de hora.</strong> En el ejemplo, las 80 horas mensuales abarcan todo el trabajo específico de clientes, incluida preparación y cierre. El servicio consume 8 de esas horas, aunque la sesión dure 6.</li>
            <li><strong>Suma solo lo que queda fuera del bloque.</strong> Si vendes un día de 8 horas que ya incluye preparar, ejecutar y documentar, introduce 8 de jornada y 0 en los otros dos campos.</li>
            <li><strong>No sumes otra vez los tiempos generales.</strong> La administración de tu negocio, captación general y vacaciones ya reducen tu capacidad facturable en la estimación mensual. No son horas adicionales de este cliente.</li>
            <li><strong>Revisa cómo obtuviste tu tarifa.</strong> Si tu divisor mensual solo contaba horas de sesión y ya cubría el resto del trabajo mediante una tarifa mayor, reajusta esa base antes de añadir preparación. Mezclar ambos métodos puede duplicar su coste.</li>
          </ol>
          <p>Contrasta las estimaciones con el <Link href="/kit-tarifa-autonomo#registro-horas">registro de cuatro semanas del kit</Link>. Anota por separado sesión, preparación y cierre; clasifica cada hora una sola vez.</p>
        </div>
      </section>

      <section className="section alt" aria-labelledby="alcance-jornada">
        <div className="container text-block">
          <h2 id="alcance-jornada">Un precio necesita un alcance que puedas cumplir</h2>
          <p>Este borrador corresponde solo al primer ejemplo de {formatEuro(result.referencePrice)}, sin costes específicos adicionales. Si necesitas el alquiler del segundo caso, inclúyelo expresamente al revisar el precio y el alcance. Sustituye duración, entregable y condiciones antes de usarlo:</p>
          <blockquote className={styles.proposal}>
            <p>El servicio cuesta {formatEuro(result.referencePrice)} sin IVA e incluye hasta 6 horas de sesión, 1,5 horas de preparación previa y 0,5 horas para redactar y enviar un resumen de cierre. El entregable es ese resumen de los acuerdos y próximos pasos.</p>
            <p>No incluye nuevas sesiones, ejecución de los próximos pasos, soporte continuado ni desplazamientos. Cualquier ampliación se valora y acuerda antes de realizarla.</p>
          </blockquote>
          <p>Acuerda también fecha y horario, materiales que debe entregar el cliente, plazo del resumen, forma de pago y condiciones de cambio o cancelación. No des por hecho que este borrador las resuelve.</p>
          <h3>Si el precio no encaja</h3>
          <p>Comprueba primero si puedes reducir el entregable o el tiempo comprometido. Un precio que supera tu referencia puede seguir siendo insuficiente si aparecen horas o costes que no has contado. Reservar exclusividad o atender una urgencia son decisiones que debes valorar y explicar por separado.</p>
          <div className="guide-cta">
            <a href="https://www.cuantopresupuestar.es?utm_source=cuantofacturar&utm_medium=article-link&utm_campaign=tarifa_diaria" className="primary-button">Pasarlo a presupuesto</a>
            <a href="https://www.mantenimientowebmensual.es?utm_source=cuantofacturar&utm_medium=article-link&utm_campaign=tarifa_diaria" className="primary-button">Valorar cuota mensual</a>
          </div>
        </div>
      </section>

      <section className="section" id="faq-tarifa-diaria">
        <div className="container text-block">
          <h2>Dudas sobre la tarifa diaria</h2>
          <div className="faq-list">{pageFaqItems.map((item) => <article className="faq-item" key={item.question}><h3>{item.question}</h3><p>{item.answer}</p></article>)}</div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
