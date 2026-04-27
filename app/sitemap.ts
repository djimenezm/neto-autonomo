import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site';

const routes = [
  '/',
  '/cuanto-facturar-autonomo',
  '/tabla-cuanto-facturar-autonomo',
  '/cuanto-facturar-autonomo-1500-euros',
  '/cuanto-facturar-autonomo-2000-euros',
  '/cuanto-facturar-autonomo-2500-euros',
  '/cuanto-facturar-autonomo-3000-euros',
  '/horas-facturables-freelance',
  '/kit-tarifa-autonomo',
  '/mejores-programas-facturacion-autonomos',
  '/tarifa-freelance-por-hora',
  '/tarifa-diaria-freelance',
  '/cuota-autonomos-2026',
  '/aviso-legal',
  '/privacidad',
  '/cookies',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();

  return routes.map((route) => ({
    url: new URL(route, siteUrl).toString(),
    lastModified,
  }));
}
