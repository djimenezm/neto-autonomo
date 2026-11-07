'use client';

import { forwardRef, useMemo, useRef, useState, type ReactNode } from 'react';
import { AUTONOMOUS_COMMUNITY_LABELS, type CalculationResult } from '@/lib/calculator';
import { formatCurrency, formatNumber } from '@/lib/format';
import BillingBreakdown from '@/components/BillingBreakdown';
import MonthlyNetPreview from '@/components/MonthlyNetPreview';
import MonthlyProjectPlanner from '@/components/MonthlyProjectPlanner';
import MonthlyPortfolioPlanner from '@/components/MonthlyPortfolioPlanner';
import MonthlyScenarioComparator from '@/components/MonthlyScenarioComparator';
import AnnualBillingPlanner from '@/components/AnnualBillingPlanner';
import ReducedFeeNotice from '@/components/ReducedFeeNotice';
import { reducedFeeSources } from '@/lib/reducedFee2026';
import { inputFromResult } from '@/lib/monthlyScenarios';
import { netReferenceFromResult } from '@/lib/monthlyNet';
import projectPlannerStyles from './MonthlyProjectPlanner.module.css';
import breakdownStyles from './BillingBreakdown.module.css';
import portfolioStyles from './MonthlyPortfolioPlanner.module.css';

type ResultCardProps = {
  result: CalculationResult;
  hoursBillable: number;
  hasIVA: boolean;
  enableCopy?: boolean;
  enableShareCopy?: boolean;
  shareUrl?: string;
};

type CopyStatus = 'idle' | 'copied' | 'error';
const hourlyRateRoundingNote = 'La tarifa por hora está redondeada a céntimos. Al multiplicarla por las horas, el total puede diferir del objetivo mensual. El comprobador de encargos usa la proporción mensual completa y redondea su referencia al céntimo superior.';
type ResultKitCtaEvent = {
  nativeEvent?: Event & {
    __cuantoFacturarResultKitTracked?: boolean;
  };
};

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
  try {
    textArea.select();
    if (!document.execCommand('copy')) {
      throw new Error('No se pudo copiar el resumen.');
    }
  } finally {
    textArea.remove();
  }
}

function ShareableSummary({ text, enableCopy, children }: { text: string; enableCopy: boolean; children: ReactNode }) {
  const textArea = useRef<HTMLTextAreaElement>(null);
  const [status, setStatus] = useState<CopyStatus | 'copying'>('idle');

  async function copySummaryAndLink() {
    setStatus('copying');
    try {
      await copyTextToClipboard(text);
      setStatus('copied');
    } catch {
      setStatus('error');
      textArea.current?.focus();
      textArea.current?.select();
    }
  }

  return (
    <>
      <textarea
        ref={textArea}
        className="result-share-text"
        readOnly
        aria-label="Resumen detallado para compartir"
        aria-describedby="result-share-scope"
        value={text}
      />
      <div className="result-share-actions" aria-label="Opciones para compartir el resultado">
        {enableCopy ? (
          <button type="button" className="secondary-button" onClick={copySummaryAndLink} disabled={status === 'copying'} aria-busy={status === 'copying'}>
            Copiar resumen y enlace
          </button>
        ) : null}
        {children}
      </div>
      {enableCopy ? (
        <>
          <div role="status" aria-label="Copia del resumen y enlace" aria-live="polite" aria-atomic="true">
            {status === 'copying' ? <p>Copiando el resumen y el enlace…</p> : null}
            {status === 'copied' ? <p>Resumen y enlace copiados.</p> : null}
            {status === 'error' ? <p className="field-error">No se ha podido copiar automáticamente. El resumen queda seleccionado para que lo copies manualmente.</p> : null}
          </div>
          <noscript><p>Sin JavaScript, selecciona el resumen y cópialo manualmente.</p></noscript>
        </>
      ) : null}
    </>
  );
}

function trackResultKitCtaClicked(event?: ResultKitCtaEvent) {
  const eventData = { source: 'result-card' };

  if (event?.nativeEvent) {
    event.nativeEvent.__cuantoFacturarResultKitTracked = true;
  }

  window.va?.('event', {
    name: 'result_kit_cta_clicked',
    data: eventData,
  });
  window.gtag?.('event', 'result_kit_cta_clicked', eventData);
}

const ResultCard = forwardRef<HTMLElement, ResultCardProps>(function ResultCard(
  { result, hoursBillable, hasIVA, enableCopy = true, enableShareCopy = false, shareUrl },
  ref,
) {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');
  const autonomousCommunityLabel = AUTONOMOUS_COMMUNITY_LABELS[result.autonomousCommunity];
  const resultSummary = useMemo(
    () =>
      [
        'Resumen de cálculo - Cuánto Facturar',
        `Neto objetivo: ${formatCurrency(result.targetNet)} al mes`,
        `Facturación objetivo sin IVA: ${formatCurrency(result.billingWithoutVAT)} al mes`,
        `Tarifa media orientativa: ${formatCurrency(result.hourlyRate)}/h`,
        `Redondeo: ${hourlyRateRoundingNote}`,
        `Horas facturables usadas: ${hoursBillable} al mes`,
        `Gastos deducibles de actividad, sin cuota: ${formatCurrency(result.monthlyExpenses)} al mes`,
        `Otros costes no deducibles: ${formatCurrency(result.monthlyNonDeductibleExpenses)} al mes`,
        hasIVA
          ? `IVA simulado al 21 % (aparte del neto): ${formatCurrency(result.estimatedVAT)}`
          : 'IVA: no incluido en esta simulación',
        result.irpfMode === 'manual'
          ? `Criterio de IRPF: reserva manual del ${formatNumber(result.irpfRate)} % sobre el beneficio de la simulación; no es retención de una factura.`
          : 'Criterio de IRPF: estimación progresiva simplificada.',
        `Reserva estimada de IRPF: ${formatCurrency(result.estimatedIRPF)} al mes`,
        `Cuota de autónomos aplicada: ${formatCurrency(result.selfEmployedFee)} al mes`,
        `Modalidad de cuota: ${result.selfEmployedFeeMode === 'manual'
          ? 'manual indicada'
          : result.selfEmployedFeeMode === 'auto'
            ? 'estimada según tramo 2026'
            : result.reducedFeePeriod === 'extended'
              ? 'prórroga simulada de cuota reducida (MEI incluido)'
              : 'cuota reducida inicial simulada (MEI incluido)'}`,
        ...(result.irpfMode === 'progressive'
          ? [`Comunidad de referencia para IRPF: ${autonomousCommunityLabel}`]
          : []),
        ...(result.selfEmployedFeeMode === 'reduced' && result.reducedFeePeriod === 'extended'
          ? [
            `Prórroga (doce meses iguales): rendimientos estimados para cotización ${formatCurrency(result.annualEstimatedNetReturnsForContributions)} al año; SMI de referencia ${formatCurrency(result.referenceAnnualSMI)} al año.`,
            `La estimación ${result.reducedFeeExtensionEligible ? 'queda' : 'no queda'} por debajo del SMI anual. La simulación conserva la cuota reducida seleccionada; no acredita el derecho a la prórroga.`,
            'Solicitud y demás requisitos aparte. Si el periodo abarca dos años naturales, revisa rendimientos y SMI de cada año.',
          ]
          : []),
      ].join('\n'),
    [autonomousCommunityLabel, hasIVA, hoursBillable, result],
  );
  const channelShareUrls = useMemo(() => {
    if (!shareUrl) {
      return null;
    }

    const buildTrackedUrl = (source: string, medium: string) => {
      const trackedUrl = new URL(shareUrl);
      trackedUrl.searchParams.set('utm_source', source);
      trackedUrl.searchParams.set('utm_medium', medium);
      trackedUrl.searchParams.set('utm_campaign', 'shared_calculator_result');
      return trackedUrl.toString();
    };

    const whatsappUrl = buildTrackedUrl('whatsapp', 'social_share');
    const xUrl = buildTrackedUrl('x', 'social_share');
    const emailUrl = buildTrackedUrl('email', 'share_link');
    const whatsappText = `${resultSummary}\n\nCalculadora: ${whatsappUrl}`;
    const xText = `Tarifa media orientativa en Cuánto Facturar. Abre el cálculo principal y sus supuestos en el enlace.\n\nCalculadora: ${xUrl}`;
    const emailBody = `${resultSummary}\n\nCalculadora: ${emailUrl}`;

    return {
      email: `mailto:?subject=${encodeURIComponent('Resumen de cálculo - Cuánto Facturar')}&body=${encodeURIComponent(emailBody)}`,
      text: emailBody,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(whatsappText)}`,
      x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(xText)}`,
    };
  }, [resultSummary, shareUrl]);

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
    <section
      ref={ref}
      className={`result-card ${projectPlannerStyles.resultCard}`}
      tabIndex={-1}
      aria-live="polite"
      aria-labelledby="result-card-title"
    >
      <h3 id="result-card-title">Tu referencia mensual para presupuestar</h3>

      <p className="result-lead">
        Esta simulación sitúa tu objetivo en <strong>{formatCurrency(result.billingWithoutVAT)}</strong>{' '}
        al mes sin IVA y una referencia de <strong>{formatCurrency(result.hourlyRate)}/h</strong>.
        Usa el objetivo mensual como referencia para preparar tus presupuestos.
      </p>

      <ReducedFeeNotice result={result} billableHours={hoursBillable} hasIVA={hasIVA} />

      <div className="result-grid">
        <div className="result-item">
          <span>Facturación objetivo sin IVA</span>
          <strong>{formatCurrency(result.billingWithoutVAT)}</strong>
        </div>

        <div className="result-item">
          <span>{hasIVA ? 'IVA simulado al 21 %' : 'IVA no incluido'}</span>
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

        {result.monthlyNonDeductibleExpenses > 0 && (
          <div className="result-item">
            <span>Costes no deducibles cubiertos</span>
            <strong>{formatCurrency(result.monthlyNonDeductibleExpenses)}</strong>
          </div>
        )}

        <div className="result-item result-item-full">
          <span>Tarifa media por hora</span>
          <strong>{formatCurrency(result.hourlyRate)}/h</strong>
          <p className="result-summary">{hourlyRateRoundingNote}</p>
        </div>
      </div>

      <details className={breakdownStyles.disclosure}>
        <summary>Ver cómo se reparte la facturación</summary>
        <BillingBreakdown
          result={result}
          hasIVA={hasIVA}
          headingId="result-billing-breakdown-title"
          headingLevel="h4"
          showWithholdingPreview
        />
        <a href="/tarifa-freelance-por-hora#ejemplo-tarifa">Ver un ejemplo completo de tarifa por hora</a>
      </details>

      <details className={breakdownStyles.disclosure}>
        <summary>Estimar qué neto dejaría otra facturación</summary>
        <MonthlyNetPreview reference={netReferenceFromResult(result)} />
        <a href="/tarifa-freelance-por-hora#neto-segun-facturacion">Ver el ejemplo de neto según facturación</a>
      </details>

      <details className={breakdownStyles.disclosure}>
        <summary>Comprobar cuántos encargos necesito y si caben</summary>
        <MonthlyProjectPlanner monthlyBilling={result.billingWithoutVAT} billableHours={hoursBillable} headingLevel="h4" />
        <a href="/cuanto-facturar-autonomo-3000-euros#ejemplo-encargos">Ver un ejemplo de encargos y capacidad mensual</a>
        <details className={`${breakdownStyles.disclosure} ${portfolioStyles.disclosure}`}>
          <summary>Combinar encargos de distintos precios y horas</summary>
          <MonthlyPortfolioPlanner monthlyBilling={result.billingWithoutVAT} billableHours={hoursBillable} />
          <a href="/cuanto-facturar-autonomo-3000-euros#combinar-encargos">Ver el ejemplo de servicios combinados</a>
        </details>
      </details>

      <details className={breakdownStyles.disclosure}>
        <summary>Comparar cambios en mis gastos y horas</summary>
        <MonthlyScenarioComparator reference={inputFromResult(result, hoursBillable, hasIVA)} />
        <a href="/tabla-cuanto-facturar-autonomo#comparar-escenarios">Ver un ejemplo de comparación de escenarios</a>
      </details>

      <details className={breakdownStyles.disclosure}>
        <summary>Planificar los meses sin facturación</summary>
        <AnnualBillingPlanner monthlyBilling={result.billingWithoutVAT} />
        <a href="/cuanto-facturar-autonomo-1500-euros#meses-sin-facturar">Ver el ejemplo de meses activos y horas anuales</a>
      </details>

      {shareUrl && channelShareUrls && (
        <div className="result-share-box">
          <div className="result-share-copy">
            <strong>Haz que el cálculo trabaje por ti</strong>
            <p>
              Copia el resumen detallado con el enlace o compártelo por WhatsApp y correo.
              En X se prepara un texto breve con el enlace al cálculo.
            </p>
            <p id="result-share-scope">
              El enlace conserva el cálculo principal, pero no los datos que hayas introducido
              en las ayudas, como los de un encargo o una combinación de servicios.
            </p>
          </div>
          <script
            dangerouslySetInnerHTML={{
              __html: `window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};(function(){if(window.__cuantoFacturarShareTracking)return;window.__cuantoFacturarShareTracking=true;document.addEventListener('click',function(event){var link=event.target&&event.target.closest?event.target.closest('[data-share-channel]'):null;if(!link)return;window.va('event',{name:'result_shared',data:{channel:link.getAttribute('data-share-channel')||'unknown'}});});})();`,
            }}
          />
          <ShareableSummary key={channelShareUrls.text} text={channelShareUrls.text} enableCopy={enableShareCopy}>
            <a
              className="link-button"
              href={channelShareUrls.whatsapp}
              target="_blank"
              rel="noreferrer"
              data-share-channel="whatsapp"
            >
              WhatsApp
            </a>
            <a
              className="link-button"
              href={channelShareUrls.x}
              target="_blank"
              rel="noreferrer"
              data-share-channel="x"
            >
              X
            </a>
            <a className="link-button" href={channelShareUrls.email} data-share-channel="email">
              Email
            </a>
          </ShareableSummary>
        </div>
      )}

      <p className="result-summary">
        Si quieres acercarte a un neto mensual de <strong>{formatCurrency(result.targetNet)}</strong>,
        con las <strong>{hoursBillable}</strong> horas facturables que has indicado, la referencia media redondeada quedaría
        en <strong>{formatCurrency(result.hourlyRate)}/h</strong>. Si tus presupuestos actuales se
        quedan por debajo de esa cifra, es una buena señal para revisar precio, alcance o número de
        horas antes de aceptar el trabajo.
      </p>

      <div className="result-lead-magnet">
        <div>
          <strong>Revisa esta tarifa antes de enviarla</strong>
          <p>
            Te mandamos el kit gratuito con señales de riesgo, lista de comprobación de mínimos y un guion corto
            para defender mejor la cifra ante un cliente.
          </p>
        </div>
        <a
          className="primary-button"
          href="#kit-tarifa-form"
          data-result-kit-cta="result-card"
          onClick={trackResultKitCtaClicked}
        >
          Quiero el kit
        </a>
      </div>

      <p className="result-summary">
        Ese objetivo incluye unos gastos deducibles estimados de{' '}
        <strong>{formatCurrency(result.monthlyExpenses)}</strong>, una cuota de autónomos de{' '}
        <strong>{formatCurrency(result.selfEmployedFee)}</strong> y una reserva mensual de IRPF de{' '}
        <strong>{formatCurrency(result.estimatedIRPF)}</strong>.
        {result.monthlyNonDeductibleExpenses > 0 && (
          <>
            {' '}Además cubre <strong>{formatCurrency(result.monthlyNonDeductibleExpenses)}</strong> de
            costes que no hemos descontado al estimar el IRPF.
          </>
        )}
        {result.irpfMode === 'manual' ? (
          <>
            {' '}
            En este escenario usamos un IRPF manual del <strong>{formatNumber(result.irpfRate)}%</strong> y un
            beneficio previo de <strong>{formatCurrency(result.preTaxProfit)}</strong>.
          </>
        ) : (
          <>
            {' '}
            En el modo progresivo, el beneficio previo sería de{' '}
            <strong>{formatCurrency(result.preTaxProfit)}</strong> al mes. Eso equivale a un tipo
            efectivo aproximado del <strong>{formatNumber(result.irpfRate)}%</strong> sobre un beneficio anual de{' '}
            <strong>{formatCurrency(result.annualPreTaxProfit)}</strong>, aplicando un mínimo personal
            estatal de <strong>{formatCurrency(result.personalAllowance)}</strong> y la referencia
            autonómica de <strong>{autonomousCommunityLabel}</strong>.
          </>
        )}
        {hasIVA ? (
          <>
            {' '}
            Esta simulación aplica un IVA del 21 % y lo mantiene aparte del neto:{' '}
            <strong>{formatCurrency(result.estimatedVAT)}</strong> de IVA. Comprueba el tipo
            aplicable a tu actividad antes de facturar.
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

      {enableCopy && (
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
      )}

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
            de <strong>{formatCurrency(result.reducedSelfEmployedFee)}</strong> al mes, incluido el
            MEI, usando el total publicado en la <a href={reducedFeeSources.importass}>guía de Importass</a>.
            {' '}Si tu recibo completo es distinto, utiliza la cuota manual. Si no
            aplicases esa tarifa reducida, la cuota orientativa por tramo para tus rendimientos
            sería <strong>{formatCurrency(result.estimatedSelfEmployedFee)}</strong> sobre una base
            de <strong>{formatCurrency(result.estimatedContributionBase)}</strong>.
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
        <a href="/kit-tarifa-autonomo#revision-encargo" className="text-link">Revisar un encargo con mis horas reales</a>
      </div>
    </section>
  );
});

export default ResultCard;
