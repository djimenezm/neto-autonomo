import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site';

const routes = [
  '/',
  '/cuanto-facturar-autonomo',
  '/tabla-cuanto-facturar-autonomo',
  '/cuanto-facturar-autonomo-1500-euros',
  '/cuanto-facturar-autonomo-3000-euros',
  '/horas-facturables-freelance',
  '/kit-tarifa-autonomo',
  '/mejores-programas-facturacion-autonomos',
  '/tarifa-freelance-por-hora',
  '/tarifa-diaria-freelance',
  '/cuota-autonomos-2026',
  '/cuanto-cuesta-ser-autonomo',
  '/aviso-legal',
  '/privacidad',
  '/cookies',
];

// Only substantive content updates belong here; deployments do not change these dates.
const lastContentUpdates: Record<string, string> = {
  '/': '2026-10-26',
  '/mejores-programas-facturacion-autonomos': '2026-10-02',
  '/horas-facturables-freelance': '2026-10-26',
  '/cuanto-facturar-autonomo-1500-euros': '2026-10-26',
  '/tarifa-freelance-por-hora': '2026-10-26',
  '/kit-tarifa-autonomo': '2026-10-26',
  '/tarifa-diaria-freelance': '2026-10-26',
};

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  return routes.map((route) => ({
    url: new URL(route, siteUrl).toString(),
    ...(lastContentUpdates[route] ? { lastModified: lastContentUpdates[route] } : {}),
  }));
}
