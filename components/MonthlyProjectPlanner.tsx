'use client';

import { useId, useRef, useState } from 'react';
import { estimateProjectCapacity, exampleProject } from '@/lib/projectCapacity';
import { formatCurrency, formatNumber } from '@/lib/format';
import { parseSpanishNumber } from '@/lib/spanishNumber';
import styles from './MonthlyProjectPlanner.module.css';

type Values = { pricePerProject: string; hoursPerProject: string };
const fields = [
  { key: 'pricePerProject', label: 'Precio por encargo sin IVA (EUR)', hint: 'Precio completo de un encargo del tipo que quieres repetir.' },
  { key: 'hoursPerProject', label: 'Horas totales por encargo', hint: 'Incluye preparación, reuniones, ejecución, revisiones y cierre de ese cliente. Cuenta cada hora una sola vez.' },
] as const;

export default function MonthlyProjectPlanner({ monthlyBilling, billableHours }: { monthlyBilling: number; billableHours: number }) {
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
      <p>Compara encargos iguales que puedas completar y facturar en ese mes. Redondeamos importes y horas a dos decimales.</p>
      <noscript><p>El comprobador necesita JavaScript. La guía de <a href="/cuanto-facturar-autonomo-3000-euros#ejemplo-encargos">encargos y capacidad mensual</a> muestra la misma cuenta paso a paso.</p></noscript>
      <fieldset className={styles.fields} aria-describedby={`${id}-reference`} onKeyDown={(event) => {
        if (event.key === 'Enter' && event.target instanceof HTMLInputElement) { event.preventDefault(); check(); }
      }}>
        <legend>El encargo que quieres repetir</legend>
        {fields.map(({ key, label, hint }) => {
          const error = estimate && !estimate.valid ? estimate.errors[key] : undefined;
          return (
            <label key={key}>
              <span id={`${id}-${key}-label`}>{label}</span>
              <input
                ref={(node) => { inputsRef.current[key] = node; }}
                type="text" inputMode="decimal" value={values[key]}
                onChange={(event) => {
                  setValues({ ...values, [key]: event.target.value });
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
