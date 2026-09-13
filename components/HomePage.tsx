import Image from 'next/image';
import AdSlot from '@/components/AdSlot';
import CalculatorForm, { type CalculatorFormValues } from '@/components/CalculatorForm';
import LeadMagnetForm from '@/components/LeadMagnetForm';
import { siteConfig } from '@/lib/site';

type HomePageProps = {
  calculatorInitialValues?: Partial<CalculatorFormValues>;
  calculatorInitiallySubmitted?: boolean;
  enableResultCopy?: boolean;
  initialShareUrl?: string;
  trackServerConversion?: boolean;
};

const outcomeItems = [
  'Facturación mensual mínima',
  'Tarifa media por hora',
  'IVA, IRPF y cuota separados',
] as const;

export default function HomePage({
  calculatorInitialValues,
  calculatorInitiallySubmitted = false,
  enableResultCopy = true,
  initialShareUrl,
  trackServerConversion = false,
}: HomePageProps) {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: siteConfig.name,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    inLanguage: 'es',
    isAccessibleForFree: true,
    description: siteConfig.description,
    url: siteConfig.url,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    featureList: [
      'Facturación mensual mínima para autónomos',
      'Tarifa media orientativa por hora',
      'Cuota, IRPF e IVA calculados por separado',
    ],
  };

  return (
    <main id="contenido-principal" className="cost-landing">
      <script
        id="webapp-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />

      <section className="cost-hero" aria-labelledby="cost-home-hero-title">
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
          <span className="cost-hero-kicker">Calculadora para autónomos y freelance</span>
          <h1 id="cost-home-hero-title">Cuánto facturar como autónomo, sin quedarte corto.</h1>
          <p>
            Convierte tu neto objetivo, gastos y horas en una tarifa clara que puedas defender.
          </p>

          <div className="cost-hero-actions">
            <a href="#calculadora" className="primary-button">
              Calcular mi cifra
            </a>
            <a href="#como-funciona" className="cost-ghost-button">
              Ver qué obtengo
            </a>
          </div>
        </div>
      </section>

      <section className="cost-calculator-band" aria-labelledby="cost-home-calculator-heading">
        <div className="container cost-calculator-shell">
          <div className="cost-calculator-copy">
            <span className="eyebrow">Calcula antes de presupuestar</span>
            <h2 id="cost-home-calculator-heading">Tu sueldo empieza en la cifra que facturas.</h2>
            <p>Introduce tus números. El resultado aparece debajo, sin registro.</p>
          </div>

          <CalculatorForm
            initialValues={calculatorInitialValues}
            initiallySubmitted={calculatorInitiallySubmitted}
            enableResultCopy={enableResultCopy}
            initialShareUrl={initialShareUrl}
            trackServerConversion={trackServerConversion}
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

      <AdSlot placement="primary" />

      <section className="cost-checklist-band" id="kit-tarifa-form">
        <div className="container cost-checklist-grid">
          <div className="cost-checklist-copy">
            <span className="eyebrow">Después del cálculo</span>
            <h2>Revisa la tarifa antes de enviarla.</h2>
            <p>Una checklist corta para comprobar margen, alcance y horas no facturables.</p>
          </div>

          <LeadMagnetForm
            source="home"
            title="Recibe la checklist para revisar tu tarifa"
            description="Comprueba que tu precio no se queda corto antes de presupuestar."
            buttonLabel="Enviar checklist gratis"
          />
        </div>
      </section>

      <AdSlot placement="secondary" />
    </main>
  );
}
