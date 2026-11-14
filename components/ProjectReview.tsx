'use client';

import { useId, useRef, useState } from 'react';
import NumericTextInput from '@/components/NumericTextInput';
import { projectReviewCostExample, projectReviewExample, reviewProject, type ProjectReviewInput } from '@/lib/projectReview';
import { formatCurrency, formatNumber } from '@/lib/format';
import { parseSpanishNumber } from '@/lib/spanishNumber';
import styles from './ProjectReview.module.css';

const hoursUnitError = 'Escribe solo el número de horas, sin moneda ni porcentaje.';
const fields = [
  {
    key: 'hourlyReference', label: 'Tu referencia por hora sin IVA (EUR)',
    hint: 'Usa tu referencia de la calculadora o de la ficha, con tus costes y horas facturables previstos.',
    unitError: 'Introduce la referencia por hora en euros. Puedes usar € o EUR.',
  },
  {
    key: 'finalPrice', label: 'Precio final pactado sin IVA (EUR)',
    hint: 'Incluye los cambios de precio acordados. Usa cero si el trabajo fue gratuito. No presupone que ya se haya cobrado.',
    unitError: 'Introduce el precio en euros. Puedes usar € o EUR.',
  },
  {
    key: 'plannedHours', label: 'Horas previstas del encargo',
    hint: 'La estimación al preparar el presupuesto, con preparación, reuniones y revisiones incluidas.',
    unitError: hoursUnitError,
  },
  {
    key: 'actualHours', label: 'Horas reales registradas',
    hint: 'Todo el tiempo dedicado a ese cliente, también las revisiones sin precio adicional. Usa horas decimales: 1,5 es una hora y media.',
    unitError: hoursUnitError,
  },
  {
    key: 'projectCosts', label: 'Costes específicos del encargo (EUR)',
    hint: 'Opcional. Suma los gastos de este encargo que tu referencia por hora aún no cubre, como materiales o subcontratación. Usa la misma base sin IVA que para el precio.',
    unitError: 'Introduce los costes en euros. Puedes usar € o EUR.',
  },
] as const;
type Values = Record<keyof ProjectReviewInput, string>;

function checkReview(values: Values) {
  const input = {
    hourlyReference: parseSpanishNumber(values.hourlyReference, 'EUR'),
    finalPrice: parseSpanishNumber(values.finalPrice, 'EUR'),
    plannedHours: parseSpanishNumber(values.plannedHours, 'none'),
    actualHours: parseSpanishNumber(values.actualHours, 'none'),
    projectCosts: values.projectCosts.trim() === '' ? 0 : parseSpanishNumber(values.projectCosts, 'EUR'),
  };
  const checked = reviewProject(input);
  if (checked.valid) return checked;

  const errors = { ...checked.errors };
  for (const { key, unitError } of fields) {
    if (Number.isNaN(input[key]) && Number.isFinite(parseSpanishNumber(values[key]))) {
      errors[key] = unitError;
    }
  }
  return { ...checked, errors };
}

export default function ProjectReview() {
  const id = useId();
  const refs = useRef<Partial<Record<keyof Values, HTMLInputElement | null>>>({});
  const [values, setValues] = useState<Values>({ hourlyReference: '', finalPrice: '', plannedHours: '', actualHours: '', projectCosts: '' });
  const [checked, setChecked] = useState<Values | null>(null);
  const [hasAttemptedReview, setHasAttemptedReview] = useState(false);
  const [isExample, setIsExample] = useState(false);
  const [reviewBeforeExample, setReviewBeforeExample] = useState<Values | null>(null);
  const [recoveryFeedback, setRecoveryFeedback] = useState('');
  const review = checked ? checkReview(checked) : null;
  const validation = hasAttemptedReview ? checkReview(values) : null;
  const hasProjectCosts = review?.valid && review.projectCosts > 0;

  function calculate(next = values) {
    setRecoveryFeedback('');
    const result = checkReview(next);
    setHasAttemptedReview(true);
    const normalized = result.valid ? {
      hourlyReference: formatNumber(result.hourlyReference),
      finalPrice: formatNumber(result.finalPrice),
      plannedHours: formatNumber(result.plannedHours),
      actualHours: formatNumber(result.actualHours),
      projectCosts: next.projectCosts.trim() === '' ? '' : formatNumber(result.projectCosts),
    } : next;
    setValues(normalized);
    setChecked(normalized);
    if (!result.valid) {
      const invalid = fields.find(({ key }) => result.errors[key]);
      if (invalid) refs.current[invalid.key]?.focus();
    }
  }

  function loadExample(example: ProjectReviewInput) {
    // Keep the first personal review exactly, including incomplete inputs.
    if (!isExample && Object.values(values).some((value) => value.trim() !== '')) {
      setReviewBeforeExample((previous) => previous ?? { ...values });
    }
    setIsExample(true);
    calculate({
      hourlyReference: formatNumber(example.hourlyReference),
      finalPrice: formatNumber(example.finalPrice),
      plannedHours: formatNumber(example.plannedHours),
      actualHours: formatNumber(example.actualHours),
      projectCosts: example.projectCosts === undefined ? '' : formatNumber(example.projectCosts),
    });
  }

  function recoverReview() {
    if (!reviewBeforeExample) return;
    setValues(reviewBeforeExample);
    setChecked(null);
    setHasAttemptedReview(false);
    setIsExample(false);
    setReviewBeforeExample(null);
    setRecoveryFeedback('Revisión anterior recuperada. Vuelve a revisar el encargo para actualizar los resultados.');
    refs.current.hourlyReference?.focus();
  }

  return (
    <div className={styles.review}>
      <h3>Revisa tu encargo con tus datos</h3>
      <p id={`${id}-method`}>Cuenta cada hora una vez. Los tiempos generales del negocio ya deben estar cubiertos por tu referencia por hora; no los sumes otra vez a este encargo.</p>
      <noscript><p>El comprobador necesita JavaScript. Puedes usar el ejemplo explicado y la ficha descargable de esta página.</p></noscript>
      <fieldset className={styles.fields} aria-describedby={`${id}-method`} onKeyDown={(event) => {
        if (event.key === 'Enter' && event.target instanceof HTMLInputElement) { event.preventDefault(); calculate(); }
      }}>
        <legend>Precio, tiempo y costes del encargo terminado</legend>
        {fields.map(({ key, label, hint }) => {
          const error = validation && !validation.valid ? validation.errors[key] : undefined;
          return (
            <label key={key}>
              <span id={`${id}-${key}-label`}>{label}</span>
              <NumericTextInput ref={(node) => { refs.current[key] = node; }} inputMode="decimal" value={values[key]}
                onValueChange={(nextValue) => { setValues({ ...values, [key]: nextValue }); setChecked(null); setIsExample(false); setRecoveryFeedback(''); }}
                aria-labelledby={`${id}-${key}-label`} aria-describedby={`${id}-${key}-hint${error ? ` ${id}-${key}-error` : ''}`} aria-invalid={Boolean(error)} />
              <small id={`${id}-${key}-hint`}>{hint}</small>
              {error ? <small className="field-error" id={`${id}-${key}-error`}>{error}</small> : null}
            </label>
          );
        })}
      </fieldset>
      <div className={styles.actions}>
        <button type="button" className="primary-button" onClick={() => calculate()}>Revisar encargo</button>
        <button type="button" className="link-button" onClick={() => loadExample(projectReviewExample)}>Probar el ejemplo de 400 €</button>
        <button type="button" className="link-button" onClick={() => loadExample(projectReviewCostExample)}>Probar el ejemplo con costes</button>
        {reviewBeforeExample ? <button type="button" className="link-button" onClick={recoverReview} aria-describedby={`${id}-recovery-hint`}>Recuperar mi revisión anterior</button> : null}
      </div>
      {reviewBeforeExample ? <p className={styles.note} id={`${id}-recovery-hint`}>Conservamos en esta página la revisión anterior al primer ejemplo. Recuperarla sustituye los cambios que ves ahora y deja el resultado pendiente de revisar. La copia se pierde al salir o recargar la página.</p> : null}
      <div role="status" aria-label="Recuperación de la revisión" aria-live="polite" aria-atomic="true">{recoveryFeedback ? <p>{recoveryFeedback}</p> : null}</div>
      <div role="status" aria-label="Revisión del encargo" aria-live="polite" aria-atomic="true">
        {validation && !validation.valid ? <p>Revisa los campos indicados para comparar el encargo.</p> : null}
        {!review && validation?.valid ? <p>Datos modificados. Pulsa «Revisar encargo» para actualizar el resultado.</p> : null}
        {review?.valid ? (
          <div className={styles.result}>
            {isExample ? <p><strong>Ejemplo ficticio; no es una tarifa recomendada.</strong></p> : null}
            <dl>
              <div><dt>Ingreso por hora con el tiempo previsto</dt><dd>{formatCurrency(review.plannedHourlyRevenue)}/h</dd></div>
              <div><dt>Ingreso por hora con el tiempo real</dt><dd>{formatCurrency(review.actualHourlyRevenue)}/h</dd></div>
              {hasProjectCosts ? <div><dt>Importe por hora real tras costes específicos</dt><dd>{formatCurrency(review.availableHourlyRate)}/h</dd></div> : null}
              <div><dt>Diferencia de horas frente a lo previsto</dt><dd>{review.hoursDifference > 0 ? '+' : ''}{formatNumber(review.hoursDifference)} h</dd></div>
              <div><dt>{hasProjectCosts ? 'Horas que cubre el precio tras costes específicos' : 'Horas que cubre el precio a tu referencia'}</dt><dd>{formatNumber(review.hoursAtReference)} h</dd></div>
              <div><dt>Importe a tu referencia para el tiempo real</dt><dd>{formatCurrency(review.actualReferencePrice)}</dd></div>
              {hasProjectCosts ? <div><dt>Importe a tu referencia con costes específicos</dt><dd>{formatCurrency(review.totalReferencePrice)}</dd></div> : null}
              <div><dt>{hasProjectCosts ? 'Precio pactado menos la referencia con costes' : 'Precio pactado menos ese importe'}</dt><dd>{formatCurrency(review.priceDifference)}</dd></div>
            </dl>
            <p>{formatCurrency(review.finalPrice)} ÷ {formatNumber(review.actualHours)} h = {formatCurrency(review.actualHourlyRevenue)}/h sin IVA. Es ingreso por hora dedicada, antes de gastos, cuota e impuestos; no es beneficio neto ni acredita el cobro.</p>
            {hasProjectCosts ? <>
              <p>Tras restar {formatCurrency(review.projectCosts)} del precio, quedan {formatCurrency(review.availableForTime)}. Al dividirlo entre {formatNumber(review.actualHours)} h obtienes {formatCurrency(review.availableHourlyRate)}/h para comparar con tu referencia. Este importe todavía debe cubrir los gastos habituales, la cuota y la reserva fiscal que incluye tu referencia.</p>
              {review.availableForTime < 0 ? <p>El precio queda {formatCurrency(-review.availableForTime)} por debajo de los costes específicos antes de contar tus horas.</p> : null}
              <p>Para el próximo presupuesto, parte de {formatCurrency(review.actualReferencePrice)} por las horas reales a tu referencia. Si se repiten estos costes, suma {formatCurrency(review.projectCosts)} para obtener {formatCurrency(review.totalReferencePrice)}.</p>
            </> : <p>{review.priceDifference < 0
              ? `El precio queda ${formatCurrency(-review.priceDifference)} por debajo del importe a tu referencia de ${formatCurrency(review.hourlyReference)}/h para las horas reales.`
              : review.priceDifference > 0
                ? `El precio supera en ${formatCurrency(review.priceDifference)} el importe a tu referencia de ${formatCurrency(review.hourlyReference)}/h para las horas reales.`
                : `El precio coincide con el importe a tu referencia de ${formatCurrency(review.hourlyReference)}/h para las horas reales.`} Anota qué explica la diferencia y qué concretarás en el próximo presupuesto.</p>}
            <p>Usamos importes y horas con dos decimales. El ingreso por hora se redondea a céntimos; el importe a tu referencia, al céntimo superior; las horas que cubre el precio, hacia abajo a centésimas.</p>
          </div>
        ) : null}
      </div>
      <p className={styles.note}>La revisión usa tu referencia y los costes que introduzcas. Los datos del comprobador solo se mantienen en esta página mientras la uses.</p>
    </div>
  );
}
