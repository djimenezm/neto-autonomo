import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politica de privacidad',
  description: 'Informacion general sobre privacidad y tratamiento de datos en Neto Autonomo.',
};

export default function PrivacidadPage() {
  return (
    <main className="legal-page container">
      <h1>Politica de privacidad</h1>
      <p>
        Esta web no recoge datos personales en esta primera version, salvo los que el usuario pueda
        enviar voluntariamente mediante futuros formularios de contacto o suscripcion.
      </p>
      <p>
        Si en el futuro se incorporan herramientas de analitica o formularios, esta politica debera
        actualizarse para reflejar el tratamiento de datos correspondiente.
      </p>
      <p>
        Mientras no existan formularios, areas privadas o herramientas de medicion adicionales, los
        datos que introduces en la calculadora se usan unicamente en tu navegador para mostrarte el
        resultado de la simulacion.
      </p>
    </main>
  );
}
