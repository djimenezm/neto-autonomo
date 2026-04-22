import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Politica de privacidad',
  description: 'Informacion general sobre privacidad y tratamiento de datos en Neto Autonomo.',
};

export default function PrivacidadPage() {
  return (
    <main className="legal-page container">
      <h1>Politica de privacidad</h1>
      <div className="legal-card">
        <p>
          Responsable: <strong>{siteConfig.ownerName}</strong>
        </p>
        <p>
          Contacto para privacidad: <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
        </p>
      </div>

      <section className="legal-section">
        <h2>Datos que se usan en esta version</h2>
        <p>
          Los importes y opciones que introduces en la calculadora se procesan en tu navegador para
          mostrar el resultado de la simulacion. En esta version no existe un formulario de registro,
          cuenta de usuario ni una base de datos propia asociada al uso de la calculadora.
        </p>
      </section>

      <section className="legal-section">
        <h2>Datos tecnicos y contacto</h2>
        <p>
          Como en cualquier servicio web, el proveedor de hosting puede tratar datos tecnicos
          imprescindibles para servir la pagina, como logs basicos de acceso, direccion IP o datos
          del navegador. Si escribes al correo de contacto, los datos que facilites se usaran
          unicamente para responder a tu consulta.
        </p>
      </section>

      <section className="legal-section">
        <h2>Medicion basica de uso</h2>
        <p>
          Esta web utiliza Vercel Web Analytics para obtener estadisticas agregadas de visitas y
          paginas vistas. Ademas, registramos de forma agregada cuando un usuario completa una
          simulacion valida en la calculadora. La finalidad es entender el uso general del sitio y
          mejorar la herramienta sin identificar personalmente a los usuarios.
        </p>
      </section>

      <section className="legal-section">
        <h2>Base y finalidad</h2>
        <p>
          La finalidad del tratamiento es prestar la herramienta, atender comunicaciones directas y
          mantener la seguridad basica del servicio. Ademas, se realiza una medicion agregada del uso
          para conocer el rendimiento general de la web. No se realiza un tratamiento comercial de tus
          datos ni se crean perfiles publicitarios propios desde esta herramienta.
        </p>
      </section>

      <section className="legal-section">
        <h2>Tus derechos</h2>
        <p>
          Puedes solicitar informacion sobre tus datos o ejercer, cuando corresponda, tus derechos de
          acceso, rectificacion, supresion u oposicion escribiendo a{' '}
          <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
        </p>
      </section>
    </main>
  );
}
