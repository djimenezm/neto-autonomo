import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import HomePage from '@/components/HomePage';
import type { CalculatorFormValues } from '@/components/CalculatorForm';
import { siteConfig } from '@/lib/site';

const pageTitle = `${siteConfig.name} | ${siteConfig.title}`;
const calculatorQueryKeys = [
  'targetNet',
  'monthlyExpenses',
  'billableHours',
  'irpfMode',
  'autonomousCommunity',
  'irpfRate',
  'hasIVA',
  'selfEmployedFeeMode',
  'reducedFeePeriod',
  'selfEmployedFee',
];
const irpfModes = ['progressive', 'manual'] satisfies readonly CalculatorFormValues['irpfMode'][];
const autonomousCommunities = [
  'common',
  'madrid',
  'catalunya',
  'andalucia',
  'valencia',
] satisfies readonly CalculatorFormValues['autonomousCommunity'][];
const selfEmployedFeeModes = ['auto', 'reduced', 'manual'] satisfies readonly CalculatorFormValues['selfEmployedFeeMode'][];
const reducedFeePeriods = ['initial', 'extended'] satisfies readonly CalculatorFormValues['reducedFeePeriod'][];

type HomeIndexProps = {
  calculatorInitialValues?: Partial<CalculatorFormValues>;
  calculatorInitiallySubmitted: boolean;
};

export const config = {
  maxDuration: undefined,
  unstable_runtimeJS: false,
};

function getQueryValue(query: Record<string, string | string[] | undefined>, key: string) {
  const value = query[key];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function getAllowedValue<T extends string>(
  value: string | undefined,
  allowedValues: readonly T[],
  fallback: T,
) {
  return value && allowedValues.includes(value as T) ? (value as T) : fallback;
}

export const getServerSideProps: GetServerSideProps<HomeIndexProps> = async ({ query, res }) => {
  const calculatorInitiallySubmitted = calculatorQueryKeys.some((key) => query[key] !== undefined);

  if (!calculatorInitiallySubmitted) {
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

    return {
      props: {
        calculatorInitiallySubmitted: false,
      },
    };
  }

  res.setHeader('Cache-Control', 'private, no-store');

  return {
    props: {
      calculatorInitiallySubmitted: true,
      calculatorInitialValues: {
        targetNet: getQueryValue(query, 'targetNet') ?? '1500',
        monthlyExpenses: getQueryValue(query, 'monthlyExpenses') ?? '200',
        billableHours: getQueryValue(query, 'billableHours') ?? '80',
        irpfMode: getAllowedValue(getQueryValue(query, 'irpfMode'), irpfModes, 'progressive'),
        autonomousCommunity: getAllowedValue(
          getQueryValue(query, 'autonomousCommunity'),
          autonomousCommunities,
          'common',
        ),
        irpfRate: getQueryValue(query, 'irpfRate') ?? '15',
        hasIVA: getQueryValue(query, 'hasIVA') !== 'no',
        selfEmployedFeeMode: getAllowedValue(
          getQueryValue(query, 'selfEmployedFeeMode'),
          selfEmployedFeeModes,
          'auto',
        ),
        reducedFeePeriod: getAllowedValue(
          getQueryValue(query, 'reducedFeePeriod'),
          reducedFeePeriods,
          'initial',
        ),
        selfEmployedFee: getQueryValue(query, 'selfEmployedFee') ?? '0',
      },
    },
  };
};

export default function IndexPage({
  calculatorInitialValues,
  calculatorInitiallySubmitted,
}: HomeIndexProps) {
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
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={siteConfig.description} />
        <meta property="og:image" content={`${siteConfig.url}/opengraph-image`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={siteConfig.description} />
        <meta name="twitter:image" content={`${siteConfig.url}/opengraph-image`} />
        <meta name="theme-color" content={siteConfig.themeColor} />
      </Head>
      <HomePage
        calculatorInitialValues={calculatorInitialValues}
        calculatorInitiallySubmitted={calculatorInitiallySubmitted}
        enableResultCopy={false}
        trackServerConversion={calculatorInitiallySubmitted}
      />
    </>
  );
}
