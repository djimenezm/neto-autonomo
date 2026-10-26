import type { CalculationResult } from '@/lib/calculator';
import { getBillingBreakdown } from '@/lib/billingBreakdown';
import { formatCurrency } from '@/lib/format';
import styles from './BillingBreakdown.module.css';

type Props = {
  result: CalculationResult;
  hasIVA: boolean;
  headingId: string;
  headingLevel?: 'h3' | 'h4';
};

export default function BillingBreakdown({ result, hasIVA, headingId, headingLevel: Heading = 'h3' }: Props) {
  const breakdown = getBillingBreakdown(result);

  return (
    <section className={styles.breakdown} aria-labelledby={headingId}>
      <Heading id={headingId}>De lo facturado a tu neto</Heading>
      <p>Reparto mensual del importe sin IVA en esta simulación:</p>
      <dl className={styles.rows}>
        <div className={styles.row}>
          <dt>Facturación necesaria sin IVA</dt>
          <dd>{formatCurrency(breakdown.billingCents / 100)}</dd>
        </div>
        {breakdown.parts.map((part) => (
          <div className={styles.row} key={part.key}>
            <dt>{part.label}</dt>
            <dd>− {formatCurrency(part.cents / 100)}</dd>
          </div>
        ))}
        {breakdown.roundingAdjustmentCents !== 0 ? (
          <div className={styles.row}>
            <dt>Ajuste de redondeo</dt>
            <dd>{breakdown.roundingAdjustmentCents > 0 ? '+' : '−'} {formatCurrency(Math.abs(breakdown.roundingAdjustmentCents) / 100)}</dd>
          </div>
        ) : null}
        <div className={`${styles.row} ${styles.net}`}>
          <dt>Neto objetivo tras estas partidas</dt>
          <dd>= {formatCurrency(breakdown.netCents / 100)}</dd>
        </div>
      </dl>
      <p>
        La reserva de IRPF ya está incluida en la resta. No hay que descontarla otra vez del neto
        mostrado. Es una previsión del modelo, no dinero que la herramienta haya apartado por ti.
      </p>
      <div className={styles.vat}>
        <strong>El IVA va aparte</strong>
        {hasIVA ? (
          <>
            <p>
              {formatCurrency(breakdown.billingCents / 100)} sin IVA + {formatCurrency(breakdown.vatCents / 100)}
              {' '}de IVA = <strong>{formatCurrency(breakdown.withVatCents / 100)}</strong> de base más IVA.
              {' '}Esa suma no es tu neto.
            </p>
            <p>
              No calcula las retenciones en factura ni el IVA soportado deducible. No es el importe
              de una liquidación de impuestos ni una previsión de cobros.
            </p>
          </>
        ) : <p>Esta simulación no añade IVA. El reparto anterior utiliza únicamente la facturación sin IVA.</p>}
      </div>
    </section>
  );
}
