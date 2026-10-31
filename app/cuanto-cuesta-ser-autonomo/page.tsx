import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import MonthlyCostCalculator from '@/components/MonthlyCostCalculator';
import CashFlowPlanner from '@/components/CashFlowPlanner';
import CashDatePlanner from '@/components/CashDatePlanner';
import { cashDatesExampleResult, formatCashDate } from '@/lib/cashDates';
import { cashPlanExampleResult, delayedCashPlanExampleResult, cashPlanSource } from '@/lib/cashPlan';
import { estimateRecurringCosts, recurringCostsExample } from '@/lib/recurringCosts';
import { formatCurrency, formatNumber } from '@/lib/format';
import { getSiteUrl, siteConfig } from '@/lib/site';
import styles from './costGuide.module.css';

const route = '/cuanto-cuesta-ser-autonomo';
const title = 'Cuánto cuesta ser autónomo cada mes';
const description =
  'Calcula costes mensuales y planifica cobros y pagos por fecha. Detecta déficits intermedios y guarda el plan en un archivo para volver a revisarlo.';

const costExample = estimateRecurringCosts(recurringCostsExample);
const faqItems = [
  { question: '¿Qué importe pongo si pago una herramienta una vez al año?', answer: 'Escribe el importe de ese pago y elige «Una vez al año». La calculadora lo suma una sola vez al coste anual y divide el total anual entre 12 para obtener una media mensual. No lo vuelvas a añadir en otros gastos.' },
  { question: '¿La media mensual coincide con lo que sale de mi cuenta cada mes?', answer: 'No necesariamente. Un pago anual de 420 EUR equivale a 35 EUR al mes para planificar la tarifa, pero se paga según su vencimiento. La calculadora de costes no conoce los cargos ni aparta dinero. El plan de caja de esta página compara por separado los cobros y pagos que introduzcas para tres meses.' },
  { question: '¿Se traslada la cuota dos veces a la calculadora de tarifa?', answer: 'No. La cuota mensual viaja por separado. El resto se divide entre gastos deducibles y costes no deducibles con el importe que tú indiques. Cambiar la frecuencia no determina que un gasto se pueda deducir.' },
  { question: '¿Este reparto mensual sirve para presentar impuestos?', answer: 'No. Es una ayuda de planificación para un año completo con pagos constantes. No calcula IVA soportado, deducibilidad ni el periodo de imputación de un gasto. Si has empezado a mitad de año o esperas cambios, revisa esos supuestos por separado.' },
  { question: '¿Un cierre positivo garantiza que podré pagar todo el mes?', answer: 'No. El plan suma los cobros y resta los pagos de cada mes, pero no conoce su orden dentro de ese mes. Puedes tener un déficit antes de cobrar aunque el cierre sea positivo. El aporte adicional mostrado solo evita saldos negativos al inicio y en los cierres calculados; no garantiza cada vencimiento ni es un fondo de emergencia recomendado.' },
  { question: '¿Cómo compruebo el orden de los cobros y pagos por fecha?', answer: 'Introduce el saldo anterior al primer movimiento y las fechas, tipos e importes de los movimientos previstos. Se agrupan por fecha y se ordenan cronológicamente. En una misma fecha se suponen todos los pagos antes de cualquier cobro. Es un supuesto prudente, no el orden bancario real; revisa las fechas de abono, los movimientos omitidos y los cobros que puedan retrasarse.' },
  { question: '¿Puedo guardar el plan de caja y abrirlo otro día?', answer: 'Sí. Comprueba los vencimientos y usa «Guardar este plan en un archivo». La copia contiene el saldo y los movimientos introducidos. Otro día puedes elegirla en «Abrir un plan guardado»: si es válida, sustituye los datos actuales y calcula los saldos de nuevo. El archivo se lee en el navegador, sin enviarlo al servidor. El plan no se guarda automáticamente al salir.' },
] as const;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: route,
  },
  keywords: [
    'cuánto cuesta ser autónomo',
    'calculadora coste autónomo',
    'coste autónomo españa',
    'gastos mensuales autónomo',
    'costes fijos freelance',
  ],
  openGraph: {
    title: `${title} | ${siteConfig.name}`,
    description,
    url: route,
    type: 'website',
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

export default function CuantoCuestaSerAutonomoPage() {
  if (!costExample.valid) throw new Error('Invalid editorial recurring-cost example');
  const cashExample = cashPlanExampleResult;
  const delayedCash = delayedCashPlanExampleResult;
  const datedCash = cashDatesExampleResult;
  if (!cashExample.valid || !delayedCash.valid || !datedCash.valid) throw new Error('Invalid editorial cash-plan example');
  const siteUrl = getSiteUrl();
  const pageUrl = new URL(route, siteUrl).toString();

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    inLanguage: 'es',
    url: pageUrl,
    dateModified: '2026-10-31',
    accountablePerson: { '@type': 'Person', name: siteConfig.ownerName },
    mainEntity: {
      '@type': 'SoftwareApplication',
      name: 'Calculadora de coste autónomo',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EUR',
      },
    },
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
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
  };

  return (
    <main id="contenido-principal" className={`cost-landing ${styles.guide}`}>
      <script
        id="cuanto-cuesta-ser-autonomo-webpage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema).replace(/</g, '\\u003c') }}
      />
      <script
        id="cuanto-cuesta-ser-autonomo-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }} />
      <Header />

      <section className="cost-hero" aria-labelledby="cost-hero-title">
        <Image
          src="/images/cost-hero-autonomo.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="cost-hero-image"
        />
        <div className="cost-hero-scrim" />
        <div className="container cost-hero-content">
          <span className="cost-hero-kicker">Calculadora para autónomos</span>
          <h1 id="cost-hero-title">¿Cuánto cuesta ser autónomo?</h1>
          <p>
            Reúne tus pagos mensuales, trimestrales y anuales antes de pensar en tu sueldo.
            Verás su media mensual y cuánto pesan sobre tus horas facturables.
          </p>

          <div className="cost-hero-actions">
            <a href="#costes-mensuales" className="primary-button">
              Calcular mis costes
            </a>
            <a href="#que-incluye" className="cost-ghost-button">
              Ver qué incluye
            </a>
          </div>
        </div>
      </section>

      <section className="cost-calculator-band" aria-labelledby="cost-calculator-heading">
        <div className="container cost-calculator-shell">
          <div className="cost-calculator-copy">
            <span className="eyebrow">Primero, el coste de existir</span>
            <h2 id="cost-calculator-heading">Tu actividad tiene un suelo mensual.</h2>
            <p>
              El ejemplo combina varias frecuencias de pago. Ajusta importes y frecuencias a tu
              actividad; no necesitas convertir a mano un recibo anual en mensual.
            </p>
          </div>

          <MonthlyCostCalculator />
        </div>
      </section>

      <section className="cost-mini-strip" aria-label="Alcance del cálculo">
        <div className="container cost-mini-strip-inner">
          <strong>Coste de actividad ≠ facturación necesaria</strong>
          <p>Para fijar tu precio todavía faltan el neto que buscas y los impuestos.</p>
        </div>
      </section>

      <section className="section" aria-labelledby="ejemplo-costes">
        <div className="container text-block">
          <p className="article-meta">Actualizada el <time dateTime="2026-10-31">31 de octubre de 2026</time>. Responsable: {siteConfig.ownerName}.</p>
          <h2 id="ejemplo-costes">Un pago anual también pesa en tu tarifa mensual</h2>
          <p>Estos son los datos ficticios con los que empieza la calculadora. No son precios de mercado ni importes deducibles confirmados. Se supone un año completo, sin altas, bajas ni cambios de precio.</p>
          <div className="scenario-table-scroll" role="region" aria-label="Ejemplo de costes con varias frecuencias" tabIndex={0}>
            <table className="scenario-table">
              <caption>Coste de planificación: importe de cada pago × pagos al año.</caption>
              <thead><tr><th scope="col">Concepto</th><th scope="col">Cada pago</th><th scope="col">Pagos/año</th><th scope="col">Coste anual</th><th scope="col">Media mensual</th></tr></thead>
              <tbody>{costExample.lines.map((line) => <tr key={line.key}><th scope="row">{line.label}</th><td>{formatCurrency(line.amountPerPayment)}</td><td>{line.paymentsPerYear}</td><td>{formatCurrency(line.annualAmount)}</td><td>{formatCurrency(line.monthlyAmount)}</td></tr>)}</tbody>
              <tfoot><tr><th scope="row">Total del ejemplo</th><td colSpan={2}>Todas las partidas</td><td>{formatCurrency(costExample.annualTotal)}</td><td>{formatCurrency(costExample.monthlyTotal)}</td></tr></tfoot>
            </table>
          </div>
          <p>La gestoría de 165 EUR cada tres meses suma 660 EUR al año, o 55 EUR al mes. El software de 420 EUR anuales equivale a 35 EUR al mes. Con la cuota y el resto de partidas, {formatCurrency(costExample.annualTotal)} al año ÷ 12 = <strong>{formatCurrency(costExample.monthlyTotal)} de media mensual</strong>.</p>
          <p>Si facturas 80 horas al mes, esos costes pesan {formatCurrency(costExample.monthlyTotal / 80)}/h. Con 40 horas, pesan {formatCurrency(costExample.monthlyTotal / 40)}/h. Esa cifra todavía no paga tu neto ni tu IRPF. Para estimar las horas, usa la <Link href="/horas-facturables-freelance">guía de horas facturables</Link>.</p>
          <div className="guide-cta"><a href="#costes-mensuales" className="primary-button">Ajustar pagos y frecuencias</a></div>
        </div>
      </section>

      <section className="section alt" aria-labelledby="media-y-vencimientos">
        <div className="container text-block">
          <h2 id="media-y-vencimientos">Una media para la tarifa, otra cuenta para los vencimientos</h2>
          <p>Repartir 420 EUR entre 12 meses da 35 EUR mensuales. Si el recibo vence el mes que viene y no tienes nada apartado, esa media no cubre por sí sola el pago próximo. Anota también la fecha del recibo y el dinero disponible fuera de esta calculadora.</p>
          <p>Redondeamos cada pago a céntimos antes de repetirlo según su frecuencia. Ejemplo aritmético ficticio: 128,075 EUR se redondean a 128,08 EUR. Si pagas cada mes, 128,08 × 12 = 1536,96 EUR al año; si pagas cada tres meses, 128,08 × 4 = 512,32 EUR al año. No son precios de mercado ni importes deducibles confirmados.</p>
          <p>El total anual se obtiene de los pagos, antes de redondear la media mensual. Por ejemplo, 100 EUR anuales son {formatNumber(100 / 12, 2)} EUR al mes al mostrar dos decimales; multiplicar esa cifra redondeada por 12 da 99,96 EUR. Conservamos los 100 EUR en el total anual para no perder esos céntimos.</p>
          <p>Al trasladar los datos a la tarifa, la cuota mensual va por separado. En el ejemplo, los otros {formatCurrency(costExample.monthlyOtherCosts)} mensuales se reparten según el importe deducible que indiques. El reparto se redondea a céntimos y se muestra antes de abrir la calculadora de tarifa: comprueba el deducible y el resto no deducible que vas a trasladar. No añadas la cuota otra vez ni repitas un mismo recibo en dos categorías.</p>
          <p>Para observar cómo se mueve el saldo, prepara el <Link href="#plan-caja">plan de cobros y pagos de tres meses</Link>. Introduce el pago anual en el mes en que saldrá de la cuenta, sin repartirlo de nuevo entre doce.</p>
        </div>
      </section>

      <section className="section" aria-labelledby="plan-caja">
        <div className="container text-block">
          <h2 id="plan-caja">Plan de caja de tres meses: cobros, pagos y saldos</h2>
          <p>
            La tarifa y el neto estimado no indican cuándo llegará el dinero a la cuenta. Para este
            plan, escribe el saldo al empezar y los cobros y pagos previstos de cada mes.
            El saldo al cierre pasa a ser el saldo inicial del siguiente: saldo inicial + cobros − pagos.
          </p>
          <h3>Un cierre final positivo puede ocultar un déficit anterior</h3>
          <p>
            Este ejemplo es ficticio, sin datos bancarios ni cuotas o impuestos calculados.
            Partimos de {formatCurrency(cashExample.initialBalance)} y situamos un cobro de
            {' '}{formatCurrency(cashExample.months[1].receipts)} en el segundo mes, aunque el trabajo
            pudiera haberse facturado antes. Los pagos son supuestos completos de cada mes.
          </p>
          <div className="scenario-table-scroll" role="region" aria-label="Ejemplo ficticio de caja de tres meses" tabIndex={0}>
            <table className="scenario-table">
              <caption>Movimientos de cuenta hipotéticos, no bases de factura ni beneficio neto.</caption>
              <thead><tr><th scope="col">Mes</th><th scope="col">Saldo inicial</th><th scope="col">Cobros</th><th scope="col">Pagos</th><th scope="col">Saldo al cierre</th></tr></thead>
              <tbody>{cashExample.months.map((month, index) => <tr key={index}><th scope="row">Mes {index + 1}</th><td>{formatCurrency(month.openingBalance)}</td><td>{formatCurrency(month.receipts)}</td><td>{formatCurrency(month.payments)}</td><td>{formatCurrency(month.closingBalance)}</td></tr>)}</tbody>
            </table>
          </div>
          <p>
            El tercer mes cierra con {formatCurrency(cashExample.finalBalance)}, pero el primero
            había cerrado con {formatCurrency(cashExample.months[0].closingBalance)}. Añadir
            {' '}{formatCurrency(cashExample.additionalAtCheckpoints)} al saldo inicial evitaría negativos
            en el inicio y en esos cierres. No comprueba si hace falta más dinero antes de un cobro dentro del mes.
          </p>
          <p>
            Si el cobro del segundo mes se retrasa al tercero, el saldo final seguiría siendo
            {' '}{formatCurrency(delayedCash.finalBalance)}, pero el mínimo entre los puntos calculados
            bajaría a {formatCurrency(delayedCash.minimumBalance)}. Cambiar el momento del cobro
            puede cambiar el déficit aunque no cambie lo cobrado en total.
          </p>
          <h3>Comprueba tus tres meses</h3>
          <p>
            Introduce lo que entrará o saldrá de la cuenta: los cobros deben reflejar el IVA y las
            retenciones cuando correspondan. Incluye en pagos la actividad, cuota, impuestos y
            retiradas personales. Un recibo anual cuenta entero en su mes de pago. Un dinero
            reservado que siga en la cuenta forma parte del saldo; no vuelvas a restarlo como pago
            hasta que salga de ella.
          </p>
          <CashFlowPlanner />
          <p>
            Revisa después las fechas concretas y los pagos posteriores al tercer mes. El{' '}
            <a href={cashPlanSource}>Banco de España explica los desfases de liquidez entre cobros y pagos</a>
            {' '}en negocios de autónomos. La tabla y el plan son una simulación propia; no calculan
            financiación, impuestos ni un colchón universal.
          </p>
        </div>
      </section>

      <section className="section alt" aria-labelledby="vencimientos-caja">
        <div className="container text-block">
          <h2 id="vencimientos-caja">Comprueba si el pago llega antes que el cobro</h2>
          <p>El plan mensual sirve para ver cierres. Para revisar el trayecto hasta ese cierre, anota las fechas de los movimientos previstos. Aquí el saldo pasa de una fecha a la siguiente; si no anotas un movimiento, no se incluye.</p>
          <h3>Ejemplo ficticio: acabar con 700 € y necesitar saldo antes</h3>
          <p>Empezamos con {formatCurrency(datedCash.initialBalance)} antes del 5 de noviembre de 2026. Pagamos {formatCurrency(datedCash.days[0].payments)} el día 5, cobramos {formatCurrency(datedCash.days[1].receipts)} el 20 y pagamos {formatCurrency(datedCash.days[2].payments)} el 25. Son movimientos de cuenta inventados, sin impuestos ni comisiones calculados.</p>
          <div className="scenario-table-scroll" role="region" aria-label="Ejemplo ficticio de vencimientos por fecha" tabIndex={0}>
            <table className="scenario-table">
              <caption>Se restan los pagos de cada fecha antes de sumar sus cobros.</caption>
              <thead><tr><th scope="col">Fecha</th><th scope="col">Pagos</th><th scope="col">Cobros</th><th scope="col">Mínimo supuesto</th><th scope="col">Saldo al terminar</th></tr></thead>
              <tbody>{datedCash.days.map((day) => <tr key={day.date}><th scope="row">{formatCashDate(day.date)}</th><td>{formatCurrency(day.payments)}</td><td>{formatCurrency(day.receipts)}</td><td>{formatCurrency(day.minimumBalance)}</td><td>{formatCurrency(day.closingBalance)}</td></tr>)}</tbody>
            </table>
          </div>
          <p>Los cobros suman {formatCurrency(datedCash.totalReceipts)} y los pagos {formatCurrency(datedCash.totalPayments)}. El saldo final es {formatCurrency(datedCash.finalBalance)}, pero el mínimo es {formatCurrency(datedCash.minimumBalance)} el {formatCashDate(datedCash.firstNegativePoint!)}. Con {formatCurrency(datedCash.additionalInitialBalance)} adicionales al empezar, el mínimo de este supuesto sería cero. No basta con mirar el saldo final.</p>
          <p><strong>Si hay cobros y pagos el mismo día, se calculan los pagos primero.</strong> Aunque el día termine en positivo, puede haber un déficit en ese orden. Si el cobro llega antes, el saldo mínimo real podría ser mayor. Este supuesto no confirma las horas ni fechas de ejecución del banco.</p>
          <h3>Revisa tus movimientos previstos</h3>
          <CashDatePlanner />
          <h3 id="guardar-plan-caja">Conserva el plan para revisarlo otro día</h3>
          <ol className="article-list article-list-ordered">
            <li>Completa el saldo y los movimientos y pulsa «Comprobar vencimientos». Después usa «Guardar este plan en un archivo» junto al resultado.</li>
            <li>Conserva el archivo .json descargado. Incluye los importes y las fechas que escribiste; la marca de ejemplo ficticio se conserva si guardaste el ejemplo.</li>
            <li>Al volver, elígelo en «Abrir un plan guardado». Un archivo válido sustituye los datos que tengas en ese comprobador; los saldos se calculan otra vez con los movimientos guardados. Si el archivo no es válido, el plan actual se mantiene.</li>
          </ol>
          <p>El archivo es para este comprobador de vencimientos por fecha: no incluye el reparto de costes ni el plan de tres meses. La página no guarda una copia por su cuenta ni envía el contenido al servidor. Si cambias fechas o importes después de abrirlo, comprueba de nuevo y guarda otra copia para conservar los cambios.</p>
        </div>
      </section>

      <section className="section cost-explainer" id="que-incluye">
        <div className="container cost-explainer-grid">
          <div>
            <span className="eyebrow">Dentro del cálculo</span>
            <h2>Pagos que sostienen tu actividad</h2>
            <p>
              Incluye tu cuota real y los importes que pagas por gestoría, herramientas, seguros
              y otros gastos recurrentes. Para cada concepto, escribe el importe de un pago y
              elige su frecuencia. La cifra por hora reparte la media mensual solo entre el tiempo
              que puedes cobrar a clientes.
            </p>
            <p>Si hay varios recibos con frecuencias distintas en una categoría, conviértelos primero a una misma frecuencia y suma sus importes. No mezcles, por ejemplo, una licencia anual con una mensual bajo un único selector sin hacer esa conversión.</p>
          </div>
          <div>
            <span className="eyebrow">Fuera del cálculo</span>
            <h2>Lo que aún necesitas facturar</h2>
            <p>
              Esta suma no representa tu beneficio ni una liquidación fiscal. Para saber cuánto
              facturar, añade el neto que deseas conservar y estima IRPF, cuota e IVA según tu
              situación. No todos los pagos de actividad son necesariamente deducibles.
            </p>
            <p>La herramienta tampoco calcula el IVA soportado deducible. La AEAT distingue entre IVA repercutido y soportado deducible al explicar el <a href="https://sede.agenciatributaria.gob.es/Sede/iva/regimenes-tributacion-iva/regimen-general.html">régimen general del IVA</a>. Este reparto de costes no sustituye esa liquidación ni determina cuándo deducir cada gasto.</p>
            <Link href="/#calculadora" className="primary-button">
              Calcular mi facturación
            </Link>
          </div>
        </div>
      </section>

      <section className="section alt" aria-labelledby="dudas-costes">
        <div className="container text-block">
          <h2 id="dudas-costes">Dudas al repartir tus pagos</h2>
          <div className="faq-list">{faqItems.map((item) => <article className="faq-item" key={item.question}><h3>{item.question}</h3><p>{item.answer}</p></article>)}</div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
