import type { CalculationResult } from '@/lib/calculator';
import { getScenarioPath, inputFromResult } from '@/lib/monthlyScenarios';
import { formatCurrency } from '@/lib/format';
import styles from './ReducedFeeNotice.module.css';

export default function ReducedFeeNotice({ result, billableHours, hasIVA }: { result: CalculationResult; billableHours: number; hasIVA: boolean }) {
  if (result.selfEmployedFeeMode !== 'reduced' || result.reducedFeePeriod !== 'extended') return null;
  const ordinaryPath = getScenarioPath({ ...inputFromResult(result, billableHours, hasIVA), selfEmployedFeeMode: 'auto' });
  return (
    <aside className={styles.notice} role="note" aria-label="Revisión de la prórroga de cuota reducida">
      <strong>Prórroga: compara importes anuales</strong>
      <p>Rendimientos netos estimados para cotización: <strong>{formatCurrency(result.annualEstimatedNetReturnsForContributions)}/año</strong>.
        {' '}SMI de referencia en 2026: <strong>{formatCurrency(result.referenceAnnualSMI)}/año</strong>.</p>
      <p>{result.reducedFeeExtensionEligible
        ? 'La estimación queda por debajo del SMI anual. Cumplir este límite en el modelo no acredita el derecho a la prórroga.'
        : 'La estimación no queda por debajo del SMI anual. Esta simulación conserva la cuota reducida que has seleccionado; no la tomes como una prórroga concedida.'}</p>
      <p>Se anualizan doce meses iguales. Si el periodo abarca dos años naturales, revisa los rendimientos y el SMI de cada año. La solicitud y los demás requisitos se comprueban aparte.</p>
      <a href={ordinaryPath}>Ver el mismo cálculo con cuota ordinaria</a>
      {' · '}<a href="/cuota-autonomos-2026#prorroga-anual">Entender la comparación anual</a>
    </aside>
  );
}
