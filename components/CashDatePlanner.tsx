'use client';

import { useId, useRef, useState } from 'react';
import NumericTextInput from '@/components/NumericTextInput';
import { cashDatesExample, checkCashDates, formatCashDate, MAX_CASH_MOVEMENTS, type CashMovementInput } from '@/lib/cashDates';
import { CASH_DATES_FILENAME, decodeCashDatesFile, encodeCashDatesFile, MAX_CASH_DATES_FILE_BYTES } from '@/lib/cashDatesFile';
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

function readPlanFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Unreadable plan'));
    reader.onerror = () => reject(new Error('Unreadable plan'));
    reader.onabort = () => reject(new Error('Aborted plan read'));
    reader.readAsText(file);
  });
}

export default function CashDatePlanner() {
  const id = useId();
  const nextId = useRef(3);
  const controls = useRef<Record<string, HTMLInputElement | HTMLSelectElement | null>>({});
  const focusKey = useRef<string | null>(null);
  const fileOperation = useRef(0);
  const [values, setValues] = useState<Values>({ initialBalance: '', rows: [blankRow(0), blankRow(1), blankRow(2)] });
  const [estimate, setEstimate] = useState<ReturnType<typeof checkCashDates> | null>(null);
  const [isExample, setIsExample] = useState(false);
  const [fileFeedback, setFileFeedback] = useState<{ text: string; error: boolean; download?: boolean } | null>(null);

  function setControl(key: string, node: HTMLInputElement | HTMLSelectElement | null) {
    controls.current[key] = node;
    if (node && focusKey.current === key) { node.focus(); focusKey.current = null; }
  }

  function invalidateFileRead() { fileOperation.current++; setFileFeedback(null); }
  function clearResult() { invalidateFileRead(); setEstimate(null); setIsExample(false); }

  function calculate(next = values) {
    invalidateFileRead();
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

  async function openPlan(file: File) {
    const operation = ++fileOperation.current;
    if (file.size > MAX_CASH_DATES_FILE_BYTES) {
      setFileFeedback({ text: 'El archivo supera el máximo de 64 KB. No se ha cambiado tu plan actual.', error: true });
      return;
    }
    setFileFeedback({ text: 'Abriendo el archivo del plan…', error: false });
    try {
      const text = await readPlanFile(file);
      if (operation !== fileOperation.current) return;
      const decoded = decodeCashDatesFile(text);
      if (!decoded.valid) { setFileFeedback({ text: decoded.error, error: true }); return; }
      const next: Values = {
        initialBalance: formatNumber(decoded.input.initialBalance),
        rows: decoded.input.movements.map((row) => ({ ...row, id: nextId.current++, amount: formatNumber(row.amount) })),
      };
      setIsExample(decoded.fictional);
      calculate(next);
      setFileFeedback({ text: `Plan abierto con ${next.rows.length} ${next.rows.length === 1 ? 'movimiento' : 'movimientos'}. Los saldos se han calculado de nuevo.`, error: false });
    } catch {
      if (operation === fileOperation.current) setFileFeedback({ text: 'No se ha podido leer el archivo. No se ha cambiado tu plan actual.', error: true });
    }
  }

  function savePlan() {
    invalidateFileRead();
    if (!estimate?.valid) return;
    const encoded = encodeCashDatesFile({ initialBalance: estimate.initialBalance, movements: estimate.movements }, isExample);
    if (!encoded.valid) { setFileFeedback({ text: encoded.error, error: true, download: true }); return; }
    let url: string | undefined;
    let link: HTMLAnchorElement | undefined;
    try {
      url = URL.createObjectURL(new Blob([encoded.text], { type: 'application/json;charset=utf-8' }));
      link = document.createElement('a');
      link.href = url; link.download = CASH_DATES_FILENAME;
      document.body.appendChild(link); link.click();
      setFileFeedback({ text: 'Archivo del plan generado. Conserva la copia descargada para volver a abrirlo.', error: false, download: true });
    } catch {
      setFileFeedback({ text: 'No se ha podido generar el archivo. Tu plan sigue en esta página; puedes volver a intentarlo.', error: true, download: true });
    } finally {
      link?.remove();
      if (url) { const generatedUrl = url; const revoke = URL.revokeObjectURL.bind(URL); window.setTimeout(() => revoke(generatedUrl), 1000); }
    }
  }

  return (
    <div className={styles.planner} onKeyDown={(event) => {
      if (event.key === 'Enter' && event.target instanceof HTMLInputElement && event.target.type !== 'file') { event.preventDefault(); calculate(); }
    }}>
      <p id={`${id}-method`}>Usa movimientos previstos de la cuenta, no bases de factura. Se agrupan por fecha y se ordenan de la más antigua a la más reciente. En una misma fecha suponemos todos los pagos antes de cualquier cobro, aunque escribas las filas en otro orden.</p>
      <p>Incluye cada salida una sola vez, también impuestos y retiradas personales si saldrán de esta cuenta. Introduce los cobros con IVA y retenciones ya reflejados cuando proceda. No restes una reserva que siga en la cuenta hasta que se pague.</p>
      <noscript><p>El comprobador necesita JavaScript. La tabla y el método del ejemplo anterior permiten hacer la misma cuenta a mano.</p></noscript>
      <div className={styles.fileBox}>
        <label htmlFor={`${id}-file`}><strong>Abrir un plan guardado</strong></label>
        <input id={`${id}-file`} type="file" accept=".json,application/json" aria-describedby={`${id}-file-hint`} onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = '';
          if (file) void openPlan(file);
        }} />
        <p id={`${id}-file-hint`}>Elige un archivo .json generado con «Guardar este plan en un archivo», de hasta 64 KB. Abrirlo sustituye el saldo y los movimientos actuales si el archivo es válido. Se lee en tu navegador; no se envía al servidor.</p>
        <div role="status" aria-label="Archivo del plan" aria-live="polite" aria-atomic="true">
          {fileFeedback && !fileFeedback.download ? <p className={fileFeedback.error ? 'field-error' : undefined}>{fileFeedback.text}</p> : null}
        </div>
      </div>
      <label className={styles.initial}>
        <span id={`${id}-initial-label`}>Saldo antes del primer movimiento (EUR)</span>
        <NumericTextInput ref={(node) => setControl('initialBalance', node)} inputMode="decimal" value={values.initialBalance}
          onValueChange={(nextValue) => { setValues({ ...values, initialBalance: nextValue }); clearResult(); }}
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
                  ) : key === 'date' ? (
                    <input {...common} ref={(node) => setControl(`${row.id}-${key}`, node)} type="date"
                      value={row.date} onChange={(event) => {
                        setValues({ ...values, rows: values.rows.map((item) => item.id === row.id ? { ...item, [key]: event.target.value } : item) }); clearResult();
                      }} />
                  ) : (
                    <NumericTextInput {...common} ref={(node) => setControl(`${row.id}-${key}`, node)} inputMode="decimal"
                      value={row.amount} onValueChange={(nextValue) => {
                        setValues({ ...values, rows: values.rows.map((item) => item.id === row.id ? { ...item, [key]: nextValue } : item) }); clearResult();
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
      {estimate?.valid ? (
        <div className={styles.fileSave}>
          <button type="button" className="secondary-button" onClick={savePlan}>Guardar este plan en un archivo</button>
          <div role="status" aria-label="Descarga del plan" aria-live="polite" aria-atomic="true">
            {fileFeedback?.download ? <p className={fileFeedback.error ? 'field-error' : undefined}>{fileFeedback.text}</p> : null}
          </div>
          <p>El archivo contiene el saldo, las fechas y los importes de los movimientos que has comprobado. Guárdalo donde quieras conservar esos datos. Para incluir cambios, vuelve a comprobar el plan y guarda otra copia.</p>
        </div>
      ) : null}
      <p className={styles.note}>Si el cobro se retrasa, cambia su fecha y vuelve a comprobar. Verifica también los cargos omitidos, el saldo realmente disponible y las fechas de abono: agrupar por día no acredita la ejecución bancaria. Un saldo positivo puede incluir reservas para pagos posteriores. El plan no se guarda automáticamente al salir; puedes conservarlo descargando el archivo. No se envían sus datos al servidor.</p>
    </div>
  );
}
