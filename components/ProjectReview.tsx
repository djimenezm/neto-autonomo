'use client';

import { useId, useRef, useState } from 'react';
import NumericTextInput from '@/components/NumericTextInput';
import { projectReviewExample, reviewProject, type ProjectReviewInput } from '@/lib/projectReview';
import { formatCurrency, formatNumber } from '@/lib/format';
import { parseSpanishNumber } from '@/lib/spanishNumber';
import styles from './ProjectReview.module.css';

const fields = [
  { key: 'hourlyReference', label: 'Tu referencia por hora sin IVA (EUR)', hint: 'Usa tu referencia de la calculadora o de la ficha, con tus costes y horas facturables previstos.' },
  { key: 'finalPrice', label: 'Precio final pactado sin IVA (EUR)', hint: 'Incluye los cambios de precio acordados. Usa cero si el trabajo fue gratuito. No presupone que ya se haya cobrado.' },
  { key: 'plannedHours', label: 'Horas previstas del encargo', hint: 'La estimación al preparar el presupuesto, con preparación, reuniones y revisiones incluidas.' },
  { key: 'actualHours', label: 'Horas reales registradas', hint: 'Todo el tiempo dedicado a ese cliente, también las revisiones sin precio adicional. Usa horas decimales: 1,5 es una hora y media.' },
] as const;
type Values = Record<keyof ProjectReviewInput, string>;

function parseValues(values: Values): ProjectReviewInput {
  return {
    hourlyReference: parseSpanishNumber(values.hourlyReference),
    finalPrice: parseSpanishNumber(values.finalPrice),
    plannedHours: parseSpanishNumber(values.plannedHours),
    actualHours: parseSpanishNumber(values.actualHours),
  };
}

export default function ProjectReview() {
  const id = useId();
  const refs = useRef<Partial<Record<keyof Values, HTMLInputElement | null>>>({});
  const [values, setValues] = useState<Values>({ hourlyReference: '', finalPrice: '', plannedHours: '', actualHours: '' });
  const [checked, setChecked] = useState<Values | null>(null);
  const [isExample, setIsExample] = useState(false);
  const review = checked ? reviewProject(parseValues(checked)) : null;

  function calculate(next = values) {
    const result = reviewProject(parseValues(next));
    const normalized = result.valid ? {
      hourlyReference: formatNumber(result.hourlyReference),
      finalPrice: formatNumber(result.finalPrice),
      plannedHours: formatNumber(result.plannedHours),
      actualHours: formatNumber(result.actualHours),
    } : next;
    setValues(normalized);
    setChecked(normalized);
    if (!result.valid) {
      const invalid = fields.find(({ key }) => result.errors[key]);
      if (invalid) refs.current[invalid.key]?.focus();
    }
  }

  return (
    <div className={styles.review}>
      <h3>Revisa tu encargo con tus datos</h3>
      <p id={`${id}-method`}>Cuenta cada hora una vez. Los tiempos generales del negocio ya deben estar cubiertos por tu referencia por hora; no los sumes otra vez a este encargo.</p>
      <noscript><p>El comprobador necesita JavaScript. Puedes usar el ejemplo explicado y la ficha descargable de esta página.</p></noscript>
      <fieldset className={styles.fields} aria-describedby={`${id}-method`} onKeyDown={(event) => {
        if (event.key === 'Enter' && event.target instanceof HTMLInputElement) { event.preventDefault(); calculate(); }
      }}>
        <legend>Precio y tiempo del encargo terminado</legend>
        {fields.map(({ key, label, hint }) => {
          const error = review && !review.valid ? review.errors[key] : undefined;
          return (
            <label key={key}>
              <span id={`${id}-${key}-label`}>{label}</span>
              <NumericTextInput ref={(node) => { refs.current[key] = node; }} inputMode="decimal" value={values[key]}
                onValueChange={(nextValue) => { setValues({ ...values, [key]: nextValue }); setChecked(null); setIsExample(false); }}
                aria-labelledby={`${id}-${key}-label`} aria-describedby={`${id}-${key}-hint${error ? ` ${id}-${key}-error` : ''}`} aria-invalid={Boolean(error)} />
              <small id={`${id}-${key}-hint`}>{hint}</small>
              {error ? <small className="field-error" id={`${id}-${key}-error`}>{error}</small> : null}
            </label>
          );
        })}
      </fieldset>
      <div className={styles.actions}>
        <button type="button" className="primary-button" onClick={() => calculate()}>Revisar encargo</button>
        <button type="button" className="link-button" onClick={() => {
          setIsExample(true);
          calculate({ hourlyReference: formatNumber(projectReviewExample.hourlyReference), finalPrice: formatNumber(projectReviewExample.finalPrice), plannedHours: formatNumber(projectReviewExample.plannedHours), actualHours: formatNumber(projectReviewExample.actualHours) });
        }}>Probar el ejemplo de 400 €</button>
      </div>
      <div role="status" aria-label="Revisión del encargo" aria-live="polite" aria-atomic="true">
        {review && !review.valid ? <p>Revisa los campos indicados para comparar el encargo.</p> : null}
        {review?.valid ? (
          <div className={styles.result}>
            {isExample ? <p><strong>Ejemplo ficticio; no es una tarifa recomendada.</strong></p> : null}
            <dl>
              <div><dt>Ingreso por hora con el tiempo previsto</dt><dd>{formatCurrency(review.plannedHourlyRevenue)}/h</dd></div>
              <div><dt>Ingreso por hora con el tiempo real</dt><dd>{formatCurrency(review.actualHourlyRevenue)}/h</dd></div>
              <div><dt>Diferencia de horas frente a lo previsto</dt><dd>{review.hoursDifference > 0 ? '+' : ''}{formatNumber(review.hoursDifference)} h</dd></div>
              <div><dt>Horas que cubre el precio a tu referencia</dt><dd>{formatNumber(review.hoursAtReference)} h</dd></div>
              <div><dt>Importe a tu referencia para el tiempo real</dt><dd>{formatCurrency(review.actualReferencePrice)}</dd></div>
              <div><dt>Precio pactado menos ese importe</dt><dd>{formatCurrency(review.priceDifference)}</dd></div>
            </dl>
            <p>{formatCurrency(review.finalPrice)} ÷ {formatNumber(review.actualHours)} h = {formatCurrency(review.actualHourlyRevenue)}/h sin IVA. Es ingreso por hora dedicada, antes de gastos, cuota e impuestos; no es beneficio neto ni acredita el cobro.</p>
            <p>{review.priceDifference < 0
              ? `El precio queda ${formatCurrency(-review.priceDifference)} por debajo del importe a tu referencia de ${formatCurrency(review.hourlyReference)}/h para las horas reales.`
              : review.priceDifference > 0
                ? `El precio supera en ${formatCurrency(review.priceDifference)} el importe a tu referencia de ${formatCurrency(review.hourlyReference)}/h para las horas reales.`
                : `El precio coincide con el importe a tu referencia de ${formatCurrency(review.hourlyReference)}/h para las horas reales.`} Anota qué explica la diferencia y qué concretarás en el próximo presupuesto.</p>
            <p>Usamos importes y horas con dos decimales. El ingreso por hora se redondea a céntimos; el importe a tu referencia, al céntimo superior; las horas que cubre el precio, hacia abajo a centésimas.</p>
          </div>
        ) : null}
      </div>
      <p className={styles.note}>Esta revisión compara precio y tiempo. No evalúa costes extraordinarios del encargo que no estén en tu referencia, ni determina una tarifa de mercado. No cambia el precio acordado ni el resultado principal. Los datos del comprobador solo se mantienen en esta página mientras la uses; no se guardan ni se incluyen en el enlace.</p>
    </div>
  );
}
