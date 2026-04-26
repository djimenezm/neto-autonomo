import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LeadMagnetForm from '@/components/LeadMagnetForm';
import { getSiteUrl, siteConfig } from '@/lib/site';

const route = '/cuanto-facturar-autonomo-3000-euros';
const title = 'Cuanto facturar como autonomo para ganar 3000 euros netos';
const description =
  'Guia practica para estimar cuanto facturar como autonomo o freelance en Espana si quieres llegar a 3000 euros netos al mes teniendo en cuenta cuota, IRPF, IVA, gastos y horas facturables.';

const pageFaqItems = [
  {
    question: 'Cuanto hay que facturar para ganar 3000 euros netos?',
    answer:
      'Depende de tus gastos, cuota, IRPF, IVA y horas facturables. Para conservar 3000 euros netos normalmente necesitas facturar bastante mas, porque parte del ingreso cubre costes, cotizacion y reserva fiscal.',
  },
  {
    question: '3000 euros netos son una buena meta para un autonomo?',
    answer:
      'Puede ser una meta razonable si tu actividad tiene margen suficiente, pero conviene traducirla a facturacion mensual y tarifa por hora antes de usarla como objetivo comercial.',
  },
  {
    question: 'Como paso ese objetivo a una tarifa por hora?',
    answer:
      'Primero calcula la facturacion mensual necesaria sin confundir IVA con ingreso real. Despues divide entre tus horas facturables reales, no entre todas las horas que trabajas.',
  },
] as const;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: route,
  },
  keywords: [
    'cuanto facturar autonomo para ganar 3000 euros',
    'cuanto facturar 3000 euros netos',
    'ganar 3000 euros autonomo',
    'cuanto cobrar freelance 3000 netos',
    'facturacion autonomo 3000 euros netos',
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

export default function CuantoFacturarAutonomo3000EurosPage() {
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
    datePublished: '2026-04-26',
    dateModified: '2026-04-26',
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
        id="cuanto-facturar-3000-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script
        id="cuanto-facturar-3000-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="cuanto-facturar-3000-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Header />

      <section className="hero">
        <div className="container article-layout">
          <div className="text-block">
            <span className="eyebrow">Guia practica</span>
            <h1>Cuanto facturar como autonomo para ganar 3000 euros netos</h1>
            <p className="lead">
              Llegar a 3000 euros netos al mes como autonomo no significa facturar 3000 euros. La
              cifra que necesitas emitir suele ser mayor porque antes debes cubrir gastos, cuota,
              IRPF, tiempo no facturable y separar el IVA cuando corresponda.
            </p>
            <div className="hero-badges" aria-label="Que cubre esta guia">
              <span className="hero-badge">3000 euros netos</span>
              <span className="hero-badge">Tarifa por hora</span>
              <span className="hero-badge">Margen real</span>
            </div>
            <div className="guide-cta">
              <Link href="/#calculadora" className="primary-button">
                Ir a la calculadora
              </Link>
              <Link href="/cuanto-facturar-autonomo-2000-euros" className="primary-button">
                Ver objetivo de 2000 euros
              </Link>
            </div>
          </div>

          <aside className="feature-card article-summary">
            <h2>Que vas a aterrizar aqui</h2>
            <ul className="article-list">
              <li>Por que el objetivo neto no coincide con lo que facturas.</li>
              <li>Que variables empujan la facturacion necesaria hacia arriba.</li>
              <li>Como convertir 3000 euros netos en tarifa por hora o presupuesto.</li>
              <li>Que revisar antes de subir precios o aceptar nuevos clientes.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>El objetivo neto es el final del calculo, no el principio</h2>
          <p>
            Cuando piensas en 3000 euros netos, estas pensando en el dinero que quieres conservar
            despues de cubrir impuestos, cuota y costes de actividad. Si empiezas la cuenta desde
            3000 euros facturados, la tarifa resultante casi siempre se queda corta.
          </p>
          <p>
            La forma mas sana es trabajar hacia atras: primero defines el neto que quieres, despues
            sumas gastos y cuota, reservas IRPF, separas IVA si aplica y finalmente lo traduces a
            horas facturables o presupuestos cerrados.
          </p>
          <div className="disclaimer-box">
            <strong>Idea clave:</strong> 3000 euros netos pueden parecer una cifra clara, pero solo
            sirven como objetivo si los conviertes en una facturacion mensual sostenible.
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container feature-grid" aria-label="Factores que cambian la cifra">
          <article className="feature-card">
            <h2>1. Gastos y cuota</h2>
            <p>
              Herramientas, gestor, seguros, software, colaboraciones y cuota reducen el margen
              disponible antes de llegar al neto que quieres conservar.
            </p>
          </article>

          <article className="feature-card">
            <h2>2. Reserva fiscal</h2>
            <p>
              Si no separas una parte para IRPF y no distingues el IVA de tu ingreso real, puedes
              creer que estas llegando al objetivo cuando en realidad solo estas aplazando el ajuste.
            </p>
          </article>

          <article className="feature-card">
            <h2>3. Horas vendibles</h2>
            <p>
              Cuanto menos tiempo facturable tengas, mas exigente sera la tarifa por hora necesaria
              para sostener 3000 euros netos sin quemarte.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container article-layout">
          <div className="text-block">
            <h2>Formula para bajar 3000 euros netos a numeros reales</h2>
            <ol className="article-list article-list-ordered">
              <li>Define 3000 euros como neto mensual que quieres conservar.</li>
              <li>Suma gastos fijos y variables de tu actividad.</li>
              <li>Incluye una cuota de autonomos realista para tu situacion.</li>
              <li>Reserva IRPF antes de contar ese dinero como disponible.</li>
              <li>Separa el IVA si tu actividad lo repercute.</li>
              <li>Divide la facturacion objetivo entre horas facturables reales.</li>
              <li>Comprueba si tus presupuestos actuales sostienen esa tarifa minima.</li>
            </ol>
            <p>
              Si el resultado te parece alto, no significa que la cuenta este mal: puede significar
              que necesitas subir precios, vender proyectos con mas margen, reducir horas no
              facturables o replantear el tipo de cliente que aceptas.
            </p>
          </div>

          <aside className="feature-card article-summary">
            <h2>Senales de que tu precio se queda corto</h2>
            <ul className="article-list">
              <li>Llegas a final de mes facturando bien, pero con poco neto real.</li>
              <li>Mucho tiempo se va en gestion, ventas o cambios no presupuestados.</li>
              <li>El IVA o el IRPF te obligan a corregir despues.</li>
              <li>Tus proyectos cerrados no cubren las horas que realmente consumen.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section alt">
        <div className="container text-block">
          <h2>Como usar este objetivo para presupuestar mejor</h2>
          <p>
            Un objetivo de 3000 euros netos puede servirte como filtro comercial. Si una propuesta,
            una tarifa por hora o una mensualidad no te acercan a esa referencia, necesitas ajustar
            precio, alcance o tipo de cliente antes de comprometerte.
          </p>
          <p>
            Tambien puedes usarlo para comparar escenarios: mas horas facturables, menos gastos,
            tickets de proyecto mas altos, servicios recurrentes o una mezcla mas equilibrada entre
            clientes pequenos y clientes de mayor margen.
          </p>
          <div className="guide-cta">
            <Link href="/#calculadora" className="primary-button">
              Calcular mi escenario
            </Link>
            <Link href="/tarifa-freelance-por-hora" className="primary-button">
              Pasarlo a tarifa por hora
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <LeadMagnetForm
            source="guia-3000-euros"
            title="Revisa si tu tarifa sostiene 3000 euros netos"
            description="Llevate el kit para contrastar tu tarifa, tus horas facturables y tu margen antes de aceptar un proyecto o subir precios."
            buttonLabel="Quiero revisar mi tarifa"
          />
        </div>
      </section>

      <section className="section" id="faq-3000-euros">
        <div className="container text-block">
          <span className="eyebrow">Preguntas frecuentes</span>
          <h2>Dudas habituales sobre ganar 3000 euros netos como autonomo</h2>
          {pageFaqItems.map((item) => (
            <article className="disclaimer-box" key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
