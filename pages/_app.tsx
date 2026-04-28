import type { AppProps } from 'next/app';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import '@/app/globals.css';

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
    </>
  );
}
