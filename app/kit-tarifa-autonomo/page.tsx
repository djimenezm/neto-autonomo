import type { Metadata } from 'next';
import Link from 'next/link';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ProjectReview from '@/components/ProjectReview';
import { formatCurrency, formatNumber } from '@/lib/format';
import { projectReviewExample, reviewProject } from '@/lib/projectReview';
import { workLogReview, workLogTotals, workLogWeeks } from '@/lib/workLogExample';
import { getSiteUrl, siteConfig } from '@/lib/site';
import styles from './kit.module.css';

const route = '/kit-tarifa-autonomo';
const title = 'Kit de tarifa para autónomos';
const description =
  'Ficha de tarifa, registro de cuatro semanas y comprobador de encargos terminados. Compara precio y horas reales, con ejemplos y descarga gratuita sin registro.';

const faqItems = [
  {
    question: '¿Qué incluye este kit de tarifa para autónomos?',
    answer:
      'Incluye una ficha de supuestos de tarifa, un registro diario y resumen de cuatro semanas, una revisión de las horas previstas, un comprobador de precio y tiempo de encargos terminados y las listas de comprobación y guion de precio.',
  },
  {
    question: '¿Necesito dejar mi correo para descargarlo?',
    answer:
      'No. Puedes leer la ficha completa y descargar el archivo de texto directamente desde esta página, sin cuenta ni correo.',
  },
  {
    question: '¿Cuatro semanas bastan para fijar mi tarifa definitiva?',
    answer:
      'Son una primera comprobación. Si hubo vacaciones, una entrega excepcional o pocos encargos, amplía el registro. No son una muestra que represente necesariamente todo el año ni una garantía de ventas.',
  },
  {
    question: '¿Se guardan aquí los datos de la ficha o del comprobador?',
    answer:
      'El sitio no recibe lo que escribas en tu copia descargada. Los valores del comprobador solo se mantienen en la memoria de la página mientras la uses: no se envían, no se guardan ni se añaden al enlace.',
  },
  {
    question: '¿El ingreso por hora de un encargo es beneficio neto?',
    answer:
      'No. Es el precio final pactado sin IVA dividido entre las horas dedicadas. No descuenta gastos, cuota ni impuestos, ni acredita que hayas cobrado. Compáralo con tu referencia por hora y revisa aparte los costes extraordinarios que no estén incluidos en ella.',
  },
] as const;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: route,
  },
  keywords: [
    'kit tarifa autónomo',
    'lista de comprobación tarifa freelance',
    'plantilla tarifa autónomo',
    'como revisar tarifa autónomo',
    'recurso para calcular tarifa freelance',
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

export default function KitTarifaAutonomoPage() {
  const siteUrl = getSiteUrl();
  const pageUrl = new URL(route, siteUrl).toString();
  const downloadUrl = '/recursos/kit-tarifa-autonomo.txt';
  const downloadText = readFileSync(join(process.cwd(), 'public', 'recursos', 'kit-tarifa-autonomo.txt'), 'utf8');
  const example = reviewProject(projectReviewExample);

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
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <main id="contenido-principal" className={styles.kit}>
      {[
        ['kit-tarifa-article-schema', articleSchema],
        ['kit-tarifa-breadcrumb-schema', breadcrumbSchema],
        ['kit-tarifa-faq-schema', faqSchema],
      ].map(([id, schema]) => (
        <script key={String(id)} id={String(id)} type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      ))}
      <Header />
      <section className="hero">
        <div className="container article-layout">
          <div className="text-block">
            <span className="eyebrow">Ficha gratuita para usar</span>
            <h1>Kit de tarifa para autónomos</h1>
            <p className="lead">
              Guarda los supuestos de tu tarifa y registra cuatro semanas de trabajo para
              contrastar las horas que esperabas facturar. Revisa también cuánto ingreso por hora
              deja un encargo terminado. Puedes usar el comprobador y descargar la ficha sin cuenta ni correo.
            </p>
            <div className="guide-cta">
              <a href={downloadUrl} className="primary-button" download>Descargar ficha y registro en texto</a>
              <Link href="#registro-horas" className={styles.heroLink}>Ver cómo usar el registro</Link>
            </div>
          </div>
          <aside className="feature-card article-summary">
            <h2>Qué te llevas</h2>
            <ul className="article-list">
              <li>Una ficha para conservar los datos y el resultado de tu cálculo.</li>
              <li>Un registro diario y resumen de cuatro semanas.</li>
              <li>Una revisión de horas previstas frente al trabajo registrado.</li>
              <li>Un comprobador de precio y horas reales por encargo.</li>
              <li>Listas de comprobación y un guion para explicar el precio.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section" aria-labelledby="ficha-tarifa">
        <div className="container text-block">
          <h2 id="ficha-tarifa">1. Conserva tu punto de partida</h2>
          <p>
            En tu copia de la ficha anota el neto objetivo, gastos deducibles y no deducibles,
            cuota, modo de IRPF y reserva estimada. Añade las horas facturables, las semanas
            sin actividad y la facturación sin IVA y tarifa por hora que muestra la calculadora.
          </p>
          <p>
            Guarda también la fecha y, si quieres, el enlace al cálculo. Cuando cambies un supuesto,
            conserva la ficha anterior: así sabrás si la diferencia viene de los costes, de las
            horas o del objetivo, en lugar de comparar cifras sin contexto.
          </p>
          <details className={styles.preview}>
            <summary>Leer la ficha completa antes de descargarla</summary>
            <div className={styles.previewScroll} role="region" aria-label="Ficha completa en texto" tabIndex={0}>
              <pre>{downloadText}</pre>
            </div>
          </details>
          <p>La vista previa y la descarga contienen la misma ficha. Puedes editar el archivo con un editor de texto o imprimirlo.</p>
          <Link href="/#calculadora" className="primary-button">Obtener mi referencia de tarifa</Link>
        </div>
      </section>

      <section className="section alt" aria-labelledby="registro-horas">
        <div className="container text-block">
          <h2 id="registro-horas">2. Registra qué ocupa tus semanas</h2>
          <p>
            Cada día reparte el trabajo entre encargos cobrables, gestión, captación y formación u
            otras tareas internas. Cuenta cada hora una sola vez. Una reunión incluida en un encargo
            aceptado no debe aparecer también como gestión.
          </p>
          <p>
            Anota aparte los huecos sin encargo, las ausencias y las revisiones que has asumido sin
            cobrar. El registro de trabajo no es un registro de cobros: una factura puede pagarse
            en otro momento. Copia el bloque diario para cada semana y suma las columnas al terminar.
          </p>
          <h3>Ejemplo ficticio: cuatro semanas de 40 horas</h3>
          <p>
            Las cifras siguientes están inventadas para explicar cómo usar la ficha. No son datos
            de usuarios, una media del sector ni una recomendación de jornada.
          </p>
          <div className="scenario-table-scroll" role="region" aria-label="Ejemplo ficticio de registro de horas" tabIndex={0}>
            <table className="scenario-table">
              <caption>Horas trabajadas; cada hora se cuenta en una sola columna.</caption>
              <thead>
                <tr>
                  <th scope="col">Semana</th><th scope="col">Cobrables</th><th scope="col">Gestión</th>
                  <th scope="col">Captación</th><th scope="col">Formación/otros</th><th scope="col">Total</th>
                </tr>
              </thead>
              <tbody>
                {workLogWeeks.map((week) => (
                  <tr key={week.label}>
                    <th scope="row">{week.label}</th><td>{week.clientWork}</td><td>{week.administration}</td>
                    <td>{week.sales}</td><td>{week.learning}</td><td>{week.total}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row">Total registrado</th><td>{workLogTotals.clientWork}</td>
                  <td>{workLogTotals.administration}</td><td>{workLogTotals.sales}</td>
                  <td>{workLogTotals.learning}</td><td>{workLogTotals.total}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p>
            En este caso, {workLogTotals.clientWork} h cobrables entre {workLogWeeks.length} semanas
            dan <strong>{workLogReview.averageClientHours} h cobrables por semana</strong>.
            Las otras {workLogTotals.total - workLogTotals.clientWork} h también son trabajo,
            aunque no generen una factura directa.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="revisar-horas">
        <div className="container text-block">
          <h2 id="revisar-horas">3. Contrasta las horas antes de cambiar la tarifa</h2>
          <p>
            El caso ficticio partía de {workLogReview.before.weeklyBillableHours} h facturables
            por semana y {workLogReview.weeksOff} semanas sin actividad al año:
            {' '}{formatNumber(workLogReview.before.monthlyBillableHours, 1)} h/mes de capacidad media.
            Si esas cuatro semanas de {workLogReview.averageClientHours} h fueran representativas,
            la misma cuenta daría {workLogReview.averageClientHours} × {workLogReview.after.activeWeeks}
            {' '}÷ 12 = <strong>{workLogReview.after.monthlyBillableHours} h/mes</strong>.
          </p>
          <div className={styles.exampleNote}>
            No copies esas {workLogReview.after.hoursToApply} horas como tu previsión. Son la salida
            de un ejemplo. Cuatro semanas con una entrega excepcional, vacaciones o pocos encargos
            pueden no representar tu actividad anual. Amplía el registro y anota qué cambia.
          </div>
          <p>
            Con tus propios datos, revisa el campo de horas de la calculadora. Si prevés vender menos
            horas que la capacidad estimada, usa la cifra menor. Conserva los otros supuestos si quieres
            observar solo el efecto de cambiar las horas; guarda después la fecha y el nuevo cálculo.
          </p>
          <div className="guide-cta">
            <Link href="/#calculadora" className="primary-button">Recalcular con mis datos</Link>
            <Link href="/horas-facturables-freelance" className="text-link">Ver el método de horas y semanas sin actividad</Link>
          </div>
        </div>
      </section>

      <section className="section alt" aria-labelledby="revision-encargo">
        <div className="container text-block">
          <h2 id="revision-encargo">4. Revisa un encargo terminado: precio y horas reales</h2>
          <p>
            Conservar una tarifa de referencia no basta si un encargo termina llevando más tiempo.
            Anota el precio final pactado sin IVA, las horas previstas al presupuestar y las horas
            reales de preparación, reuniones, ejecución, revisiones y cierre. Incluye el tiempo
            específico del cliente aunque no lo hayas cobrado aparte, contando cada hora una vez.
          </p>
          <h3>Ejemplo ficticio: el mismo precio, cuatro horas más</h3>
          {example.valid ? (
            <>
              <p>
                Imagina una referencia propia de {formatCurrency(example.hourlyReference)}/h y
                un precio cerrado de {formatCurrency(example.finalPrice)} sin IVA. Se previeron
                {' '}{formatNumber(example.plannedHours)} h y se registraron {formatNumber(example.actualHours)} h.
                Son cifras inventadas para explicar la cuenta, no una tarifa de mercado.
              </p>
              <div className="scenario-table-scroll" role="region" aria-label="Ejemplo ficticio de revisión de encargo" tabIndex={0}>
                <table className="scenario-table">
                  <caption>Un precio de 400 € sin IVA antes y después de registrar el tiempo.</caption>
                  <thead><tr><th scope="col">Dato</th><th scope="col">Al presupuestar</th><th scope="col">Al terminar</th></tr></thead>
                  <tbody>
                    <tr><th scope="row">Tiempo dedicado</th><td>{formatNumber(example.plannedHours)} h</td><td>{formatNumber(example.actualHours)} h</td></tr>
                    <tr><th scope="row">Precio ÷ horas</th><td>{formatCurrency(example.plannedHourlyRevenue)}/h</td><td>{formatCurrency(example.actualHourlyRevenue)}/h</td></tr>
                  </tbody>
                </table>
              </div>
              <p>
                El encargo ocupó {formatNumber(example.hoursDifference)} h más de lo previsto.
                A {formatCurrency(example.hourlyReference)}/h, el precio cubría {formatNumber(example.hoursAtReference)} h.
                Para {formatNumber(example.actualHours)} h, esa referencia da {formatCurrency(example.actualReferencePrice)}:
                {' '}el precio pactado queda {formatCurrency(-example.priceDifference)} por debajo.
                Eso ayuda a revisar el próximo presupuesto; no modifica el acuerdo ya cerrado.
              </p>
            </>
          ) : null}
          <div className={styles.exampleNote}>
            Precio dividido entre horas es ingreso por hora dedicada, antes de gastos, cuota e
            impuestos. No es beneficio neto ni confirma el cobro de la factura. Los costes
            extraordinarios del encargo que no estén en tu referencia se revisan aparte.
          </div>
          <ProjectReview />
          <p>
            Guarda la revisión en la ficha descargable. Anota la causa concreta de las horas
            adicionales, como dos reuniones no previstas o una ronda extra de cambios. Decide
            qué estimación, alcance o revisiones incluidas vas a concretar en el siguiente presupuesto.
            Si terminaste antes, registra también qué ayudó: una sola entrega no representa todos tus encargos.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="aplicar-revision">
        <div className="container text-block">
          <h2 id="aplicar-revision">5. Escribe qué vas a concretar en el siguiente encargo</h2>
          <p>
            La ficha termina con una decisión y su motivo: qué dato has cambiado, qué has observado
            y cuándo lo revisarás. Puedes concretar revisiones incluidas, trabajo adicional,
            preparación o seguimiento antes de enviar otro presupuesto.
          </p>
          <p>
            Mantiene las listas de comprobación y un guion de precio para adaptar a tu servicio.
            No es un contrato ni añade un margen comercial automáticamente. Si la duda está en el
            resultado, consulta el <Link href="/tarifa-freelance-por-hora#ejemplo-tarifa">desglose de facturación y neto</Link>.
          </p>
          <p className="scenario-note">
            Responsable del sitio: <Link href="/aviso-legal">{siteConfig.ownerName}</Link>.
            {' '}Método: ficha de trabajo propia con ejemplo hipotético, no un estudio de mercado.
            {' '}Actualizado el <time dateTime="2026-10-27">27 de octubre de 2026</time>.
          </p>
        </div>
      </section>

      <section className="section alt" aria-labelledby="kit-tarifa-faq-title">
        <div className="container text-block">
          <h2 id="kit-tarifa-faq-title">Preguntas frecuentes sobre el kit</h2>
          <div className="faq-list">
            {faqItems.map((item) => (
              <article className="faq-item" key={item.question}><h3>{item.question}</h3><p>{item.answer}</p></article>
            ))}
          </div>
          <div className="guide-cta">
            <a href={downloadUrl} className="primary-button" download>Descargar la ficha completa</a>
            <Link href="#ficha-tarifa" className="text-link">Volver al punto de partida</Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
