export type AdsEnvironment = Record<string, string | undefined>;

const CLIENT_PATTERN = /^ca-pub-\d+$/;
const SLOT_PATTERN = /^\d+$/;

function validValue(value: string | undefined, pattern: RegExp) {
  const normalized = value?.trim() ?? '';
  return pattern.test(normalized) ? normalized : '';
}

export function createAdsConfig(environment: AdsEnvironment) {
  const client = validValue(environment.NEXT_PUBLIC_ADSENSE_CLIENT, CLIENT_PATTERN);
  const primarySlot = validValue(
    environment.NEXT_PUBLIC_ADSENSE_SLOT_PRIMARY,
    SLOT_PATTERN,
  );
  const secondarySlot = validValue(
    environment.NEXT_PUBLIC_ADSENSE_SLOT_SECONDARY,
    SLOT_PATTERN,
  );
  const requested = environment.NEXT_PUBLIC_ADSENSE_ENABLED === 'true';

  return {
    client,
    primarySlot,
    secondarySlot,
    enabled: requested && Boolean(client) && Boolean(primarySlot || secondarySlot),
  } as const;
}

export const adsConfig = createAdsConfig(process.env);

export function getAdsTxtRecord(client = adsConfig.client) {
  if (!CLIENT_PATTERN.test(client)) return '';
  return `google.com, ${client.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0\n`;
}
