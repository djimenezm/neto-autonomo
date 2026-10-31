'use client';

import { useId, useRef, useState } from 'react';
import NumericTextInput from '@/components/NumericTextInput';
import { compareRateDiscount, rateDiscountExample, type RateDiscountInput } from '@/lib/rateDiscount';
import { formatCurrency, formatNumber } from '@/lib/format';
import { parseSpanishNumber } from '@/lib/spanishNumber';
import styles from './RateDiscountPlanner.module.css';

const fields = [
  { key: 'hourlyRate', label: 'Tarifa actual por hora sin IVA (EUR)', hint: 'La tarifa de partida para los servicios que comparas, antes de la rebaja.' },
  { key: 'discountPercent', label: 'Rebaja que quieres comprobar (%)', hint: 'Entre 0 y 100. Redondeamos el porcentaje a dos decimales y después la nueva tarifa a céntimos.' },
  { key: 'currentHours', label: 'Horas facturadas en el mes de partida', hint: 'Solo las horas que se cobran a la tarifa de partida. No añadas aquí preparación o cierre que no se facturen a esa tarifa.' },
  { key: 'capacityHours', label: 'Capacidad mensual para facturar horas (horas)', hint: 'Total de horas que puedes facturar en estos servicios, incluidas las que ya vendes. Descuenta gestión, preparación no facturada, descansos y otros servicios. No son horas libres adicionales ni ventas confirmadas.' },
] as const;
type Values = Record<keyof RateDiscountInput, string>;

export default function RateDiscountPlanner() {
  const id = useId();
  const refs = useRef<Partial<Record<keyof Values, HTMLInputElement | null>>>({});
  const [values, setValues] = useState<Values>({ hourlyRate: '', discountPercent: '', currentHours: '', capacityHours: '' });
  const [result, setResult] = useState<ReturnType<typeof compareRateDiscount> | null>(null);
  const [isExample, setIsExample] = useState(false);

  function calculate(next = values) {
    const estimate = compareRateDiscount({ hourlyRate: parseSpanishNumber(next.hourlyRate), discountPercent: parseSpanishNumber(next.discountPercent), currentHours: parseSpanishNumber(next.currentHours), capacityHours: parseSpanishNumber(next.capacityHours) });
    setResult(estimate);
    if (estimate.valid) setValues({ hourlyRate: formatNumber(estimate.hourlyRate), discountPercent: formatNumber(estimate.discountPercent), currentHours: formatNumber(estimate.currentHours), capacityHours: formatNumber(estimate.capacityHours) });
    else {
      const invalid = fields.find(({ key }) => estimate.errors[key]);
      if (invalid) refs.current[invalid.key]?.focus();
    }
  }

  return (
    <div className={styles.planner}>
      <p id={`${id}-method`}>Comparamos la misma clase de servicio, con el mismo alcance y tiempo por unidad. Suponemos que toda la facturación comparada pasa a la nueva tarifa. Esta ayuda no calcula el neto ni cambia el resultado principal.</p>
      <noscript><p>La comprobación interactiva necesita JavaScript. La tabla de esta sección permite seguir la cuenta sin él.</p></noscript>
      <fieldset className={styles.fields} aria-describedby={`${id}-method`} onKeyDown={(event) => {
        if (event.key === 'Enter' && event.target instanceof HTMLInputElement) { event.preventDefault(); calculate(); }
      }}>
        <legend>Tu tarifa, la rebaja y tu capacidad</legend>
        {fields.map(({ key, label, hint }) => {
          const error = result && !result.valid ? result.errors[key] : undefined;
          return (
            <label key={key}>
              <span id={`${id}-${key}-label`}>{label}</span>
              <NumericTextInput inputMode="decimal" value={values[key]} ref={(node) => { refs.current[key] = node; }}
                onValueChange={(nextValue) => { setValues({ ...values, [key]: nextValue }); setResult(null); setIsExample(false); }}
                aria-labelledby={`${id}-${key}-label`} aria-describedby={`${id}-${key}-hint${error ? ` ${id}-${key}-error` : ''}`} aria-invalid={Boolean(error)} />
              <small id={`${id}-${key}-hint`}>{hint}</small>
              {error ? <small className="field-error" id={`${id}-${key}-error`}>{error}</small> : null}
            </label>
          );
        })}
      </fieldset>
      <div className={styles.actions}>
        <button type="button" className="primary-button" onClick={() => calculate()}>Comprobar rebaja de tarifa</button>
        <button type="button" className="link-button" onClick={() => {
          setIsExample(true);
          calculate({ hourlyRate: formatNumber(rateDiscountExample.hourlyRate), discountPercent: formatNumber(rateDiscountExample.discountPercent), currentHours: formatNumber(rateDiscountExample.currentHours), capacityHours: formatNumber(rateDiscountExample.capacityHours) });
        }}>Probar la rebaja ficticia del 10 %</button>
      </div>
      <div role="status" aria-label="Rebaja de tarifa y capacidad" aria-live="polite" aria-atomic="true">
        {result && !result.valid ? <p>Revisa los datos indicados antes de comparar la rebaja.</p> : null}
        {result?.valid ? (
          <div className={styles.result}>
            {isExample ? <p><strong>Tarifa, rebaja y horas ficticias; no son una recomendación de precio.</strong></p> : null}
            <p>Partida: {formatCurrency(result.hourlyRate)}/h × {formatNumber(result.currentHours)} h = {formatCurrency(result.baselineBilling)} sin IVA. Rebaja indicada: {formatNumber(result.discountPercent)} %. Capacidad total: {formatNumber(result.capacityHours)} h al mes.</p>
            <dl>
              <div><dt>Tarifa tras la rebaja, redondeada</dt><dd>{formatCurrency(result.reducedHourlyRate)}/h sin IVA</dd></div>
              <div><dt>Facturación con las mismas horas</dt><dd>{formatCurrency(result.sameHoursBilling)} sin IVA</dd></div>
              <div><dt>Reducción de facturación con las mismas horas</dt><dd>{formatCurrency(result.lostBilling)} sin IVA</dd></div>
              <div><dt>Horas para recuperar el valor de partida</dt><dd>{result.requiredHours === null ? 'No se recupera con tarifa cero' : `${formatNumber(result.requiredHours)} h`}</dd></div>
              <div><dt>Capacidad menos horas necesarias</dt><dd>{result.remainingHours === null ? 'No aplicable' : `${formatNumber(result.remainingHours)} h`}</dd></div>
            </dl>
            {result.requiredHours !== null ? (
              <p>{formatNumber(result.requiredHours)} h × {formatCurrency(result.reducedHourlyRate)}/h = {formatCurrency(result.recoveryBilling!)} sin IVA. Son {formatNumber(result.extraHours!)} h adicionales respecto a las {formatNumber(result.currentHours)} h de partida. Las horas se redondean al alza a centésimas para cubrir el valor original de tarifa × tiempo, antes de redondear la facturación.</p>
            ) : <p>Con una tarifa de cero no puedes recuperar los {formatCurrency(result.baselineBilling)} de partida vendiendo más horas a esa tarifa.</p>}
            {!result.currentFitsCapacity ? <p className={styles.shortfall}>Las horas de partida ya superan la capacidad indicada. Revisa esa carga aunque no apliques ninguna rebaja.</p> : null}
            <p className={result.fitsCapacity ? styles.fits : styles.shortfall}>
              <strong>{result.fitsCapacity ? result.remainingHours === 0 ? 'Cabe justo por horas, sin holgura.' : `Cabe por horas; quedarían ${formatNumber(result.remainingHours!)} h.` : result.requiredHours === null ? 'La tarifa cero no permite recuperar la facturación.' : `No cabe en esa capacidad: faltan ${formatNumber(-result.remainingHours!)} h.`}</strong>
              {' '}Con las {formatNumber(result.capacityHours)} h totales a la tarifa rebajada se facturarían {formatCurrency(result.capacityBilling)} sin IVA. {result.capacityBillingDifference < 0 ? `Faltarían ${formatCurrency(-result.capacityBillingDifference)} para el importe de partida.` : ''}{result.extraHours !== null && result.extraHours > 0 ? ' Vender esas horas adicionales sigue siendo un supuesto.' : ''}
            </p>
            {result.discountPercent > 0 && result.reducedHourlyRate === result.hourlyRate ? <p>La rebaja indicada no cambia la tarifa al redondearla a céntimos. La comparación usa esa tarifa redondeada.</p> : null}
          </div>
        ) : null}
      </div>
      <p className={styles.note}>Esta comparación de facturación no estima ventas futuras ni beneficio neto. No recalcula gastos, cuota o impuestos, ni incluye costes específicos adicionales o cobros. Si cambia el alcance o solo rebajas una parte de tus servicios, compara esa parte por separado. Los campos solo se usan en esta página, sin guardarlos ni enviarlos.</p>
    </div>
  );
}
