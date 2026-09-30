import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LeadMagnetForm from '@/components/LeadMagnetForm';
import { getSiteUrl, siteConfig } from '@/lib/site';

const route = '/cuanto-facturar-autonomo-2000-euros';
const title = 'Cuánto facturar como autónomo para ganar 2000 euros netos';
const description =
  'Guía práctica para estimar cuánto facturar como autónomo o freelance en España si quieres llegar a 2000 euros netos al mes sin olvidarte de cuota, IRPF, IVA y gastos.';

const pageFaqItems = [
  {
    question: '¿Cuánto hay que facturar para ganar 2000 euros netos?',
    answer:
      'No existe una sola cifra, porque depende de tus gastos, de la cuota de autónomos, del IRPF que reserves, de si repercutes IVA y de cuantas horas puedas facturar al mes. Por eso conviene usar una simulación y no un número fijo copiado de otra persona.',
  },
  {
    question: '¿2000 euros netos equivalen a 2000 euros facturados?',
    answer:
      'No. Facturar y conservar no son lo mismo. Para quedarte con 2000 euros netos normalmente tendrás que facturar bastante más, porque antes se restan gastos, cuota y reserva fiscal.',
  },
  {
    question: '¿Sirve esta referencia si trabajo por proyecto y no por horas?',
    answer:
      'Sí. Aunque cierres proyectos, una referencia mensual como esta te ayuda a validar si tus presupuestos te dejan realmente el neto que buscas o si estás trabajando por debajo de tu suelo.',
  },
] as const;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: route,
  },
  keywords: [
    'cuánto facturar autónomo para ganar 2000 euros',
    'cuánto facturar freelance 2000 euros',
    'ganar 2000 euros autónomo',
    'cuánto cobrar autónomo 2000 netos',
    'cuánto facturar 2000 euros netos',
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

export default function CuantoFacturarAutonomo2000EurosPage() {
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
    datePublished: '2026-04-24',
    dateModified: '2026-04-24',
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
        id="cuanto-facturar-2000-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script
        id="cuanto-facturar-2000-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="cuanto-facturar-2000-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Header />

      <section className="hero">
        <div className="container article-layout">
          <div className="text-block">
            <span className="eyebrow">Guía práctica</span>
            <h1>Cuánto facturar como autónomo para ganar 2000 euros netos</h1>
            <p className="lead">
              Si tu objetivo es llegar a 2000 euros netos al mes, la pregunta útil no es qué tarifa
              te gustaría cobrar, sino cuánto necesitas facturar de verdad para que, después de
              gastos, cuota, IRPF e IVA, esa cifra siga quedándose contigo.
            </p>
            <div className="hero-badges" aria-label="Qué cubre esta guía">
              <span className="hero-badge">2000 euros netos</span>
              <span className="hero-badge">Cuota e IRPF</span>
              <span className="hero-badge">Tarifa por hora</span>
            </div>
            <div className="guide-cta">
              <Link href="/#calculadora" className="primary-button">
                Ir a la calculadora
              </Link>
            </div>
          </div>

          <aside className="feature-card article-summary">
            <h2>Qué vas a aterrizar aquí</h2>
            <ul className="article-list">
              <li>Por qué 2000 euros netos exigen facturar bastante más de 2000.</li>
              <li>Qué variables cambian la cifra final qué necesitas.</li>
              <li>Como bajar esa referencia a horas o a presupuestos cerrados.</li>
              <li>Qué errores suelen hacerte infravalorar tu mínimo razonable.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>Para llegar a 2000 euros netos, no basta con cobrar 2000</h2>
          <p>
            Es uno de los errores más comunes al empezar o al revisar tarifas. Si quieres conservar
            2000 euros netos al mes, antes tienes que cubrir tu cuota de autónomos, tus gastos
            deducibles, la reserva fiscal y, si aplica, separar el IVA para no confundirlo con
            dinero disponible.
          </p>
          <p>
            La cifra exacta cambia según tu situación, pero la lógica siempre es la misma: el neto
            es el resultado final, no el punto de partida de tu facturación.
          </p>
          <div className="disclaimer-box">
            <strong>Idea clave:</strong> pensar en 2000 euros netos es útil, pero necesitas
            convertir esa meta en una facturación mensual más alta y después bajarla a una tarifa o
            a presupuestos concretos.
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container feature-grid" aria-label="Factores que cambian la cifra">
          <article className="feature-card">
            <h2>1. Gastos y cuota</h2>
            <p>
              Cuanto más consuma tu actividad entre gastos y cotización, mayor tendrá que ser la
              facturación necesaria para llegar a esos 2000 euros netos.
            </p>
          </article>

          <article className="feature-card">
            <h2>2. Reserva de IRPF</h2>
            <p>
              Si no reservas impuestos antes de tocar ese dinero, la sensación de estar llegando al
              objetivo suele ser engañosa y te obliga a corregir después.
            </p>
          </article>

          <article className="feature-card">
            <h2>3. Horas facturables reales</h2>
            <p>
              No todas tus horas de trabajo se pueden vender. Esa diferencia es la que luego empuja
              hacia arriba la tarifa por hora qué necesitas defender.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>Fórmula mental rápida para un objetivo de 2000 euros</h2>
          <ol className="article-list article-list-ordered">
            <li>Fija 2000 euros como neto real que quieres conservar.</li>
            <li>Suma tus gastos deducibles mensuales.</li>
            <li>Añade una cuota de autónomos realista para tu situación.</li>
            <li>Reserva IRPF antes de considerar ese dinero como tuyo.</li>
            <li>Separa el IVA si tu actividad lo repercute.</li>
            <li>Divide la facturación objetivo entre horas facturables, no entre todas tus horas.</li>
          </ol>
          <p>
            Eso te da una referencia mucho más útil que elegir una tarifa por intuición y esperar
            que encaje. Si además trabajas por proyecto, esa referencia te sirve para validar si tus
            propuestas te dejan realmente esos 2000 euros netos o si se quedan cortas.
          </p>
        </div>
      </section>

      <section className="section alt">
        <div className="container feature-grid" aria-label="Errores frecuentes">
          <article className="feature-card">
            <h2>Olvidar la parte fiscal</h2>
            <p>
              Si calculas solo con lo que quieres llevarte al bolsillo, la tarifa resultante suele
              ser demasiado optimista.
            </p>
          </article>

          <article className="feature-card">
            <h2>Subestimar tus horas vendibles</h2>
            <p>
              Administración, reuniones, ventas y seguimiento también ocupan tiempo, aunque el
              cliente no te las pague por separado.
            </p>
          </article>

          <article className="feature-card">
            <h2>No revisar escenarios</h2>
            <p>
              Un mismo objetivo de 2000 euros cambia bastante si suben tus gastos, cambia tu cuota o
              reduces las horas que puedes facturar sin saturarte.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>Usa la calculadora para aterrizar tu caso real</h2>
          <p>
            Esta guía te da el marco. La calculadora te ayuda a probar tu caso con gastos, cuota,
            IRPF, horas facturables, IVA y comunidad autónoma para acercarte a una cifra mensual y
            una tarifa por hora más defendible.
          </p>
          <p>
            Si tus 2000 euros netos son una meta cercana, esta es probablemente la forma más rápida
            de ver si tu precio actual la sostiene o si necesitas ajustar tarifa, horas o tipo de
            cliente.
          </p>
          <div className="guide-cta">
            <Link href="/#calculadora" className="primary-button">
              Calcular mi referencia
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <LeadMagnetForm
            source="guia-2000-euros"
            title="Revisa tu tarifa antes de perseguir esos 2.000 euros netos"
            description="Te enviamos el kit con la estructura mínima para revisar horas facturables, margen, cuota, impuestos e IVA antes de aceptar un precio."
            buttonLabel="Quiero el kit"
          />
        </div>
      </section>

      <section className="section alt" aria-labelledby="cuanto-facturar-2000-faq-title">
        <div className="container text-block">
          <h2 id="cuanto-facturar-2000-faq-title">
            Preguntas frecuentes sobre cuánto facturar para ganar 2000 euros
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

      <section className="section">
        <div className="container text-block">
          <span className="eyebrow">Siguiente lectura</span>
          <h2>Después de tu objetivo mensual, toca aterrizar la tarifa</h2>
          <p>
            Si ya te orientas mejor con un objetivo de 2000 euros netos, el siguiente paso útil es
            convertir esa referencia en una tarifa por hora o seguir por la guía general sobre cuanto
            facturar como autónomo.
          </p>
          <div className="guide-cta">
            <Link href="/tarifa-freelance-por-hora" className="primary-button">
              Leer guía sobre tarifa por hora
            </Link>
            <Link href="/cuanto-facturar-autonomo" className="primary-button">
              Volver a la guía general
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
