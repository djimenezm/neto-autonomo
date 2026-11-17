'use client';

import { useId, useState } from 'react';
import NumericTextInput from '@/components/NumericTextInput';
import { formatCurrency } from '@/lib/format';
import { parseSpanishNumber } from '@/lib/spanishNumber';
import { planUpcomingPayment } from '@/lib/upcomingPayment';
import styles from './UpcomingPaymentPlanner.module.css';

const fields = [
  { key: 'payment', label: 'Importe del próximo recibo (EUR)', unit: 'EUR' },
  { key: 'saved', label: 'Dinero ya apartado (EUR)', unit: 'EUR', hint: 'Cuenta solo el dinero reservado para este recibo. Puedes dejarlo vacío si todavía no has apartado nada.' },
  { key: 'contributions', label: 'Aportaciones que quedan antes del cargo', unit: 'none', hint: 'Cuenta las veces que aún puedes apartar dinero antes del cargo. Escribe 0 si ya no queda ninguna.' },
] as const;
const emptyValues = { payment: '', saved: '', contributions: '' };
type CheckedPlan = Extract<ReturnType<typeof planUpcomingPayment>, { valid: true }>;

export default function UpcomingPaymentPlanner() {
  const id = useId();
  const [values, setValues] = useState(emptyValues);
  const [hasChecked, setHasChecked] = useState(false);
  const [result, setResult] = useState<CheckedPlan | null>(null);
  const plan = planUpcomingPayment({
    payment: parseSpanishNumber(values.payment, 'EUR'),
    saved: values.saved.trim() === '' ? 0 : parseSpanishNumber(values.saved, 'EUR'),
    contributions: parseSpanishNumber(values.contributions, 'none'),
  });

  return (
    <form className={`feature-card ${styles.planner}`} aria-label="Preparar el próximo pago" noValidate onSubmit={(event) => {
      event.preventDefault();
      setHasChecked(true);
      if (plan.valid) {
        setResult(plan);
        return;
      }
      const firstInvalid = fields.find(({ key }) => plan.errors[key]);
      if (firstInvalid) event.currentTarget.ownerDocument.getElementById(`${id}-${firstInvalid.key}`)?.focus();
    }}>
      <div className={styles.fields}>
        {fields.map((field) => {
          const { key, label, unit } = field;
          const fieldId = `${id}-${key}`;
          const hint = 'hint' in field ? field.hint : undefined;
          const error = hasChecked && !plan.valid ? plan.errors[key] : undefined;
          return (
            <div className={styles.field} key={key}>
              <label htmlFor={fieldId}>{label}</label>
              <NumericTextInput id={fieldId} inputMode={unit === 'EUR' ? 'decimal' : 'numeric'} value={values[key]}
                onValueChange={(value) => { setValues((current) => ({ ...current, [key]: value })); setResult(null); }}
                aria-invalid={Boolean(error)}
                aria-describedby={[hint ? `${fieldId}-hint` : '', error ? `${fieldId}-error` : ''].filter(Boolean).join(' ') || undefined} />
              {hint ? <small id={`${fieldId}-hint`}>{hint}</small> : null}
              {error ? <small id={`${fieldId}-error`} className="field-error">{error}</small> : null}
            </div>
          );
        })}
      </div>
      <button className="primary-button" type="submit">Calcular cuánto apartar</button>
      <noscript><p>Para hacer el cálculo a mano, sigue el ejemplo de arriba.</p></noscript>
      <div className={styles.result} role="status" aria-label="Importe para el próximo pago">
        {hasChecked && !plan.valid ? <p>Revisa los campos indicados para calcular cuánto falta.</p> : null}
        {result ? (
          <dl>
            <div><dt>Importe pendiente</dt><dd>{formatCurrency(result.remaining)}</dd></div>
            {result.remaining > 0 && result.contributionAmount !== null ? (
              <div><dt>Por aportación</dt><dd>{formatCurrency(result.contributionAmount)}</dd></div>
            ) : null}
          </dl>
        ) : null}
        {result && result.remaining === 0 ? <p>El dinero que ya has apartado cubre el recibo.</p> : null}
        {result && result.remaining > 0 && result.contributionAmount === null ? <p>Ya no quedan aportaciones previstas. Falta reunir {formatCurrency(result.remaining)} antes del cargo.</p> : null}
        {result && result.remaining > 0 && result.contributionAmount !== null ? <p>Redondeamos al céntimo superior. Puedes ajustar la última aportación al importe que siga pendiente.</p> : null}
      </div>
    </form>
  );
}
