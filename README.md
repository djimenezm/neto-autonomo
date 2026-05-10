# Neto Autónomo

Aplicación en Next.js para calcular cuánto debe facturar un autónomo o freelance en España para alcanzar un neto mensual deseado.

Incluye calculadora, guías SEO, páginas legales, sitemap, robots, manifest, recurso descargable y flujo de captación para el kit de tarifa.

## Requisitos

- Node.js 20.9 o superior
- npm 10 o superior

## Arranque en local

```bash
npm install
npm run dev
```

La app queda disponible en:

```text
http://localhost:3001
```

## Scripts

```bash
npm run dev      # servidor local en puerto 3001
npm run build    # build de producción
npm run start    # servir build en puerto 3001
npm run lint     # ESLint
npm test         # Vitest
```

## Estructura principal

```text
app/
  layout.tsx
  globals.css
  sitemap.ts
  robots.ts
  manifest.ts
  opengraph-image.tsx
  */page.tsx
components/
  CalculatorForm.tsx
  ResultCard.tsx
  HomePage.tsx
  Header.tsx
  Footer.tsx
  FAQ.tsx
  LeadMagnetForm.tsx
lib/
  calculator.ts
  format.ts
  site.ts
pages/
  index.tsx
  cuanto-facturar-autonomo.tsx
public/
  recursos/kit-tarifa-autonomo.txt
tests/
```

## Rutas destacadas

- `/` calculadora principal
- `/cuanto-facturar-autonomo` guía principal
- `/tabla-cuanto-facturar-autonomo` tabla de objetivos netos
- `/cuanto-facturar-autonomo-1500-euros`
- `/cuanto-facturar-autonomo-2000-euros`
- `/cuanto-facturar-autonomo-2500-euros`
- `/cuanto-facturar-autonomo-3000-euros`
- `/tarifa-freelance-por-hora`
- `/tarifa-diaria-freelance`
- `/horas-facturables-freelance`
- `/cuota-autonomos-2026`
- `/kit-tarifa-autonomo`
- `/mejores-programas-facturacion-autonomos`
- `/aviso-legal`, `/privacidad`, `/cookies`

La ruta `/gracias-kit-tarifa` es una página de conversión no indexable y se excluye del sitemap a propósito.

## Configuración

La configuración global vive en `lib/site.ts`.

El dominio de produccion actual es:

```text
https://www.cuantofacturar.es
```

La Content Security Policy se sirve en modo estricto en producción. En desarrollo se relaja solo la directiva de Trusted Types para que el overlay de Next.js pueda renderizar errores locales sin bloquear la app.

## Verificación antes de publicar

```bash
npm run lint
npm test
npm run build
```

También conviene probar manualmente:

- Cálculo básico desde `/`
- Enlaces principales del header y footer
- Formulario del kit de tarifa
- Descarga de `/recursos/kit-tarifa-autonomo.txt`
- `/sitemap.xml` y `/robots.txt`
