import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import HomePage from '@/components/HomePage';
import { DEFAULT_FORM_VALUES, type CalculatorFormValues } from '@/lib/calculatorForm';
import { calculatorQueryKeys, calculateValidSharedResult, readCalculatorQuery } from '@/lib/calculatorQuery';
import { siteConfig } from '@/lib/site';

const pageTitle = 'Cuánto facturar como autónomo | Calculadora gratis';

type HomeIndexProps = {
  calculatorInitialValues?: Partial<CalculatorFormValues>;
  calculatorInitiallySubmitted: boolean;
  calculatorShareUrl?: string;
  importedFromCosts?: boolean;
};

function getQueryValue(query: Record<string, string | string[] | undefined>, key: string) {
  const value = query[key];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function getResultImageUrl(values?: Partial<CalculatorFormValues>) {
  if (!values) {
    return `${siteConfig.url}/opengraph-image`;
  }

  const params = new URLSearchParams();

  calculatorQueryKeys.forEach((key) => {
    const value = values[key as keyof CalculatorFormValues];

    if (value !== undefined) {
      params.set(key, typeof value === 'boolean' ? (value ? 'yes' : 'no') : String(value));
    }
  });

  return `${siteConfig.url}/resultado-opengraph-image?${params.toString()}`;
}

function getCalculatorShareUrl(values?: Partial<CalculatorFormValues>) {
  if (!values) {
    return `${siteConfig.url}/#calculadora`;
  }

  const url = new URL(siteConfig.url);
  url.pathname = '/';
  url.hash = 'calculadora';

  calculatorQueryKeys.forEach((key) => {
    const value = values[key as keyof CalculatorFormValues];

    if (value !== undefined) {
      url.searchParams.set(key, typeof value === 'boolean' ? (value ? 'yes' : 'no') : String(value));
    }
  });

  return url.toString();
}

export const getServerSideProps: GetServerSideProps<HomeIndexProps> = async ({ query, res }) => {
  const hasCalculatorValues = calculatorQueryKeys.some((key) => query[key] !== undefined);
  const importedFromCosts = hasCalculatorValues && getQueryValue(query, 'source') === 'monthly-costs';
  const calculatorInitiallySubmitted = hasCalculatorValues && !importedFromCosts;

  if (!hasCalculatorValues) {
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

    return {
      props: {
        calculatorInitiallySubmitted: false,
      },
    };
  }

  res.setHeader('Cache-Control', 'private, no-store');

  const calculatorInitialValues = readCalculatorQuery((key) => getQueryValue(query, key));

  return {
    props: {
      calculatorInitiallySubmitted,
      importedFromCosts,
      calculatorInitialValues,
      ...(calculatorInitiallySubmitted
        ? { calculatorShareUrl: getCalculatorShareUrl(calculatorInitialValues) }
        : {}),
    },
  };
};

export default function IndexPage({
  calculatorInitialValues,
  calculatorInitiallySubmitted,
  calculatorShareUrl,
  importedFromCosts,
}: HomeIndexProps) {
  const hasValidSharedResult = calculatorInitiallySubmitted && calculatorInitialValues !== undefined
    && calculateValidSharedResult({ ...DEFAULT_FORM_VALUES, ...calculatorInitialValues }) !== null;
  const openGraphImage = hasValidSharedResult
    ? getResultImageUrl(calculatorInitialValues)
    : `${siteConfig.url}/opengraph-image`;
  const openGraphTitle = hasValidSharedResult
    ? 'Resultado orientativo para facturar como autónomo'
    : pageTitle;
  const openGraphDescription = hasValidSharedResult
    ? 'Calculadora precargada con una referencia de facturación mensual y tarifa por hora para autónomos.'
    : siteConfig.description;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={siteConfig.description} />
        <meta name="keywords" content={siteConfig.keywords.join(', ')} />
        <meta name="application-name" content={siteConfig.name} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${siteConfig.url}/`} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={siteConfig.locale} />
        <meta property="og:site_name" content={siteConfig.name} />
        <meta property="og:url" content={`${siteConfig.url}/`} />
        <meta property="og:title" content={openGraphTitle} />
        <meta property="og:description" content={openGraphDescription} />
        <meta property="og:image" content={openGraphImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={openGraphTitle} />
        <meta name="twitter:description" content={openGraphDescription} />
        <meta name="twitter:image" content={openGraphImage} />
        <meta name="theme-color" content={siteConfig.themeColor} />
      </Head>
      <HomePage
        calculatorInitialValues={calculatorInitialValues}
        calculatorInitiallySubmitted={calculatorInitiallySubmitted}
        enableResultCopy={false}
        initialShareUrl={calculatorShareUrl}
        trackServerConversion={calculatorInitiallySubmitted}
        importedFromCosts={importedFromCosts}
      />
    </>
  );
}
