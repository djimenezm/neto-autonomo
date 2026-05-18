import type { AppProps } from 'next/app';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { siteConfig } from '@/lib/site';
import '@/app/globals.css';

const googleAdsPageViewConversion = `${siteConfig.googleAdsId}/${siteConfig.googleAdsPageViewConversionLabel}`;
const resultKitCtaTrackingScript = `window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};(function(){if(window.__cuantoFacturarResultKitTracking)return;window.__cuantoFacturarResultKitTracking=true;document.addEventListener('click',function(event){var target=event.target&&event.target.closest?event.target.closest('[data-result-kit-cta]'):null;if(!target||event.__cuantoFacturarResultKitTracked)return;var data={source:target.getAttribute('data-result-kit-cta')||'result-card'};window.va('event',{name:'result_kit_cta_clicked',data:data});if(window.gtag){window.gtag('event','result_kit_cta_clicked',data);}});})();`;

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
      <script
        dangerouslySetInnerHTML={{
          __html: resultKitCtaTrackingScript,
        }}
      />
    </>
  );
}
