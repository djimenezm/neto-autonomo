'use client';

import { useId, useRef, useState } from 'react';
import NumericTextInput from '@/components/NumericTextInput';
import { AUTONOMOUS_COMMUNITY_LABELS, type CalculatorInput } from '@/lib/calculator';
import { compareMonthlyScenarios, getScenarioPath, type MonthlyAlternative } from '@/lib/monthlyScenarios';
import { formatCurrency, formatNumber, formatPreciseNumber } from '@/lib/format';
import { parseSpanishNumber } from '@/lib/spanishNumber';
import styles from './MonthlyScenarioComparator.module.css';

const fields = [
  { key: 'monthlyExpenses', label: 'Gastos deducibles del escenario alternativo (EUR/mes)', hint: 'El total mensual alternativo, no solo el incremento. No añadas aquí la cuota de autónomos ni costes no deducibles.' },
  { key: 'billableHours', label: 'Horas facturables del escenario alternativo (mes)', hint: 'Horas enteras que prevés vender, después de descontar gestión y descansos.' },
] as const;
type Values = Record<keyof MonthlyAlternative, string>;

function checkAlternative(reference: CalculatorInput, values: Values) {
  return compareMonthlyScenarios(reference, {
    monthlyExpenses: parseSpanishNumber(values.monthlyExpenses), billableHours: parseSpanishNumber(values.billableHours),
  });
}

function describeDifference(amount: number, unit: string) {
  return amount === 0 ? `sin cambios (${formatCurrency(0)}${unit})` : `${amount > 0 ? 'sube' : 'baja'} ${formatCurrency(Math.abs(amount))}${unit}`;
}

function ComparisonEditor({ reference }: { reference: CalculatorInput }) {
  const id = useId();
  const [values, setValues] = useState<Values>({ monthlyExpenses: '', billableHours: '' });
  const [checked, setChecked] = useState<Values | null>(null);
  const [hasAttemptedComparison, setHasAttemptedComparison] = useState(false);
  const [alternativeBeforeLoad, setAlternativeBeforeLoad] = useState<Values | null>(null);
  const [usesStartingValues, setUsesStartingValues] = useState(false);
  const [recoveryFeedback, setRecoveryFeedback] = useState('');
  const refs = useRef<Partial<Record<keyof Values, HTMLInputElement | null>>>({});
  const comparison = checked ? checkAlternative(reference, checked) : null;
  const validation = hasAttemptedComparison ? checkAlternative(reference, values) : null;

  function compare(next = values) {
    setRecoveryFeedback('');
    const result = checkAlternative(reference, next);
    setHasAttemptedComparison(true);
    if (result.valid) {
      const normalized = { monthlyExpenses: formatPreciseNumber(result.alternativeInput.monthlyExpenses), billableHours: String(result.alternativeInput.billableHours) };
      setValues(normalized);
      setChecked(normalized);
    } else {
      setChecked(next);
      const invalid = fields.find(({ key }) => result.errors[key]);
      if (invalid) refs.current[invalid.key]?.focus();
    }
  }

  function loadStartingValues() {
    // Keep the first personal alternative, including unfinished inputs. Loading
    // and comparing the untouched starting values must not create a new copy.
    if (!usesStartingValues && Object.values(values).some((value) => value.trim() !== '')) {
      setAlternativeBeforeLoad((previous) => previous ?? { ...values });
    }
    setValues({ monthlyExpenses: formatPreciseNumber(reference.monthlyExpenses), billableHours: String(reference.billableHours) });
    setChecked(null);
    setHasAttemptedComparison(false);
    setUsesStartingValues(true);
    setRecoveryFeedback('');
  }

  function recoverAlternative() {
    if (!alternativeBeforeLoad) return;
    setValues(alternativeBeforeLoad);
    setChecked(null);
    setHasAttemptedComparison(false);
    setAlternativeBeforeLoad(null);
    setUsesStartingValues(false);
    setRecoveryFeedback('Alternativa anterior recuperada. Vuelve a comparar los escenarios para actualizar los resultados.');
    refs.current.monthlyExpenses?.focus();
  }

  return (
    <div className={styles.comparator}>
      <p className={styles.reference} id={`${id}-reference`}>
        Conservamos tu objetivo de <strong>{formatCurrency(reference.targetNet)} netos al mes</strong>.
        {' '}Partida: {formatCurrency(reference.monthlyExpenses)} de gastos deducibles y {formatNumber(reference.billableHours)} h facturables.
      </p>
      <p>Se mantienen los costes no deducibles ({formatCurrency(reference.monthlyNonDeductibleExpenses ?? 0)}/mes), el IVA {reference.hasIVA ? 'activado' : 'desactivado'}, la comunidad de {AUTONOMOUS_COMMUNITY_LABELS[reference.autonomousCommunity ?? 'common']} y estos criterios:</p>
      <ul>
        <li>IRPF: {reference.irpfMode === 'manual' ? `reserva manual del ${formatPreciseNumber(reference.irpfRate)} %` : 'estimación progresiva del mismo motor'}.</li>
        <li>Cuota: {reference.selfEmployedFeeMode === 'manual' ? `manual de ${formatCurrency(reference.selfEmployedFee)}/mes` : reference.selfEmployedFeeMode === 'reduced' ? `reducida, ${reference.reducedFeePeriod === 'extended' ? 'prórroga' : 'periodo inicial'}` : 'automática por rendimientos'}.</li>
      </ul>
      <noscript><p>La comparación interactiva necesita JavaScript. Puedes consultar el <a href="/tabla-cuanto-facturar-autonomo#comparar-escenarios">ejemplo de gastos y horas</a>.</p></noscript>
      <fieldset className={styles.fields} aria-describedby={`${id}-reference`} onKeyDown={(event) => {
        if (event.key === 'Enter' && event.target instanceof HTMLInputElement) { event.preventDefault(); compare(); }
      }}>
        <legend>Los dos datos que quieres comparar</legend>
        {fields.map(({ key, label, hint }) => {
          const error = validation && !validation.valid ? validation.errors[key] : undefined;
          return (
            <label key={key}>
              <span id={`${id}-${key}-label`}>{label}</span>
              <NumericTextInput inputMode={key === 'billableHours' ? 'numeric' : 'decimal'} value={values[key]}
                ref={(node) => { refs.current[key] = node; }}
                onValueChange={(nextValue) => { setValues({ ...values, [key]: nextValue }); setChecked(null); setUsesStartingValues(false); setRecoveryFeedback(''); }}
                aria-labelledby={`${id}-${key}-label`} aria-describedby={`${id}-${key}-hint${error ? ` ${id}-${key}-error` : ''}`} aria-invalid={Boolean(error)} />
              <small id={`${id}-${key}-hint`}>{hint}</small>
              {error ? <small className="field-error" id={`${id}-${key}-error`}>{error}</small> : null}
            </label>
          );
        })}
      </fieldset>
      <div className={styles.actions}>
        <button type="button" className="primary-button" onClick={() => compare()}>Comparar escenarios</button>
        <button type="button" className="link-button" onClick={loadStartingValues}>Cargar los datos de partida</button>
        {alternativeBeforeLoad ? <button type="button" className="link-button" onClick={recoverAlternative} aria-describedby={`${id}-recovery-hint`}>Recuperar mi alternativa anterior</button> : null}
      </div>
      {alternativeBeforeLoad ? <p className={styles.note} id={`${id}-recovery-hint`}>Conservamos en esta página los gastos y las horas anteriores a la primera carga de datos de partida. Recuperarlos sustituye los cambios que ves ahora y deja la comparación y su enlace pendientes de comprobar. La copia se pierde al salir, recargar o cambiar el cálculo de referencia.</p> : null}
      <div role="status" aria-label="Comparación de escenarios" aria-live="polite" aria-atomic="true">
        {recoveryFeedback ? <p>{recoveryFeedback}</p> : null}
        {validation && !validation.valid ? <p>Revisa los campos indicados antes de comparar.</p> : null}
        {!comparison && validation?.valid ? <p>Datos modificados. Pulsa «Comparar escenarios» para actualizar la comparación y su enlace.</p> : null}
        {comparison?.valid ? (
          <div className={styles.result}>
            <div className={styles.cards}>
              {[{ label: 'Partida', result: comparison.current, hours: reference.billableHours }, { label: 'Alternativa', result: comparison.proposed, hours: comparison.alternativeInput.billableHours }].map(({ label, result, hours }) => (
                <div key={label} className={styles.card}>
                  <strong>{label}</strong>
                  <dl>
                    <div><dt>Gastos deducibles/mes</dt><dd>{formatCurrency(result.monthlyExpenses)}</dd></div>
                    <div><dt>Horas facturables/mes</dt><dd>{formatNumber(hours)} h</dd></div>
                    <div><dt>Facturación sin IVA/mes</dt><dd>{formatCurrency(result.billingWithoutVAT)}</dd></div>
                    <div><dt>Tarifa por hora sin IVA</dt><dd>{formatCurrency(result.hourlyRate)}/h</dd></div>
                  </dl>
                </div>
              ))}
            </div>
            <p><strong>Facturación: {describeDifference(comparison.billingDifference, '/mes')}. Tarifa: {describeDifference(comparison.hourlyDifference, '/h')}.</strong> El neto objetivo sigue siendo {formatCurrency(reference.targetNet)}/mes.</p>
            {comparison.alternativeInput.monthlyExpenses === reference.monthlyExpenses ? <p>Cambiar solo las horas no cambia la facturación mensual necesaria; reparte el mismo importe entre más o menos horas.</p> : null}
            <a className="link-button" href={getScenarioPath(comparison.alternativeInput)}>Abrir la alternativa en la calculadora</a>
          </div>
        ) : null}
      </div>
      <p className={styles.note}>Esta comparación no cambia tu resultado ni su resumen compartido. El enlace abre un cálculo nuevo con la alternativa. Los dos escenarios usan la misma estimación fiscal simplificada; no comprueban ventas, cobros ni que un gasto sea deducible.</p>
    </div>
  );
}

export default function MonthlyScenarioComparator({ reference }: { reference: CalculatorInput }) {
  // A new main calculation starts a fresh comparison, including its inputs and links.
  return <ComparisonEditor key={JSON.stringify(reference)} reference={reference} />;
}
