'use client';

import { useId, useRef, useState } from 'react';
import { planAnnualBilling } from '@/lib/annualBillingPlan';
import { formatCurrency, formatNumber } from '@/lib/format';
import { parseSpanishNumber } from '@/lib/spanishNumber';
import styles from './AnnualBillingPlanner.module.css';

const fields = [
  { key: 'activeMonths', label: 'Meses completos con facturación en el año', hint: 'Entre 1 y 12. Repartimos la misma facturación entre esos meses; no modelamos meses parciales.' },
  { key: 'hoursPerActiveMonth', label: 'Horas facturables en cada mes activo', hint: 'Horas vendibles de un mes con actividad, después de gestión y descansos. No uses aquí una media anual que ya incluya meses sin trabajar.' },
] as const;
type Values = Record<(typeof fields)[number]['key'], string>;

function PlanEditor({ monthlyBilling }: { monthlyBilling: number }) {
  const id = useId();
  const refs = useRef<Partial<Record<keyof Values, HTMLInputElement | null>>>({});
  const [values, setValues] = useState<Values>({ activeMonths: '', hoursPerActiveMonth: '' });
  const [checked, setChecked] = useState<Values | null>(null);
  const [isExample, setIsExample] = useState(false);
  const plan = checked ? planAnnualBilling({ monthlyBilling, activeMonths: parseSpanishNumber(checked.activeMonths), hoursPerActiveMonth: parseSpanishNumber(checked.hoursPerActiveMonth) }) : null;

  function calculate(next = values) {
    const result = planAnnualBilling({ monthlyBilling, activeMonths: parseSpanishNumber(next.activeMonths), hoursPerActiveMonth: parseSpanishNumber(next.hoursPerActiveMonth) });
    const normalized = result.valid ? { activeMonths: String(result.activeMonths), hoursPerActiveMonth: formatNumber(result.hoursPerActiveMonth) } : next;
    setValues(normalized);
    setChecked(normalized);
    if (!result.valid) {
      const invalid = fields.find(({ key }) => result.errors[key]);
      if (invalid) refs.current[invalid.key]?.focus();
    }
  }

  return (
    <div className={styles.planner}>
      <p className={styles.reference} id={`${id}-reference`}>Referencia: <strong>{formatCurrency(monthlyBilling)} al mes sin IVA durante doce meses</strong>. Conservamos el mismo objetivo neto y los mismos costes todos los meses, incluidos los que no factures.</p>
      <p>Repartimos esa necesidad anual entre meses activos iguales. Introduce su capacidad real: las horas del campo principal no se vuelven a reducir automáticamente.</p>
      <noscript><p>La ayuda necesita JavaScript. Consulta el <a href="/cuanto-facturar-autonomo-1500-euros#meses-sin-facturar">ejemplo de meses sin facturación</a>.</p></noscript>
      <fieldset className={styles.fields} aria-describedby={`${id}-reference`} onKeyDown={(event) => {
        if (event.key === 'Enter' && event.target instanceof HTMLInputElement) { event.preventDefault(); calculate(); }
      }}>
        <legend>Tu calendario de facturación</legend>
        {fields.map(({ key, label, hint }) => {
          const error = plan && !plan.valid ? plan.errors[key] : undefined;
          return (
            <label key={key}>
              <span id={`${id}-${key}-label`}>{label}</span>
              <input ref={(node) => { refs.current[key] = node; }} type="text" inputMode={key === 'activeMonths' ? 'numeric' : 'decimal'} value={values[key]}
                onChange={(event) => { setValues({ ...values, [key]: event.target.value }); setChecked(null); setIsExample(false); }}
                aria-labelledby={`${id}-${key}-label`} aria-describedby={`${id}-${key}-hint${error ? ` ${id}-${key}-error` : ''}`} aria-invalid={Boolean(error)} />
              <small id={`${id}-${key}-hint`}>{hint}</small>
              {error ? <small className="field-error" id={`${id}-${key}-error`}>{error}</small> : null}
            </label>
          );
        })}
      </fieldset>
      <div className={styles.actions}>
        <button type="button" className="primary-button" onClick={() => calculate()}>Comprobar plan anual</button>
        <button type="button" className="link-button" onClick={() => { setIsExample(true); calculate({ activeMonths: '10', hoursPerActiveMonth: '70' }); }}>Probar 10 meses de 70 horas</button>
      </div>
      <div role="status" aria-label="Plan anual de facturación" aria-live="polite" aria-atomic="true">
        {plan && !plan.valid ? <p>{plan.errors.monthlyBilling ?? 'Revisa los campos indicados antes de comprobar el plan.'}</p> : null}
        {plan?.valid ? (
          <div className={styles.result}>
            {isExample ? <p><strong>Calendario ficticio; se usa la referencia mensual indicada arriba.</strong></p> : null}
            <dl>
              <div><dt>Objetivo anual de facturación sin IVA</dt><dd>{formatCurrency(plan.annualTarget)}</dd></div>
              <div><dt>Facturación por cada mes activo</dt><dd>{formatCurrency(plan.billingPerActiveMonth)}</dd></div>
              <div><dt>Meses sin facturación previstos</dt><dd>{formatNumber(plan.inactiveMonths)}</dd></div>
              <div><dt>Horas facturables de todo el año</dt><dd>{formatNumber(plan.annualHours)} h</dd></div>
              <div><dt>Referencia por hora, redondeada al alza</dt><dd>{formatCurrency(plan.hourlyRate)}/h</dd></div>
            </dl>
            <p>{formatNumber(plan.activeMonths)} × {formatCurrency(plan.billingPerActiveMonth)} = {formatCurrency(plan.plannedAnnualBilling)} sin IVA al año. Son {formatCurrency(plan.extraPerActiveMonth)} más por mes activo que la referencia mensual de partida; no es beneficio adicional.</p>
            <p>{formatNumber(plan.activeMonths)} × {formatNumber(plan.hoursPerActiveMonth)} h = {formatNumber(plan.annualHours)} h/año, equivalentes a {formatNumber(plan.monthlyAverageHours)} h/mes repartidas entre doce. No vuelvas a descontar los meses sin actividad de esa media.</p>
            <p>Redondeamos al alza a céntimos el importe por mes activo y la referencia por hora. El reparto mensual suma {formatCurrency(plan.roundingExcess)} por encima del objetivo anual por ese redondeo.</p>
          </div>
        ) : null}
      </div>
      <p className={styles.note}>Es un reparto de facturación, no un calendario de cobros ni una reserva de caja. No añade IVA ni aplica retenciones ni recalcula impuestos o cambios de cuota durante el año. Si tus costes o tu situación cambian entre meses, revisa los periodos por separado. No cambia el resultado principal ni su enlace compartido.</p>
    </div>
  );
}

export default function AnnualBillingPlanner({ monthlyBilling }: { monthlyBilling: number }) {
  return <PlanEditor key={monthlyBilling} monthlyBilling={monthlyBilling} />;
}
