import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LeadMagnetForm from '@/components/LeadMagnetForm';
import { getSiteUrl, siteConfig } from '@/lib/site';

const route = '/mejores-programas-facturacion-autonomos';
const title = 'Programas de facturación para autónomos: compara 4 opciones';
const description =
  'Compara cuatro programas de facturación para autónomos en España según tu operativa. Revisa límites, gastos, cobros y exportación antes de elegir.';

const pageFaqItems = [
  {
    question: '¿Cuál es el mejor programa de facturación para autónomos?',
    answer:
      'No hay uno universal. Compara tu volumen y tipo de facturas, la gestión de gastos y cobros, el acceso para tu asesoría, la exportación de datos y el coste total del plan que necesitas.',
  },
  {
    question: '¿Existe una opción gratis para facturar como autónomo?',
    answer:
      'Sí. La AEAT ofrece una aplicación gratuita para emitir facturas y remitir sus registros. No admite facturas simplificadas y los registros generados solo se gestionan en esa aplicación; comprueba si esas limitaciones encajan contigo.',
  },
  {
    question: '¿Qué debería mirar antes de elegir un software de facturación?',
    answer:
      'Como mínimo: cumplimiento normativo, facilidad para emitir facturas y presupuestos, control de cobros y gastos, acceso para asesoría, conciliación bancaria si la necesitas y claridad de precios.',
  },
  {
    question: '¿Qué conviene probar antes de cambiar de programa?',
    answer:
      'Crea una factura de prueba, registra un gasto, revisa el seguimiento de cobros y pregunta cómo exportar tus datos. Comprueba también si tu asesoría podrá trabajar con ellos y qué funciones exige un plan de pago.',
  },
] as const;

type SoftwareOption = {
  name: string;
  summary: string;
  fit: string;
  check: string;
  productUrl: string;
  productLabel: string;
};

const softwareOptions: SoftwareOption[] = [
  {
    name: 'Aplicación gratuita VERI*FACTU de la AEAT',
    summary:
      'La opción oficial y gratuita para generar facturas y remitir registros directamente a la Agencia Tributaria.',
    fit: 'Si buscas emisión básica sin cuota de software y tu operativa encaja con la aplicación oficial.',
    check: 'No admite facturas simplificadas y no permite continuar en otro programa con los registros generados en ella.',
    productUrl:
      'https://sede.agenciatributaria.gob.es/Sede/ayuda/consultas-informaticas/presentacion-declaraciones-ayuda-tecnica/aplicacion-gratuita-verifactu-aeat.html',
    productLabel: 'Ver aplicación oficial',
  },
  {
    name: 'Holded',
    summary:
      'Plataforma más amplia para unir facturación, gastos, banco, impuestos y operativa general del negocio.',
    fit: 'Si necesitas conectar facturas, gastos, banco y colaboración con tu asesoría.',
    check: 'Comprueba qué funciones incluye el plan que contratarías, no solo las que aparecen en la página general.',
    productUrl: 'https://www.holded.com/es/autonomos',
    productLabel: 'Ver Holded para autónomos',
  },
  {
    name: 'Quipu',
    summary:
      'Herramienta muy orientada al día a día del autónomo: facturas, tickets, impuestos y conciliación bancaria.',
    fit: 'Si quieres gestionar facturas, gastos y previsión fiscal desde una misma herramienta.',
    check: 'La conciliación bancaria y algunas automatizaciones dependen del plan: revisa su alcance antes de pagar.',
    productUrl: 'https://getquipu.com/es/autonomos',
    productLabel: 'Ver Quipu para autónomos',
  },
  {
    name: 'FacturaDirecta',
    summary:
      'Enfoque muy claro en VERI*FACTU y cumplimiento, con facturación, impuestos y operativa sencilla para pequeño negocio.',
    fit: 'Si priorizas facturas, cobros y una operativa fiscal visible en el mismo panel.',
    check: 'Verifica el plan necesario para tu volumen, tu territorio fiscal y el acceso que necesita tu asesoría.',
    productUrl: 'https://www.facturadirecta.com/',
    productLabel: 'Ver FacturaDirecta',
  },
] as const;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: route,
  },
  keywords: [
    'mejores programas facturación autónomos',
    'software facturación autónomos España',
    'programa facturación autónomos VERI*FACTU',
    'mejor software facturación freelance',
    'programa para hacer facturas autónomo',
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

export default function MejoresProgramasFacturacionAutonomosPage() {
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
    datePublished: '2026-04-25',
    dateModified: '2026-10-02',
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
    <main>
      <Script
        id="mejores-programas-facturacion-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script
        id="mejores-programas-facturacion-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="mejores-programas-facturacion-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Header />

      <section className="hero">
        <div className="container article-layout">
          <div className="text-block">
            <span className="eyebrow">Comparativa práctica</span>
            <h1>Programas de facturación para autónomos: compara 4 opciones</h1>
            <p className="lead">
              La opción adecuada depende de cómo emites, cobras y entregas información a tu
              asesoría. Compara cuatro alternativas por encaje y comprueba sus límites antes de
              contratar: una lista de funciones no basta para tomar la decisión.
            </p>
            <div className="hero-badges" aria-label="Qué cubre esta guía">
              <span className="hero-badge">Autónomos en España</span>
              <span className="hero-badge">VERI*FACTU</span>
              <span className="hero-badge">Cuatro opciones</span>
              <span className="hero-badge">Criterios de elección</span>
            </div>
            <div className="guide-cta">
              <Link href="/#calculadora" className="primary-button">
                Ir a la calculadora
              </Link>
            </div>
          </div>

          <aside className="feature-card article-summary">
            <h2>Alcance de la comparativa</h2>
            <ul className="article-list">
              <li>Información contrastada en páginas oficiales el 2 de octubre de 2026.</li>
              <li>No es una prueba práctica de las cuatro herramientas ni un ranking de velocidad.</li>
              <li>Los precios y las funciones de cada plan pueden cambiar: confírmalos en el proveedor.</li>
              <li>Los enlaces son directos, sin seguimiento de afiliados.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>Qué deberías mirar hoy antes de elegir un programa de facturación</h2>
          <p>
            Para un autónomo en España ya no basta con que una herramienta haga facturas bonitas.
            Lo importante es que te ayude a trabajar mejor con la realidad de tu negocio: control
            de cobros, gastos, trazabilidad, cumplimiento y una forma razonable de compartir datos
            con tu asesoría si la tienes.
          </p>
          <p>
            El filtro más útil suele ser este: elige una herramienta que encaje con tu volumen, tu
            complejidad y tu forma de trabajar. Una solución mínima puede bastar si emites pocas
            facturas. Una plataforma más completa compensa si quieres integrar banco, impuestos o
            automatizaciones.
          </p>
          <div className="disclaimer-box">
            <strong>Idea clave:</strong> el mejor software no es el que tiene más funciones. Es el
            que te ahorra más fricción sin empujarte a pagar por complejidad que no vas a usar.
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container feature-grid" aria-label="Criterios para elegir software de facturación">
          <article className="feature-card">
            <h2>1. Cumplimiento y tranquilidad</h2>
            <p>
              Revisa si la herramienta habla claro de VERI*FACTU, trazabilidad, código QR y
              adaptación a la normativa. Hoy ya es un criterio de compra, no un extra.
            </p>
          </article>

          <article className="feature-card">
            <h2>2. Cobros, gastos e impuestos</h2>
            <p>
              Si quieres algo más que emitir facturas, valora si te ayuda con gastos, modelos,
              previsión fiscal o conciliación bancaria.
            </p>
          </article>

          <article className="feature-card">
            <h2>3. Encaje con tu operativa</h2>
            <p>
              No necesita lo mismo quien emite 8 facturas al mes que quien trabaja con clientes,
              tickets, banco, presupuestos y asesoría en paralelo.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>Cuatro opciones para necesidades distintas</h2>
          <p>
            La aplicación de la AEAT cubre una operativa básica; las soluciones comerciales añaden
            gestión de gastos, cobros u otras funciones según el plan. Elige primero dos candidatas
            que encajen con tu trabajo y pruébalas con los mismos documentos.
          </p>
          <div className="disclaimer-box">
            <strong>Importante:</strong> la AEAT indica que su aplicación no admite facturas
            simplificadas y que los registros creados allí no se pueden exportar para seguir
            facturando en otro sistema. No decidas solo por el precio de entrada.
          </div>
        </div>
        <div className="container feature-grid" aria-label="Programas destacados">
          {softwareOptions.map((option) => (
            <article className="feature-card commercial-card" key={option.name}>
              <span className="card-kicker">Opción para comparar</span>
              <h3>{option.name}</h3>
              <p>{option.summary}</p>
              <p>
                <strong>Puede encajar:</strong> {option.fit}
              </p>
              <p className="commercial-note"><strong>Antes de elegir:</strong> {option.check}</p>
              <div className="button-row">
                <a className="secondary-button" href={option.productUrl} target="_blank" rel="noreferrer">
                  {option.productLabel}
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section alt">
        <div className="container feature-grid" aria-label="Qué opción suele encajar mejor según perfil">
          <article className="feature-card">
            <h2>1. Emite una factura de prueba</h2>
            <p>Repite la misma factura con descuento, vencimiento y rectificación. Comprueba qué datos puedes corregir y cuáles quedan cerrados.</p>
          </article>
          <article className="feature-card">
            <h2>2. Cierra un mes ficticio</h2>
            <p>Registra un gasto, marca un cobro pendiente y pide a tu asesoría que revise el resumen. Así verás el trabajo manual que queda.</p>
          </article>
          <article className="feature-card">
            <h2>3. Comprueba la salida</h2>
            <p>Pregunta por la exportación de facturas, contactos y registros, las funciones incluidas en tu plan y el coste tras cualquier promoción.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>Lo que puede cambiar la decisión</h2>
          <ol className="article-list article-list-ordered">
            <li>Necesitas tickets, rectificativas o varios destinatarios: revisa los límites antes de migrar.</li>
            <li>Tu asesoría trabaja en otro sistema: pregunta por acceso y formato de exportación.</li>
            <li>Tienes cobros aplazados: prueba recordatorios, estados y conciliación del plan concreto.</li>
            <li>Trabajas en territorio foral o en un régimen especial: confirma el flujo con tu asesoría.</li>
          </ol>
          <p>
            Antes de pagar un año por adelantado, documenta un mes habitual de tu actividad y
            repítelo en las dos opciones finalistas. Esta prueba revela mejor el encaje que una
            lista de funciones.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <LeadMagnetForm
            source="programas-facturacion"
            title="Antes de elegir software, revisa si tu tarifa se sostiene"
            description="Te enviamos el kit para revisar tu número base, horas facturables, margen e impuestos antes de convertirlo en facturas, presupuestos o cuotas."
            buttonLabel="Quiero el kit de tarifa"
          />
        </div>
      </section>

      <section className="section alt">
        <div className="container text-block">
          <h2>Primero define tu número, luego elige la herramienta</h2>
          <p>
            Antes de comparar software, te conviene saber cuánto necesitas facturar y qué tarifa te
            sostiene. Si esa base no está clara, la herramienta te puede ordenar la facturación,
            pero no te va a arreglar un precio mal planteado.
          </p>
          <p>
            Si estás afinando tu referencia mensual, puedes apoyarte también en la guía sobre{' '}
            <Link href="/cuanto-facturar-autonomo">cuánto facturar como autónomo</Link> y en el caso
            concreto de{' '}
            <Link href="/tabla-cuanto-facturar-autonomo#neto-2000">
              cuánto facturar para ganar 2000 euros netos
            </Link>.
          </p>
          <div className="guide-cta">
            <Link href="/#calculadora" className="primary-button">
              Calcular cuánto facturar
            </Link>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="programas-facturacion-faq-title">
        <div className="container text-block">
          <h2 id="programas-facturacion-faq-title">
            Preguntas frecuentes sobre programas de facturación para autónomos
          </h2>

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
