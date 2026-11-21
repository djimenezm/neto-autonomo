import { useId, useRef, useState } from 'react';
import { formatCurrency, formatNumber } from '@/lib/format';
import { simulatePortfolioCancellation, type CheckedMonthlyPortfolio } from '@/lib/projectPortfolio';
import styles from './MonthlyPortfolioPlanner.module.css';

const formatHours = (value: number) => `${formatNumber(value)} h`;

const metrics = [
  { label: 'Facturación prevista sin IVA', value: (plan: CheckedMonthlyPortfolio) => formatCurrency(plan.plannedBilling) },
  { label: 'Horas necesarias', value: (plan: CheckedMonthlyPortfolio) => formatHours(plan.plannedHours) },
  { label: 'Facturación pendiente para el objetivo', value: (plan: CheckedMonthlyPortfolio) => formatCurrency(Math.max(0, -plan.billingDifference)) },
  { label: 'Horas libres', value: (plan: CheckedMonthlyPortfolio) => formatHours(Math.max(0, plan.remainingHours)) },
  {
    label: 'Media necesaria por hora libre sin IVA',
    value: (plan: CheckedMonthlyPortfolio) => plan.remainingHourlyRate === null ? '—' : `${formatCurrency(plan.remainingHourlyRate)}/h`,
  },
];

export default function PortfolioCancellationComparison({ plan }: { plan: CheckedMonthlyPortfolio }) {
  const id = useId();
  const selectRef = useRef<HTMLSelectElement>(null);
  const [group, setGroup] = useState(plan.groups.length === 1 ? '0' : '');
  const [comparison, setComparison] = useState<ReturnType<typeof simulatePortfolioCancellation> | null>(null);
  const groupIndex = group === '' ? -1 : Number(group);
  const alternative = comparison?.valid ? comparison.alternative : null;
  const cancelled = alternative ? plan.groups[groupIndex] : null;
  const error = comparison && !comparison.valid ? comparison.error : null;

  function compare() {
    const result = simulatePortfolioCancellation(plan, groupIndex);
    setComparison(result);
    if (!result.valid) selectRef.current?.focus();
  }

  return (
    <details className={styles.cancellation}>
      <summary>Simular la cancelación de un servicio</summary>
      <p id={`${id}-hint`}>Prueba qué pasa si un servicio se queda fuera de este mes. La simulación descuenta el precio y las horas de uno del grupo que elijas.</p>
      <div className={styles.cancellationControl}>
        <label htmlFor={`${id}-group`}>Grupo del servicio cancelado</label>
        <select id={`${id}-group`} ref={selectRef} value={group}
          aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`} aria-invalid={Boolean(error)}
          onChange={(event) => { setGroup(event.target.value); setComparison(null); }}>
          <option value="">Elige un grupo</option>
          {plan.groups.map((item, index) => (
            <option key={index} value={index}>Grupo {index + 1} · {formatCurrency(item.pricePerProject)} · {formatHours(item.hoursPerProject)}</option>
          ))}
        </select>
        {error ? <small id={`${id}-error`} className="field-error" role="alert">{error}</small> : null}
      </div>
      <button type="button" className="secondary-button" onClick={compare}>Comparar con la cancelación</button>
      <div role="status" aria-label="Comparación por cancelación del servicio" aria-live="polite" aria-atomic="true">
        {alternative && cancelled ? (
          <>
            <div className={styles.comparisonTable} role="region" aria-label="Facturación y horas de ambos planes" tabIndex={0}>
              <table>
                <caption>Si se cancela un servicio del grupo {groupIndex + 1}, salen {formatCurrency(cancelled.pricePerProject)} y {formatHours(cancelled.hoursPerProject)} del plan.</caption>
                <thead><tr><th scope="col">Qué cambia</th><th scope="col">Plan actual</th><th scope="col">Con la cancelación</th></tr></thead>
                <tbody>{metrics.map(({ label, value }) => (
                  <tr key={label}><th scope="row">{label}</th><td>{value(plan)}</td><td>{value(alternative)}</td></tr>
                ))}</tbody>
              </table>
            </div>
            {alternative.coversBilling ? <p>La facturación prevista alcanza el objetivo con los servicios restantes.</p> : null}
            {alternative.remainingHours < 0 ? <p className={styles.shortfall}>Aún faltan {formatHours(-alternative.remainingHours)} de capacidad para los servicios restantes.</p> : null}
            {!alternative.coversBilling && alternative.remainingHourlyRate === null ? (
              <p>{alternative.remainingHours <= 0
                ? 'Queda facturación pendiente y se han ocupado todas las horas disponibles.'
                : 'El importe por hora necesario es demasiado grande para mostrarlo con precisión.'}</p>
            ) : null}
            {alternative.remainingHourlyRate !== null ? <p>La media por hora se redondea al céntimo superior. Si facturas menos horas, la media necesaria sube.</p> : null}
          </>
        ) : null}
      </div>
    </details>
  );
}
