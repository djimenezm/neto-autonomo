import { siteConfig } from '@/lib/site';

type LeadMagnetFormProps = {
  source: string;
  title?: string;
  description?: string;
  buttonLabel?: string;
};

export default function LeadMagnetForm({
  source,
  title = 'Te enviamos el kit de tarifa para autónomos',
  description = 'Deja tu email y te daremos acceso al kit con checklist de tarifa, estructura de números y una revisión rápida antes de subir o defender tus precios.',
  buttonLabel = 'Quiero el kit',
}: LeadMagnetFormProps) {
  return (
    <section className="lead-card" aria-labelledby={`lead-form-title-${source}`}>
      <div className="lead-card-copy">
        <span className="eyebrow">Recurso gratuito</span>
        <h2 id={`lead-form-title-${source}`}>{title}</h2>
        <p>{description}</p>
      </div>

      <form className="lead-form" action={siteConfig.brevoKitFormAction} method="POST">
        <input type="hidden" name="locale" value="es" />
        <input type="hidden" name="html_type" value="simple" />
        <input type="hidden" name="email_address_check" value="" />
        <label>
          <span>Email</span>
          <input type="email" name="EMAIL" placeholder="tu@email.com" autoComplete="email" required />
        </label>
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
