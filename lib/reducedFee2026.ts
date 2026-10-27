// Checked against the linked official sources on 2026-10-27.
// Importass publishes the total including MEI as 88.64 EUR. Use that published
// amount directly; do not infer a MEI breakdown from a different contribution base.
export const REDUCED_FEE_2026 = 88.64;
export const MONTHLY_SMI_2026 = 1221;
export const ANNUAL_SMI_2026 = 17094;
export const reducedFeeSources = {
  importass: 'https://portal.seg-social.gob.es/wps/portal/importass/importass/Colectivos/trabajo%2Bautonomo/guia',
  extension: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-13409#a3-5',
  smi: 'https://www.boe.es/eli/es/rd/2026/02/18/126',
} as const;

export function isBelowAnnualSMI(annualNetReturns: number) {
  // Compare the same cents shown to the reader, with a strict lower boundary.
  return Number.isFinite(annualNetReturns) && annualNetReturns >= 0
    && Math.round(annualNetReturns * 100) < ANNUAL_SMI_2026 * 100;
}
