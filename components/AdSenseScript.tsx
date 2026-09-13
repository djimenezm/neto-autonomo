import Script from 'next/script';
import { adsConfig } from '@/lib/ads';

type AdSenseScriptProps = {
  nonce?: string;
};

export default function AdSenseScript({ nonce }: AdSenseScriptProps) {
  if (!adsConfig.enabled) return null;

  return (
    <Script
      id="adsense-script"
      nonce={nonce}
      strategy="afterInteractive"
      async
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsConfig.client}`}
    />
  );
}
