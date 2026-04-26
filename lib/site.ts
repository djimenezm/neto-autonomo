const productionUrl = 'https://www.cuantofacturar.es';

export const siteConfig = {
  name: 'Neto Autónomo',
  shortName: 'Neto Autónomo',
  title: 'Calculadora de autónomos para saber cuánto facturar',
  description:
    'Calcula cuánto debes facturar como autónomo o freelance en España para llegar al neto mensual que buscas. Estimación orientativa de cuota, IRPF, IVA y tarifa por hora.',
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
  url: process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : productionUrl,
  ownerName: 'Equipo de Cuánto Facturar',
  contactEmail: 'hola@cuantofacturar.es',
  country: 'España',
  themeColor: '#145da0',
  backgroundColor: '#f6f8fb',
} as const;

export function getSiteUrl() {
  return new URL(siteConfig.url);
}
