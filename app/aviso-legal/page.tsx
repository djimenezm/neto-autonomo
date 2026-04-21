import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aviso legal',
  description: 'Condiciones de uso y limitacion de responsabilidad de la calculadora Neto Autonomo.',
};

export default function AvisoLegalPage() {
  return (
    <main className="legal-page container">
      <h1>Aviso legal</h1>
      <p>
        Este sitio ofrece informacion orientativa con fines informativos. Los calculos mostrados no
        constituyen asesoramiento fiscal, legal ni contable.
      </p>
      <p>
        El titular del sitio no se hace responsable del uso que terceros hagan de la informacion
        publicada ni de las decisiones tomadas a partir de las estimaciones mostradas.
      </p>
      <p>
        El contenido puede actualizarse, modificarse o retirarse sin previo aviso con el fin de
        mantener la herramienta alineada con cambios normativos, mejoras de producto o revisiones
        de contenido.
      </p>
    </main>
  );
}
