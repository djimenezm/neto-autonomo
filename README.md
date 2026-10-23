# Neto Autónomo

Calculadora para estimar cuánto debe facturar un autónomo o freelance en España para alcanzar un neto mensual deseado. Incluye herramientas de costes y tarifas, guías, páginas legales y el kit de tarifa.

## Empezar

Requiere Node.js 24.22.1 o superior de la rama 24 y npm 10 o superior.
La versión recomendada está en `.nvmrc`; el arranque y la compilación rechazan versiones anteriores al parche de seguridad.

```bash
npm ci
npm run dev
```

La aplicación local se abre en <http://localhost:3001/>.

## Comprobar cambios

```bash
npm run lint
npm test
npm run build
```

## Seguridad

La revisión del 23 de octubre de 2026 actualiza Next.js a 16.4.2, React a 19.2.9
y las dependencias con parches compatibles. Para repetir la comprobación:

```bash
npm audit --omit=dev
npm audit
```

La auditoría de producción no debe devolver avisos conocidos. La auditoría completa
mantiene cinco avisos propagados desde un único problema sin parche publicado:
`braces@3.0.3` ([CVE-2026-93687](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)).
La cadena es `eslint-config-next > @next/eslint-plugin-next > fast-glob > micromatch > braces`.
Solo se utiliza al analizar código de desarrollo y no recibe entradas de visitantes.
No ejecutar ESLint sobre código o patrones no confiables ni usar `npm audit fix --force`:
la sugerencia automática implica bajar a una configuración de Next.js incompatible.
No se oculta este aviso; hay que revisarlo al actualizar ESLint o cuando exista un parche.

Node.js debe permanecer en una versión corregida de la rama 24. La compilación comprueba
la versión real y la registra. Vercel gestiona las actualizaciones de su runtime;
`engines.node` y `.nvmrc` no demuestran por sí solos que todos sus procesos estén parcheados.

## Documentación

- [Estructura, configuración y revisión local](docs/desarrollo.md)
- [Seguimiento histórico de monetización](docs/seguimiento-monetizacion-cuantofacturar.md)

Los anuncios no se activan por defecto. La configuración y las comprobaciones previas están documentadas en la guía de desarrollo.
