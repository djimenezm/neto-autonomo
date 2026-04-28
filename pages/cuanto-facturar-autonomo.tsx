import Head from 'next/head';
import CuantoFacturarAutonomoPage, {
  description,
  route,
  title,
} from '@/components/CuantoFacturarAutonomoPage';
import { siteConfig } from '@/lib/site';

const pageTitle = `${title} | ${siteConfig.name}`;
const canonicalUrl = `${siteConfig.url}${route}`;

export const config = {
  maxDuration: undefined,
  unstable_runtimeJS: false,
};

export default function CuantoFacturarAutonomoIndexPage() {
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <meta
          name="keywords"
          content={[
            'cuanto facturar autonomo',
            'cuanto facturar freelance',
            'como calcular cuanto facturar autonomo',
            'tarifa freelance por hora',
            'cuanto cobrar por proyecto',
          ].join(', ')}
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta property="og:type" content="article" />
        <meta property="og:locale" content={siteConfig.locale} />
        <meta property="og:site_name" content={siteConfig.name} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={`${siteConfig.url}/opengraph-image`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={`${siteConfig.url}/opengraph-image`} />
        <meta name="theme-color" content={siteConfig.themeColor} />
      </Head>
      <CuantoFacturarAutonomoPage />
    </>
  );
}
