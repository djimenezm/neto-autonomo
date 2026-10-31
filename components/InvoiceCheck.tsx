'use client';

import { useId, useRef, useState } from 'react';
import NumericTextInput from '@/components/NumericTextInput';
import { checkInvoice, invoiceCheckExample, type InvoiceCheckInput } from '@/lib/invoiceCheck';
import { formatCurrency, formatNumber } from '@/lib/format';
import { parseSpanishNumber } from '@/lib/spanishNumber';
import styles from './InvoiceCheck.module.css';

const fields = [
  { key: 'baseAmount', label: 'Base de la factura sin IVA (EUR)', hint: 'Importe antes de añadir IVA y restar retención. Usa una sola base de al menos 0,01 EUR.' },
  { key: 'vatRate', label: 'IVA que quieres comprobar (%)', hint: 'Indica el porcentaje que hayas comprobado para tu caso, o 0 si no hay IVA. La herramienta no elige un tipo por ti.' },
  { key: 'withholdingRate', label: 'Retención que quieres comprobar (%)', hint: 'Indica el porcentaje que hayas comprobado para tu caso, o 0 si no hay retención. No se copia de la reserva estimada de IRPF.' },
] as const;
type Values = Record<keyof InvoiceCheckInput, string>;

function parseValues(values: Values): InvoiceCheckInput {
  return { baseAmount: parseSpanishNumber(values.baseAmount), vatRate: parseSpanishNumber(values.vatRate), withholdingRate: parseSpanishNumber(values.withholdingRate) };
}

export default function InvoiceCheck() {
  const id = useId();
  const refs = useRef<Partial<Record<keyof Values, HTMLInputElement | null>>>({});
  const [values, setValues] = useState<Values>({ baseAmount: '', vatRate: '', withholdingRate: '' });
  const [result, setResult] = useState<ReturnType<typeof checkInvoice> | null>(null);
  const [isExample, setIsExample] = useState(false);

  function calculate(next = values) {
    const checked = checkInvoice(parseValues(next));
    setResult(checked);
    if (checked.valid) setValues({ baseAmount: formatNumber(checked.baseAmount), vatRate: formatNumber(checked.vatRate), withholdingRate: formatNumber(checked.withholdingRate) });
    else {
      const invalid = fields.find(({ key }) => checked.errors[key]);
      if (invalid) refs.current[invalid.key]?.focus();
    }
  }

  return (
    <div className={styles.check}>
      <p id={`${id}-method`}>Comprobamos una sola base, compartida por IVA y retención, con los porcentajes que indiques. Esta ayuda no determina si corresponden a tu actividad ni cambia tu resultado mensual.</p>
      <noscript><p>La comprobación interactiva necesita JavaScript. La tabla de esta sección muestra la cuenta del ejemplo paso a paso.</p></noscript>
      <fieldset className={styles.fields} aria-describedby={`${id}-method`} onKeyDown={(event) => {
        if (event.key === 'Enter' && event.target instanceof HTMLInputElement) { event.preventDefault(); calculate(); }
      }}>
        <legend>Tu base y los porcentajes de esta factura</legend>
        {fields.map(({ key, label, hint }) => {
          const error = result && !result.valid ? result.errors[key] : undefined;
          const fieldId = `${id}-${key}`;
          return (
            <label key={key} htmlFor={fieldId}>
              <span id={`${fieldId}-label`}>{label}</span>
              <NumericTextInput id={fieldId} ref={(node) => { refs.current[key] = node; }} inputMode="decimal" value={values[key]}
                onValueChange={(nextValue) => { setValues((previous) => ({ ...previous, [key]: nextValue })); setResult(null); setIsExample(false); }}
                aria-labelledby={`${fieldId}-label`} aria-describedby={`${fieldId}-hint${error ? ` ${fieldId}-error` : ''}`} aria-invalid={Boolean(error)} />
              <small id={`${fieldId}-hint`}>{hint}</small>
              {error ? <small className="field-error" id={`${fieldId}-error`}>{error}</small> : null}
            </label>
          );
        })}
      </fieldset>
      <div className={styles.actions}>
        <button type="button" className="primary-button" onClick={() => calculate()}>Comprobar esta factura</button>
        <button type="button" className="link-button" onClick={() => {
          setIsExample(true);
          calculate({ baseAmount: formatNumber(invoiceCheckExample.baseAmount), vatRate: formatNumber(invoiceCheckExample.vatRate), withholdingRate: formatNumber(invoiceCheckExample.withholdingRate) });
        }}>Probar la factura ficticia de 1000 €</button>
      </div>
      <div role="status" aria-label="Comprobación de una factura" aria-live="polite" aria-atomic="true">
        {result && !result.valid ? <p>Revisa los campos indicados para comprobar la factura.</p> : null}
        {result?.valid ? (
          <div className={styles.result}>
            {isExample ? <p><strong>Base y porcentajes ficticios; no son tipos recomendados para tu actividad.</strong></p> : null}
            <dl>
              <div><dt>Base sin IVA</dt><dd>{formatCurrency(result.baseAmount)}</dd></div>
              <div><dt>IVA del {formatNumber(result.vatRate)} % sobre la base</dt><dd>+ {formatCurrency(result.vatAmount)}</dd></div>
              <div><dt>Base más IVA antes de retención</dt><dd>{formatCurrency(result.beforeWithholdingAmount)}</dd></div>
              <div><dt>Retención del {formatNumber(result.withholdingRate)} % sobre la base sin IVA</dt><dd>− {formatCurrency(result.withholdingAmount)}</dd></div>
              <div className={styles.receivable}><dt>Importe a cobrar con estos datos</dt><dd>= {formatCurrency(result.receivableAmount)}</dd></div>
            </dl>
            <p>{formatCurrency(result.baseAmount)} + {formatCurrency(result.vatAmount)} − {formatCurrency(result.withholdingAmount)} = {formatCurrency(result.receivableAmount)}. IVA y retención se calculan sobre la base sin IVA; la retención no es una rebaja del servicio.</p>
            <p>Redondeamos la base y los porcentajes a dos decimales antes de calcular. IVA y retención se redondean por separado a céntimos.</p>
            <p>El importe a cobrar no es tu neto disponible: todavía debe sostener costes y obligaciones. Esta cuenta no acredita que se haya emitido o cobrado una factura.</p>
          </div>
        ) : null}
      </div>
      <p className={styles.note}>Esta ayuda no contempla varias bases o tipos, pagos parciales ni suplidos. No calcula el impuesto definitivo ni el IVA a ingresar, no emite facturas y no modifica el resultado principal ni su resumen. No resta otra vez la reserva de IRPF. Los campos solo se usan en esta página, sin guardarlos ni enviarlos.</p>
    </div>
  );
}
