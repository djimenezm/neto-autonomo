'use client';

import { useId, useState } from 'react';
import NumericTextInput from '@/components/NumericTextInput';
import { projectRecordedHours } from '@/lib/billableHoursPlan';
import { formatNumber } from '@/lib/format';
import { parseSpanishNumber } from '@/lib/spanishNumber';
import styles from './WorkLogProjection.module.css';

const weekFields = ['week1', 'week2', 'week3', 'week4'] as const;
const fields = [...weekFields, 'weeksOff', 'previousHours'] as const;
const emptyValues = { week1: '', week2: '', week3: '', week4: '', weeksOff: '', previousHours: '' };

export default function WorkLogProjection() {
  const id = useId();
  const [values, setValues] = useState(emptyValues);
  const [showErrors, setShowErrors] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const weeklyHours = weekFields.map((field) => parseSpanishNumber(values[field], 'none'));
  const weeksOff = parseSpanishNumber(values.weeksOff, 'none');
  const previousHours = parseSpanishNumber(values.previousHours, 'none');
  const hasPrevious = values.previousHours.trim() !== '';
  const weeklyErrors = weeklyHours.map((hours) => !(hours >= 0 && hours <= 168)
    ? 'Introduce un número de horas entre 0 y 168.' : null);
  const errors = [
    ...weeklyErrors,
    !(weeksOff >= 0 && weeksOff <= 52) ? 'Introduce un número de semanas entre 0 y 52.' : null,
    hasPrevious && !(Number.isSafeInteger(previousHours) && previousHours > 0) ? 'Introduce un número entero de horas mayor que cero.' : null,
  ];
  const firstError = errors.findIndex(Boolean);
  const projection = submitted && firstError === -1
    ? projectRecordedHours([weeklyHours[0], weeklyHours[1], weeklyHours[2], weeklyHours[3]], weeksOff) : null;
  const difference = projection && hasPrevious ? projection.hoursToApply - previousHours : null;

  function fieldInput(field: typeof fields[number], label: string) {
    const error = showErrors ? errors[fields.indexOf(field)] : null;
    const fieldId = `${id}-${field}`;
    return (
      <div className={styles.field} key={field}>
        <label htmlFor={fieldId}>{label}</label>
        <NumericTextInput
          id={fieldId}
          inputMode={field === 'previousHours' ? 'numeric' : 'decimal'}
          value={values[field]}
          onValueChange={(value) => {
            setValues((current) => ({ ...current, [field]: value }));
            setSubmitted(false);
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fieldId}-error` : undefined}
        />
        {error ? <small id={`${fieldId}-error`} className="field-error">{error}</small> : null}
      </div>
    );
  }

  return (
    <form className={`feature-card ${styles.projection}`} aria-labelledby={`${id}-title`} noValidate onSubmit={(event) => {
      event.preventDefault();
      setShowErrors(firstError !== -1);
      setSubmitted(firstError === -1);
      if (firstError !== -1) {
        const field = event.currentTarget.ownerDocument.getElementById(`${id}-${fields[firstError]}`);
        field?.focus();
      }
    }}>
      <h3 id={`${id}-title`}>Proyecta tus horas a partir de cuatro semanas</h3>
      <fieldset className={styles.fields} aria-describedby={`${id}-hint`}>
        <legend>Horas cobrables registradas</legend>
        <p id={`${id}-hint`} className={styles.hint}>Usa semanas completas de tu actividad habitual. Escribe 0 si trabajaste esa semana y no tuviste horas cobrables. Puedes usar decimales.</p>
        {weekFields.map((field, index) => fieldInput(field, `Semana ${index + 1} (horas)`))}
        {fieldInput('weeksOff', 'Semanas sin actividad al año')}
        {fieldInput('previousHours', 'Horas de tu cálculo anterior al mes (opcional)')}
      </fieldset>
      <button className="primary-button" type="submit">Calcular mi previsión de horas</button>
      <noscript><p>Activa JavaScript para calcular tus horas aquí o usa la fórmula del ejemplo.</p></noscript>
      <div className={styles.result} role="status">
        {projection ? (
          <>
            <dl>
              <div><dt>Media registrada por semana</dt><dd>{formatNumber(projection.averageWeeklyHours)} h</dd></div>
              <div><dt>Media mensual estimada</dt><dd>{formatNumber(projection.monthlyHours)} h</dd></div>
              <div><dt>Horas enteras al mes para tu cálculo</dt><dd>{projection.hoursToApply} h</dd></div>
            </dl>
            {difference !== null ? <p>{difference === 0 ? 'Coincide con las horas de tu cálculo anterior.' : `${formatNumber(Math.abs(difference))} h ${difference < 0 ? 'menos' : 'más'} al mes que en tu cálculo anterior.`}</p> : null}
            <p>{projection.hoursToApply > 0
              ? 'Redondeamos hacia abajo a horas enteras. Si esperas vender menos, usa la cifra menor en «Horas facturables al mes» al actualizar tu tarifa.'
              : 'Con estos datos, la previsión queda por debajo de una hora entera al mes. Revisa el registro o las semanas de actividad antes de actualizar tu tarifa.'}</p>
          </>
        ) : null}
      </div>
    </form>
  );
}
