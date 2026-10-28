import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import BillingBreakdown from '@/components/BillingBreakdown';
import InvoiceCheck from '@/components/InvoiceCheck';
import { checkInvoice, invoiceVatSource } from '@/lib/invoiceCheck';
import MonthlyNetPreview from '@/components/MonthlyNetPreview';
import RateDiscountPlanner from '@/components/RateDiscountPlanner';
import { rateDiscountGuideExamples } from '@/lib/rateDiscount';
import { formatNumber } from '@/lib/format';
import { monthlyNetExampleReference, monthlyNetExampleRows } from '@/lib/monthlyNetExample';
import { netPreviewSources } from '@/lib/monthlyNet';
import { withholdingExample, withholdingExampleRows, withholdingSource } from '@/lib/withholdingPreview';
import { calculateExample, exampleAssumptions, formatEuro, getExampleUrl } from '@/lib/scenarioExamples';
import { getSiteUrl, siteConfig } from '@/lib/site';
import styles from './withholdingGuide.module.css';

const route = '/tarifa-freelance-por-hora';
const title = 'Tarifa freelance por hora: cómo calcularla bien';
const description =
  'Calcula tu tarifa freelance por hora, comprueba rebajas y el neto previsto, y desglosa una factura con tu base, IVA y retención. Con ejemplos paso a paso.';

const targetNet = 2000;
const example = calculateExample(targetNet);
const fewerHours = exampleAssumptions.billableHours / 2;
const fewerHoursExample = calculateExample(targetNet, { billableHours: fewerHours });
const invoiceGuideExample = (() => {
  const result = checkInvoice({ baseAmount: 2000, vatRate: 10, withholdingRate: 7 });
  if (!result.valid) throw new Error('Invalid editorial invoice example');
  return result;
})();

const pageFaqItems = [
  {
    question: '¿Puedo comprobar una factura con mi base y mis porcentajes?',
    answer:
      'Sí. Introduce una base sin IVA y los porcentajes de IVA y retención que hayas comprobado para tu caso. Escribe 0 si no se añaden o detraen importes en ese supuesto. Se calculan por separado sobre la misma base y se redondean a céntimos: base más IVA menos retención es el importe a cobrar. La ayuda no determina tipos, no emite facturas ni calcula neto o liquidaciones. Compara una sola base con un único porcentaje de cada clase.',
  },
  {
    question: '¿Una rebaja del 10 % se compensa con un 10 % más de horas?',
    answer:
      'No. En el ejemplo ficticio, 40 EUR/h por 80 horas son 3200 EUR sin IVA. Rebajar a 36 EUR/h deja 2880 EUR con las mismas horas. Para cubrir el valor de partida hacen falta 88,89 horas, redondeadas al alza: 8,89 más. Con una capacidad de 80 horas no cabe. Esto compara facturación, no neto, y no garantiza vender las horas adicionales.',
  },
  {
    question: '¿Puedo estimar el neto a partir de lo que voy a facturar?',
    answer:
      'Sí. La ayuda parte de una facturación mensual sin IVA, mantiene los gastos y la cuota de tu cálculo y vuelve a estimar la reserva de IRPF con el mismo criterio. Proyecta doce meses iguales. No recalcula la cotización ni verifica reducciones, otras rentas o pagos a cuenta; no es una declaración ni un calendario de cobros.',
  },
  {
    question: '¿La retención de una factura es la reserva de IRPF de la calculadora?',
    answer:
      'No. La retención es un pago a cuenta que detrae el pagador cuando corresponde. La reserva de IRPF es una estimación del modelo sobre el beneficio. El comprobador calcula base más IVA menos la retención que indiques; no vuelve a restarla del neto ni determina tu impuesto final.',
  },
  {
    question: '¿La tarifa por hora es lo que gano limpio?',
    answer:
      `No. En el ejemplo hipotético, ${formatEuro(example.hourlyRate)}/h sin IVA permiten facturar ${formatEuro(example.billingWithoutVAT)} con ${exampleAssumptions.billableHours} horas mensuales. De ahí se cubren gastos, cuota y reserva de IRPF para conservar ${formatEuro(targetNet)} netos. No es una tarifa de mercado ni una estimación de tu fiscalidad real.`,
  },
  {
    question: '¿Cómo sé si mi tarifa por hora es demasiado baja?',
    answer:
      'Si después de cubrir gastos, cuota, impuestos y horas no facturables tu tarifa no te deja el neto que buscas, seguramente está por debajo de tu mínimo razonable. La referencia útil no es solo lo que el mercado paga, sino lo que tu actividad necesita para sostenerse.',
  },
  {
    question: '¿Debo presupuestar siempre por hora?',
    answer:
      'No. Muchos profesionales prefieren presupuestar por proyecto o por mensualidad. Aun así, tener una referencia por hora sigue siendo muy útil para validar si ese proyecto o esa cuota mensual te dejan margen real.',
  },
  {
    question: '¿Cuántas horas facturables son realistas al mes?',
    answer:
      'Depende de tu actividad, pero suele ser bastante menos de las horas totales que trabajas. Reuniones, administración, ventas, revisión, formación y soporte también consumen tiempo aunque no siempre se facturen directamente.',
  },
] as const;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: route,
  },
  keywords: [
    'tarifa freelance por hora',
    'cómo calcular tarifa por hora freelance',
    'cuánto cobrar por hora freelance',
    'precio por hora autónomo',
    'tarifa consultor freelance',
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

export default function TarifaFreelancePorHoraPage() {
  const siteUrl = getSiteUrl();
  const pageUrl = new URL(route, siteUrl).toString();
  const netExamples = monthlyNetExampleRows.map((row) => {
    if (!row.valid) throw new Error('Invalid editorial monthly-net example');
    return row;
  });
  const discountExamples = rateDiscountGuideExamples.map((row) => {
    if (!row.valid || row.requiredHours === null) throw new Error('Invalid editorial rate-discount example');
    return row;
  });

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
    dateModified: '2026-10-28',
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
        id="tarifa-freelance-por-hora-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema).replace(/</g, '\\u003c') }}
      />
      <script
        id="tarifa-freelance-por-hora-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }}
      />
      <script
        id="tarifa-freelance-por-hora-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
      />

      <Header />

      <section className="hero">
        <div className="container article-layout">
          <div className="text-block">
            <span className="eyebrow">Guía práctica</span>
            <h1>Tarifa freelance por hora: cómo calcularla sin quedarte corto</h1>
            <p className="lead">
              Ejemplo hipotético: <strong>{formatEuro(example.hourlyRate)}/h sin IVA</strong> con
              {' '}{exampleAssumptions.billableHours} horas facturables al mes para conservar
              {' '}{formatEuro(targetNet)} netos. La cuenta depende de tus gastos, cuota e impuestos;
              no es un precio de mercado.
            </p>
            <div className="hero-badges" aria-label="Qué cubre esta guía">
              <span className="hero-badge">Horas facturables</span>
              <span className="hero-badge">Precio por proyecto</span>
              <span className="hero-badge">Margen real</span>
            </div>
            <div className="guide-cta">
              <Link href={getExampleUrl(targetNet)} className="primary-button">
                Ajustar este ejemplo a mis datos
              </Link>
              <a href="#ejemplo-cobro" className="link-button">Comprobar base, IVA y retención</a>
              <a href="#descuento-tarifa" className="link-button">Comprobar una rebaja de tarifa</a>
            </div>
          </div>

          <aside className="feature-card article-summary">
            <h2>Supuestos del ejemplo</h2>
            <ul className="article-list">
              <li>Gastos deducibles: {formatEuro(exampleAssumptions.monthlyExpenses)}/mes.</li>
              <li>Cuota manual: {formatEuro(exampleAssumptions.selfEmployedFee)}/mes.</li>
              <li>Reserva manual de IRPF: {exampleAssumptions.irpfRate} %.</li>
              <li>Horas facturables: {exampleAssumptions.billableHours}/mes.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section" aria-labelledby="ejemplo-tarifa">
        <div className="container text-block">
          <h2 id="ejemplo-tarifa">Una tarifa de {formatEuro(example.hourlyRate)} no es un sueldo de {formatEuro(example.hourlyRate)} por hora</h2>
          <p>
            Para conservar {formatEuro(targetNet)} al mes con estos supuestos necesitas facturar
            {' '}{formatEuro(example.billingWithoutVAT)} sin IVA. Esta es la resta completa: la reserva
            de IRPF se cuenta una sola vez y el IVA queda fuera del reparto.
          </p>
          <BillingBreakdown result={example} hasIVA={exampleAssumptions.hasIVA} headingId="guide-billing-breakdown-title" />
          <p>
            Después divides {formatEuro(example.billingWithoutVAT)} entre
            {' '}{exampleAssumptions.billableHours} h: <strong>{formatEuro(example.hourlyRate)}/h sin IVA</strong>.
            {' '}No hemos añadido un margen comercial extra ni costes específicos de un proyecto.
            La reserva del {exampleAssumptions.irpfRate} % y la cuota manual son supuestos elegidos
            para el ejemplo, no tipos ni cuotas aplicables a todas las personas.
          </p>
          <div className="disclaimer-box">
            Con el mismo objetivo y los mismos costes, si solo puedes vender {fewerHours} h al mes,
            la tarifa de cobertura sube a <strong>{formatEuro(fewerHoursExample.hourlyRate)}/h sin IVA</strong>.
            {' '}La facturación mensual necesaria sigue siendo {formatEuro(fewerHoursExample.billingWithoutVAT)}.
            {' '}<Link href={getExampleUrl(targetNet, { billableHours: fewerHours })}>Probar el caso de {fewerHours} horas</Link>.
          </div>
          <p className="scenario-note">
            Método: simulación aritmética con el mismo motor de la calculadora, no una encuesta de
            precios. Responsable del sitio: <Link href="/aviso-legal">{siteConfig.ownerName}</Link>.
            {' '}Actualizada el <time dateTime="2026-10-28">28 de octubre de 2026</time>.
          </p>
        </div>
      </section>

      <section className="section alt" aria-labelledby="descuento-tarifa">
        <div className="container text-block">
          <h2 id="descuento-tarifa">Antes de rebajar tu tarifa, comprueba las horas que necesitarías</h2>
          <p>
            Si mantienes el alcance y cobras menos por hora, facturar lo mismo exige vender más horas.
            El límite no es solo encontrar clientes: esas horas deben caber en tu agenda. La capacidad
            de esta comparación es el total que puedes facturar en estos servicios durante el mes,
            incluidas las horas de partida. Descuenta antes la gestión, la preparación no facturada,
            los descansos y el tiempo reservado a otros servicios.
          </p>
          <h3>Ejemplo ficticio: 40 EUR/h, 80 horas facturadas y 80 horas de capacidad</h3>
          <p>Partimos de 3200 EUR sin IVA. Las tres filas son alternativas sobre esos mismos servicios; no son precios de mercado ni recomendaciones de descuento.</p>
          <div className="scenario-table-scroll" role="region" aria-label="Ejemplo de rebajas de tarifa y horas necesarias" tabIndex={0}>
            <table className="scenario-table">
              <caption>Misma clase de servicio y alcance. Capacidad total de 80 h al mes; no se suman las filas.</caption>
              <thead><tr><th scope="col">Rebaja</th><th scope="col">Nueva tarifa sin IVA</th><th scope="col">Facturación con 80 h sin IVA</th><th scope="col">Horas para recuperar el valor de partida</th></tr></thead>
              <tbody>{discountExamples.map((row) => (
                <tr key={row.discountPercent}><th scope="row">{formatNumber(row.discountPercent)} %</th><td>{formatEuro(row.reducedHourlyRate)}/h</td><td>{formatEuro(row.sameHoursBilling)}</td><td>{formatNumber(row.requiredHours!)} h</td></tr>
              ))}</tbody>
            </table>
          </div>
          <p>
            Al rebajar un 10 %, la tarifa pasa de 40 a 36 EUR/h. Con 80 h facturas 2880 EUR:
            {' '}<strong>320 EUR menos sin IVA</strong>. Para recuperar el valor de partida:
            {' '}3200 ÷ 36 = 88,888… h, que redondeamos al alza a <strong>88,89 h</strong>.
            Son 8,89 h adicionales, aproximadamente un 11,11 % más de tiempo. Con 80 h disponibles
            no cabe; con 100 h cabría por horas, pero aún tendrías que venderlas.
          </p>
          <RateDiscountPlanner />
          <p>
            Método: tarifa nueva = tarifa de partida × (1 − rebaja ÷ 100), redondeada a céntimos.
            Usamos esa tarifa redondeada en todas las cuentas. Las horas necesarias se redondean
            al alza a centésimas para cubrir tarifa original × horas de partida antes de redondear
            la facturación. Los importes se muestran a céntimos; el resultado puede superar en unos
            céntimos el importe de partida. Una tarifa que quede en cero no permite recuperarlo.
          </p>
          <p>
            Si la rebaja afecta solo a un cliente o servicio, compara sus horas y su capacidad por separado.
            Si reduces entregables, cambia también el alcance y revisa el presupuesto completo.
            Esta cuenta no incorpora costes adicionales de trabajar más. Una caída de facturación
            del 10 % no implica una caída del neto del 10 %: puedes contrastar el importe con la
            {' '}<a href="#neto-segun-facturacion" className={styles.costLink}>estimación de neto según facturación</a>.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="neto-segun-facturacion">
        <div className="container text-block">
          <h2 id="neto-segun-facturacion">Qué neto dejaría facturar menos o más</h2>
          <p>
            La calculadora parte de un neto deseado para buscar una facturación objetivo. Esta
            comprobación recorre la cuenta desde una facturación prevista: resta los mismos gastos
            deducibles y cuota, estima de nuevo la reserva de IRPF y descuenta los costes no deducibles.
            La cuota se mantiene como supuesto, aunque antes la hayas obtenido en modo automático.
          </p>
          <h3>Ejemplo ficticio: se mantiene el coste, cambia lo facturado</h3>
          <p>
            Conservamos {formatEuro(monthlyNetExampleReference.monthlyExpenses)} de gastos deducibles,
            {' '}{formatEuro(monthlyNetExampleReference.selfEmployedFee)} de cuota manual y
            {' '}{formatEuro(monthlyNetExampleReference.monthlyNonDeductibleExpenses)} de costes no deducibles.
            La reserva manual del {monthlyNetExampleReference.irpfRate} % se aplica al beneficio positivo
            del modelo; no es una retención ni un tipo que corresponda a todas las personas.
          </p>
          <div className="scenario-table-scroll" role="region" aria-label="Ejemplo de neto según facturación con costes constantes" tabIndex={0}>
            <table className="scenario-table">
              <caption>Tres escenarios alternativos; cada uno supone doce meses iguales y los mismos costes y cuota.</caption>
              <thead><tr><th scope="col">Facturación sin IVA</th><th scope="col">Tras gastos y cuota</th><th scope="col">Reserva de IRPF</th><th scope="col">Neto orientativo</th></tr></thead>
              <tbody>{netExamples.map((row) => <tr key={row.monthlyBilling}><th scope="row">{formatEuro(row.monthlyBilling)}</th><td>{formatEuro(row.preTaxProfit)}</td><td>− {formatEuro(row.estimatedIRPF)}</td><td>{formatEuro(row.estimatedNet)}</td></tr>)}</tbody>
            </table>
          </div>
          <p>
            Con {formatEuro(netExamples[0].monthlyBilling)} sin IVA: restamos
            {' '}{formatEuro(netExamples[0].monthlyExpenses)} de gastos y {formatEuro(netExamples[0].selfEmployedFee)}
            {' '}de cuota y quedan {formatEuro(netExamples[0].preTaxProfit)} antes de la reserva.
            El {monthlyNetExampleReference.irpfRate} % son {formatEuro(netExamples[0].estimatedIRPF)} y quedan
            {' '}<strong>{formatEuro(netExamples[0].estimatedNet)}</strong>. Son {formatEuro(-netExamples[0].netDifference)}
            {' '}menos que el objetivo de {formatEuro(netExamples[0].targetNet)}. El IVA no entra en esta resta
            y la retención no se descuenta otra vez. Con {formatEuro(netExamples[2].monthlyBilling)} y estos
            mismos supuestos, el neto del modelo sería {formatEuro(netExamples[2].estimatedNet)}.
          </p>
          <p>Para probar tus costes, abre «Ver cómo se reparte la facturación» y después «Estimar qué neto dejaría otra facturación» en tu resultado. Aquí se mantienen los supuestos ficticios de la tabla.</p>
          <MonthlyNetPreview reference={monthlyNetExampleReference} />
          <p>
            La AEAT explica el <a href={netPreviewSources.incomeAndExpenses}>cálculo del rendimiento a partir de ingresos y gastos deducibles</a>.
            Esta simulación no aplica todas las reducciones ni sustituye la fiscalidad de tu actividad.
            La Seguridad Social explica la <a href={netPreviewSources.contributionReview}>regularización de cuotas según los rendimientos anuales</a>:
            conservar una cuota en esta comparación no confirma que sea la que te corresponda al final.
          </p>
        </div>
      </section>

      <section className="section alt" aria-labelledby="iva-y-reserva">
        <div className="container text-block">
          <h2 id="iva-y-reserva">IVA añadido y reserva de IRPF son cuentas diferentes</h2>
          <p>
            El selector de esta calculadora añade un 21 % de IVA cuando lo activas; no comprueba
            el régimen ni el tipo que corresponde a tu actividad. El IVA añadido se muestra aparte
            y no aumenta el neto objetivo del ejemplo.
          </p>
          <p>
            La Agencia Tributaria explica que, en el régimen general, la liquidación tiene en cuenta
            la diferencia entre el IVA repercutido y el soportado deducible. Por eso el IVA que ves
            aquí no equivale por sí solo a lo que ingresarás a Hacienda. Consulta la explicación
            oficial del <a href="https://sede.agenciatributaria.gob.es/Sede/iva/regimenes-tributacion-iva/regimen-general.html" className="text-link">régimen general del IVA de la AEAT</a>.
          </p>
          <p>
            La reserva de IRPF del ejemplo se estima sobre el beneficio del modelo, no sobre el total
            con IVA. Esa reserva no es una retención en factura ni descuenta pagos a cuenta ya
            realizados: sirve para planificar el objetivo, no para rellenar una declaración.
            La ayuda siguiente muestra por separado cómo una retención cambiaría el importe a cobrar.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="ejemplo-cobro">
        <div className="container text-block">
          <h2 id="ejemplo-cobro">Base, IVA, retención e importe a cobrar</h2>
          <p>
            Una cosa es la base sin IVA de tu trabajo y otra lo que abonaría el cliente. Supongamos
            una base ficticia de {formatEuro(withholdingExample.baseAmount)} y {formatEuro(withholdingExample.vatAmount)} de IVA.
            {' '}Comparamos esa misma base sin retención y con una retención ficticia del 15 %.
            No son tipos que la herramienta haya determinado para tu actividad.
          </p>
          <div className="scenario-table-scroll" role="region" aria-label="Ejemplo de base, IVA, retención y cobro" tabIndex={0}>
            <table className="scenario-table">
              <caption>Misma base e IVA; cambia únicamente el supuesto de retención.</caption>
              <thead><tr><th scope="col">Supuesto</th><th scope="col">Base sin IVA</th><th scope="col">IVA añadido</th><th scope="col">Retención sobre base</th><th scope="col">Importe a cobrar</th></tr></thead>
              <tbody>{withholdingExampleRows.map((row) => (
                <tr key={row.rateUsed}>
                  <th scope="row">Retención del {row.rateUsed} %</th>
                  <td>{formatEuro(row.baseCents / 100)}</td><td>+ {formatEuro(row.vatCents / 100)}</td>
                  <td>− {formatEuro(row.withholdingCents / 100)}</td><td>{formatEuro(row.receivableCents / 100)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <p>
            Con el 15 % del ejemplo, {formatEuro(withholdingExample.baseAmount)} + {formatEuro(withholdingExample.vatAmount)}
            {' '}− {formatEuro(withholdingExampleRows[1].withholdingCents / 100)} = {formatEuro(withholdingExampleRows[1].receivableCents / 100)}.
            {' '}La base sigue siendo {formatEuro(withholdingExample.baseAmount)}: la retención no es una rebaja del servicio.
            {' '}La AEAT explica que las <a href={withholdingSource}>retenciones son anticipos del impuesto</a>
            {' '}y que dependen de la renta y del pagador. Comprueba si se aplica y qué porcentaje corresponde a tu caso.
          </p>
          <p>
            El cobro incluye IVA y todavía debe sostener costes y obligaciones: no es dinero neto
            disponible. La retención no se vuelve a restar del neto objetivo de la calculadora.
            No calculamos aquí una declaración, una devolución ni un importe de IVA a ingresar.
          </p>
          <div id="comprobar-factura" className={styles.invoiceCheck}>
            <h3 id="comprobar-cobro">Comprueba una factura con tu base y tus porcentajes</h3>
            <p>Prepara la base sin IVA, antes de retención, y los porcentajes que correspondan a tu caso. Los tres campos empiezan vacíos; el ejemplo anterior no se aplica automáticamente a tus datos.</p>
            <InvoiceCheck />
            <p>
              Otro supuesto ficticio: {formatEuro(invoiceGuideExample.baseAmount)} de base con
              {' '}{formatNumber(invoiceGuideExample.vatRate)} % de IVA y
              {' '}{formatNumber(invoiceGuideExample.withholdingRate)} % de retención.
              {' '}{formatEuro(invoiceGuideExample.baseAmount)} + {formatEuro(invoiceGuideExample.vatAmount)}
              {' '}− {formatEuro(invoiceGuideExample.withholdingAmount)} = <strong>{formatEuro(invoiceGuideExample.receivableAmount)} a cobrar</strong>.
              {' '}Los porcentajes de ambos ejemplos son datos elegidos para explicar la operación;
              no indican qué corresponde a tu actividad.
            </p>
            <p>
              Método: normalizamos base y porcentajes a dos decimales. Calculamos IVA y retención
              sobre la misma base normalizada y redondeamos cada importe por separado a céntimos
              antes de sumar y restar. No calculamos por líneas ni combinamos distintas bases o tipos.
              La AEAT explica qué revisar para <a href={invoiceVatSource}>calcular el IVA repercutido</a>:
              base, tipos y casos en que no se repercute. Esta comprobación solo aplica los porcentajes que escribas.
            </p>
            <p>Si lo que quieres contrastar es toda tu referencia mensual, abre «Ver cómo se reparte la facturación» y después «Comprobar el cobro si hay retención» en el resultado de la calculadora. Esa ayuda conserva la base y el IVA del resultado mensual.</p>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container feature-grid" aria-label="Qué entra en una tarifa freelance por hora">
          <article className="feature-card">
            <h2>1. Tu objetivo mensual</h2>
            <p>
              Necesitas saber cuánto quieres conservar al mes y cuánto debes facturar para llegar a
              esa cifra sin depender de la intuición.
            </p>
          </article>

          <article className="feature-card">
            <h2>2. Tus horas facturables reales</h2>
            <p>
              No cuentan solo las horas que trabajas. Cuenta el tiempo que realmente puedes vender sin
              asumir una agenda imposible de sostener. Puedes calcular esa disponibilidad con los{' '}
              <Link href="/horas-facturables-freelance">ejemplos de horas facturables mensuales</Link>.
            </p>
          </article>

          <article className="feature-card">
            <h2>3. El margen que te deja cada encargo</h2>
            <p>
              Tu tarifa por hora tiene que ayudarte a decidir si un proyecto, una bolsa de horas o una
              mensualidad te compensa de verdad.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>Cómo calcular una tarifa por hora más defendible</h2>
          <ol className="article-list article-list-ordered">
            <li>Calcula primero tu facturación mensual objetivo.</li>
            <li>Descarta horas que no vas a poder facturar realmente.</li>
            <li>Divide la facturación sin IVA entre esas horas facturables.</li>
            <li>Comprueba si esa tarifa sigue teniendo sentido para tu mercado y tu posicionamiento.</li>
            <li>Úsala como referencia base, no como techo fijo para todos los trabajos.</li>
          </ol>
          <p>
            Si el resultado te parece alto, no significa automáticamente que esté mal. Puede indicar
            que estabas infravalorando tus costes, tus tiempos no vendibles o el margen mínimo que
            necesita tu actividad para ser sostenible.
          </p>
        </div>
      </section>

      <section className="section alt">
        <div className="container feature-grid" aria-label="Cuándo usar la tarifa por hora">
          <article className="feature-card">
            <h2>Para validar presupuestos cerrados</h2>
            <p>
              Aunque presupuestes por proyecto, tu referencia por hora te ayuda a comprobar si el
              importe final está alineado con el esfuerzo esperado.
            </p>
          </article>

          <article className="feature-card">
            <h2>Para negociar alcance</h2>
            <p>
              Cuando un cliente ajusta presupuesto, tu tarifa por hora te ayuda a decidir si conviene
              bajar precio o reducir entregables.
            </p>
          </article>

          <article className="feature-card">
            <h2>Para detectar encargos poco rentables</h2>
            <p>
              Si un proyecto te deja por debajo de esa referencia, ya tienes una señal clara para
              revisar precio, tiempos o condiciones antes de aceptar.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>Usa la calculadora para aterrizar tu número</h2>
          <p>
            La calculadora te permite probar distintos escenarios con neto mensual, gastos, cuota de
            autónomos, IRPF, IVA y horas facturables. Así obtienes una referencia por hora que te
            sirve tanto para trabajar con precio/hora como para convertirla en un presupuesto por
            proyecto más defendible.
          </p>
          <div className="guide-cta">
            <Link href="/#calculadora" className="primary-button">
              Ir a la calculadora
            </Link>
          </div>
        </div>
      </section>

      <section className="section alt" aria-labelledby="tarifa-freelance-faq-title">
        <div className="container text-block">
          <h2 id="tarifa-freelance-faq-title">Preguntas frecuentes sobre tarifa freelance por hora</h2>

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
          <span className="eyebrow">Lectura relacionada</span>
          <h2>Antes de fijar tu tarifa, conviene entender cuánto tienes que facturar</h2>
          <p>
            Si todavía no has trabajado tu referencia mensual, esta guía te ayudará a pasar del neto
            que buscas a una facturación más realista antes de bajar el cálculo a precio por hora.
          </p>
          <p>
            Y si quieres afinar mejor la parte de cotización, también te conviene revisar cómo
            funciona la cuota de autónomos de 2026 y cuándo cambia de forma significativa.
          </p>
          <div className="guide-cta">
            <Link href="/cuanto-facturar-autonomo" className="primary-button">
              Leer guía sobre cuánto facturar
            </Link>
            <Link href="/tarifa-diaria-freelance#comprobar-jornada" className="primary-button">
              Comprobar el precio de una jornada
            </Link>
            <Link href="/cuota-autonomos-2026" className="primary-button">
              Leer guía sobre cuota 2026
            </Link>
          </div>
          <p>Si un servicio exige un gasto adicional que tu tarifa aún no cubre, revisa el <Link href="/tarifa-diaria-freelance#costes-jornada" className={styles.costLink}>ejemplo de jornada con costes específicos</Link> antes de comparar el precio por hora.</p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
