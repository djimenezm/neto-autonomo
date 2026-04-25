import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { getSiteUrl, siteConfig } from '@/lib/site';

const route = '/mejores-programas-facturacion-autonomos';
const title = 'Mejores programas de facturacion para autonomos en Espana';
const description =
  'Comparativa practica de programas de facturacion para autonomos en Espana: que mirar, cuando compensa una opcion gratis y que herramientas encajan mejor segun tu forma de trabajar.';

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
        </div>
        <div className="container feature-grid" aria-label="Programas destacados">
          <article className="feature-card">
            <h3>Aplicacion gratuita VERI*FACTU de la AEAT</h3>
            <p>
              La opcion oficial y gratuita. La Agencia Tributaria la presenta como una aplicacion
              para generar facturas electronicas y remitir los registros directamente, orientada a
              autonomos, profesionales y empresas con volumen reducido de facturas.
            </p>
            <p>
              Encaja si quieres una base muy simple, oficial y sin coste para una operativa pequena.
            </p>
          </article>

          <article className="feature-card">
            <h3>Holded</h3>
            <p>
              En sus paginas para autonomos destaca facturacion, control de gastos, sincronizacion
              bancaria y preparacion de modelos fiscales, ademas de una posicion clara sobre su
              adaptacion a VERI*FACTU.
            </p>
            <p>
              Tiene sentido si quieres una plataforma mas completa y mas alla de la mera emision de
              facturas.
            </p>
          </article>

          <article className="feature-card">
            <h3>Quipu</h3>
            <p>
              Esta muy orientado a autonomos y pequenos negocios, con foco en facturas, tickets,
              control de impuestos, banco y una narrativa clara sobre adaptacion a VERI*FACTU.
            </p>
            <p>
              Suele encajar bien si quieres algo pensado para el dia a dia del autonomo y no solo
              para emitir documentos.
            </p>
          </article>

          <article className="feature-card">
            <h3>FacturaDirecta</h3>
            <p>
              Comunica muy fuerte la parte de VERI*FACTU: envio automatico del registro a la AEAT,
              codigo QR y cumplimiento de la normativa, con un enfoque bastante directo hacia
              pequena empresa y autonomos.
            </p>
            <p>
              Encaja si tu prioridad es facturar facil y sentir que la parte normativa esta muy
              aterrizada.
            </p>
          </article>
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
