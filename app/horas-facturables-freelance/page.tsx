import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LeadMagnetForm from '@/components/LeadMagnetForm';
import { availableMonthlyHours, billableHoursExamples, monthlyBillingExample } from '@/lib/billableHoursExamples';
import { estimateBillableHours, exampleHoursPlan } from '@/lib/billableHoursPlan';
import { formatCurrency, formatNumber } from '@/lib/format';
import { getSiteUrl, siteConfig } from '@/lib/site';

const route = '/horas-facturables-freelance';
const title = 'Horas facturables freelance: cuántas puedes vender al mes';
const description =
  'Estima tus horas facturables con tu jornada, gestión y semanas sin actividad. Incluye una cuenta anual paso a paso y una ayuda para aplicarla a tu tarifa.';

const annualExample = (() => {
  const result = estimateBillableHours(exampleHoursPlan);
  if (!result.valid) throw new Error('El ejemplo de agenda anual debe ser válido.');
  return result;
})();

const pageFaqItems = [
  {
    question: '¿Cómo incluyo las vacaciones en mis horas facturables?',
    answer:
      'Resta de 52 semanas las semanas sin actividad. Multiplica las semanas activas por las horas facturables de una semana de trabajo y divide entre 12 meses. Es una media anual de capacidad; si prevés vender menos horas, usa esa cifra menor.',
  },
  {
    question: '¿Cuántas horas facturables tiene un freelance al mes?',
    answer:
      'No existe una cifra universal. Resta de tu disponibilidad mensual la gestión, la captación, la formación y una reserva para imprevistos, sin contar dos veces la misma tarea. Los ejemplos de esta guía son agendas hipotéticas, no medias del sector.',
  },
  {
    question: '¿Por qué no puedo contar todas mis horas de trabajo?',
    answer:
      'Porque no todas generan factura directa. Hay tiempo comercial, administrativo, formación, coordinación, soporte, propuestas y seguimiento que sostiene el negocio aunque no aparezca como una línea facturada.',
  },
  {
    question: '¿Cómo afectan las horas facturables a mi tarifa?',
    answer:
      'Cuantas menos horas facturables reales tengas, más alta debe ser tu tarifa para sostener el mismo objetivo mensual. Por eso estimarlas mal puede hacer que cobres por debajo de tu suelo.',
  },
] as const;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: route,
  },
  keywords: [
    'horas facturables freelance',
    'horas facturables autónomo',
    'cuantas horas facturables al mes',
    'calcular horas facturables freelance',
    'tarifa freelance horas facturables',
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

export default function HorasFacturablesFreelancePage() {
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
    accountablePerson: { '@type': 'Person', name: siteConfig.ownerName },
    datePublished: '2026-04-27',
    dateModified: '2026-10-26',
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
    <main id="contenido-principal">
      <script
        id="horas-facturables-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema).replace(/</g, '\\u003c') }}
      />
      <script
        id="horas-facturables-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }}
      />
      <script
        id="horas-facturables-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
      />

      <Header />

      <section className="hero">
        <div className="container article-layout">
          <div className="text-block">
            <span className="eyebrow">Base de cálculo</span>
            <h1>Horas facturables freelance: cuántas puedes vender al mes</h1>
            <p className="lead">
              Tu tarifa no se calcula dividiendo tu objetivo mensual entre todas las horas que
              trabajas. Se calcula sobre las horas que realmente puedes facturar: sobreestimarlas
              puede dejarte una tarifa insuficiente para cubrir tu actividad.
            </p>
            <div className="hero-badges" aria-label="Qué cubre esta guía">
              <span className="hero-badge">Horas vendibles</span>
              <span className="hero-badge">Trabajo invisible</span>
              <span className="hero-badge">Tarifa por hora</span>
            </div>
            <div className="guide-cta">
              <Link href="/#calculadora" className="primary-button">
                Estimar mis horas en la calculadora
              </Link>
              <Link href="/tarifa-freelance-por-hora" className="primary-button">
                Ver tarifa por hora
              </Link>
            </div>
          </div>

          <aside className="feature-card article-summary">
            <h2>Resumen rápido</h2>
            <ul className="article-list">
              <li>No todas tus horas de trabajo son horas facturables.</li>
              <li>Ventas, gestión, propuestas y soporte también consumen agenda.</li>
              <li>Menos horas facturables implican una tarifa mínima más alta.</li>
              <li>La estimación debe ser prudente si quieres sostener margen.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>Qué son las horas facturables</h2>
          <p>
            Las horas facturables son las horas que puedes cobrar directamente a un cliente. Pueden
            aparecer como trabajo por hora, estar dentro de un presupuesto cerrado o formar parte de
            una cuota mensual, pero tienen algo en común: generan ingresos directos.
          </p>
          <p>
            El resto de horas también son necesarias, aunque no siempre se facturen. Preparar
            presupuestos, responder correos, hacer seguimiento comercial, ordenar facturas, aprender,
            revisar procesos o gestionar la agenda sostiene el negocio, pero no debería contarse como
            tiempo vendible.
          </p>
          <div className="disclaimer-box">
            <strong>Idea clave:</strong> si divides tu objetivo mensual entre demasiadas horas,
            obtendrás una tarifa artificialmente baja.
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container feature-grid" aria-label="Tipos de horas en un negocio freelance">
          <article className="feature-card">
            <h2>Horas facturables</h2>
            <p>
              Producción, consultoría, soporte contratado, reuniones incluidas en un proyecto o
              entregables que forman parte de una propuesta aceptada.
            </p>
          </article>

          <article className="feature-card">
            <h2>Horas no facturables</h2>
            <p>
              Administración, ventas, propuestas, seguimiento, formación, reuniones exploratorias,
              investigación interna y mejora de procesos.
            </p>
          </article>

          <article className="feature-card">
            <h2>Horas de margen</h2>
            <p>
              Espacio para imprevistos, descanso y huecos entre proyectos. Es tiempo que reservas,
              no una tarea adicional que debas restar de nuevo si ya la has contado.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container article-layout">
          <div className="text-block">
            <h2>Cómo estimar tus horas facturables mensuales</h2>
            <ol className="article-list article-list-ordered">
              <li>Multiplica tus días de trabajo por las horas de cada día: esa es tu jornada semanal.</li>
              <li>Resta las horas semanales de gestión, captación, formación y reserva para huecos.</li>
              <li>Resta de 52 semanas las semanas sin actividad por vacaciones, festivos y otras ausencias.</li>
              <li>Multiplica las horas facturables semanales por las semanas activas y divide entre 12 meses.</li>
              <li>Si prevés contratar menos horas que esa capacidad, usa la cifra menor para tu tarifa.</li>
            </ol>
            <p>
              Usamos 52 semanas como aproximación de planificación, no un calendario laboral.
              Convierte festivos y días sueltos en fracciones de tu semana habitual. Una reunión
              incluida en un proyecto ya puede estar dentro de sus horas facturables; no la restes
              también como gestión.
            </p>
          </div>

          <aside className="feature-card article-summary">
            <h2>La fórmula de tu agenda</h2>
            <p>(52 − semanas sin actividad) × (horas de trabajo semanales − horas no facturables semanales) ÷ 12.</p>
            <ul className="article-list">
              <li>Clasifica cada hora una sola vez.</li>
              <li>Contrasta la estimación con tu registro de varias semanas.</li>
              <li>Separa capacidad disponible de trabajo realmente contratado.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section alt" aria-labelledby="agenda-anual-title">
        <div className="container text-block">
          <h2 id="agenda-anual-title">Un mes de trabajo no representa todo el año</h2>
          <p>
            Ejemplo hipotético: {exampleHoursPlan.daysPerWeek} días × {exampleHoursPlan.hoursPerDay} h
            {' '}= {annualExample.weeklyWorkHours} h de trabajo por semana. Tras restar
            {' '}{exampleHoursPlan.nonBillableHoursPerWeek} h de gestión, captación y otras tareas,
            quedan {annualExample.weeklyBillableHours} h facturables por semana activa.
          </p>
          <p>
            Con {exampleHoursPlan.weeksOff} semanas sin actividad:
            {' '}({52} − {exampleHoursPlan.weeksOff}) × {annualExample.weeklyBillableHours}
            {' '}= {formatNumber(annualExample.annualBillableHours)} h al año. Al repartirlas entre
            {' '}12 meses, la capacidad media es <strong>{formatNumber(annualExample.monthlyBillableHours, 1)} h/mes</strong>.
            {' '}La ayuda de la calculadora aplica {annualExample.hoursToApply} h, redondeando hacia abajo.
          </p>
          <div className="disclaimer-box">
            Esta media permite planificar un objetivo durante los 12 meses, también cuando no
            trabajas. No garantiza vender esas horas ni tener ingresos cada mes. Si tienes temporadas
            sin clientes, reduce tu previsión y planifica aparte cuándo cobrarás.
          </div>
          <p>
            En la <Link href="/#calculadora">calculadora de tarifa</Link>, abre «Estimar mis horas
            con mi agenda» junto al campo de horas. Puedes aplicar tu estimación sin perder el resto
            de tus datos.
          </p>
          <h3>Contrasta la estimación con cuatro semanas de trabajo</h3>
          <p>
            Anota cada día las horas dedicadas a encargos cobrables y, por separado, a gestión,
            captación, formación y huecos. Compara esa semana real con la que has previsto. Si las
            tareas internas ocupan más o no consigues vender toda la capacidad, baja tus horas
            facturables antes de fijar el siguiente precio. Cuatro semanas son una primera
            comprobación, no una muestra que represente todo el año.
          </p>
        </div>
      </section>

      <section className="section alt" aria-labelledby="agendas-title">
        <div className="container text-block">
          <h2 id="agendas-title">Tres agendas, no una media del sector</h2>
          <p>
            Estos casos son inventados para mostrar la resta. No proceden de una encuesta ni
            describen la productividad esperable de un profesional. Todas las cifras de la tabla
            son horas de un mes activo de 20 días, no medias anuales que incluyan vacaciones;
            sustituye cada partida por tus propios datos.
          </p>
          <div className="scenario-table-scroll" role="region" aria-label="Ejemplos de agendas mensuales" tabIndex={0}>
            <table className="scenario-table">
              <caption>Disponibilidad de partida: {availableMonthlyHours} h (20 días × 8 h).</caption>
              <thead>
                <tr>
                  <th scope="col">Agenda hipotética</th>
                  <th scope="col">Gestión</th>
                  <th scope="col">Captación</th>
                  <th scope="col">Formación</th>
                  <th scope="col">Reserva</th>
                  <th scope="col">Facturables</th>
                </tr>
              </thead>
              <tbody>
                {billableHoursExamples.map((agenda) => (
                  <tr key={agenda.name}>
                    <th scope="row">{agenda.name}</th>
                    <td>{agenda.administration}</td>
                    <td>{agenda.sales}</td>
                    <td>{agenda.learning}</td>
                    <td>{agenda.reserve}</td>
                    <td><strong>{agenda.billableHours}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h2>Mismo objetivo, distinta disponibilidad</h2>
          <p>
            Supongamos que ya has estimado una facturación necesaria de{' '}
            {formatCurrency(monthlyBillingExample)} al mes sin IVA. No es un sueldo neto: ese
            objetivo debe cubrir previamente tus costes, cuota e impuestos. La referencia por
            hora es ese importe dividido entre las horas facturables de cada agenda.
          </p>
          <div className="feature-grid" aria-label="Comparativa de horas facturables">
            {billableHoursExamples.map((agenda) => (
              <article className="feature-card" key={agenda.name}>
                <h3>{agenda.billableHours} horas facturables</h3>
                <p>{formatCurrency(monthlyBillingExample)} ÷ {agenda.billableHours} h</p>
                <p><strong>{formatCurrency(agenda.hourlyRate)}/h sin IVA</strong></p>
              </article>
            ))}
          </div>
          <p className="scenario-note">
            Es una referencia de cobertura, no un precio de mercado ni una garantía de que
            conseguirás vender todas esas horas. Para estimar primero tu objetivo mensual,
            consulta <Link href="/cuanto-facturar-autonomo">cómo calcular cuánto facturar</Link>.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>Cómo usar este dato en la calculadora</h2>
          <p>
            En la calculadora, el campo de horas facturables es uno de los más importantes. Si lo
            ajustas bien, la tarifa por hora resultante será mucho más útil para presupuestos,
            jornadas, bolsas de horas o proyectos cerrados.
          </p>
          <p>
            Si después quieres convertir esa referencia a un formato distinto, puedes revisar la{' '}
            <Link href="/tarifa-freelance-por-hora">guía de tarifa freelance por hora</Link> o la{' '}
            <Link href="/tarifa-diaria-freelance">guía de tarifa diaria freelance</Link>.
          </p>
          <div className="guide-cta">
            <Link href="/#calculadora" className="primary-button">
              Calcular con mis horas reales
            </Link>
            <Link href="/tabla-cuanto-facturar-autonomo" className="primary-button">
              Ver tabla de objetivos
            </Link>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <LeadMagnetForm
            source="horas-facturables-freelance"
            title="Llévate el kit para revisar tu tarifa con horas reales"
            description="Recibe una guía rápida para revisar mínimos, margen, horas facturables y señales de que una tarifa se queda corta antes de enviar una propuesta."
            buttonLabel="Quiero revisar mi tarifa"
          />
        </div>
      </section>

      <section className="section" id="faq-horas-facturables">
        <div className="container text-block">
          <span className="eyebrow">Preguntas frecuentes</span>
          <h2>Dudas habituales sobre horas facturables freelance</h2>
          <p className="scenario-note">
            Responsable del sitio: <Link href="/aviso-legal">{siteConfig.ownerName}</Link>.
            {' '}Método: ejemplos aritméticos propios con supuestos explícitos, no un estudio
            de mercado. Actualizada el <time dateTime="2026-10-26">26 de octubre de 2026</time>.
          </p>
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
