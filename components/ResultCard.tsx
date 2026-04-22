import { AUTONOMOUS_COMMUNITY_LABELS, CalculationResult } from '@/lib/calculator';
import { formatCurrency } from '@/lib/format';

type ResultCardProps = {
  result: CalculationResult;
  hoursBillable: number;
  hasIVA: boolean;
};

export default function ResultCard({ result, hoursBillable, hasIVA }: ResultCardProps) {
  const autonomousCommunityLabel = AUTONOMOUS_COMMUNITY_LABELS[result.autonomousCommunity];

  return (
    <section className="result-card" aria-live="polite">
      <h3>Tu referencia mensual para presupuestar</h3>

      <p className="result-lead">
        Esta simulacion situa tu objetivo en <strong>{formatCurrency(result.billingWithoutVAT)}</strong>{' '}
        al mes sin IVA y una referencia de <strong>{formatCurrency(result.hourlyRate)}/h</strong>.
        Piensa en esta cifra como un suelo orientativo para no quedarte corto al poner precio.
      </p>

      <div className="result-grid">
        <div className="result-item">
          <span>Facturacion objetivo sin IVA</span>
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
          <span>Cuota de autonomos aplicada</span>
          <strong>{formatCurrency(result.selfEmployedFee)}</strong>
        </div>

        <div className="result-item result-item-full">
          <span>Tarifa media por hora</span>
          <strong>{formatCurrency(result.hourlyRate)}/h</strong>
        </div>
      </div>

      <p className="result-summary">
        Si quieres acercarte a un neto mensual de <strong>{formatCurrency(result.targetNet)}</strong>,
        con las{' '}
        <strong>{hoursBillable}</strong> horas facturables que has indicado, la referencia quedaria
        en <strong>{formatCurrency(result.hourlyRate)}/h</strong>. Si tus presupuestos actuales se
        quedan por debajo de esa cifra, es una buena señal para revisar precio, alcance o numero de
        horas antes de aceptar el trabajo.
      </p>

      <p className="result-summary">
        Ese objetivo incluye unos gastos deducibles estimados de{' '}
        <strong>{formatCurrency(result.monthlyExpenses)}</strong>, una cuota de autonomos de{' '}
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
            En el modo progresivo, el beneficio previo seria de{' '}
            <strong>{formatCurrency(result.preTaxProfit)}</strong> al mes. Eso equivale a un tipo
            efectivo aproximado del <strong>{result.irpfRate}%</strong> sobre un beneficio anual de{' '}
            <strong>{formatCurrency(result.annualPreTaxProfit)}</strong>, aplicando un minimo personal
            estatal de <strong>{formatCurrency(result.personalAllowance)}</strong> y la referencia
            autonomica de <strong>{autonomousCommunityLabel}</strong>.
          </>
        )}
        {hasIVA ? (
          <>
            {' '}
            El IVA se mantiene aparte, asi que en tus facturas tendrias que anadir aproximadamente{' '}
            <strong>{formatCurrency(result.estimatedVAT)}</strong> de IVA.
          </>
        ) : (
          <> En esta simulacion no se anade IVA.</>
        )}{' '}
        Puedes usar esta cifra como punto de partida para revisar si tus presupuestos actuales te
        dejan realmente el neto que buscas.
      </p>

      {result.irpfMode === 'progressive' && (
        <p className="result-summary">
          Para esta estimacion de IRPF tomamos una base anual aproximada de{' '}
          <strong>{formatCurrency(result.annualTaxableIrpfBase)}</strong> en el tramo estatal y de{' '}
          <strong>{formatCurrency(result.annualRegionalTaxableIrpfBase)}</strong> en el tramo
          autonomico, con un minimo autonomico de{' '}
          <strong>{formatCurrency(result.regionalPersonalAllowance)}</strong>. Es una simulacion
          simplificada: no incorpora deducciones personales, situaciones familiares ni todos los
          matices concretos de cada comunidad autonoma.
          {result.autonomousCommunity === 'common' ? (
            <> En Territorio comun usamos una referencia general, no la escala cerrada de una comunidad concreta.</>
          ) : null}
        </p>
      )}

      <p className="result-summary">
        {result.selfEmployedFeeMode === 'manual' ? (
          <>
            Hemos usado tu cuota manual de <strong>{formatCurrency(result.selfEmployedFee)}</strong>.
            Como referencia, la cuota minima orientativa por tramo seria{' '}
            <strong>{formatCurrency(result.estimatedSelfEmployedFee)}</strong> sobre una base de
            cotizacion de <strong>{formatCurrency(result.estimatedContributionBase)}</strong>.
          </>
        ) : result.selfEmployedFeeMode === 'reduced' ? (
          <>
            Hemos aplicado{' '}
            {result.reducedFeePeriod === 'extended'
              ? 'la prorroga estimada de la tarifa reducida'
              : 'la tarifa reducida inicial'}{' '}
            de <strong>{formatCurrency(result.reducedSelfEmployedFee)}</strong> al mes. Durante este
            escenario tomamos como referencia la base minima del tramo 1 de la tabla general, que
            en 2026 es <strong>{formatCurrency(result.reducedContributionBase)}</strong>. Si no
            aplicases esa tarifa reducida, la cuota orientativa por tramo para tus rendimientos
            seria <strong>{formatCurrency(result.estimatedSelfEmployedFee)}</strong> sobre una base
            de <strong>{formatCurrency(result.estimatedContributionBase)}</strong>.
            {result.reducedFeePeriod === 'extended' ? (
              result.reducedFeeExtensionEligible ? (
                <>
                  {' '}
                  En esta simulacion, los rendimientos netos de referencia quedan en{' '}
                  <strong>{formatCurrency(result.estimatedNetReturnsForContributions)}</strong> al
                  mes, por debajo del SMI 2026 de{' '}
                  <strong>{formatCurrency(result.referenceSMI)}</strong>, asi que la prorroga podria
                  encajar.
                </>
              ) : (
                <>
                  {' '}
                  Ojo: en esta simulacion, los rendimientos netos de referencia quedan en{' '}
                  <strong>{formatCurrency(result.estimatedNetReturnsForContributions)}</strong> al
                  mes, por encima del SMI 2026 de{' '}
                  <strong>{formatCurrency(result.referenceSMI)}</strong>, asi que esa prorroga podria
                  no corresponderte.
                </>
              )
            ) : null}
          </>
        ) : (
          <>
            Hemos estimado una cuota minima orientativa de{' '}
            <strong>{formatCurrency(result.selfEmployedFee)}</strong> sobre una base de cotizacion de{' '}
            <strong>{formatCurrency(result.estimatedContributionBase)}</strong>, segun el tramo de
            rendimientos netos mensuales de 2026. Para estimar ese tramo tomamos como referencia
            unos rendimientos netos de{' '}
            <strong>{formatCurrency(result.estimatedNetReturnsForContributions)}</strong> al mes.
          </>
        )}
      </p>

      <div className="result-next-step">
        <strong>Siguiente paso recomendado</strong>
        <p>
          Usa esta referencia para convertir un precio difuso en una decision mas clara: tarifa por
          hora, mensualidad o presupuesto cerrado. Si luego quieres cerrar una cifra definitiva para
          un cliente importante, contrastala con tu asesor fiscal o gestoria.
        </p>
      </div>
    </section>
  );
}
