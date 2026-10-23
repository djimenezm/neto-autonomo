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

Las auditorías de producción y completa no deben devolver avisos conocidos.
Se ha eliminado la cadena `fast-glob > micromatch > braces` del plugin de ESLint de Next.js,
sin bajar versiones ni desactivar reglas. Como `braces@3.0.3` aún no tiene un parche publicado
para [CVE-2026-93687](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), se utiliza un
[adaptador local limitado al plugin de Next.js](tooling/eslint-root-glob/README.md),
basado en Tinyglobby. No es una versión parcheada de braces ni una sustitución general de fast-glob.
Las pruebas comprueban sus rutas y que las reglas de ESLint siguen detectando errores.
Al actualizar Next.js hay que revisar el adaptador y su override; no usar `npm audit fix --force`
para forzar una configuración incompatible.

Node.js debe permanecer en una versión corregida de la rama 24. La compilación comprueba
la versión real y la registra. Vercel gestiona las actualizaciones de su runtime;
`engines.node` y `.nvmrc` no demuestran por sí solos que todos sus procesos estén parcheados.

## Documentación

- [Estructura, configuración y revisión local](docs/desarrollo.md)
- [Seguimiento histórico de monetización](docs/seguimiento-monetizacion-cuantofacturar.md)

Los anuncios no se activan por defecto. La configuración y las comprobaciones previas están documentadas en la guía de desarrollo.
