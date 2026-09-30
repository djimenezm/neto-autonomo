import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import MonthlyCostCalculator from '@/components/MonthlyCostCalculator';
import { getSiteUrl, siteConfig } from '@/lib/site';

const route = '/cuanto-cuesta-ser-autonomo';
const title = 'Cuánto cuesta ser autónomo cada mes';
const description =
  'Suma tu cuota, gestoría, software, seguros y otros gastos para saber cuánto te cuesta mantener tu actividad cada mes y por hora facturable.';

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
  const siteUrl = getSiteUrl();
  const pageUrl = new URL(route, siteUrl).toString();

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    inLanguage: 'es',
    url: pageUrl,
    dateModified: '2026-09-22',
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

  return (
    <main id="contenido-principal" className="cost-landing">
      <Script
        id="cuanto-cuesta-ser-autonomo-webpage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <Script
        id="cuanto-cuesta-ser-autonomo-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
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
            Suma lo que pagas cada mes antes de pensar en tu sueldo. Cuota, herramientas y tiempo
            entran en la cuenta.
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
              Ajusta los importes del ejemplo a tus pagos reales. Verás el total mensual, su
              equivalente anual y cuánto pesa sobre cada hora facturable.
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

      <section className="section cost-explainer" id="que-incluye">
        <div className="container cost-explainer-grid">
          <div>
            <span className="eyebrow">Dentro del cálculo</span>
            <h2>Pagos que sostienen tu actividad</h2>
            <p>
              Incluye tu cuota real y los importes que pagas por gestoría, herramientas, seguros
              y otros gastos recurrentes. Si pagas algo una vez al año, divide el importe entre
              doce antes de escribirlo. La cifra por hora reparte esos costes solo entre el tiempo
              que puedes cobrar a clientes.
            </p>
          </div>
          <div>
            <span className="eyebrow">Fuera del cálculo</span>
            <h2>Lo que aún necesitas facturar</h2>
            <p>
              Esta suma no representa tu beneficio ni una liquidación fiscal. Para saber cuánto
              facturar, añade el neto que deseas conservar y estima IRPF, cuota e IVA según tu
              situación. No todos los pagos de actividad son necesariamente deducibles.
            </p>
            <Link href="/#calculadora" className="primary-button">
              Calcular mi facturación
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
