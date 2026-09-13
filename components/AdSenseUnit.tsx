'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

type AdSenseUnitProps = {
  client: string;
  slot: string;
};

export default function AdSenseUnit({ client, slot }: AdSenseUnitProps) {
  useEffect(() => {
    try {
      (window.adsbygoogle ??= []).push({});
    } catch {
      // Ad blockers can interrupt initialization without affecting the calculator.
    }
  }, [slot]);

  return (
    <ins
      className="adsbygoogle ad-unit"
      style={{ display: 'block' }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
