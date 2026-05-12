import type { AppProps } from 'next/app';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { siteConfig } from '@/lib/site';
import '@/app/globals.css';

const googleAdsPageViewConversion = `${siteConfig.googleAdsId}/${siteConfig.googleAdsPageViewConversionLabel}`;

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <a className="skip-link" href="#contenido-principal">
        Saltar al contenido principal
      </a>
      <Header />
      <Component {...pageProps} />
      <Footer />
      <script
        defer
        src="/_vercel/insights/script.js"
        data-sdkn="@vercel/analytics/next"
        data-sdkv="2.0.1"
      />
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${siteConfig.googleAdsId}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${siteConfig.googleAdsId}');if(['/', '/cuanto-facturar-autonomo'].includes(window.location.pathname)){gtag('event','conversion',{'send_to':'${googleAdsPageViewConversion}'});}`,
        }}
      />
    </>
  );
}
