import type { Metadata } from 'next';
import Image from 'next/image';
import Script from 'next/script';
import CalculatorForm from '@/components/CalculatorForm';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LeadMagnetForm from '@/components/LeadMagnetForm';
import { getSiteUrl, siteConfig } from '@/lib/site';

const route = '/cuanto-cuesta-ser-autonomo';
const title = 'Cuanto cuesta ser autonomo: calculadora rapida';
const description =
  'Calcula cuanto necesitas facturar como autonomo para cubrir cuota, gastos, impuestos y horas facturables sin quedarte corto.';

const calculatorInitialValues = {
  targetNet: '1500',
  monthlyExpenses: '300',
  billableHours: '80',
  irpfMode: 'progressive' as const,
  autonomousCommunity: 'common' as const,
  hasIVA: true,
  selfEmployedFeeMode: 'auto' as const,
};

const outcomeItems = [
  'Facturacion mensual minima',
  'Tarifa media por hora',
  'IVA, IRPF y cuota separados',
] as const;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: route,
  },
  keywords: [
    'cuanto cuesta ser autonomo',
    'calculadora coste autonomo',
    'coste autonomo españa',
    'cuanto facturar autonomo',
    'tarifa autonomo por hora',
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
    dateModified: '2026-09-13',
    mainEntity: {
      '@type': 'SoftwareApplication',
      name: 'Calculadora de coste autonomo',
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
          <span className="cost-hero-kicker">Calculadora para autonomos</span>
          <h1 id="cost-hero-title">Tu tarifa no se intuye. Se calcula.</h1>
          <p>
            Mete tres numeros y descubre si ese presupuesto te deja sueldo, margen o solo una agenda
            llena.
          </p>

          <div className="cost-hero-actions">
            <a href="#calculadora" className="primary-button">
              Calcular ahora
            </a>
            <a href="#como-funciona" className="cost-ghost-button">
              Ver resultado
            </a>
          </div>
        </div>
      </section>

      <section className="cost-calculator-band" aria-labelledby="cost-calculator-heading">
        <div className="container cost-calculator-shell">
          <div className="cost-calculator-copy">
            <span className="eyebrow">Calcula antes de enviar precio</span>
            <h2 id="cost-calculator-heading">Pasa de “creo que esta bien” a una cifra defendible.</h2>
            <p>
              Introduce neto, gastos y horas. El resultado aparece debajo, sin registro.
            </p>
          </div>

          <CalculatorForm
            initialValues={calculatorInitialValues}
            enableResultCopy={false}
            updateUrlOnSubmit={false}
            trackServerConversion
          />
        </div>
      </section>

      <section className="cost-mini-strip" id="como-funciona" aria-label="Resultado de la calculadora">
        <div className="container cost-mini-strip-inner">
          <strong>Obtienes solo lo necesario:</strong>
          <div>
            {outcomeItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="cost-checklist-band" id="kit-tarifa-form">
        <div className="container cost-checklist-grid">
          <div className="cost-checklist-copy">
            <span className="eyebrow">Despues del calculo</span>
            <h2>Si la cifra te sorprende, revisala antes de enviarla.</h2>
            <p>
              Te mando una checklist corta para comprobar margen, alcance y horas no facturables.
            </p>
          </div>

          <LeadMagnetForm
            source="cuanto-cuesta-ser-autonomo"
            title="Recibe la checklist para revisar tu tarifa"
            description="Un recurso corto para comprobar que tu precio no se queda corto antes de presupuestar."
            buttonLabel="Enviar checklist gratis"
          />
        </div>
      </section>

      <Footer />
    </main>
  );
}
