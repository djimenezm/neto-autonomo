'use client';

import { useId, useRef, useState } from 'react';
import NumericTextInput from '@/components/NumericTextInput';
import { AUTONOMOUS_COMMUNITY_LABELS } from '@/lib/calculator';
import { estimateMonthlyNet, type NetPreviewReference } from '@/lib/monthlyNet';
import { formatCurrency, formatNumber } from '@/lib/format';
import { parseSpanishNumber } from '@/lib/spanishNumber';
import styles from './MonthlyNetPreview.module.css';

function NetEditor({ reference }: { reference: NetPreviewReference }) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');
  const [estimate, setEstimate] = useState<ReturnType<typeof estimateMonthlyNet> | null>(null);
  const [isExample, setIsExample] = useState(false);
  const error = estimate && !estimate.valid ? estimate.errors.monthlyBilling : undefined;

  function check(nextValue = value) {
    const result = estimateMonthlyNet(reference, parseSpanishNumber(nextValue));
    setEstimate(result);
    if (result.valid) setValue(formatNumber(result.monthlyBilling));
    else input.current?.focus();
  }

  return (
    <div className={styles.preview}>
      <p className={styles.reference} id={`${id}-reference`}>
        Conservamos {formatCurrency(reference.monthlyExpenses)} de gastos deducibles,
        {' '}{formatCurrency(reference.selfEmployedFee)} de cuota y
        {' '}{formatCurrency(reference.monthlyNonDeductibleExpenses)} de costes no deducibles al mes.
        {' '}El objetivo de comparación sigue siendo <strong>{formatCurrency(reference.targetNet)} netos al mes</strong>.
      </p>
      <p>{reference.irpfMode === 'manual'
        ? `IRPF: mantenemos tu reserva manual del ${formatNumber(reference.irpfRate)} % sobre el beneficio positivo, no sobre la facturación.`
        : `IRPF: usamos la misma estimación progresiva de la calculadora para ${AUTONOMOUS_COMMUNITY_LABELS[reference.autonomousCommunity]}; cambia la reserva al cambiar el beneficio.`}</p>
      <p>Proyectamos doce meses iguales. La cuota indicada permanece fija aunque proceda del modo automático o reducido; esta ayuda no recalcula cotizaciones ni comprueba el derecho a una reducción.</p>
      <noscript><p>La ayuda necesita JavaScript. Puedes consultar el <a href="/tarifa-freelance-por-hora#neto-segun-facturacion">ejemplo de neto según facturación</a>.</p></noscript>
      <label className={styles.field}>
        <span id={`${id}-label`}>Facturación mensual prevista sin IVA (EUR)</span>
        <NumericTextInput ref={input} inputMode="decimal" value={value}
          onValueChange={(nextValue) => { setValue(nextValue); setEstimate(null); setIsExample(false); }}
          onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); check(); } }}
          aria-labelledby={`${id}-label`} aria-describedby={`${id}-hint ${id}-reference${error ? ` ${id}-error` : ''}`} aria-invalid={Boolean(error)} />
        <small id={`${id}-hint`}>Suma las bases del mes antes de IVA y retenciones. No uses el cobro bancario ni solo una factura. Puedes indicar cero.</small>
        {error ? <small className="field-error" id={`${id}-error`}>{error}</small> : null}
      </label>
      <div className={styles.actions}>
        <button type="button" className="primary-button" onClick={() => check()}>Estimar neto con esta facturación</button>
        <button type="button" className="link-button" onClick={() => { setIsExample(true); setValue('2500'); check('2500'); }}>Probar una facturación de 2.500 €</button>
      </div>
      <div role="status" aria-label="Neto según facturación" aria-live="polite" aria-atomic="true">
        {estimate && !estimate.valid ? <p>{estimate.errors.reference ?? 'Revisa la facturación indicada antes de estimar el neto.'}</p> : null}
        {estimate?.valid ? (
          <div className={styles.result}>
            {isExample ? <p><strong>Facturación ficticia; conservamos los costes, cuota y criterio de IRPF indicados arriba.</strong></p> : null}
            <dl>
              <div><dt>Facturación prevista sin IVA</dt><dd>{formatCurrency(estimate.monthlyBilling)}</dd></div>
              <div><dt>Gastos deducibles mantenidos</dt><dd>− {formatCurrency(estimate.monthlyExpenses)}</dd></div>
              <div><dt>Cuota mantenida</dt><dd>− {formatCurrency(estimate.selfEmployedFee)}</dd></div>
              <div><dt>Resultado antes de la reserva de IRPF</dt><dd>{formatCurrency(estimate.preTaxProfit)}</dd></div>
              <div><dt>Reserva estimada de IRPF recalculada</dt><dd>− {formatCurrency(estimate.estimatedIRPF)}</dd></div>
              <div><dt>Costes no deducibles mantenidos</dt><dd>− {formatCurrency(estimate.monthlyNonDeductibleExpenses)}</dd></div>
              <div className={styles.net}><dt>Neto orientativo con estos supuestos</dt><dd>{formatCurrency(estimate.estimatedNet)}</dd></div>
              <div><dt>Diferencia frente al neto objetivo</dt><dd>{estimate.netDifference > 0 ? '+' : ''}{formatCurrency(estimate.netDifference)}</dd></div>
            </dl>
            <p>{estimate.netDifference < 0 ? `Queda ${formatCurrency(-estimate.netDifference)} por debajo de tu objetivo mensual.` : estimate.netDifference > 0 ? `Queda ${formatCurrency(estimate.netDifference)} por encima de tu objetivo mensual.` : 'Coincide con tu objetivo mensual.'}</p>
            {estimate.estimatedNet < 0 ? <p className={styles.shortfall}><strong>Hay un déficit de {formatCurrency(-estimate.estimatedNet)} tras estas partidas.</strong> No es dinero disponible. Un beneficio negativo no genera una reserva de IRPF negativa ni una devolución en esta ayuda.</p> : null}
            <p>La cuenta usa importes y reserva mensual redondeados a céntimos. Al partir de cifras ya redondeadas, reproducir el objetivo inicial puede dar un céntimo de diferencia. No suma IVA ni descuenta retenciones o anticipos del neto: no es un calendario de cobros.</p>
          </div>
        ) : null}
      </div>
      <p className={styles.note}>Usa tus costes y la cuota adecuados al escenario. Esta proyección no considera otras rentas, circunstancias personales, reducciones ni pagos a cuenta y no calcula tu declaración o regularización. Si cambian tus costes o tu cuota, revisa el cálculo de partida. El resultado principal y su enlace compartido permanecen iguales; este campo solo se usa en la página, sin guardarlo ni enviarlo.</p>
    </div>
  );
}

export default function MonthlyNetPreview({ reference }: { reference: NetPreviewReference }) {
  return <NetEditor key={JSON.stringify(reference)} reference={reference} />;
}
