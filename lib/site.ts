export const siteConfig = {
  name: 'Neto Autonomo',
  shortName: 'Neto Autonomo',
  title: 'Calculadora de autonomos para saber cuanto facturar',
  description:
    'Calcula cuanto debes facturar como autonomo o freelance en Espana para llegar al neto mensual que buscas. Estimacion orientativa de cuota, IRPF, IVA y tarifa por hora.',
  locale: 'es_ES',
  keywords: [
    'calculadora autonomo',
    'cuanto facturar autonomo',
    'calculadora freelance espana',
    'cuanto cobrar freelance',
    'neto autonomo',
    'tarifa hora freelance',
    'calculadora tarifa freelance',
    'IRPF autonomos',
    'IVA autonomos',
  ],
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001',
  themeColor: '#145da0',
  backgroundColor: '#f6f8fb',
} as const;

export function getSiteUrl() {
  return new URL(siteConfig.url);
}
