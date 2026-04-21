import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politica de cookies',
  description: 'Informacion sobre el uso de cookies en Neto Autonomo.',
};

export default function CookiesPage() {
  return (
    <main className="legal-page container">
      <h1>Politica de cookies</h1>
      <p>
        En esta version inicial del sitio no se instalan cookies no tecnicas propias con fines
        publicitarios o de perfilado.
      </p>
      <p>
        Si mas adelante se anaden herramientas de analitica, afiliacion o publicidad, esta pagina
        debera actualizarse con el detalle correspondiente.
      </p>
      <p>
        Si publicas esta web con nuevos servicios de terceros, convendra revisar de nuevo esta
        politica para identificar cookies tecnicas, de medicion o de personalizacion que pudieran
        instalarse.
      </p>
    </main>
  );
}
