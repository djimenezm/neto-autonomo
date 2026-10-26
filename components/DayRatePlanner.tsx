'use client';

import { useId, useRef, useState } from 'react';
import { estimateDayRate, type DayRateInput } from '@/lib/dayRate';
import { formatCurrency, formatNumber } from '@/lib/format';
import { parseSpanishNumber } from '@/lib/spanishNumber';
import styles from './DayRatePlanner.module.css';

const fields = [
  { key: 'hourlyRate', label: 'Tu referencia por hora sin IVA (EUR)', hint: 'La que has calculado con tus costes y horas mensuales. Redondeamos los importes a céntimos.' },
  { key: 'sessionHours', label: 'Horas de jornada con el cliente', hint: 'La sesión o el bloque de trabajo que estás ofreciendo, hasta 24 horas.' },
  { key: 'preparationHours', label: 'Horas de preparación de este servicio', hint: 'Trabajo específico para este cliente fuera de la jornada. Usa 0 si ya está incluido.' },
  { key: 'followUpHours', label: 'Horas de cierre y seguimiento', hint: 'Documentación o revisión posterior fuera de la jornada. Usa 0 si ya está incluido.' },
  { key: 'proposedPrice', label: 'Precio que estás valorando sin IVA (EUR, opcional)', hint: 'Déjalo vacío si solo quieres obtener la referencia para la jornada.' },
] as const;
type Values = Record<keyof DayRateInput, string>;
const emptyValues: Values = { hourlyRate: '', sessionHours: '', preparationHours: '', followUpHours: '', proposedPrice: '' };

export default function DayRatePlanner({ example }: { example: DayRateInput }) {
  const id = useId();
  const inputsRef = useRef<Partial<Record<keyof Values, HTMLInputElement | null>>>({});
  const [values, setValues] = useState<Values>(emptyValues);
  const [estimate, setEstimate] = useState<ReturnType<typeof estimateDayRate> | null>(null);
  const [isExample, setIsExample] = useState(false);

  function calculate(nextValues = values) {
    const result = estimateDayRate({
      hourlyRate: parseSpanishNumber(nextValues.hourlyRate),
      sessionHours: parseSpanishNumber(nextValues.sessionHours),
      preparationHours: parseSpanishNumber(nextValues.preparationHours),
      followUpHours: parseSpanishNumber(nextValues.followUpHours),
      proposedPrice: nextValues.proposedPrice.trim() ? parseSpanishNumber(nextValues.proposedPrice) : undefined,
    });
    setEstimate(result);
    if (!result.valid) {
      const firstInvalid = fields.find(({ key }) => result.errors[key]);
      if (firstInvalid) inputsRef.current[firstInvalid.key]?.focus();
    }
  }

  return (
    <div className={styles.planner}>
      <p id={`${id}-intro`}>Suma todo el tiempo específico del servicio, aunque parte ocurra otro día. Los datos se usan en esta página y no se guardan al salir.</p>
      <noscript><p>El comprobador necesita JavaScript. El ejemplo y la fórmula de arriba permiten hacer la cuenta sin él.</p></noscript>
      <form noValidate aria-label="Comprobar una tarifa diaria" aria-describedby={`${id}-intro`} onSubmit={(event) => { event.preventDefault(); calculate(); }}>
        <div className={styles.fields}>
          {fields.map(({ key, label, hint }) => {
            const error = estimate && !estimate.valid ? estimate.errors[key] : undefined;
            return (
              <label key={key}>
                <span id={`${id}-${key}-label`}>{label}</span>
                <input
                  ref={(node) => { inputsRef.current[key] = node; }}
                  type="text"
                  inputMode="decimal"
                  value={values[key]}
                  onChange={(event) => {
                    setValues({ ...values, [key]: event.target.value });
                    setEstimate(null);
                    setIsExample(false);
                  }}
                  aria-invalid={Boolean(error)}
                  aria-labelledby={`${id}-${key}-label`}
                  aria-describedby={`${id}-${key}-hint${error ? ` ${id}-${key}-error` : ''}`}
                />
                <small id={`${id}-${key}-hint`}>{hint}</small>
                {error ? <small className="field-error" id={`${id}-${key}-error`}>{error}</small> : null}
              </label>
            );
          })}
        </div>
        <div className={styles.actions}>
          <button className="primary-button" type="submit">Comprobar jornada</button>
          <button type="button" className="link-button" onClick={() => {
            const nextValues: Values = {
              hourlyRate: String(example.hourlyRate),
              sessionHours: String(example.sessionHours),
              preparationHours: String(example.preparationHours),
              followUpHours: String(example.followUpHours),
              proposedPrice: example.proposedPrice === undefined ? '' : String(example.proposedPrice),
            };
            setValues(nextValues);
            setIsExample(true);
            calculate(nextValues);
          }}>Cargar el ejemplo de la guía</button>
        </div>
      </form>
      <div role="status" aria-live="polite" aria-atomic="true">
        {estimate && !estimate.valid ? <p>Revisa los campos indicados antes de comprobar la jornada.</p> : null}
        {estimate?.valid ? (
          <div className={styles.result}>
            {isExample ? <p><strong>Ejemplo hipotético; cambia los datos para tu servicio.</strong></p> : null}
            <h3>Lo que supone esta jornada</h3>
            <dl>
              <div><dt>Tiempo total del servicio</dt><dd>{formatNumber(estimate.totalHours)} h</dd></div>
              <div><dt>Precio según tu referencia por hora</dt><dd>{formatCurrency(estimate.referencePrice)} sin IVA</dd></div>
              {estimate.proposedPrice !== null ? (
                <>
                  <div><dt>Precio que estás valorando</dt><dd>{formatCurrency(estimate.proposedPrice)} sin IVA</dd></div>
                  <div><dt>Ingreso por cada hora dedicada</dt><dd>{formatCurrency(estimate.effectiveHourlyRate!)} / h sin IVA</dd></div>
                </>
              ) : null}
            </dl>
            <p>{formatNumber(parseSpanishNumber(values.sessionHours))} h de jornada + {formatNumber(parseSpanishNumber(values.preparationHours))} h de preparación + {formatNumber(parseSpanishNumber(values.followUpHours))} h de cierre = {formatNumber(estimate.totalHours)} h × {formatCurrency(estimate.hourlyRate)}/h.</p>
            {estimate.priceDifference !== null ? (
              <p className={styles.comparison}>
                {estimate.priceDifference < 0
                  ? `Faltan ${formatCurrency(-estimate.priceDifference)} para alcanzar tu referencia.`
                  : estimate.priceDifference > 0
                    ? `Supera tu referencia en ${formatCurrency(estimate.priceDifference)}.`
                    : 'El precio coincide con tu referencia para estas horas.'}
              </p>
            ) : null}
            <p>La comparación depende de tu estimación. No calcula beneficio neto, impuestos, gastos extraordinarios ni un recargo por reservar agenda.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
