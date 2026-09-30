import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createAdsConfig, getAdsTxtRecord } from '@/lib/ads';

describe('display advertising', () => {
  it('stays disabled until it is explicitly enabled with valid public ids', () => {
    expect(createAdsConfig({})).toMatchObject({ enabled: false });
    expect(
      createAdsConfig({
        NEXT_PUBLIC_ADSENSE_ENABLED: 'true',
        NEXT_PUBLIC_ADSENSE_CLIENT: 'ca-pub-1234567890123456',
        NEXT_PUBLIC_ADSENSE_SLOT_PRIMARY: '1234567890',
      }),
    ).toMatchObject({ enabled: false, consentManaged: false });
    expect(
      createAdsConfig({
        NEXT_PUBLIC_ADSENSE_ENABLED: 'true',
        NEXT_PUBLIC_ADSENSE_CLIENT: 'invalid',
        NEXT_PUBLIC_ADSENSE_SLOT_PRIMARY: '1234567890',
      }),
    ).toMatchObject({ enabled: false, client: '' });
  });

  it('accepts a valid publisher and at least one manual slot', () => {
    expect(
      createAdsConfig({
        NEXT_PUBLIC_ADSENSE_ENABLED: 'true',
        NEXT_PUBLIC_ADSENSE_CONSENT_MANAGED: 'true',
        NEXT_PUBLIC_ADSENSE_CLIENT: 'ca-pub-1234567890123456',
        NEXT_PUBLIC_ADSENSE_SLOT_PRIMARY: '1234567890',
      }),
    ).toMatchObject({ enabled: true, primarySlot: '1234567890' });
  });

  it('generates the authorized seller record', () => {
    expect(getAdsTxtRecord('ca-pub-1234567890123456')).toBe(
      'google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n',
    );
  });

  it('keeps ads outside the calculator and marks both manual placements', () => {
    const homepage = readFileSync(join(process.cwd(), 'components', 'HomePage.tsx'), 'utf8');
    expect(homepage).toContain('<AdSlot placement="primary" />');
    expect(homepage).toContain('<AdSlot placement="secondary" />');
    expect(homepage.indexOf('<CalculatorForm')).toBeLessThan(
      homepage.indexOf('<AdSlot placement="primary" />'),
    );
  });
});
