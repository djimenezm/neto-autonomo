import type { Metadata } from 'next';
import Link from 'next/link';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { formatNumber } from '@/lib/format';
import { workLogReview, workLogTotals, workLogWeeks } from '@/lib/workLogExample';
import { getSiteUrl, siteConfig } from '@/lib/site';
import styles from './kit.module.css';

const route = '/kit-tarifa-autonomo';
const title = 'Kit de tarifa para autónomos';
const description =
  'Ficha de tarifa y registro de cuatro semanas para contrastar tus horas facturables. Descarga gratuita en texto, sin registro, con un ejemplo explicado y lista de comprobación.';

const faqItems = [
  {
    question: '¿Qué incluye este kit de tarifa para autónomos?',
    answer:
      'Incluye una ficha de supuestos de tarifa, un registro diario y resumen de cuatro semanas, una revisión de las horas previstas y las listas de comprobación y guion de precio.',
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
    question: '¿Se guardan aquí los datos que escriba en la ficha?',
    answer:
      'La ficha es un archivo de texto para editar o imprimir. El sitio no recibe el contenido que escribas en tu copia descargada.',
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
    dateModified: '2026-10-26',
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
              contrastar las horas que esperabas facturar. Descarga la ficha y rellena tu copia;
              puedes usarla sin cuenta ni correo.
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

      <section className="section alt" aria-labelledby="aplicar-revision">
        <div className="container text-block">
          <h2 id="aplicar-revision">4. Escribe qué vas a concretar en el siguiente encargo</h2>
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
            {' '}Actualizado el <time dateTime="2026-10-26">26 de octubre de 2026</time>.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="kit-tarifa-faq-title">
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
