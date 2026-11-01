'use client';

import { useId, useRef, useState } from 'react';
import NumericTextInput from '@/components/NumericTextInput';
import { estimateProjectCapacity, exampleProject } from '@/lib/projectCapacity';
import { formatCurrency, formatNumber } from '@/lib/format';
import { parseSpanishNumber } from '@/lib/spanishNumber';
import styles from './MonthlyProjectPlanner.module.css';

type Values = { pricePerProject: string; hoursPerProject: string };
const fields = [
  { key: 'pricePerProject', label: 'Precio por encargo sin IVA (EUR)', hint: 'Precio completo de un encargo, no la suma de varios.' },
  { key: 'hoursPerProject', label: 'Horas totales por encargo', hint: 'Incluye preparación, reuniones, ejecución, revisiones y cierre de ese cliente. Cuenta cada hora una sola vez.' },
] as const;

export default function MonthlyProjectPlanner({ monthlyBilling, billableHours, headingLevel: Heading = 'h3' }: { monthlyBilling: number; billableHours: number; headingLevel?: 'h3' | 'h4' }) {
  const id = useId();
  const [values, setValues] = useState<Values>({ pricePerProject: '', hoursPerProject: '' });
  const [checkedValues, setCheckedValues] = useState<Values | null>(null);
  const [isExample, setIsExample] = useState(false);
  const inputsRef = useRef<Partial<Record<keyof Values, HTMLInputElement | null>>>({});
  // Derive from the current reference as well as the last explicit submission,
  // so a changed monthly target cannot leave an old capacity check visible.
  const estimate = checkedValues ? estimateProjectCapacity({
    monthlyBilling, billableHours,
    pricePerProject: parseSpanishNumber(checkedValues.pricePerProject),
    hoursPerProject: parseSpanishNumber(checkedValues.hoursPerProject),
  }) : null;

  function check(nextValues = values) {
    setCheckedValues(nextValues);
    const result = estimateProjectCapacity({
      monthlyBilling, billableHours,
      pricePerProject: parseSpanishNumber(nextValues.pricePerProject),
      hoursPerProject: parseSpanishNumber(nextValues.hoursPerProject),
    });
    if (!result.valid) {
      const firstInvalid = fields.find(({ key }) => result.errors[key]);
      if (firstInvalid) inputsRef.current[firstInvalid.key]?.focus();
    }
  }

  return (
    <div className={styles.planner}>
      <p id={`${id}-reference`} className={styles.reference}>
        Referencia de este cálculo: <strong>{formatCurrency(monthlyBilling)} sin IVA al mes</strong>
        {' '}y <strong>{formatNumber(billableHours)} h facturables disponibles</strong>.
      </p>
      <p>Compara primero el precio de un encargo con tu referencia y después revisa qué supondría repetirlo durante el mes. Redondeamos importes y horas a dos decimales.</p>
      <noscript><p>El comprobador necesita JavaScript. La guía de <a href="/cuanto-facturar-autonomo-3000-euros#ejemplo-encargos">encargos y capacidad mensual</a> muestra la misma cuenta paso a paso.</p></noscript>
      <fieldset className={styles.fields} aria-describedby={`${id}-reference`} onKeyDown={(event) => {
        if (event.key === 'Enter' && event.target instanceof HTMLInputElement) { event.preventDefault(); check(); }
      }}>
        <legend>El encargo que quieres valorar</legend>
        {fields.map(({ key, label, hint }) => {
          const error = estimate && !estimate.valid ? estimate.errors[key] : undefined;
          return (
            <label key={key}>
              <span id={`${id}-${key}-label`}>{label}</span>
              <NumericTextInput
                ref={(node) => { inputsRef.current[key] = node; }}
                inputMode="decimal" value={values[key]}
                onValueChange={(nextValue) => {
                  setValues({ ...values, [key]: nextValue });
                  setCheckedValues(null);
                  setIsExample(false);
                }}
                aria-labelledby={`${id}-${key}-label`}
                aria-describedby={`${id}-${key}-hint${error ? ` ${id}-${key}-error` : ''}`}
                aria-invalid={Boolean(error)}
              />
              <small id={`${id}-${key}-hint`}>{hint}</small>
              {error ? <small className="field-error" id={`${id}-${key}-error`}>{error}</small> : null}
            </label>
          );
        })}
      </fieldset>
      <div className={styles.actions}>
        <button type="button" className="primary-button" onClick={() => check()}>Comprobar encargos</button>
        <button type="button" className="link-button" onClick={() => {
          const nextValues = { pricePerProject: String(exampleProject.pricePerProject), hoursPerProject: String(exampleProject.hoursPerProject) };
          setValues(nextValues);
          setIsExample(true);
          check(nextValues);
        }}>Probar un encargo ficticio</button>
      </div>
      <div role="status" aria-live="polite" aria-atomic="true">
        {estimate && !estimate.valid ? <p>Revisa los datos indicados y la referencia mensual antes de comprobar el plan.</p> : null}
        {estimate?.valid ? (
          <div className={styles.result}>
            {isExample ? <p><strong>Precio y horas del encargo ficticios; se usa la referencia mensual de arriba.</strong></p> : null}
            <Heading>Qué supone este encargo</Heading>
            <dl>
              <div><dt>Precio por hora del encargo</dt><dd>{formatCurrency(estimate.projectHourlyRate)}/h sin IVA</dd></div>
              {estimate.projectReferencePrice !== null ? (
                <div><dt>Referencia para estas horas sin IVA</dt><dd>{formatCurrency(estimate.projectReferencePrice)}</dd></div>
              ) : null}
              {estimate.projectTimeReference.status === 'available' ? (
                <div><dt>Horas que cubre este precio a tu referencia</dt><dd>{formatNumber(estimate.projectTimeReference.hoursCovered)} h</dd></div>
              ) : null}
            </dl>
            <p>{formatCurrency(estimate.pricePerProject)} sin IVA entre {formatNumber(estimate.hoursPerProject)} h = {formatCurrency(estimate.projectHourlyRate)}/h. Es facturación por hora, no sueldo neto.</p>
            {estimate.projectPriceDifference !== null ? (
              <p className={estimate.projectPriceDifference < 0 ? styles.shortfall : styles.fits}>
                <strong>{estimate.projectPriceDifference < 0
                  ? `El precio queda ${formatCurrency(-estimate.projectPriceDifference)} por debajo de la referencia para estas horas.`
                  : estimate.projectPriceDifference > 0
                    ? `El precio supera en ${formatCurrency(estimate.projectPriceDifference)} la referencia para estas horas.`
                    : 'El precio coincide con la referencia para estas horas.'}</strong>
              </p>
            ) : <p className={styles.note}>Sin horas facturables disponibles en el mes no podemos obtener una referencia para comparar este precio. Revisa la capacidad de tu cálculo.</p>}
            {estimate.projectTimeReference.status === 'available' ? (
              <>
                <p className={estimate.projectTimeReference.excessHours > 0 ? styles.shortfall : styles.note}>
                  <strong>{estimate.projectTimeReference.hoursCovered === 0
                    ? 'El precio no cubre ni 0,01 h a tu referencia. Revisa el alcance o el precio.'
                    : estimate.projectTimeReference.excessHours > 0
                      ? `Las horas previstas superan este límite en ${formatNumber(estimate.projectTimeReference.excessHours)} h. Revisa el alcance o el precio antes de comprometer el trabajo.`
                      : 'Las horas previstas no superan este límite.'}</strong>
                </p>
                <p className={styles.note}>Calculamos las horas con la proporción mensual completa y redondeamos hacia abajo a centésimas. Son horas decimales: 1,5 h es una hora y media. Este límite no reserva hueco en tu agenda.</p>
              </>
            ) : estimate.projectTimeReference.status === 'out-of-range' ? <p className={styles.note}>No podemos mostrar con precisión las horas que cubre este precio. Revisa los importes y la capacidad de referencia.</p> : null}
            <p className={styles.note}>La referencia reparte el objetivo mensual entre las horas disponibles y lo aplica a las del encargo, redondeando al alza al céntimo. Esta comparación no añade costes específicos del encargo ni calcula beneficio neto o decide si debes aceptarlo.</p>
            <Heading>Si repites encargos iguales durante el mes</Heading>
            <dl>
              <div><dt>Encargos completos para alcanzar el importe</dt><dd>{formatNumber(estimate.requiredProjects)}</dd></div>
              <div><dt>Facturación de esos encargos sin IVA</dt><dd>{formatCurrency(estimate.plannedBilling)}</dd></div>
              <div><dt>Horas que requieren</dt><dd>{formatNumber(estimate.plannedHours)} h</dd></div>
              <div><dt>Encargos completos que caben por horas</dt><dd>{formatNumber(estimate.maxProjects)}</dd></div>
            </dl>
            <p>{formatNumber(estimate.requiredProjects)} × {formatCurrency(estimate.pricePerProject)} = {formatCurrency(estimate.plannedBilling)} sin IVA. {estimate.billingDifference === 0 ? 'Coincide con el objetivo de facturación.' : `Supera el objetivo de facturación en ${formatCurrency(estimate.billingDifference)}; esa diferencia no es beneficio neto.`}</p>
            {estimate.remainingHours < 0 ? (
              <div className={styles.shortfall}>
                <p><strong>Ese volumen no cabe: faltan {formatNumber(-estimate.remainingHours)} horas.</strong></p>
                <p>Con las horas disponibles {estimate.maxProjects === 1 ? 'cabe' : 'caben'} {formatNumber(estimate.maxProjects)} {estimate.maxProjects === 1 ? 'encargo completo' : 'encargos completos'}: {formatCurrency(estimate.capacityBilling)} sin IVA. Faltarían {formatCurrency(-estimate.capacityDifference)} para la facturación objetivo.</p>
              </div>
            ) : (
              <p className={styles.fits}><strong>{estimate.remainingHours === 0 ? 'Cabe por horas, sin holgura.' : `Cabe por horas; quedan ${formatNumber(estimate.remainingHours)} h.`}</strong> Vender y coordinar esos encargos sigue siendo un supuesto.</p>
            )}
          </div>
        ) : null}
      </div>
      <p className={styles.note}>Esto no acredita ventas, cobros ni fechas de entrega. Las horas deben cubrir todo el trabajo de cada encargo; la gestión general ya debe estar descontada de tu capacidad mensual. No calcula un nuevo neto ni cambia tus datos de la calculadora.</p>
      <p>Si estás negociando el precio, puedes <a href="/tarifa-freelance-por-hora#descuento-tarifa" className={styles.guideLink}>comprobar una rebaja de tarifa y las horas necesarias</a>.</p>
    </div>
  );
}
