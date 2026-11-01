'use client';

import { useId, useRef, useState } from 'react';
import NumericTextInput from '@/components/NumericTextInput';
import Link from 'next/link';
import { estimateBillableHours, exampleHoursPlan, type BillableHoursPlan } from '@/lib/billableHoursPlan';
import { formatNumber } from '@/lib/format';
import { parseSpanishNumber } from '@/lib/spanishNumber';
import styles from './BillableHoursPlanner.module.css';

const fields = [
  { key: 'daysPerWeek', label: 'Días de trabajo por semana', hint: 'Tu jornada habitual, incluidos días parciales.' },
  { key: 'hoursPerDay', label: 'Horas de trabajo por día', hint: 'Todas las horas de trabajo, también las que no cobras.' },
  { key: 'nonBillableHoursPerWeek', label: 'Horas no facturables por semana', hint: 'Gestión, captación, formación y reserva para huecos. Cuenta cada hora una sola vez.' },
  { key: 'weeksOff', label: 'Semanas sin actividad al año', hint: 'Vacaciones, festivos y otras ausencias, expresados en semanas. Usa decimales si necesitas.' },
] as const;

type Values = Record<keyof BillableHoursPlan, string>;
const emptyValues: Values = { daysPerWeek: '', hoursPerDay: '', nonBillableHoursPerWeek: '', weeksOff: '' };
type Estimate = ReturnType<typeof estimateBillableHours>;

export default function BillableHoursPlanner({ onApply }: { onApply: (hours: number) => void }) {
  const id = useId();
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const inputsRef = useRef<Partial<Record<keyof Values, HTMLInputElement | null>>>({});
  const [values, setValues] = useState<Values>(emptyValues);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [isExample, setIsExample] = useState(false);
  const [agendaBeforeExample, setAgendaBeforeExample] = useState<Values | null>(null);
  const [recoveryFeedback, setRecoveryFeedback] = useState('');

  function estimateHours(nextValues = values) {
    setRecoveryFeedback('');
    const nextEstimate = estimateBillableHours({
      daysPerWeek: parseSpanishNumber(nextValues.daysPerWeek),
      hoursPerDay: parseSpanishNumber(nextValues.hoursPerDay),
      nonBillableHoursPerWeek: parseSpanishNumber(nextValues.nonBillableHoursPerWeek),
      weeksOff: parseSpanishNumber(nextValues.weeksOff),
    });
    setEstimate(nextEstimate);
    if (!nextEstimate.valid) {
      const firstInvalid = fields.find(({ key }) => nextEstimate.errors[key]);
      if (firstInvalid) inputsRef.current[firstInvalid.key]?.focus();
    }
  }

  function recoverAgenda() {
    if (!agendaBeforeExample) return;
    setValues(agendaBeforeExample);
    setEstimate(null);
    setIsExample(false);
    setAgendaBeforeExample(null);
    setRecoveryFeedback('Agenda anterior recuperada. Vuelve a estimarla antes de usar sus horas.');
    inputsRef.current.daysPerWeek?.focus();
  }

  return (
    <details className={styles.planner} ref={detailsRef}>
      <summary>Estimar mis horas con mi agenda</summary>
      <p id={`${id}-intro`}>
        Reparte tu capacidad anual entre 12 meses para que las semanas sin trabajar
        también cuenten al fijar tu tarifa. Completa tu agenda o prueba un ejemplo.
      </p>
      <noscript>
        <p>Esta ayuda necesita JavaScript. Puedes hacer la misma cuenta con la <a href="/horas-facturables-freelance">guía de horas facturables</a>.</p>
      </noscript>
      <fieldset
        className={styles.fields}
        aria-describedby={`${id}-intro`}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
            event.preventDefault();
            estimateHours();
          }
        }}
      >
        <legend>Tu agenda de trabajo</legend>
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
                  setRecoveryFeedback('');
                }}
                aria-invalid={Boolean(error)}
                aria-labelledby={`${id}-${key}-label`}
                aria-describedby={`${id}-${key}-hint${error ? ` ${id}-${key}-error` : ''}`}
              />
              <small className="field-hint" id={`${id}-${key}-hint`}>{hint}</small>
              {error ? <small className="field-error" id={`${id}-${key}-error`}>{error}</small> : null}
            </label>
          );
        })}
      </fieldset>
      <div className={styles.actions}>
        <button type="button" className="primary-button" onClick={() => estimateHours()}>Estimar horas</button>
        <button
          type="button"
          className="link-button"
          onClick={() => {
            // Keep the first personal agenda exactly; edited or repeated examples
            // must not replace it. Recovery never applies hours to the main form.
            if (!isExample && Object.values(values).some((value) => value.trim() !== '')) {
              setAgendaBeforeExample((previous) => previous ?? { ...values });
            }
            const example: Values = {
              daysPerWeek: String(exampleHoursPlan.daysPerWeek),
              hoursPerDay: String(exampleHoursPlan.hoursPerDay),
              nonBillableHoursPerWeek: String(exampleHoursPlan.nonBillableHoursPerWeek),
              weeksOff: String(exampleHoursPlan.weeksOff),
            };
            setValues(example);
            setIsExample(true);
            estimateHours(example);
          }}
        >Probar un ejemplo</button>
        {agendaBeforeExample ? <button type="button" className="link-button" onClick={recoverAgenda} aria-describedby={`${id}-recovery-hint`}>Recuperar mi agenda anterior</button> : null}
      </div>
      {agendaBeforeExample ? <p id={`${id}-recovery-hint`}>Conservamos en esta página la agenda anterior al primer ejemplo. Recuperarla sustituye los cambios que ves ahora y no modifica las horas ya aplicadas a la calculadora. Vuelve a estimarla para poder aplicarla. La copia se pierde al salir o recargar la página.</p> : null}
      <div aria-label="Recuperación de la agenda" aria-live="polite" aria-atomic="true">{recoveryFeedback ? <p>{recoveryFeedback}</p> : null}</div>
      <div aria-live="polite" aria-atomic="true">
        {estimate && !estimate.valid ? <p>Revisa los datos de la agenda. Las horas de la calculadora siguen iguales.</p> : null}
        {estimate?.valid ? (
          <div className={styles.result}>
            {isExample ? <p><strong>Ejemplo hipotético; ajústalo a tu actividad.</strong></p> : null}
            <p className={styles.total}>
              Capacidad media: <strong>{formatNumber(estimate.monthlyBillableHours, 1)} h/mes</strong>
            </p>
            <p>
              ({formatNumber(52)} − {formatNumber(parseSpanishNumber(values.weeksOff))}) semanas
              {' '}× ({formatNumber(estimate.weeklyWorkHours)} − {formatNumber(parseSpanishNumber(values.nonBillableHoursPerWeek))}) h/semana
              {' '}= {formatNumber(estimate.annualBillableHours)} h/año; entre 12 meses.
            </p>
            <p>
              Es capacidad disponible, no trabajo contratado. Si prevés vender menos horas, usa
              esa cifra menor. No vuelvas a restar vacaciones ya incluidas en las semanas sin actividad.
            </p>
            {estimate.hoursToApply >= 1 ? (
              <>
                <p>
                  Usaremos {estimate.hoursToApply} h/mes, redondeando hacia abajo para no inflar
                  la capacidad. La media de arriba se muestra redondeada a un decimal; para
                  aplicarla usamos la cuenta completa y descartamos la fracción de hora.
                </p>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    onApply(estimate.hoursToApply);
                    if (detailsRef.current) detailsRef.current.open = false;
                  }}
                >Usar {estimate.hoursToApply} horas al mes</button>
              </>
            ) : <p>No hay una hora mensual completa disponible. Revisa tu agenda antes de calcular una tarifa.</p>}
          </div>
        ) : null}
      </div>
      <p><Link href="/horas-facturables-freelance">Ver el método y cómo contrastarlo con tus horas reales</Link></p>
    </details>
  );
}
