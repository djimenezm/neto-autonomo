import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description: 'Información general sobre privacidad y tratamiento de datos en Neto Autónomo.',
};

export default function PrivacidadPage() {
  return (
    <main className="legal-page container">
      <h1>Política de privacidad</h1>
      <div className="legal-card">
        <p>
          Responsable: <strong>{siteConfig.ownerName}</strong>
        </p>
        <p>
          Contacto para privacidad:{' '}
          <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
        </p>
      </div>

      <section className="legal-section">
        <h2>Datos que se usan en esta versión</h2>
        <p>
          Los importes y opciones que introduces en la calculadora se procesan en tu navegador para
          mostrar el resultado de la simulación. En esta versión no existe un formulario de registro,
          cuenta de usuario ni una base de datos propia asociada al uso de la calculadora.
        </p>
      </section>

      <section className="legal-section">
        <h2>Datos técnicos y contacto</h2>
        <p>
          Como en cualquier servicio web, el proveedor de hosting puede tratar datos técnicos
          imprescindibles para servir la página, como logs básicos de acceso, dirección IP o datos
          del navegador. Si escribes al correo de contacto, los datos que facilites se usarán
          únicamente para responder a tu consulta.
        </p>
      </section>

      <section className="legal-section">
        <h2>Medición básica de uso</h2>
        <p>
          Esta web utiliza Vercel Web Analytics para obtener estadísticas agregadas de visitas y
          páginas vistas. Además, registramos de forma agregada cuando un usuario completa una
          simulación válida en la calculadora. La finalidad es entender el uso general del sitio y
          mejorar la herramienta sin identificar personalmente a los usuarios.
        </p>
      </section>

      <section className="legal-section">
        <h2>Base y finalidad</h2>
        <p>
          La finalidad del tratamiento es prestar la herramienta, atender comunicaciones directas y
          mantener la seguridad básica del servicio. Además, se realiza una medición agregada del uso
          para conocer el rendimiento general de la web. No se realiza un tratamiento comercial de tus
          datos ni se crean perfiles publicitarios propios desde esta herramienta.
        </p>
      </section>

      <section className="legal-section">
        <h2>Tus derechos</h2>
        <p>
          Puedes solicitar información sobre tus datos o ejercer, cuando corresponda, tus derechos de
          acceso, rectificación, supresión u oposición escribiendo a{' '}
          <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
        </p>
      </section>
    </main>
  );
}
