'use client';

import { useId, useRef, useState } from 'react';
import NumericTextInput from '@/components/NumericTextInput';
import { estimateDayRate, type DayRateInput } from '@/lib/dayRate';
import { formatCurrency, formatNumber } from '@/lib/format';
import { parseSpanishNumber } from '@/lib/spanishNumber';
import styles from './DayRatePlanner.module.css';

const fields = [
  { key: 'hourlyRate', label: 'Tu referencia por hora sin IVA (EUR)', hint: 'La que has calculado con tus costes y horas mensuales. Redondeamos los importes a céntimos.' },
  { key: 'sessionHours', label: 'Horas de jornada con el cliente', hint: 'La sesión o el bloque de trabajo que estás ofreciendo, hasta 24 horas.' },
  { key: 'preparationHours', label: 'Horas de preparación de este servicio', hint: 'Trabajo específico para este cliente fuera de la jornada. Usa 0 si ya está incluido.' },
  { key: 'followUpHours', label: 'Horas de cierre y seguimiento', hint: 'Documentación o revisión posterior fuera de la jornada. Usa 0 si ya está incluido.' },
  { key: 'serviceCosts', label: 'Costes específicos que debe cubrir el precio (EUR)', hint: 'Solo costes de este servicio que aún no estén cubiertos por tu referencia por hora. Usa 0 si no hay. No se calcula su deducibilidad ni el IVA recuperable.' },
  { key: 'proposedPrice', label: 'Precio que estás valorando sin IVA (EUR, opcional)', hint: 'Déjalo vacío si solo quieres obtener la referencia para la jornada.' },
] as const;
type Values = Record<keyof DayRateInput, string>;
const emptyValues: Values = { hourlyRate: '', sessionHours: '', preparationHours: '', followUpHours: '', serviceCosts: '', proposedPrice: '' };

export default function DayRatePlanner({ example, costExample }: { example: DayRateInput; costExample?: DayRateInput }) {
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
      serviceCosts: parseSpanishNumber(nextValues.serviceCosts),
      proposedPrice: nextValues.proposedPrice.trim() ? parseSpanishNumber(nextValues.proposedPrice) : undefined,
    });
    setEstimate(result);
    if (result.valid) setValues({
      hourlyRate: formatNumber(result.hourlyRate),
      sessionHours: formatNumber(result.sessionHours),
      preparationHours: formatNumber(result.preparationHours),
      followUpHours: formatNumber(result.followUpHours),
      serviceCosts: formatNumber(result.serviceCosts),
      proposedPrice: result.proposedPrice === null ? '' : formatNumber(result.proposedPrice),
    });
    if (!result.valid) {
      const firstInvalid = fields.find(({ key }) => result.errors[key]);
      if (firstInvalid) inputsRef.current[firstInvalid.key]?.focus();
    }
  }

  function loadExample(input: DayRateInput) {
    setIsExample(true);
    calculate({
      hourlyRate: formatNumber(input.hourlyRate),
      sessionHours: formatNumber(input.sessionHours),
      preparationHours: formatNumber(input.preparationHours),
      followUpHours: formatNumber(input.followUpHours),
      serviceCosts: formatNumber(input.serviceCosts ?? 0),
      proposedPrice: input.proposedPrice === undefined ? '' : formatNumber(input.proposedPrice),
    });
  }

  return (
    <div className={styles.planner}>
      <p id={`${id}-intro`}>Suma todo el tiempo específico del servicio, aunque parte ocurra otro día, y los costes adicionales que deba cubrir su precio. No repitas los gastos habituales ya incluidos en tu tarifa. Los datos se usan en esta página y no se guardan al salir.</p>
      <noscript><p>El comprobador necesita JavaScript. El ejemplo y la fórmula de arriba permiten hacer la cuenta sin él.</p></noscript>
      <form noValidate aria-label="Comprobar una tarifa diaria" aria-describedby={`${id}-intro`} onSubmit={(event) => { event.preventDefault(); calculate(); }}>
        <div className={styles.fields}>
          {fields.map(({ key, label, hint }) => {
            const error = estimate && !estimate.valid ? estimate.errors[key] : undefined;
            return (
              <label key={key}>
                <span id={`${id}-${key}-label`}>{label}</span>
                <NumericTextInput
                  ref={(node) => { inputsRef.current[key] = node; }}
                  inputMode="decimal"
                  value={values[key]}
                  onValueChange={(nextValue) => {
                    setValues({ ...values, [key]: nextValue });
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
          <button type="button" className="link-button" onClick={() => loadExample(example)}>Cargar el ejemplo de la guía</button>
          {costExample ? <button type="button" className="link-button" onClick={() => loadExample(costExample)}>Probar el ejemplo con costes</button> : null}
        </div>
      </form>
      <div role="status" aria-label="Comprobación de jornada y costes" aria-live="polite" aria-atomic="true">
        {estimate && !estimate.valid ? <p>Revisa los campos indicados antes de comprobar la jornada.</p> : null}
        {estimate?.valid ? (
          <div className={styles.result}>
            {isExample ? <p><strong>Ejemplo hipotético; cambia los datos para tu servicio.</strong></p> : null}
            <h3>Lo que supone esta jornada</h3>
            <dl>
              <div><dt>Tiempo total del servicio</dt><dd>{formatNumber(estimate.totalHours)} h</dd></div>
              <div><dt>Precio según tu referencia por hora</dt><dd>{formatCurrency(estimate.referencePrice)} sin IVA</dd></div>
              <div><dt>Costes específicos a cubrir una sola vez</dt><dd>{formatCurrency(estimate.serviceCosts)}</dd></div>
              <div><dt>Referencia total: horas y costes</dt><dd>{formatCurrency(estimate.totalReferencePrice)} sin IVA</dd></div>
              {estimate.proposedPrice !== null ? (
                <>
                  <div><dt>Precio que estás valorando</dt><dd>{formatCurrency(estimate.proposedPrice)} sin IVA</dd></div>
                  <div><dt>Precio menos los costes específicos</dt><dd>{formatCurrency(estimate.availableForTime!)}</dd></div>
                  <div><dt>Por hora tras esos costes</dt><dd>{formatCurrency(estimate.availableHourlyRate!)} / h</dd></div>
                </>
              ) : null}
            </dl>
            <p>({formatNumber(estimate.sessionHours)} h de jornada + {formatNumber(estimate.preparationHours)} h de preparación + {formatNumber(estimate.followUpHours)} h de cierre) × {formatCurrency(estimate.hourlyRate)}/h = {formatCurrency(estimate.referencePrice)}. Al sumar {formatCurrency(estimate.serviceCosts)} de costes específicos, la referencia total es {formatCurrency(estimate.totalReferencePrice)} sin IVA.</p>
            {estimate.proposedPrice !== null ? <p>{formatCurrency(estimate.proposedPrice)} de precio − {formatCurrency(estimate.serviceCosts)} de costes = {formatCurrency(estimate.availableForTime!)}; entre {formatNumber(estimate.totalHours)} h quedan {formatCurrency(estimate.availableHourlyRate!)} por hora para cubrir tu referencia. Todavía incluye los gastos habituales, cuota y reserva fiscal contemplados en ella; no es sueldo neto.</p> : null}
            {estimate.priceDifference !== null ? (
              <p className={`${styles.comparison}${estimate.priceDifference < 0 ? ` ${styles.shortfall}` : ''}`}>
                {estimate.priceDifference < 0
                  ? `Faltan ${formatCurrency(-estimate.priceDifference)} para alcanzar tu referencia total de horas y costes.`
                  : estimate.priceDifference > 0
                    ? `Supera tu referencia en ${formatCurrency(estimate.priceDifference)} tras cubrir esos costes específicos.`
                    : 'El precio coincide con tu referencia total para estas horas y costes.'}
              </p>
            ) : null}
            {estimate.availableForTime !== null && estimate.availableForTime < 0 ? <p className={styles.shortfall}>El precio ni siquiera cubre los costes específicos: faltan {formatCurrency(-estimate.availableForTime)} antes de remunerar tus horas.</p> : null}
            <p>Redondeamos importes y horas a dos decimales antes de calcular. La comparación depende de tu estimación. No calcula beneficio neto, impuestos, deducibilidad, cobros ni un recargo por reservar agenda. El total es una referencia aritmética; no determina el precio que debes acordar.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
