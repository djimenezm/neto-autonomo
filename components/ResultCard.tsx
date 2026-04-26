'use client';

import { useMemo, useState } from 'react';
import { AUTONOMOUS_COMMUNITY_LABELS, type CalculationResult } from '@/lib/calculator';
import { formatCurrency } from '@/lib/format';

type ResultCardProps = {
  result: CalculationResult;
  hoursBillable: number;
  hasIVA: boolean;
};

type CopyStatus = 'idle' | 'copied' | 'error';

async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.select();

  const copied = document.execCommand('copy');
  document.body.removeChild(textArea);

  if (!copied) {
    throw new Error('No se pudo copiar el resumen.');
  }
}

export default function ResultCard({ result, hoursBillable, hasIVA }: ResultCardProps) {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');
  const autonomousCommunityLabel = AUTONOMOUS_COMMUNITY_LABELS[result.autonomousCommunity];
  const resultSummary = useMemo(
    () =>
      [
        'Resumen de cálculo - Cuánto Facturar',
        `Neto objetivo: ${formatCurrency(result.targetNet)} al mes`,
        `Facturación objetivo sin IVA: ${formatCurrency(result.billingWithoutVAT)} al mes`,
        `Tarifa media orientativa: ${formatCurrency(result.hourlyRate)}/h`,
        `Horas facturables usadas: ${hoursBillable} al mes`,
        hasIVA
          ? `IVA a repercutir aparte: ${formatCurrency(result.estimatedVAT)}`
          : 'IVA: no incluido en esta simulación',
        `Reserva estimada de IRPF: ${formatCurrency(result.estimatedIRPF)} al mes`,
        `Cuota de autónomos aplicada: ${formatCurrency(result.selfEmployedFee)} al mes`,
        `Comunidad de referencia para IRPF: ${autonomousCommunityLabel}`,
      ].join('\n'),
    [autonomousCommunityLabel, hasIVA, hoursBillable, result],
  );

  async function handleCopySummary() {
    try {
      await copyTextToClipboard(resultSummary);
      setCopyStatus('copied');
      window.setTimeout(() => setCopyStatus('idle'), 2500);
    } catch {
      setCopyStatus('error');
    }
  }

  return (
    <section className="result-card" aria-live="polite">
      <h3>Tu referencia mensual para presupuestar</h3>

      <p className="result-lead">
        Esta simulación sitúa tu objetivo en <strong>{formatCurrency(result.billingWithoutVAT)}</strong>{' '}
        al mes sin IVA y una referencia de <strong>{formatCurrency(result.hourlyRate)}/h</strong>.
        Piensa en esta cifra como un suelo orientativo para no quedarte corto al poner precio.
      </p>

      <div className="result-grid">
        <div className="result-item">
          <span>Facturación objetivo sin IVA</span>
          <strong>{formatCurrency(result.billingWithoutVAT)}</strong>
        </div>

        <div className="result-item">
          <span>IVA a repercutir aparte</span>
          <strong>{formatCurrency(result.estimatedVAT)}</strong>
        </div>

        <div className="result-item">
          <span>Reserva estimada de IRPF</span>
          <strong>{formatCurrency(result.estimatedIRPF)}</strong>
        </div>

        <div className="result-item">
          <span>Beneficio antes de IRPF</span>
          <strong>{formatCurrency(result.preTaxProfit)}</strong>
        </div>

        <div className="result-item">
          <span>Cuota de autónomos aplicada</span>
          <strong>{formatCurrency(result.selfEmployedFee)}</strong>
        </div>

        <div className="result-item result-item-full">
          <span>Tarifa media por hora</span>
          <strong>{formatCurrency(result.hourlyRate)}/h</strong>
        </div>
      </div>

      <p className="result-summary">
        Si quieres acercarte a un neto mensual de <strong>{formatCurrency(result.targetNet)}</strong>,
        con las <strong>{hoursBillable}</strong> horas facturables que has indicado, la referencia quedaría
        en <strong>{formatCurrency(result.hourlyRate)}/h</strong>. Si tus presupuestos actuales se
        quedan por debajo de esa cifra, es una buena señal para revisar precio, alcance o número de
        horas antes de aceptar el trabajo.
      </p>

      <p className="result-summary">
        Ese objetivo incluye unos gastos deducibles estimados de{' '}
        <strong>{formatCurrency(result.monthlyExpenses)}</strong>, una cuota de autónomos de{' '}
        <strong>{formatCurrency(result.selfEmployedFee)}</strong> y una reserva mensual de IRPF de{' '}
        <strong>{formatCurrency(result.estimatedIRPF)}</strong>.
        {result.irpfMode === 'manual' ? (
          <>
            {' '}
            En este escenario usamos un IRPF manual del <strong>{result.irpfRate}%</strong> y un
            beneficio previo de <strong>{formatCurrency(result.preTaxProfit)}</strong>.
          </>
        ) : (
          <>
            {' '}
            En el modo progresivo, el beneficio previo sería de{' '}
            <strong>{formatCurrency(result.preTaxProfit)}</strong> al mes. Eso equivale a un tipo
            efectivo aproximado del <strong>{result.irpfRate}%</strong> sobre un beneficio anual de{' '}
            <strong>{formatCurrency(result.annualPreTaxProfit)}</strong>, aplicando un mínimo personal
            estatal de <strong>{formatCurrency(result.personalAllowance)}</strong> y la referencia
            autonómica de <strong>{autonomousCommunityLabel}</strong>.
          </>
        )}
        {hasIVA ? (
          <>
            {' '}
            El IVA se mantiene aparte, así que en tus facturas tendrías que añadir aproximadamente{' '}
            <strong>{formatCurrency(result.estimatedVAT)}</strong> de IVA.
          </>
        ) : (
          <> En esta simulación no se añade IVA.</>
        )}{' '}
        Puedes usar esta cifra como punto de partida para revisar si tus presupuestos actuales te
        dejan realmente el neto que buscas.
      </p>

      {result.irpfMode === 'progressive' && (
        <p className="result-summary">
          Para esta estimación de IRPF tomamos una base anual aproximada de{' '}
          <strong>{formatCurrency(result.annualTaxableIrpfBase)}</strong> en el tramo estatal y de{' '}
          <strong>{formatCurrency(result.annualRegionalTaxableIrpfBase)}</strong> en el tramo
          autonómico, con un mínimo autonómico de{' '}
          <strong>{formatCurrency(result.regionalPersonalAllowance)}</strong>. Es una simulación
          simplificada: no incorpora deducciones personales, situaciones familiares ni todos los
          matices concretos de cada comunidad autónoma.
          {result.autonomousCommunity === 'common' ? (
            <> En Territorio común usamos una referencia general, no la escala cerrada de una comunidad concreta.</>
          ) : null}
        </p>
      )}

      <div className="result-copy-box">
        <div className="result-copy-header">
          <div>
            <strong>Resumen rápido para guardar</strong>
            <p>
              Copia una versión corta del cálculo para pegarla en tus notas, una propuesta o una
              conversación con tu gestoría.
            </p>
          </div>
          <button type="button" className="secondary-button result-copy-button" onClick={handleCopySummary}>
            {copyStatus === 'copied' ? 'Resumen copiado' : 'Copiar resumen'}
          </button>
        </div>
        <pre className="result-copy-preview">{resultSummary}</pre>
        {copyStatus === 'copied' && (
          <span className="result-copy-status" role="status">
            Resumen copiado.
          </span>
        )}
        {copyStatus === 'error' && (
          <span className="result-copy-status result-copy-status-error" role="status">
            No se ha podido copiar automáticamente. Puedes seleccionar el resumen manualmente.
          </span>
        )}
      </div>

      <p className="result-summary">
        {result.selfEmployedFeeMode === 'manual' ? (
          <>
            Hemos usado tu cuota manual de <strong>{formatCurrency(result.selfEmployedFee)}</strong>.
            Como referencia, la cuota mínima orientativa por tramo sería{' '}
            <strong>{formatCurrency(result.estimatedSelfEmployedFee)}</strong> sobre una base de
            cotización de <strong>{formatCurrency(result.estimatedContributionBase)}</strong>.
          </>
        ) : result.selfEmployedFeeMode === 'reduced' ? (
          <>
            Hemos aplicado{' '}
            {result.reducedFeePeriod === 'extended'
              ? 'la prórroga estimada de la tarifa reducida'
              : 'la tarifa reducida inicial'}{' '}
            de <strong>{formatCurrency(result.reducedSelfEmployedFee)}</strong> al mes. Durante este
            escenario tomamos como referencia la base mínima del tramo 1 de la tabla general, que
            en 2026 es <strong>{formatCurrency(result.reducedContributionBase)}</strong>. Si no
            aplicases esa tarifa reducida, la cuota orientativa por tramo para tus rendimientos
            sería <strong>{formatCurrency(result.estimatedSelfEmployedFee)}</strong> sobre una base
            de <strong>{formatCurrency(result.estimatedContributionBase)}</strong>.
            {result.reducedFeePeriod === 'extended' ? (
              result.reducedFeeExtensionEligible ? (
                <>
                  {' '}
                  En esta simulación, los rendimientos netos de referencia quedan en{' '}
                  <strong>{formatCurrency(result.estimatedNetReturnsForContributions)}</strong> al
                  mes, por debajo del SMI 2026 de{' '}
                  <strong>{formatCurrency(result.referenceSMI)}</strong>, así que la prórroga podría
                  encajar.
                </>
              ) : (
                <>
                  {' '}
                  Ojo: en esta simulación, los rendimientos netos de referencia quedan en{' '}
                  <strong>{formatCurrency(result.estimatedNetReturnsForContributions)}</strong> al
                  mes, por encima del SMI 2026 de{' '}
                  <strong>{formatCurrency(result.referenceSMI)}</strong>, así que esa prórroga podría
                  no corresponderte.
                </>
              )
            ) : null}
          </>
        ) : (
          <>
            Hemos estimado una cuota mínima orientativa de{' '}
            <strong>{formatCurrency(result.selfEmployedFee)}</strong> sobre una base de cotización de{' '}
            <strong>{formatCurrency(result.estimatedContributionBase)}</strong>, según el tramo de
            rendimientos netos mensuales de 2026. Para estimar ese tramo tomamos como referencia
            unos rendimientos netos de{' '}
            <strong>{formatCurrency(result.estimatedNetReturnsForContributions)}</strong> al mes.
          </>
        )}
      </p>

      <div className="result-next-step">
        <strong>Siguiente paso recomendado</strong>
        <p>
          Usa esta referencia para convertir un precio difuso en una decisión más clara: tarifa por
          hora, mensualidad o presupuesto cerrado. Si luego quieres cerrar una cifra definitiva para
          un cliente importante, contrástala con tu asesor fiscal o gestoría.
        </p>
      </div>
    </section>
  );
}
