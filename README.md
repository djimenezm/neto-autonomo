# Neto Autónomo

MVP en Next.js para calcular cuánto debe facturar un autónomo para conseguir un neto mensual deseado.

## Requisitos

- Node.js 20.9 o superior
- npm 10 o superior

## Arranque en local

```bash
npm install
npm run dev
```

Después abre:

```bash
http://localhost:3001
```

## Estructura

```text
neto-autonomo/
  app/
    aviso-legal/page.tsx
    cookies/page.tsx
    privacidad/page.tsx
    globals.css
    layout.tsx
    page.tsx
  components/
    CalculatorForm.tsx
    FAQ.tsx
    Footer.tsx
    Header.tsx
    ResultCard.tsx
  lib/
    calculator.ts
    format.ts
  public/
  .gitignore
  next-env.d.ts
  next.config.ts
  package.json
  README.md
  tsconfig.json
```
