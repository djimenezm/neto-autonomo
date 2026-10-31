'use client';

import { useId, useRef, useState } from 'react';
import NumericTextInput from '@/components/NumericTextInput';
import { CASH_PLAN_MONTHS, cashPlanExample, planCash, type CashMonthInput } from '@/lib/cashPlan';
import { formatCurrency, formatNumber } from '@/lib/format';
import { parseSpanishNumber } from '@/lib/spanishNumber';
import styles from './CashFlowPlanner.module.css';

type Values = { initialBalance: string; months: Record<keyof CashMonthInput, string>[] };
const fields = [
  { key: 'receipts', label: 'Cobros previstos', hint: 'Dinero que esperas recibir en la cuenta ese mes, con IVA y retenciones ya reflejados cuando correspondan. Una factura sin cobrar no es una entrada.' },
  { key: 'payments', label: 'Pagos previstos', hint: 'Todo lo que saldrá de la cuenta ese mes: actividad, cuota, impuestos y retiradas personales. Cuenta cada salida una vez.' },
] as const;

export default function CashFlowPlanner() {
  const id = useId();
  const refs = useRef<Record<string, HTMLInputElement | null>>({});
  const [values, setValues] = useState<Values>({ initialBalance: '', months: Array.from({ length: CASH_PLAN_MONTHS }, () => ({ receipts: '', payments: '' })) });
  const [plan, setPlan] = useState<ReturnType<typeof planCash> | null>(null);
  const [isExample, setIsExample] = useState(false);
  const initialError = plan && !plan.valid ? plan.errors.initialBalance : undefined;

  function check(next = values) {
    const result = planCash({ initialBalance: parseSpanishNumber(next.initialBalance), months: next.months.map((month) => ({ receipts: parseSpanishNumber(month.receipts), payments: parseSpanishNumber(month.payments) })) });
    setPlan(result);
    if (result.valid) {
      setValues({ initialBalance: formatNumber(result.initialBalance), months: result.months.map((month) => ({ receipts: formatNumber(month.receipts), payments: formatNumber(month.payments) })) });
    } else {
      const invalidRow = result.errors.rows.findIndex((row) => Object.keys(row).length);
      const invalidField = fields.find(({ key }) => result.errors.rows[invalidRow]?.[key]);
      refs.current[result.errors.initialBalance ? 'initialBalance' : `${Math.max(0, invalidRow)}-${invalidField?.key ?? 'receipts'}`]?.focus();
    }
  }

  function edit(next: Values) { setValues(next); setPlan(null); setIsExample(false); }

  return (
    <div className={styles.planner}>
      <p>Tú eliges a qué tres meses consecutivos corresponden Mes 1, Mes 2 y Mes 3. Usamos movimientos de la cuenta, no bases de facturas ni medias de gastos.</p>
      <noscript><p>La ayuda necesita JavaScript. Puedes seguir la tabla del ejemplo ficticio de esta página.</p></noscript>
      <div onKeyDown={(event) => { if (event.key === 'Enter' && event.target instanceof HTMLInputElement) { event.preventDefault(); check(); } }}>
        <label className={styles.initial}>
          <span id={`${id}-initial-label`}>Saldo inicial de la cuenta (EUR)</span>
          <NumericTextInput ref={(node) => { refs.current.initialBalance = node; }} inputMode="decimal" value={values.initialBalance}
            onValueChange={(nextValue) => edit({ ...values, initialBalance: nextValue })}
            aria-labelledby={`${id}-initial-label`} aria-describedby={`${id}-initial-hint${initialError ? ` ${id}-initial-error` : ''}`} aria-invalid={Boolean(initialError)} />
          <small id={`${id}-initial-hint`}>Saldo al empezar el Mes 1, incluido el dinero reservado para pagos que vas a anotar. Puede ser cero o negativo.</small>
          {initialError ? <small className="field-error" id={`${id}-initial-error`}>{initialError}</small> : null}
        </label>
        {values.months.map((month, index) => (
          <fieldset key={index} className={styles.month}>
            <legend>Mes {index + 1}</legend>
            <div className={styles.fields}>
              {fields.map(({ key, label, hint }) => {
                const error = plan && !plan.valid ? plan.errors.rows[index]?.[key] : undefined;
                const fieldId = `${id}-${index}-${key}`;
                return (
                  <label key={key}>
                    <span id={`${fieldId}-label`}>{label} del mes {index + 1} (EUR)</span>
                    <NumericTextInput ref={(node) => { refs.current[`${index}-${key}`] = node; }} inputMode="decimal" value={month[key]}
                      onValueChange={(nextValue) => edit({ ...values, months: values.months.map((item, monthIndex) => monthIndex === index ? { ...item, [key]: nextValue } : item) })}
                      aria-labelledby={`${fieldId}-label`} aria-describedby={`${fieldId}-hint${error ? ` ${fieldId}-error` : ''}`} aria-invalid={Boolean(error)} />
                    <small id={`${fieldId}-hint`}>{hint}</small>
                    {error ? <small className="field-error" id={`${fieldId}-error`}>{error}</small> : null}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
      <div className={styles.actions}>
        <button type="button" className="primary-button" onClick={() => check()}>Comprobar plan de caja</button>
        <button type="button" className="link-button" onClick={() => {
          const next = { initialBalance: formatNumber(cashPlanExample.initialBalance), months: cashPlanExample.months.map((month) => ({ receipts: formatNumber(month.receipts), payments: formatNumber(month.payments) })) };
          setIsExample(true); setValues(next); check(next);
        }}>Probar tres meses ficticios</button>
      </div>
      <div role="status" aria-label="Plan de caja de tres meses" aria-live="polite" aria-atomic="true">
        {plan && !plan.valid ? <p>{plan.errors.months ?? 'Revisa los campos indicados; escribe cero donde no preveas movimientos.'}</p> : null}
        {plan?.valid ? (
          <div className={styles.result}>
            {isExample ? <p><strong>Saldos, cobros y pagos ficticios; no son datos de una cuenta real.</strong></p> : null}
            <div className={styles.tableScroll} role="region" aria-label="Saldos previstos del plan de caja" tabIndex={0}>
              <table>
                <caption>Saldo inicial + cobros − pagos = saldo al cierre. No ordena los movimientos dentro del mes.</caption>
                <thead><tr><th scope="col">Mes</th><th scope="col">Saldo inicial</th><th scope="col">Cobros</th><th scope="col">Pagos</th><th scope="col">Saldo al cierre</th></tr></thead>
                <tbody>{plan.months.map((month, index) => <tr key={index}><th scope="row">Mes {index + 1}</th><td>{formatCurrency(month.openingBalance)}</td><td>{formatCurrency(month.receipts)}</td><td>{formatCurrency(month.payments)}</td><td>{formatCurrency(month.closingBalance)}</td></tr>)}</tbody>
              </table>
            </div>
            <dl>
              <div><dt>Saldo al cierre del tercer mes</dt><dd>{formatCurrency(plan.finalBalance)}</dd></div>
              <div><dt>Saldo mínimo entre el inicio y los cierres</dt><dd>{formatCurrency(plan.minimumBalance)}</dd></div>
              <div><dt>Aporte adicional para evitar negativos en esos puntos</dt><dd>{formatCurrency(plan.additionalAtCheckpoints)}</dd></div>
              <div><dt>Primer saldo negativo entre inicio y cierres</dt><dd>{plan.firstNegativePoint === null ? 'Ninguno' : plan.firstNegativePoint === 0 ? 'Saldo inicial' : `Cierre del mes ${plan.firstNegativePoint}`}</dd></div>
            </dl>
            <p>{formatCurrency(plan.initialBalance)} iniciales + {formatCurrency(plan.totalReceipts)} de cobros − {formatCurrency(plan.totalPayments)} de pagos = {formatCurrency(plan.finalBalance)}. La variación del saldo es {formatCurrency(plan.balanceChange)}; no es beneficio neto.</p>
            <p className={plan.minimumBalance < 0 ? styles.shortfall : styles.note}><strong>{plan.minimumBalance < 0 ? 'Hay saldos negativos en los puntos calculados.' : 'No hay saldos negativos al inicio ni en los cierres calculados.'}</strong> El aporte mostrado solo cubre esos puntos: si un pago llega antes que un cobro dentro del mes, puede hacer falta más saldo. Revisa las fechas concretas.</p>
          </div>
        ) : null}
      </div>
      <p className={styles.note}>Un saldo positivo puede incluir dinero reservado para impuestos u obligaciones posteriores a estos tres meses; no es dinero libre para gastar. No calculamos impuestos, facturación necesaria, intereses ni comisiones. No se supone que los cobros previstos estén confirmados. Los datos solo se usan en esta página, sin guardarlos ni enviarlos.</p>
      <p><a href="#vencimientos-caja" className={styles.datesLink}>Revisar cobros y pagos por fecha</a></p>
    </div>
  );
}
