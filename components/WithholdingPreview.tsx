'use client';

import { useId, useRef, useState } from 'react';
import NumericTextInput from '@/components/NumericTextInput';
import { previewWithholding } from '@/lib/withholdingPreview';
import { formatCurrency, formatNumber } from '@/lib/format';
import { parseSpanishNumber } from '@/lib/spanishNumber';
import styles from './WithholdingPreview.module.css';

type Props = { baseAmount: number; vatAmount: number; context: 'monthly' | 'example' };

function PreviewEditor({ baseAmount, vatAmount, context }: Props) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [rate, setRate] = useState('');
  const [checked, setChecked] = useState<{ rate: string; isExample: boolean } | null>(null);
  const result = checked ? previewWithholding({ baseAmount, vatAmount, withholdingRate: parseSpanishNumber(checked.rate) }) : null;
  const fieldError = result && !result.valid && result.field === 'withholdingRate' ? result.error : undefined;

  function check(nextRate = rate, isExample = false) {
    const estimate = previewWithholding({ baseAmount, vatAmount, withholdingRate: parseSpanishNumber(nextRate) });
    const normalizedRate = estimate.valid ? formatNumber(estimate.rateUsed) : nextRate;
    setRate(normalizedRate);
    setChecked({ rate: normalizedRate, isExample });
    if (!estimate.valid && estimate.field === 'withholdingRate') input.current?.focus();
  }

  return (
    <div className={styles.preview}>
      <p id={`${id}-reference`} className={styles.reference}>
        {context === 'monthly' ? 'Referencia de tu resultado mensual' : 'Referencia del ejemplo ficticio'}:
        {' '}<strong>{formatCurrency(baseAmount)} de base sin IVA</strong> y <strong>{formatCurrency(vatAmount)} de IVA añadido</strong>.
      </p>
      <p>{context === 'monthly'
        ? 'Suponemos que toda esta base mensual lleva el mismo porcentaje de retención. No representa una factura concreta ni una mezcla de clientes con retenciones distintas.'
        : 'Comprobamos una sola base con el IVA del ejemplo. El porcentaje de retención que escribas es un supuesto; esta ayuda no decide si corresponde aplicarlo.'}</p>
      <noscript><p>La ayuda interactiva necesita JavaScript. Puedes consultar el <a href="/tarifa-freelance-por-hora#ejemplo-cobro">ejemplo de base, IVA, retención e importe a cobrar</a>.</p></noscript>
      <label className={styles.field}>
        <span id={`${id}-label`}>Retención que quieres comprobar (%)</span>
        <NumericTextInput ref={input} inputMode="decimal" value={rate}
          onValueChange={(nextValue) => { setRate(nextValue); setChecked(null); }}
          onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); check(); } }}
          aria-labelledby={`${id}-label`} aria-describedby={`${id}-hint ${id}-reference${fieldError ? ` ${id}-error` : ''}`}
          aria-invalid={Boolean(fieldError)} />
        <small id={`${id}-hint`}>Usa el porcentaje que hayas comprobado para tu caso, o 0 si no hay retención. No se copia de la reserva estimada de IRPF.</small>
        {fieldError ? <small className="field-error" id={`${id}-error`}>{fieldError}</small> : null}
      </label>
      <div className={styles.actions}>
        <button type="button" className="primary-button" onClick={() => check()}>Comprobar importe a cobrar</button>
        <button type="button" className="link-button" onClick={() => check('15', true)}>Probar una retención ficticia del 15 %</button>
      </div>
      <div role="status" aria-label="Importe a cobrar con retención" aria-live="polite" aria-atomic="true">
        {result && !result.valid ? <p>{result.error}</p> : null}
        {result?.valid ? (
          <div className={styles.result}>
            {checked?.isExample ? <p><strong>Retención ficticia del 15 %; no es una recomendación para tu actividad.</strong></p> : null}
            <dl>
              <div><dt>Base sin IVA</dt><dd>{formatCurrency(result.baseCents / 100)}</dd></div>
              <div><dt>IVA añadido en esta referencia</dt><dd>+ {formatCurrency(result.vatCents / 100)}</dd></div>
              <div><dt>Base más IVA antes de retención</dt><dd>{formatCurrency(result.beforeWithholdingCents / 100)}</dd></div>
              <div><dt>Retención del {formatNumber(result.rateUsed)} % sobre la base sin IVA</dt><dd>− {formatCurrency(result.withholdingCents / 100)}</dd></div>
              <div className={styles.receivable}><dt>Importe a cobrar con este supuesto</dt><dd>= {formatCurrency(result.receivableCents / 100)}</dd></div>
            </dl>
            <p>La base sin IVA sigue siendo {formatCurrency(result.baseCents / 100)}. La retención cambia lo que abonaría el cliente; no es un descuento comercial.</p>
          </div>
        ) : null}
      </div>
      <p className={styles.note}>El importe a cobrar no es tu neto disponible. Esta cuenta no modifica el resultado principal ni su resumen, no resta otra vez la reserva de IRPF y no calcula el impuesto definitivo ni el IVA a ingresar. Tampoco acredita que se haya emitido o cobrado una factura.</p>
    </div>
  );
}

export default function WithholdingPreview(props: Props) {
  return <PreviewEditor key={`${props.baseAmount}:${props.vatAmount}:${props.context}`} {...props} />;
}
