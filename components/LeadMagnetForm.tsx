import { getSiteUrl, siteConfig } from '@/lib/site';

type LeadMagnetFormProps = {
  source: string;
  title?: string;
  description?: string;
  buttonLabel?: string;
};

export default function LeadMagnetForm({
  source,
  title = 'Te enviamos el kit de tarifa para autónomos',
  description = 'Deja tu email y te enviaremos acceso al kit con checklist de tarifa, estructura de números y una revisión rápida antes de subir o defender tus precios.',
  buttonLabel = 'Quiero el kit',
}: LeadMagnetFormProps) {
  const siteUrl = getSiteUrl();
  const thankYouUrl = new URL('/gracias-kit-tarifa', siteUrl).toString();
  const resourceUrl = new URL('/kit-tarifa-autonomo', siteUrl).toString();
  const downloadUrl = new URL('/recursos/kit-tarifa-autonomo.txt', siteUrl).toString();
  const formAction = `https://formsubmit.co/${siteConfig.contactEmail}`;

  return (
    <section className="lead-card" aria-labelledby={`lead-form-title-${source}`}>
      <div className="lead-card-copy">
        <span className="eyebrow">Recurso gratuito</span>
        <h2 id={`lead-form-title-${source}`}>{title}</h2>
        <p>{description}</p>
      </div>

      <form className="lead-form" action={formAction} method="POST">
        <input type="hidden" name="_subject" value="Nueva solicitud del kit de tarifa autónomo" />
        <input
          type="hidden"
          name="_autoresponse"
          value={`Gracias por pedir el kit de tarifa para autónomos. Puedes verlo aquí: ${resourceUrl} y descargar la versión en texto aquí: ${downloadUrl}. Si publicamos mejoras importantes, te avisaremos en este mismo email.`}
        />
        <input type="hidden" name="_next" value={thankYouUrl} />
        <input type="hidden" name="origen" value={source} />
        <input type="hidden" name="interes" value="kit-tarifa-autonomo" />
        <label>
          <span>Email</span>
          <input type="email" name="email" placeholder="tu@email.com" required />
        </label>
        <input type="text" name="_honey" className="honey-field" tabIndex={-1} autoComplete="off" />
        <button type="submit" className="primary-button">
          {buttonLabel}
        </button>
        <p className="form-note">
          Al enviar el formulario aceptas que usemos tu email para darte acceso a este recurso y
          avisarte de futuras actualizaciones relacionadas. Más información en{' '}
          <a href="/privacidad">privacidad</a>.
        </p>
      </form>
    </section>
  );
}
