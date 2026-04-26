import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LeadMagnetForm from '@/components/LeadMagnetForm';
import { getSiteUrl, siteConfig } from '@/lib/site';

const route = '/mejores-programas-facturacion-autonomos';
const title = 'Mejores programas de facturacion para autonomos en Espana';
const description =
  'Comparativa practica de programas de facturacion para autonomos en Espana: que mirar, cuando compensa una opcion gratis, que herramientas encajan mejor segun tu forma de trabajar y que opciones oficiales tienen programas de recomendacion o partner.';

const pageFaqItems = [
  {
    question: 'Cual es el mejor programa de facturacion para autonomos?',
    answer:
      'No hay uno universal. Depende de si solo necesitas emitir facturas, si quieres banco e impuestos en la misma herramienta, si trabajas con una asesoria y de cuanto valoras automatizaciones y soporte.',
  },
  {
    question: 'Existe una opcion gratis para facturar como autonomo?',
    answer:
      'Si. La AEAT ofrece una aplicacion gratuita VERI*FACTU orientada a contribuyentes con volumen reducido de facturas. Puede encajar si buscas una solucion basica y oficial.',
  },
  {
    question: 'Que deberia mirar antes de elegir un software de facturacion?',
    answer:
      'Como minimo: cumplimiento normativo, facilidad para emitir facturas y presupuestos, control de cobros y gastos, acceso para asesoria, conciliacion bancaria si la necesitas y claridad de precios.',
  },
  {
    question: 'Se puede monetizar una comparativa de software de facturacion?',
    answer:
      'Si, pero conviene hacerlo con criterio. Algunas herramientas tienen programas oficiales de recomendacion, afiliacion o partner. Lo importante es dejar clara la naturaleza editorial de la comparativa y no recomendar una herramienta solo por su comision.',
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
    name: 'Aplicacion gratuita VERI*FACTU de la AEAT',
    summary:
      'La opcion oficial y gratuita para generar facturas y remitir registros directamente a la Agencia Tributaria.',
    fit: 'Mejor si emites pocas facturas y quieres una base simple, oficial y sin coste.',
    productUrl:
      'https://sede.agenciatributaria.gob.es/Sede/ayuda/consultas-informaticas/presentacion-declaraciones-ayuda-tecnica/aplicacion-gratuita-verifactu-aeat.html',
    productLabel: 'Ver aplicacion oficial',
    commercialModel:
      'No tiene afiliacion ni partner comercial; es una referencia util para comparar contra opciones de pago.',
  },
  {
    name: 'Holded',
    summary:
      'Plataforma mas amplia para unir facturacion, gastos, banco, impuestos y operativa general del negocio.',
    fit: 'Mejor si quieres una herramienta mas completa que vaya mas alla de emitir facturas.',
    productUrl: 'https://www.holded.com/es/autonomos',
    productLabel: 'Ver Holded para autonomos',
    programUrl: 'https://help.holded.com/es/articles/13435604-recomienda-holded-y-gana-dinero-en-efectivo',
    programLabel: 'Ver programa de recomendacion',
    commercialModel:
      'Holded indica un sistema de invitacion con un 50% de descuento durante 3 meses para el referido y una recompensa recurrente para quien recomienda, hasta un maximo de 500 euros por contacto.',
  },
  {
    name: 'Quipu',
    summary:
      'Herramienta muy orientada al dia a dia del autonomo: facturas, tickets, impuestos y conciliacion bancaria.',
    fit: 'Mejor si quieres una operativa sencilla y muy pensada para autonomos y pequenos negocios.',
    productUrl: 'https://getquipu.com/es/autonomos',
    productLabel: 'Ver Quipu para autonomos',
    programUrl: 'https://getquipu.com/es/referral',
    programLabel: 'Ver programa de afiliados',
    commercialModel:
      'Quipu publica un programa de afiliados con 30% sobre el importe real pagado por el cliente y una ventana recurrente de 12 meses en planes mensuales.',
  },
  {
    name: 'FacturaDirecta',
    summary:
      'Enfoque muy claro en VERI*FACTU y cumplimiento, con facturacion, impuestos y operativa sencilla para pequeno negocio.',
    fit: 'Mejor si tu prioridad es facturar facil y sentir muy aterrizada la parte normativa.',
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
    audience: 'Contenido para autonomos y freelancers que quieren una solucion mas completa.',
    model: 'Programa de recomendacion dentro del propio producto.',
    note: 'Encaja mejor si usas la herramienta o puedes enseñar casos de uso reales.',
    programUrl: 'https://help.holded.com/es/articles/13435604-recomienda-holded-y-gana-dinero-en-efectivo',
  },
  {
    name: 'Quipu',
    audience: 'Comparativas, tutoriales y contenido para autonomos con intencion de compra.',
    model: 'Programa de afiliados oficial publicado por Quipu.',
    note: 'Es la opcion mas parecida a un afiliado clasico para este nicho.',
    programUrl: 'https://getquipu.com/es/referral',
  },
  {
    name: 'FacturaDirecta',
    audience: 'Profesionales que gestionan varias cuentas o prestan servicio a clientes.',
    model: 'Programa partner con descuentos por volumen y gestion consolidada.',
    note: 'Tiene mas sentido como via reseller o partner que como blog de afiliacion tradicional.',
    programUrl: 'https://www.facturadirecta.com/partner/',
  },
  {
    name: 'Sage',
    audience: 'Sites y comparativas con foco mas amplio en software de empresa, no solo microautonomo.',
    model: 'Programa de afiliados oficial en Impact y partner network para negocios mas estructurados.',
    note: 'Puede servirte mas adelante si amplias el panel con comparativas de software para pymes.',
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
    'mejores programas facturacion autonomos',
    'software facturacion autonomos espana',
    'programa facturacion autonomos verifactu',
    'mejor software facturacion freelance',
    'programa para hacer facturas autonomo',
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
            <span className="eyebrow">Comparativa practica</span>
            <h1>Mejores programas de facturacion para autonomos en Espana</h1>
            <p className="lead">
              Si ya tienes claro cuanto necesitas facturar, el siguiente cuello de botella suele ser
              otro: con que herramienta hacerlo sin perder tiempo, control ni margen. Esta guia no
              busca darte una lista infinita, sino ayudarte a elegir segun tu forma real de trabajar.
            </p>
            <div className="hero-badges" aria-label="Que cubre esta guia">
              <span className="hero-badge">Autonomos en Espana</span>
              <span className="hero-badge">VERI*FACTU</span>
              <span className="hero-badge">Herramientas actuales</span>
              <span className="hero-badge">Partner y afiliacion oficial</span>
            </div>
            <div className="guide-cta">
              <Link href="/#calculadora" className="primary-button">
                Ir a la calculadora
              </Link>
            </div>
          </div>

          <aside className="feature-card article-summary">
            <h2>Como esta hecha esta comparativa</h2>
            <ul className="article-list">
              <li>Criterios pensados para autonomos y freelancers en Espana.</li>
              <li>Herramientas revisadas en sus paginas oficiales a 25 de abril de 2026.</li>
              <li>Foco en encaje practico, no en promesas de marketing.</li>
              <li>Se senalan solo programas comerciales oficiales, no rumores ni directorios externos.</li>
              <li>Util para elegir software antes de casarte con una herramienta.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>Que deberias mirar hoy antes de elegir un programa de facturacion</h2>
          <p>
            Para un autonomo en Espana ya no basta con que una herramienta haga facturas bonitas.
            Lo importante es que te ayude a trabajar mejor con la realidad de tu negocio: control
            de cobros, gastos, trazabilidad, cumplimiento y una forma razonable de compartir datos
            con tu asesoria si la tienes.
          </p>
          <p>
            El filtro mas util suele ser este: elige una herramienta que encaje con tu volumen, tu
            complejidad y tu forma de trabajar. Una solucion minima puede bastar si emites pocas
            facturas. Una plataforma mas completa compensa si quieres integrar banco, impuestos o
            automatizaciones.
          </p>
          <div className="disclaimer-box">
            <strong>Idea clave:</strong> el mejor software no es el que tiene mas funciones. Es el
            que te ahorra mas friccion sin empujarte a pagar por complejidad que no vas a usar.
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container feature-grid" aria-label="Criterios para elegir software de facturacion">
          <article className="feature-card">
            <h2>1. Cumplimiento y tranquilidad</h2>
            <p>
              Revisa si la herramienta habla claro de VERI*FACTU, trazabilidad, codigo QR y
              adaptacion a la normativa. Hoy ya es un criterio de compra, no un extra.
            </p>
          </article>

          <article className="feature-card">
            <h2>2. Cobros, gastos e impuestos</h2>
            <p>
              Si quieres algo mas que emitir facturas, valora si te ayuda con gastos, modelos,
              prevision fiscal o conciliacion bancaria.
            </p>
          </article>

          <article className="feature-card">
            <h2>3. Encaje con tu operativa</h2>
            <p>
              No necesita lo mismo quien emite 8 facturas al mes que quien trabaja con clientes,
              tickets, banco, presupuestos y asesoria en paralelo.
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
            mas rapido.
          </p>
          <div className="disclaimer-box">
            <strong>Transparencia:</strong> los enlaces de esta guia apuntan a paginas oficiales.
            A dia de hoy no estoy usando tracking propio en esta comparativa. Si en el futuro
            anado enlaces de recomendacion o afiliacion, lo indicare de forma expresa en esta
            misma pagina.
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
        <div className="container feature-grid" aria-label="Que opcion suele encajar mejor segun perfil">
          <article className="feature-card">
            <h2>Si emites pocas facturas</h2>
            <p>
              La aplicacion gratuita de la AEAT puede ser suficiente si buscas una solucion oficial,
              simple y con operativa reducida.
            </p>
          </article>

          <article className="feature-card">
            <h2>Si quieres control mas completo</h2>
            <p>
              Holded o Quipu tienen mas sentido si necesitas unir facturacion con gastos, banco,
              impuestos o una vision mas amplia del negocio.
            </p>
          </article>

          <article className="feature-card">
            <h2>Si tu prioridad es cumplimiento facil</h2>
            <p>
              FacturaDirecta destaca especialmente en como comunica la parte de VERI*FACTU y la
              emision de facturas verificables.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>Mi lectura rapida: mejor opcion segun el tipo de autonomo</h2>
          <p>
            Esta parte es una <strong>inferencia editorial</strong> mia a partir de como cada
            herramienta se presenta en sus paginas oficiales, no una afirmacion contractual de los
            proveedores. La idea es ayudarte a descartar mas rapido.
          </p>
        </div>
        <div className="container feature-grid" aria-label="Mejor programa segun perfil">
          <article className="feature-card">
            <h3>AEAT VERI*FACTU</h3>
            <p>
              Mejor si buscas una opcion oficial, gratuita y muy basica para una operativa pequena
              y con pocas facturas.
            </p>
          </article>

          <article className="feature-card">
            <h3>Holded</h3>
            <p>
              Mejor si quieres una vision mas amplia del negocio y te interesa juntar facturacion,
              gastos, banco e impuestos en una misma plataforma.
            </p>
          </article>

          <article className="feature-card">
            <h3>Quipu</h3>
            <p>
              Mejor si quieres una herramienta muy pensada para el autonomo y una operativa diaria
              sencilla entre facturas, tickets, impuestos y conciliacion.
            </p>
          </article>

          <article className="feature-card">
            <h3>FacturaDirecta</h3>
            <p>
              Mejor si tu prioridad numero uno es facturar facil y tener muy aterrizada la parte de
              VERI*FACTU y cumplimiento normativo.
            </p>
          </article>
        </div>
      </section>

      <section className="section alt">
        <div className="container text-block">
          <h2>Si quieres monetizar una comparativa, estas son las vias mas claras hoy</h2>
          <p>
            Si tu idea es recomendar software desde una web de contenido, no todas las herramientas
            sirven igual. Algunas tienen un programa de afiliados claro, otras funcionan mejor como
            partner o reseller, y otras solo tienen sentido como referencia editorial.
          </p>
        </div>
        <div className="container feature-grid" aria-label="Opciones oficiales para monetizar comparativas">
          {monetizationOptions.map((option) => (
            <article className="feature-card" key={option.name}>
              <span className="card-kicker">Opcion comercial oficial</span>
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
          <h2>Errores tipicos al elegir software de facturacion</h2>
          <ol className="article-list article-list-ordered">
            <li>Elegir por precio sin mirar si de verdad encaja con tu operativa.</li>
            <li>Pagar por una suite enorme cuando solo emites pocas facturas al mes.</li>
            <li>Elegir una opcion minima cuando si necesitas banco, gastos y asesoria conectados.</li>
            <li>No revisar como afronta la herramienta la parte normativa.</li>
            <li>Tomar la decision antes de saber cuanto necesitas facturar de verdad.</li>
          </ol>
          <p>
            Ese ultimo punto importa mucho: si no sabes tu referencia economica, es facil pedir al
            software que te arregle un problema de precios que en realidad viene de antes.
          </p>
          <div className="disclaimer-box">
            <strong>Mi criterio:</strong> si algun dia monetizas esta comparativa, intenta que la
            comision sea una consecuencia del encaje real y no el motivo principal de la
            recomendacion. A medio plazo, eso suele convertir mejor y quemar menos la confianza.
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
          <h2>Primero define tu numero, luego elige la herramienta</h2>
          <p>
            Antes de comparar software, te conviene saber cuanto necesitas facturar y que tarifa te
            sostiene. Si esa base no esta clara, la herramienta te puede ordenar la facturacion,
            pero no te va a arreglar un precio mal planteado.
          </p>
          <p>
            Si estas afinando tu referencia mensual, puedes apoyarte tambien en la guia sobre{' '}
            <Link href="/cuanto-facturar-autonomo">cuanto facturar como autonomo</Link> y en el caso
            concreto de{' '}
            <Link href="/cuanto-facturar-autonomo-2000-euros">
              cuanto facturar para ganar 2000 euros netos
            </Link>
            .
          </p>
          <div className="guide-cta">
            <Link href="/#calculadora" className="primary-button">
              Calcular cuanto facturar
            </Link>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="programas-facturacion-faq-title">
        <div className="container text-block">
          <h2 id="programas-facturacion-faq-title">
            Preguntas frecuentes sobre programas de facturacion para autonomos
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
