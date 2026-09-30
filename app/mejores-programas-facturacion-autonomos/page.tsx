import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LeadMagnetForm from '@/components/LeadMagnetForm';
import { getSiteUrl, siteConfig } from '@/lib/site';

const route = '/mejores-programas-facturacion-autonomos';
const title = 'Mejores programas de facturación para autónomos en España';
const description =
  'Comparativa práctica de programas de facturación para autónomos en España: qué mirar, cuándo compensa una opción gratis, qué herramientas encajan mejor según tu forma de trabajar y qué opciones oficiales tienen programas de recomendación o partner.';

const pageFaqItems = [
  {
    question: '¿Cuál es el mejor programa de facturación para autónomos?',
    answer:
      'No hay uno universal. Depende de si solo necesitas emitir facturas, si quieres banco e impuestos en la misma herramienta, si trabajas con una asesoría y de cuanto valoras automatizaciones y soporte.',
  },
  {
    question: '¿Existe una opción gratis para facturar como autónomo?',
    answer:
      'Sí. La AEAT ofrece una aplicación gratuita VERI*FACTU orientada a contribuyentes con volumen reducido de facturas. Puede encajar si buscas una solución básica y oficial.',
  },
  {
    question: '¿Qué debería mirar antes de elegir un software de facturación?',
    answer:
      'Como mínimo: cumplimiento normativo, facilidad para emitir facturas y presupuestos, control de cobros y gastos, acceso para asesoría, conciliación bancaria si la necesitas y claridad de precios.',
  },
  {
    question: '¿Se puede monetizar una comparativa de software de facturación?',
    answer:
      'Sí, pero conviene hacerlo con criterio. Algunas herramientas tienen programas oficiales de recomendación, afiliación o partner. Lo importante es dejar clara la naturaleza editorial de la comparativa y no recomendar una herramienta solo por su comisión.',
  },
] as const;

type SoftwareOption = {
  name: string;
  summary: string;
  fit: string;
  productUrl: string;
  productLabel: string;
  commercialModel: string;
  programUrl?: string;
  programLabel?: string;
};

type MonetizationOption = {
  name: string;
  audience: string;
  model: string;
  note: string;
  programUrl: string;
};

const softwareOptions: SoftwareOption[] = [
  {
    name: 'Aplicación gratuita VERI*FACTU de la AEAT',
    summary:
      'La opción oficial y gratuita para generar facturas y remitir registros directamente a la Agencia Tributaria.',
    fit: 'Mejor si emites pocas facturas y quieres una base simple, oficial y sin coste.',
    productUrl:
      'https://sede.agenciatributaria.gob.es/Sede/ayuda/consultas-informaticas/presentacion-declaraciones-ayuda-tecnica/aplicacion-gratuita-verifactu-aeat.html',
    productLabel: 'Ver aplicación oficial',
    commercialModel:
      'No tiene afiliación ni partner comercial; es una referencia útil para comparar contra opciones de pago.',
  },
  {
    name: 'Holded',
    summary:
      'Plataforma más amplia para unir facturación, gastos, banco, impuestos y operativa general del negocio.',
    fit: 'Mejor si quieres una herramienta más completa que vaya más allá de emitir facturas.',
    productUrl: 'https://www.holded.com/es/autonomos',
    productLabel: 'Ver Holded para autónomos',
    programUrl: 'https://help.holded.com/es/articles/13435604-recomienda-holded-y-gana-dinero-en-efectivo',
    programLabel: 'Ver programa de recomendación',
    commercialModel:
      'Holded indica un sistema de invitación con un 50% de descuento durante 3 meses para el referido y una recompensa recurrente para quien recomienda, hasta un máximo de 500 euros por contacto.',
  },
  {
    name: 'Quipu',
    summary:
      'Herramienta muy orientada al día a día del autónomo: facturas, tickets, impuestos y conciliación bancaria.',
    fit: 'Mejor si quieres una operativa sencilla y muy pensada para autónomos y pequeños negocios.',
    productUrl: 'https://getquipu.com/es/autonomos',
    productLabel: 'Ver Quipu para autónomos',
    programUrl: 'https://getquipu.com/es/referral',
    programLabel: 'Ver programa de afiliados',
    commercialModel:
      'Quipu publica un programa de afiliados con un 30% sobre el importe real pagado por el cliente y una ventana recurrente de 12 meses en planes mensuales.',
  },
  {
    name: 'FacturaDirecta',
    summary:
      'Enfoque muy claro en VERI*FACTU y cumplimiento, con facturación, impuestos y operativa sencilla para pequeño negocio.',
    fit: 'Mejor si tu prioridad es facturar fácil y sentir muy aterrizada la parte normativa.',
    productUrl: 'https://www.facturadirecta.com/',
    productLabel: 'Ver FacturaDirecta',
    programUrl: 'https://www.facturadirecta.com/partner/',
    programLabel: 'Ver programa partner',
    commercialModel:
      'No comunica un afiliado abierto tipo blog, sino un programa partner orientado a gestionar cuentas de clientes con descuentos por volumen y panel centralizado.',
  },
] as const;

const monetizationOptions: MonetizationOption[] = [
  {
    name: 'Holded',
    audience: 'Contenido para autónomos y freelancers que quieren una solución más completa.',
    model: 'Programa de recomendación dentro del propio producto.',
    note: 'Encaja mejor si usas la herramienta o puedes enseñar casos de uso reales.',
    programUrl: 'https://help.holded.com/es/articles/13435604-recomienda-holded-y-gana-dinero-en-efectivo',
  },
  {
    name: 'Quipu',
    audience: 'Comparativas, tutoriales y contenido para autónomos con intención de compra.',
    model: 'Programa de afiliados oficial publicado por Quipu.',
    note: 'Es la opción más parecida a un afiliado clásico para este nicho.',
    programUrl: 'https://getquipu.com/es/referral',
  },
  {
    name: 'FacturaDirecta',
    audience: 'Profesionales que gestionan varias cuentas o prestan servicio a clientes.',
    model: 'Programa partner con descuentos por volumen y gestión consolidada.',
    note: 'Tiene más sentido como vía reseller o partner que como blog de afiliación tradicional.',
    programUrl: 'https://www.facturadirecta.com/partner/',
  },
  {
    name: 'Sage',
    audience: 'Sitios y comparativas con foco más amplio en software de empresa, no solo microautónomos.',
    model: 'Programa de afiliados oficial en Impact y partner network para negocios más estructurados.',
    note: 'Puede servirte más adelante si amplías el panel con comparativas de software para pymes.',
    programUrl: 'https://www.sage.com/es-es/soporte-actualizacion/programa-de-afiliados/',
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
    dateModified: '2026-04-25',
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
            <h1>Mejores programas de facturación para autónomos en España</h1>
            <p className="lead">
              Si ya tienes claro cuánto necesitas facturar, el siguiente cuello de botella suele ser
              otro: con qué herramienta hacerlo sin perder tiempo, control ni margen. Esta guía no
              busca darte una lista infinita, sino ayudarte a elegir según tu forma real de trabajar.
            </p>
            <div className="hero-badges" aria-label="Qué cubre esta guía">
              <span className="hero-badge">Autónomos en España</span>
              <span className="hero-badge">VERI*FACTU</span>
              <span className="hero-badge">Herramientas actuales</span>
              <span className="hero-badge">Partner y afiliación oficial</span>
            </div>
            <div className="guide-cta">
              <Link href="/#calculadora" className="primary-button">
                Ir a la calculadora
              </Link>
            </div>
          </div>

          <aside className="feature-card article-summary">
            <h2>Cómo está hecha esta comparativa</h2>
            <ul className="article-list">
              <li>Criterios pensados para autónomos y freelancers en España.</li>
              <li>Herramientas revisadas en sus páginas oficiales a 25 de abril de 2026.</li>
              <li>Foco en encaje práctico, no en promesas de marketing.</li>
              <li>Se señalan solo programas comerciales oficiales, no rumores ni directorios externos.</li>
              <li>Útil para elegir software antes de casarte con una herramienta.</li>
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
          <h2>Opciones que si merece la pena mirar</h2>
          <p>
            Estas opciones no cubren exactamente el mismo perfil, y justo por eso merece la pena
            verlas juntas. La idea no es coronar una ganadora universal, sino ayudarte a descartar
            más rápido.
          </p>
          <div className="disclaimer-box">
            <strong>Transparencia:</strong> los enlaces de esta guía apuntan a páginas oficiales.
            A día de hoy no estoy usando tracking propio en esta comparativa. Si en el futuro
            añado enlaces de recomendación o afiliación, lo indicaré de forma expresa en esta
            misma página.
          </div>
        </div>
        <div className="container feature-grid" aria-label="Programas destacados">
          {softwareOptions.map((option) => (
            <article className="feature-card commercial-card" key={option.name}>
              <span className="card-kicker">Herramienta destacada</span>
              <h3>{option.name}</h3>
              <p>{option.summary}</p>
              <p>
                <strong>Mejor para:</strong> {option.fit}
              </p>
              <p className="commercial-note">{option.commercialModel}</p>
              <div className="button-row">
                <a className="secondary-button" href={option.productUrl} target="_blank" rel="noreferrer">
                  {option.productLabel}
                </a>
                {option.programUrl ? (
                  <a className="link-button" href={option.programUrl} target="_blank" rel="noreferrer">
                    {option.programLabel}
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section alt">
        <div className="container feature-grid" aria-label="Qué opción suele encajar mejor según perfil">
          <article className="feature-card">
            <h2>Si emites pocas facturas</h2>
            <p>
              La aplicación gratuita de la AEAT puede ser suficiente si buscas una solución oficial,
              simple y con operativa reducida.
            </p>
          </article>

          <article className="feature-card">
            <h2>Si quieres control más completo</h2>
            <p>
              Holded o Quipu tienen más sentido si necesitas unir facturación con gastos, banco,
              impuestos o una visión más amplia del negocio.
            </p>
          </article>

          <article className="feature-card">
            <h2>Si tu prioridad es cumplimiento fácil</h2>
            <p>
              FacturaDirecta destaca especialmente en cómo comunica la parte de VERI*FACTU y la
              emisión de facturas verificables.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>Mi lectura rápida: mejor opción según el tipo de autónomo</h2>
          <p>
            Esta parte es una <strong>inferencia editorial</strong> mía a partir de como cada
            herramienta se presenta en sus páginas oficiales, no una afirmación contractual de los
            proveedores. La idea es ayudarte a descartar más rápido.
          </p>
        </div>
        <div className="container feature-grid" aria-label="Mejor programa según perfil">
          <article className="feature-card">
            <h3>AEAT VERI*FACTU</h3>
            <p>
              Mejor si buscas una opción oficial, gratuita y muy básica para una operativa pequeña
              y con pocas facturas.
            </p>
          </article>

          <article className="feature-card">
            <h3>Holded</h3>
            <p>
              Mejor si quieres una visión más amplia del negocio y te interesa juntar facturación,
              gastos, banco e impuestos en una misma plataforma.
            </p>
          </article>

          <article className="feature-card">
            <h3>Quipu</h3>
            <p>
              Mejor si quieres una herramienta muy pensada para el autónomo y una operativa diaria
              sencilla entre facturas, tickets, impuestos y conciliación.
            </p>
          </article>

          <article className="feature-card">
            <h3>FacturaDirecta</h3>
            <p>
              Mejor si tu prioridad número uno es facturar fácil y tener muy aterrizada la parte de
              VERI*FACTU y cumplimiento normativo.
            </p>
          </article>
        </div>
      </section>

      <section className="section alt">
        <div className="container text-block">
          <h2>Si quieres monetizar una comparativa, estas son las vías más claras hoy</h2>
          <p>
            Si tu idea es recomendar software desde una web de contenido, no todas las herramientas
            sirven igual. Algunas tienen un programa de afiliados claro, otras funcionan mejor como
            partner o reseller, y otras solo tienen sentido como referencia editorial.
          </p>
        </div>
        <div className="container feature-grid" aria-label="Opciones oficiales para monetizar comparativas">
          {monetizationOptions.map((option) => (
            <article className="feature-card" key={option.name}>
              <span className="card-kicker">Opción comercial oficial</span>
              <h3>{option.name}</h3>
              <p>
                <strong>Encaje:</strong> {option.audience}
              </p>
              <p>
                <strong>Modelo:</strong> {option.model}
              </p>
              <p>{option.note}</p>
              <div className="button-row">
                <a className="secondary-button" href={option.programUrl} target="_blank" rel="noreferrer">
                  Ver programa oficial
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>Errores típicos al elegir software de facturación</h2>
          <ol className="article-list article-list-ordered">
            <li>Elegir por precio sin mirar si de verdad encaja con tu operativa.</li>
            <li>Pagar por una suite enorme cuando solo emites pocas facturas al mes.</li>
            <li>Elegir una opción mínima cuando si necesitas banco, gastos y asesoría conectados.</li>
            <li>No revisar cómo afronta la herramienta la parte normativa.</li>
            <li>Tomar la decisión antes de saber cuánto necesitas facturar de verdad.</li>
          </ol>
          <p>
            Ese último punto importa mucho: si no sabes tu referencia económica, es fácil pedir al
            software que te arregle un problema de precios que en realidad viene de antes.
          </p>
          <div className="disclaimer-box">
            <strong>Mi criterio:</strong> si algún día monetizas esta comparativa, intenta que la
            comisión sea una consecuencia del encaje real y no el motivo principal de la
            recomendación. A medio plazo, eso suele convertir mejor y quemar menos la confianza.
          </div>
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
            Antes de comparar software, te conviene saber cuánto necesitas facturar y que tarifa te
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
