import { useId, useRef, useState } from 'react';
import { compareCashReceiptDate, formatCashDate, type CheckedCashDates } from '@/lib/cashDates';
import { formatCurrency } from '@/lib/format';
import styles from './CashDatePlanner.module.css';

function formatPoint(point: string | null) {
  if (point === null) return 'Ninguno';
  return point === 'initial' ? 'Saldo inicial' : formatCashDate(point);
}

export default function CashReceiptComparison({ plan }: { plan: CheckedCashDates }) {
  const id = useId();
  const receipts = plan.movements.flatMap((movement, index) => movement.kind === 'receipt' && movement.amount > 0
    ? [{ ...movement, index }]
    : []);
  const [receiptIndex, setReceiptIndex] = useState(receipts.length === 1 ? String(receipts[0].index) : '');
  const [date, setDate] = useState('');
  const [result, setResult] = useState<ReturnType<typeof compareCashReceiptDate> | null>(null);
  const receiptControl = useRef<HTMLSelectElement>(null);
  const dateControl = useRef<HTMLInputElement>(null);

  if (receipts.length === 0) return null;
  const error = result && !result.valid ? result : null;
  const alternative = result?.valid ? result.alternative : null;

  function compare() {
    const checked = compareCashReceiptDate(plan, receiptIndex === '' ? -1 : Number(receiptIndex), date);
    setResult(checked);
    if (!checked.valid) {
      if (checked.field === 'receipt') receiptControl.current?.focus();
      if (checked.field === 'date') dateControl.current?.focus();
    }
  }

  const rows = alternative ? [
    { label: 'Saldo mínimo previsto', current: formatCurrency(plan.minimumBalance), alternative: formatCurrency(alternative.minimumBalance) },
    { label: 'Aporte inicial para evitar saldo negativo', current: formatCurrency(plan.additionalInitialBalance), alternative: formatCurrency(alternative.additionalInitialBalance) },
    { label: 'Primer saldo negativo', current: formatPoint(plan.firstNegativePoint), alternative: formatPoint(alternative.firstNegativePoint) },
  ] : [];
  if (alternative && plan.minimumBalanceTarget && plan.additionalInitialBalanceForTarget !== null && alternative.additionalInitialBalanceForTarget !== null) {
    rows.push(
      { label: 'Aporte inicial para mantener el mínimo', current: formatCurrency(plan.additionalInitialBalanceForTarget), alternative: formatCurrency(alternative.additionalInitialBalanceForTarget) },
      { label: 'Primera vez por debajo del mínimo', current: formatPoint(plan.firstBelowTarget), alternative: formatPoint(alternative.firstBelowTarget) },
    );
  }

  return (
    <details className={styles.comparison}>
      <summary>Comparar otra fecha de cobro</summary>
      <p id={`${id}-hint`}>Prueba qué pasa si un cobro llega antes o después. La comparación usa el saldo inicial del plan y conserva sus fechas al guardar.</p>
      <div className={`${styles.fields} ${styles.comparisonFields}`}>
        <label htmlFor={`${id}-receipt`}>
          <span id={`${id}-receipt-label`}>Cobro que quieres mover</span>
          <select ref={receiptControl} id={`${id}-receipt`} value={receiptIndex}
            aria-labelledby={`${id}-receipt-label`}
            aria-describedby={error?.field === 'receipt' ? `${id}-receipt-error` : undefined} aria-invalid={error?.field === 'receipt'}
            onChange={(event) => { setReceiptIndex(event.target.value); setResult(null); }}>
            <option value="">Elige un cobro</option>
            {receipts.map((receipt) => (
              <option key={receipt.index} value={receipt.index}>Movimiento {receipt.index + 1} · {formatCashDate(receipt.date)} · {formatCurrency(receipt.amount)}</option>
            ))}
          </select>
          {error?.field === 'receipt' ? <small id={`${id}-receipt-error`} className="field-error" role="alert">{error.error}</small> : null}
        </label>
        <label htmlFor={`${id}-date`}>
          <span id={`${id}-date-label`}>Fecha alternativa del cobro</span>
          <input ref={dateControl} id={`${id}-date`} type="date" value={date}
            aria-labelledby={`${id}-date-label`}
            aria-describedby={error?.field === 'date' ? `${id}-hint ${id}-date-error` : `${id}-hint`} aria-invalid={error?.field === 'date'}
            onChange={(event) => { setDate(event.target.value); setResult(null); }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') { event.preventDefault(); event.stopPropagation(); compare(); }
            }} />
          {error?.field === 'date' ? <small id={`${id}-date-error`} className="field-error" role="alert">{error.error}</small> : null}
        </label>
      </div>
      <button type="button" className="secondary-button" onClick={compare}>Comparar fechas</button>
      <div role="status" aria-label="Comparación de fechas de cobro" aria-live="polite" aria-atomic="true">
        {error?.field === 'plan' ? <p className="field-error">{error.error}</p> : null}
        {alternative ? (
          <>
            <div className={styles.tableScroll} role="region" aria-label="Saldos de la comparación" tabIndex={0}>
              <table>
                <caption>Comparación del cobro del {formatCashDate(plan.movements[Number(receiptIndex)].date)} con el {formatCashDate(date)}. En cada fecha, los pagos se descuentan primero.</caption>
                <thead><tr><th scope="col">Qué cambia</th><th scope="col">Plan actual</th><th scope="col">Fecha alternativa</th></tr></thead>
                <tbody>{rows.map((row) => (
                  <tr key={row.label}><th scope="row">{row.label}</th><td>{row.current}</td><td>{row.alternative}</td></tr>
                ))}</tbody>
              </table>
            </div>
            <p>Saldo final en ambos supuestos: <strong>{formatCurrency(plan.finalBalance)}</strong>.</p>
          </>
        ) : null}
      </div>
    </details>
  );
}
