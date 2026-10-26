import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import DayRatePlanner from '@/components/DayRatePlanner';
import { dayRateExample, dayRateExampleResult, dayRateMonthlyExample } from '@/lib/dayRateExample';
import { exampleAssumptions, formatEuro, getExampleUrl } from '@/lib/scenarioExamples';
import { getSiteUrl, siteConfig } from '@/lib/site';
import styles from './dailyRate.module.css';

const route = '/tarifa-diaria-freelance';
const title = 'Tarifa diaria freelance: calcula la jornada completa';
const description = 'Comprueba cuánto cobrar por una jornada freelance sumando sesión, preparación y cierre. Ejemplo reproducible, comparación de precios y propuesta con alcance definido.';

const pageFaqItems = [
  {
    question: '¿Cómo calculo mi tarifa diaria freelance?',
    answer: 'Multiplica tu referencia por hora sin IVA por todo el tiempo específico del servicio: jornada con el cliente, preparación y cierre. Cuenta cada hora una sola vez. Después revisa el alcance, los gastos extraordinarios y las condiciones que esa cuenta no incluye.',
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
  if (!result.valid) throw new Error('Invalid editorial day-rate example');
  const schemas = [
    {
      '@context': 'https://schema.org', '@type': 'Article', headline: title, description,
      inLanguage: 'es', mainEntityOfPage: pageUrl,
      author: { '@type': 'Organization', name: siteConfig.name },
      publisher: { '@type': 'Organization', name: siteConfig.name },
      accountablePerson: { '@type': 'Person', name: siteConfig.ownerName },
      datePublished: '2026-04-27', dateModified: '2026-10-26',
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
          <p className="article-meta">Actualizada el <time dateTime="2026-10-26">26 de octubre de 2026</time>. Responsable del contenido: {siteConfig.ownerName}.</p>
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
          <p>Esta cuenta no añade IVA, retenciones ni otros gastos del encargo. Tampoco convierte el precio en beneficio neto.</p>
          <div className="guide-cta"><Link href={getExampleUrl(2000)} className="primary-button">Reproducir la base mensual en la calculadora</Link></div>
        </div>
      </section>

      <section className="section alt" aria-labelledby="comprobar-jornada">
        <div className="container text-block">
          <span className="eyebrow">Tus horas y tu precio</span>
          <h2 id="comprobar-jornada">Comprueba una jornada antes de ofrecerla</h2>
          <p>Introduce una referencia por hora que incluya tus costes habituales. Si aún no la tienes, <Link href="/#calculadora">calcúlala con tu objetivo mensual</Link>. Puedes contrastar también un precio que ya estés valorando.</p>
          <DayRatePlanner example={dayRateExample} />
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
          <p>Este borrador corresponde solo al ejemplo de {formatEuro(result.referencePrice)}. Sustituye duración, entregable y condiciones antes de usarlo:</p>
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
