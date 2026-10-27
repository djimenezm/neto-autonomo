'use client';

import { useId, useRef, useState } from 'react';
import { cashDatesExample, checkCashDates, formatCashDate, MAX_CASH_MOVEMENTS, type CashMovementInput } from '@/lib/cashDates';
import { formatCurrency, formatNumber } from '@/lib/format';
import { parseSpanishNumber } from '@/lib/spanishNumber';
import styles from './CashDatePlanner.module.css';

type Row = { id: number; date: string; kind: CashMovementInput['kind']; amount: string };
type Values = { initialBalance: string; rows: Row[] };
const fields = [
  { key: 'date', label: 'Fecha' },
  { key: 'kind', label: 'Tipo' },
  { key: 'amount', label: 'Importe (EUR)' },
] as const;
const blankRow = (id: number): Row => ({ id, date: '', kind: '', amount: '' });

export default function CashDatePlanner() {
  const id = useId();
  const nextId = useRef(3);
  const controls = useRef<Record<string, HTMLInputElement | HTMLSelectElement | null>>({});
  const focusKey = useRef<string | null>(null);
  const [values, setValues] = useState<Values>({ initialBalance: '', rows: [blankRow(0), blankRow(1), blankRow(2)] });
  const [estimate, setEstimate] = useState<ReturnType<typeof checkCashDates> | null>(null);
  const [isExample, setIsExample] = useState(false);

  function setControl(key: string, node: HTMLInputElement | HTMLSelectElement | null) {
    controls.current[key] = node;
    if (node && focusKey.current === key) { node.focus(); focusKey.current = null; }
  }

  function clearResult() { setEstimate(null); setIsExample(false); }

  function calculate(next = values) {
    const result = checkCashDates({
      initialBalance: parseSpanishNumber(next.initialBalance),
      movements: next.rows.map((row) => ({ date: row.date, kind: row.kind, amount: parseSpanishNumber(row.amount) })),
    });
    setEstimate(result);
    if (result.valid) {
      setValues({ initialBalance: formatNumber(result.initialBalance), rows: next.rows.map((row, index) => ({ ...row, amount: formatNumber(result.movements[index].amount) })) });
    } else if (result.errors.initialBalance) {
      controls.current.initialBalance?.focus();
    } else {
      for (const [index, row] of next.rows.entries()) {
        const invalid = fields.find(({ key }) => result.errors.rows[index]?.[key]);
        if (invalid) { controls.current[`${row.id}-${invalid.key}`]?.focus(); break; }
      }
    }
  }

  return (
    <div className={styles.planner} onKeyDown={(event) => {
      if (event.key === 'Enter' && event.target instanceof HTMLInputElement) { event.preventDefault(); calculate(); }
    }}>
      <p id={`${id}-method`}>Usa movimientos previstos de la cuenta, no bases de factura. Se agrupan por fecha y se ordenan de la más antigua a la más reciente. En una misma fecha suponemos todos los pagos antes de cualquier cobro, aunque escribas las filas en otro orden.</p>
      <p>Incluye cada salida una sola vez, también impuestos y retiradas personales si saldrán de esta cuenta. Introduce los cobros con IVA y retenciones ya reflejados cuando proceda. No restes una reserva que siga en la cuenta hasta que se pague.</p>
      <noscript><p>El comprobador necesita JavaScript. La tabla y el método del ejemplo anterior permiten hacer la misma cuenta a mano.</p></noscript>
      <label className={styles.initial}>
        <span id={`${id}-initial-label`}>Saldo antes del primer movimiento (EUR)</span>
        <input ref={(node) => setControl('initialBalance', node)} type="text" inputMode="decimal" value={values.initialBalance}
          onChange={(event) => { setValues({ ...values, initialBalance: event.target.value }); clearResult(); }}
          aria-labelledby={`${id}-initial-label`} aria-invalid={Boolean(estimate && !estimate.valid && estimate.errors.initialBalance)}
          aria-describedby={`${id}-initial-hint${estimate && !estimate.valid && estimate.errors.initialBalance ? ` ${id}-initial-error` : ''}`} />
        <small id={`${id}-initial-hint`}>El saldo al empezar, antes de la fecha más antigua que introduzcas. Puede ser cero o negativo.</small>
        {estimate && !estimate.valid && estimate.errors.initialBalance ? <small className="field-error" id={`${id}-initial-error`}>{estimate.errors.initialBalance}</small> : null}
      </label>
      {values.rows.map((row, index) => (
        <fieldset className={styles.movement} key={row.id} aria-describedby={`${id}-method`}>
          <legend>Movimiento {index + 1}</legend>
          <div className={styles.fields}>
            {fields.map(({ key, label }) => {
              const controlId = `${id}-${row.id}-${key}`;
              const error = estimate && !estimate.valid ? estimate.errors.rows[index]?.[key] : undefined;
              const common = {
                id: controlId,
                'aria-invalid': Boolean(error),
                'aria-labelledby': `${controlId}-label`,
                'aria-describedby': error ? `${controlId}-error` : undefined,
              };
              return (
                <label key={key} htmlFor={controlId}>
                  <span id={`${controlId}-label`}>{label} del movimiento {index + 1}</span>
                  {key === 'kind' ? (
                    <select {...common} ref={(node) => setControl(`${row.id}-${key}`, node)} value={row.kind} onChange={(event) => {
                      const kind = event.target.value as Row['kind'];
                      setValues({ ...values, rows: values.rows.map((item) => item.id === row.id ? { ...item, kind } : item) }); clearResult();
                    }}>
                      <option value="">Elige cobro o pago</option><option value="receipt">Cobro</option><option value="payment">Pago</option>
                    </select>
                  ) : (
                    <input {...common} ref={(node) => setControl(`${row.id}-${key}`, node)} type={key === 'date' ? 'date' : 'text'} inputMode={key === 'amount' ? 'decimal' : undefined}
                      value={row[key]} onChange={(event) => {
                        setValues({ ...values, rows: values.rows.map((item) => item.id === row.id ? { ...item, [key]: event.target.value } : item) }); clearResult();
                      }} />
                  )}
                  {error ? <small className="field-error" id={`${controlId}-error`}>{error}</small> : null}
                </label>
              );
            })}
          </div>
          <button type="button" className="link-button" disabled={values.rows.length === 1} onClick={() => {
            const rows = values.rows.filter((item) => item.id !== row.id);
            focusKey.current = `${rows[Math.min(index, rows.length - 1)].id}-date`;
            setValues({ ...values, rows }); clearResult();
          }}>Eliminar movimiento {index + 1}</button>
        </fieldset>
      ))}
      <button type="button" className="secondary-button" disabled={values.rows.length >= MAX_CASH_MOVEMENTS} onClick={() => {
        const row = blankRow(nextId.current++);
        focusKey.current = `${row.id}-date`;
        setValues({ ...values, rows: [...values.rows, row] }); clearResult();
      }}>Añadir movimiento</button>
      <p>Incluye de 1 a {MAX_CASH_MOVEMENTS} movimientos. Todos deben tener fecha, tipo e importe; usa 0 si el importe es cero o elimina la fila que no necesites. No se añaden movimientos recurrentes automáticamente.</p>
      <div className={styles.actions}>
        <button type="button" className="primary-button" onClick={() => calculate()}>Comprobar vencimientos</button>
        <button type="button" className="link-button" onClick={() => {
          const next: Values = { initialBalance: formatNumber(cashDatesExample.initialBalance), rows: cashDatesExample.movements.map((movement) => ({ ...movement, id: nextId.current++, amount: formatNumber(movement.amount) })) };
          setIsExample(true); calculate(next);
        }}>Probar las fechas ficticias</button>
      </div>
      <div role="status" aria-label="Caja por fechas" aria-live="polite" aria-atomic="true">
        {estimate && !estimate.valid ? <p>Revisa los campos indicados. {estimate.errors.movements}</p> : null}
        {estimate?.valid ? (
          <div className={styles.result}>
            {isExample ? <p><strong>Fechas, saldo y movimientos ficticios; no son datos de una cuenta real.</strong></p> : null}
            <div className={styles.tableScroll} role="region" aria-label="Saldos por fecha con pagos antes de cobros" tabIndex={0}>
              <table>
                <caption>Una fila por fecha. Se restan todos sus pagos antes de sumar sus cobros. No se usan horas bancarias reales.</caption>
                <thead><tr><th scope="col">Fecha</th><th scope="col">Saldo al empezar</th><th scope="col">Pagos primero</th><th scope="col">Cobros después</th><th scope="col">Mínimo supuesto</th><th scope="col">Saldo al terminar</th></tr></thead>
                <tbody>{estimate.days.map((day) => <tr key={day.date}><th scope="row">{formatCashDate(day.date)}</th><td>{formatCurrency(day.openingBalance)}</td><td>{formatCurrency(day.payments)}</td><td>{formatCurrency(day.receipts)}</td><td>{formatCurrency(day.minimumBalance)}</td><td>{formatCurrency(day.closingBalance)}</td></tr>)}</tbody>
              </table>
            </div>
            <dl>
              <div><dt>Saldo tras la última fecha</dt><dd>{formatCurrency(estimate.finalBalance)}</dd></div>
              <div><dt>Saldo mínimo con este orden supuesto</dt><dd>{formatCurrency(estimate.minimumBalance)}</dd></div>
              <div><dt>Aporte inicial adicional para este supuesto</dt><dd>{formatCurrency(estimate.additionalInitialBalance)}</dd></div>
              <div><dt>Primer punto negativo</dt><dd>{estimate.firstNegativePoint === 'initial' ? 'Saldo inicial' : estimate.firstNegativePoint ? formatCashDate(estimate.firstNegativePoint) : 'Ninguno'}</dd></div>
            </dl>
            <p>{formatCurrency(estimate.initialBalance)} iniciales + {formatCurrency(estimate.totalReceipts)} de cobros − {formatCurrency(estimate.totalPayments)} de pagos = {formatCurrency(estimate.finalBalance)} tras la última fecha. No es beneficio neto ni una previsión de cobros confirmados.</p>
            <p className={estimate.minimumBalance < 0 ? styles.shortfall : undefined}>{estimate.minimumBalance < 0 ? 'Hay saldo negativo en el orden calculado.' : 'No hay saldo negativo en el orden calculado.'} El aporte mostrado solo compensa el déficit de los movimientos introducidos, suponiendo pagos antes de cobros en una misma fecha. No es una recomendación de financiación ni un fondo de emergencia.</p>
          </div>
        ) : null}
      </div>
      <p className={styles.note}>Si el cobro se retrasa, cambia su fecha y vuelve a comprobar. Verifica también los cargos omitidos, el saldo realmente disponible y las fechas de abono: agrupar por día no acredita la ejecución bancaria. Un saldo positivo puede incluir reservas para pagos posteriores. Los datos se usan solo en esta página, sin guardarlos ni enviarlos.</p>
    </div>
  );
}
