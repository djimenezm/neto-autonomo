'use client';

import type { ClipboardEvent } from 'react';
import { Activity, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ResultCard from '@/components/ResultCard';
import BillableHoursPlanner from '@/components/BillableHoursPlanner';
import {
  AUTONOMOUS_COMMUNITY_LABELS,
  type AutonomousCommunity,
  calculateFreelanceBilling,
  type IrpfMode,
  type ReducedFeePeriod,
  type SelfEmployedFeeMode,
} from '@/lib/calculator';
import {
  buildCalculatorUrl,
  DEFAULT_FORM_VALUES,
  type CalculatorFormValues,
  type FieldName,
  getCalculationKey,
  getNormalizedPastedValue,
  normalizeFieldValue,
  parseFormNumber as parseNumericValue,
  validateForm,
} from '@/lib/calculatorForm';
import { ANNUAL_SMI_2026, REDUCED_FEE_2026 } from '@/lib/reducedFee2026';
import { formatCurrency } from '@/lib/format';
import { siteConfig } from '@/lib/site';

export type { CalculatorFormValues } from '@/lib/calculatorForm';

type CalculatorFormProps = {
  initialValues?: Partial<CalculatorFormValues>;
  initiallySubmitted?: boolean;
  enableResultCopy?: boolean;
  initialShareUrl?: string;
  trackServerConversion?: boolean;
  updateUrlOnSubmit?: boolean;
  importedFromCosts?: boolean;
};

const googleAdsCalculatorConversion = `${siteConfig.googleAdsId}/${siteConfig.googleAdsCalculatorConversionLabel}`;

declare global {
  interface Window {
    va?: (
      command: 'event',
      payload: {
        name: string;
        data?: Record<string, string>;
      },
    ) => void;
    gtag?: (
      command: 'event',
      eventName: string,
      eventParams?: Record<string, string>,
    ) => void;
  }
}

function trackCalculatorCompleted(data: Record<string, string>) {
  window.va?.('event', {
    name: 'calculator_completed',
    data,
  });
  window.gtag?.('event', 'calculator_completed', data);
  window.gtag?.('event', 'conversion', {
    send_to: googleAdsCalculatorConversion,
  });
}

export default function CalculatorForm({
  initialValues,
  initiallySubmitted = false,
  enableResultCopy = true,
  initialShareUrl = '',
  trackServerConversion = false,
  updateUrlOnSubmit = true,
  importedFromCosts = false,
}: CalculatorFormProps = {}) {
  const values = { ...DEFAULT_FORM_VALUES, ...initialValues };
  const [targetNet, setTargetNet] = useState(values.targetNet);
  const [monthlyExpenses, setMonthlyExpenses] = useState(values.monthlyExpenses);
  const [monthlyNonDeductibleExpenses, setMonthlyNonDeductibleExpenses] = useState(
    values.monthlyNonDeductibleExpenses,
  );
  const [billableHours, setBillableHours] = useState(values.billableHours);
  const [appliedHours, setAppliedHours] = useState<number | null>(null);
  const [irpfMode, setIrpfMode] = useState<IrpfMode>(values.irpfMode);
  const [autonomousCommunity, setAutonomousCommunity] = useState<AutonomousCommunity>(
    values.autonomousCommunity,
  );
  const [irpfRate, setIrpfRate] = useState(values.irpfRate);
  const [hasIVA, setHasIVA] = useState(values.hasIVA);
  const [selfEmployedFeeMode, setSelfEmployedFeeMode] = useState<SelfEmployedFeeMode>(
    values.selfEmployedFeeMode,
  );
  const [reducedFeePeriod, setReducedFeePeriod] = useState<ReducedFeePeriod>(values.reducedFeePeriod);
  const [selfEmployedFee, setSelfEmployedFee] = useState(values.selfEmployedFee);
  const [submitted, setSubmitted] = useState(initiallySubmitted);
  const [invalidSubmissionCount, setInvalidSubmissionCount] = useState(0);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [hasTrackedConversion, setHasTrackedConversion] = useState(initiallySubmitted);
  const [validSubmissionCount, setValidSubmissionCount] = useState(0);
  const [shareUrl, setShareUrl] = useState(() =>
    initialShareUrl || (initiallySubmitted && typeof window !== 'undefined' ? window.location.href : ''),
  );
  const resultRegionRef = useRef<HTMLElement | null>(null);
  const lastFocusedSubmission = useRef(0);
  const hasTrackedCostImport = useRef(false);
  const [invalidPastedField, setInvalidPastedField] = useState<FieldName | null>(null);

  function updateNumericValue(field: FieldName, value: string, setValue: (value: string) => void) {
    setValue(value);
    if (invalidPastedField === field) setInvalidPastedField(null);
  }

  function handleNumericPaste(
    event: ClipboardEvent<HTMLInputElement>,
    field: FieldName,
    setValue: (value: string) => void,
  ) {
    const normalizedValue = getNormalizedPastedValue(field, event.clipboardData.getData('text'));
    event.preventDefault();
    if (normalizedValue === null) {
      // Number inputs cannot retain malformed text. Clear the old number too,
      // so a rejected paste cannot silently leave a previous result shareable.
      setValue('');
      setInvalidPastedField(field);
    } else {
      updateNumericValue(field, normalizedValue, setValue);
    }
  }

  useEffect(() => {
    if (!importedFromCosts || hasTrackedCostImport.current) return;

    hasTrackedCostImport.current = true;
    window.va?.('event', { name: 'monthly_costs_transferred' });
  }, [importedFromCosts]);

  useEffect(() => {
    if (invalidSubmissionCount > 0) {
      formRef.current?.querySelector<HTMLInputElement>('[name][aria-invalid="true"]')?.focus();
    }
  }, [invalidSubmissionCount]);

  const validationErrors = useMemo(
    () => {
      const errors = validateForm(
        {
          targetNet,
          monthlyExpenses,
          monthlyNonDeductibleExpenses,
          billableHours,
          irpfRate,
          selfEmployedFee,
        },
        irpfMode,
        selfEmployedFeeMode,
      );
      if (invalidPastedField && errors[invalidPastedField]) {
        errors[invalidPastedField] = 'El formato del dato pegado no es válido. Pega un solo número y revisa los separadores.';
      }
      return errors;
    },
    [
      targetNet,
      monthlyExpenses,
      monthlyNonDeductibleExpenses,
      billableHours,
      irpfRate,
      selfEmployedFee,
      irpfMode,
      selfEmployedFeeMode,
      invalidPastedField,
    ],
  );

  const showFieldError = (field: FieldName) =>
    (submitted || invalidPastedField === field) && Boolean(validationErrors[field]);
  const parsedHours = parseNumericValue(billableHours);
  const hasValidationErrors = Object.keys(validationErrors).length > 0;
  const showHoursError =
    Boolean(validationErrors.billableHours) &&
    (submitted || invalidPastedField === 'billableHours'
      || (billableHours.trim() !== '' && Number.isFinite(parsedHours) && parsedHours <= 0));

  const calculationKey = getCalculationKey({
    targetNet, monthlyExpenses, monthlyNonDeductibleExpenses, billableHours,
    irpfMode, irpfRate, autonomousCommunity, hasIVA, selfEmployedFeeMode,
    selfEmployedFee, reducedFeePeriod,
  });
  const [calculatedValues, setCalculatedValues] = useState<CalculatorFormValues | null>(() =>
    initiallySubmitted && !hasValidationErrors ? values : null,
  );
  const calculatedKey = calculatedValues ? getCalculationKey(calculatedValues) : null;
  const resultIsCurrent = calculatedKey === calculationKey;

  const result = useMemo(() => {
    if (!calculatedValues) return null;

    return calculateFreelanceBilling({
      targetNet: parseNumericValue(calculatedValues.targetNet),
      monthlyExpenses: parseNumericValue(calculatedValues.monthlyExpenses),
      monthlyNonDeductibleExpenses: parseNumericValue(calculatedValues.monthlyNonDeductibleExpenses),
      billableHours: parseNumericValue(calculatedValues.billableHours),
      irpfRate: parseNumericValue(calculatedValues.irpfRate),
      irpfMode: calculatedValues.irpfMode,
      autonomousCommunity: calculatedValues.autonomousCommunity,
      hasIVA: calculatedValues.hasIVA,
      selfEmployedFee: parseNumericValue(calculatedValues.selfEmployedFee),
      selfEmployedFeeMode: calculatedValues.selfEmployedFeeMode,
      reducedFeePeriod: calculatedValues.reducedFeePeriod,
    });
  }, [calculatedValues]);

  useEffect(() => {
    if (validSubmissionCount > 0) {
      resultRegionRef.current?.focus({ preventScroll: false });
    }
  }, [validSubmissionCount]);

  const setResultRegionRef = useCallback(
    (node: HTMLElement | null) => {
      resultRegionRef.current = node;

      if (node && validSubmissionCount > lastFocusedSubmission.current) {
        lastFocusedSubmission.current = validSubmissionCount;
        window.requestAnimationFrame(() => node.focus({ preventScroll: false }));
      }
    },
    [validSubmissionCount],
  );

  return (
    <div className="calculator-card" id="calculadora">
      <h2>Calculadora</h2>
      <p className="card-intro" id="calculator-intro">
        Introduce tus datos para obtener una referencia orientativa de facturación mensual y una
        tarifa por hora más defendible.
      </p>
      {importedFromCosts && (
        <p className="calculator-import-note" role="status">
          Hemos traído tus costes y horas, con la cuota en modo manual. Este traslado abre un cálculo
          nuevo y no recupera tu escenario anterior. Revisa el neto mensual, el criterio y la comunidad
          de IRPF y el IVA antes de calcular tu tarifa.
        </p>
      )}

      <form
        ref={formRef}
        noValidate
        method="get"
        action="/#calculadora"
        aria-label="Calculadora de facturación"
        aria-describedby="calculator-intro"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);

          if (hasValidationErrors) {
            setInvalidSubmissionCount((count) => count + 1);
          }

          if (!hasValidationErrors) {
            const nextValues: CalculatorFormValues = {
              targetNet: normalizeFieldValue('targetNet', targetNet),
              monthlyExpenses: normalizeFieldValue('monthlyExpenses', monthlyExpenses),
              monthlyNonDeductibleExpenses: normalizeFieldValue(
                'monthlyNonDeductibleExpenses',
                monthlyNonDeductibleExpenses,
              ),
              billableHours: normalizeFieldValue('billableHours', billableHours),
              irpfMode,
              autonomousCommunity,
              irpfRate: normalizeFieldValue('irpfRate', irpfRate),
              hasIVA,
              selfEmployedFeeMode,
              reducedFeePeriod,
              selfEmployedFee: normalizeFieldValue('selfEmployedFee', selfEmployedFee),
            };
            const nextShareUrl = buildCalculatorUrl(nextValues, window.location.href);
            // The result must use exactly the values encoded in its link, including
            // normalization when Enter submits a field without first blurring it.
            setTargetNet(nextValues.targetNet);
            setMonthlyExpenses(nextValues.monthlyExpenses);
            setMonthlyNonDeductibleExpenses(nextValues.monthlyNonDeductibleExpenses);
            setBillableHours(nextValues.billableHours);
            setIrpfRate(nextValues.irpfRate);
            setSelfEmployedFee(nextValues.selfEmployedFee);
            setCalculatedValues(nextValues);

            if (updateUrlOnSubmit) {
              window.history.replaceState(null, '', nextShareUrl);
            }
            if (updateUrlOnSubmit || shareUrl) setShareUrl(nextShareUrl);

            setValidSubmissionCount((currentCount) => currentCount + 1);
          }

          if (!hasValidationErrors && !hasTrackedConversion) {
            trackCalculatorCompleted({
              irpfMode,
              selfEmployedFeeMode,
            });
            if (importedFromCosts) {
              window.va?.('event', { name: 'monthly_costs_tariff_calculated' });
            }
            setHasTrackedConversion(true);
          }
        }}
        className="calculator-form"
      >
        <label>
          <span>Neto mensual deseado (EUR)</span>
          <input
            name="targetNet"
            type="number"
            min="0"
            step="0.01"
            value={targetNet}
            onChange={(event) => updateNumericValue('targetNet', event.target.value, setTargetNet)}
            onPaste={(event) => handleNumericPaste(event, 'targetNet', setTargetNet)}
            onBlur={(event) => setTargetNet(normalizeFieldValue('targetNet', event.target.value))}
            aria-invalid={showFieldError('targetNet')}
            aria-describedby={showFieldError('targetNet') ? 'target-net-error' : undefined}
          />
          {showFieldError('targetNet') && (
            <small className="field-error" id="target-net-error" role="alert">
              {validationErrors.targetNet}
            </small>
          )}
        </label>

        <label>
          <span>Gastos mensuales deducibles (EUR)</span>
          <input
            name="monthlyExpenses"
            type="number"
            min="0"
            step="0.01"
            value={monthlyExpenses}
            onChange={(event) => updateNumericValue('monthlyExpenses', event.target.value, setMonthlyExpenses)}
            onPaste={(event) =>
              handleNumericPaste(event, 'monthlyExpenses', setMonthlyExpenses)
            }
            onBlur={(event) =>
              setMonthlyExpenses(normalizeFieldValue('monthlyExpenses', event.target.value))
            }
            aria-invalid={showFieldError('monthlyExpenses')}
            aria-describedby={
              showFieldError('monthlyExpenses') ? 'monthly-expenses-error' : undefined
            }
          />
          {showFieldError('monthlyExpenses') && (
            <small className="field-error" id="monthly-expenses-error" role="alert">
              {validationErrors.monthlyExpenses}
            </small>
          )}
        </label>

        <label>
          <span>Gastos mensuales no deducibles (EUR)</span>
          <input
            name="monthlyNonDeductibleExpenses"
            type="number"
            min="0"
            step="0.01"
            value={monthlyNonDeductibleExpenses}
            onChange={(event) => updateNumericValue('monthlyNonDeductibleExpenses', event.target.value, setMonthlyNonDeductibleExpenses)}
            onPaste={(event) =>
              handleNumericPaste(event, 'monthlyNonDeductibleExpenses', setMonthlyNonDeductibleExpenses)
            }
            onBlur={(event) =>
              setMonthlyNonDeductibleExpenses(
                normalizeFieldValue('monthlyNonDeductibleExpenses', event.target.value),
              )
            }
            aria-invalid={showFieldError('monthlyNonDeductibleExpenses')}
            aria-describedby={
              showFieldError('monthlyNonDeductibleExpenses')
                ? 'monthly-non-deductible-expenses-error'
                : 'monthly-non-deductible-expenses-hint'
            }
          />
          <small className="field-hint" id="monthly-non-deductible-expenses-hint">
            Costes que pagas pero no descuentas en esta estimación de IRPF. Escribe 0 si no tienes.
          </small>
          {showFieldError('monthlyNonDeductibleExpenses') && (
            <small className="field-error" id="monthly-non-deductible-expenses-error" role="alert">
              {validationErrors.monthlyNonDeductibleExpenses}
            </small>
          )}
        </label>

        <label>
          <span id="billable-hours-label">Horas facturables al mes</span>
          <input
            name="billableHours"
            type="number"
            min="1"
            step="1"
            value={billableHours}
            onChange={(event) => {
              updateNumericValue('billableHours', event.target.value, setBillableHours);
              setAppliedHours(null);
            }}
            onPaste={(event) => {
              handleNumericPaste(event, 'billableHours', setBillableHours);
              setAppliedHours(null);
            }}
            onBlur={(event) => setBillableHours(normalizeFieldValue('billableHours', event.target.value))}
            aria-invalid={showHoursError}
            aria-labelledby="billable-hours-label"
            aria-describedby={`billable-hours-hint${showHoursError ? ' billable-hours-error' : ''}`}
          />
          <small className="field-hint" id="billable-hours-hint">
            Horas que prevés cobrar, no toda tu jornada. Si aún no lo sabes, estima tu agenda debajo.
          </small>
          {showHoursError && validationErrors.billableHours && (
            <small className="field-error" id="billable-hours-error" role="alert">
              {validationErrors.billableHours}
            </small>
          )}
        </label>
        <BillableHoursPlanner onApply={(hours) => {
          setBillableHours(String(hours));
          setAppliedHours(hours);
          setSubmitted(false);
          setShareUrl('');
          formRef.current?.querySelector<HTMLInputElement>('[name="billableHours"]')?.focus();
        }} />
        {appliedHours !== null && !submitted ? (
          <p className="form-note" role="status">
            Aplicadas {appliedHours} h/mes. Tus otros datos se mantienen; calcula de nuevo tu tarifa.
          </p>
        ) : null}

        <label>
          <span>Cómo quieres estimar el IRPF</span>
          <select
            name="irpfMode"
            value={irpfMode}
            onChange={(event) => setIrpfMode(event.target.value as IrpfMode)}
          >
            <option value="progressive">Estimación progresiva simplificada</option>
            <option value="manual">Porcentaje manual</option>
          </select>
          <small className="field-hint">
            {irpfMode === 'progressive' &&
              'Usamos una estimación anual por tramos sobre beneficio, con mínimo personal estatal y una aproximación simplificada de la parte autonómica.'}
            {irpfMode === 'manual' &&
              'Usaremos exactamente el porcentaje de IRPF que indiques para la simulación.'}
          </small>
        </label>

        {irpfMode === 'progressive' && (
          <label>
            <span>Comunidad autónoma para el IRPF</span>
            <select
              name="autonomousCommunity"
              value={autonomousCommunity}
              onChange={(event) => setAutonomousCommunity(event.target.value as AutonomousCommunity)}
            >
              {Object.entries(AUTONOMOUS_COMMUNITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <small className="field-hint">
              Territorio común mantiene una aproximación general. Madrid, Cataluña, Andalucía y
              Comunitat Valenciana usan escalas autonómicas específicas de 2026.
            </small>
          </label>
        )}

        {irpfMode === 'manual' && (
          <label>
            <span>IRPF manual (%)</span>
            <input
              name="irpfRate"
              type="number"
              min="0"
              max="99"
              step="0.1"
              value={irpfRate}
              onChange={(event) => updateNumericValue('irpfRate', event.target.value, setIrpfRate)}
              onPaste={(event) => handleNumericPaste(event, 'irpfRate', setIrpfRate)}
              onBlur={(event) => setIrpfRate(normalizeFieldValue('irpfRate', event.target.value))}
              aria-invalid={showFieldError('irpfRate')}
              aria-describedby={showFieldError('irpfRate') ? 'irpf-rate-error' : undefined}
            />
            {showFieldError('irpfRate') && (
              <small className="field-error" id="irpf-rate-error" role="alert">
                {validationErrors.irpfRate}
              </small>
            )}
          </label>
        )}

        <label>
          <span>Cómo quieres calcular la cuota de autónomos</span>
          <select
            name="selfEmployedFeeMode"
            value={selfEmployedFeeMode}
            onChange={(event) => setSelfEmployedFeeMode(event.target.value as SelfEmployedFeeMode)}
          >
            <option value="auto">Estimar según tramo 2026</option>
            <option value="reduced">Tarifa reducida / nuevo autónomo</option>
            <option value="manual">Indicar cuota manual</option>
          </select>
          <small className="field-hint">
            {selfEmployedFeeMode === 'auto' &&
              'Estimamos una cuota mínima orientativa según el tramo de rendimientos netos mensuales de 2026.'}
            {selfEmployedFeeMode === 'reduced' &&
              `Usamos ${formatCurrency(REDUCED_FEE_2026)} al mes, con MEI incluido, según el total publicado por Importass. Si tu recibo es distinto, indica la cuota manual.`}
            {selfEmployedFeeMode === 'manual' &&
              'Usaremos exactamente la cuota que indiques para la simulación.'}
          </small>
        </label>

        {selfEmployedFeeMode === 'reduced' && (
          <label>
            <span>Período de la tarifa reducida</span>
            <select
              name="reducedFeePeriod"
              value={reducedFeePeriod}
              onChange={(event) => setReducedFeePeriod(event.target.value as ReducedFeePeriod)}
            >
              <option value="initial">Primeros 12 meses</option>
              <option value="extended">Prórroga 12 meses si sigues por debajo del SMI</option>
            </select>
            <small className="field-hint">
              Comparamos rendimientos anuales estimados con el SMI de 2026: {formatCurrency(ANNUAL_SMI_2026)} al año. No es el neto que deseas conservar ni tu facturación.
            </small>
          </label>
        )}

        {selfEmployedFeeMode === 'manual' && (
          <label>
            <span>Cuota manual de autónomos (EUR)</span>
            <input
              name="selfEmployedFee"
              type="number"
              min="0.01"
              step="0.01"
              value={selfEmployedFee}
              onChange={(event) => updateNumericValue('selfEmployedFee', event.target.value, setSelfEmployedFee)}
              onPaste={(event) =>
                handleNumericPaste(event, 'selfEmployedFee', setSelfEmployedFee)
              }
              onBlur={(event) =>
                setSelfEmployedFee(normalizeFieldValue('selfEmployedFee', event.target.value))
              }
              aria-invalid={showFieldError('selfEmployedFee')}
              aria-describedby={
                showFieldError('selfEmployedFee') ? 'self-employed-fee-error' : undefined
              }
            />
            {showFieldError('selfEmployedFee') && (
              <small className="field-error" id="self-employed-fee-error" role="alert">
                {validationErrors.selfEmployedFee}
              </small>
            )}
          </label>
        )}

        <fieldset className="radio-group" aria-describedby="calculator-vat-help">
          <legend>¿Quieres simular IVA al 21 %?</legend>
          <label>
            <input
              type="radio"
              name="hasIVA"
              value="yes"
              checked={hasIVA}
              onChange={() => setHasIVA(true)}
            />
            Sí
          </label>
          <label>
            <input
              type="radio"
              name="hasIVA"
              value="no"
              checked={!hasIVA}
              onChange={() => setHasIVA(false)}
            />
            No
          </label>
          <p className="form-note" id="calculator-vat-help">
            Solo se simula el 21 % o sin IVA. Comprueba el tipo aplicable a tu actividad.
            El IVA va aparte del neto.
          </p>
        </fieldset>

        <button type="submit" className="primary-button">
          Calcular mi tarifa orientativa
        </button>
        <p className="form-note">Puedes probar varios escenarios sin registrarte.</p>
        {calculatedValues ? (
          <p className="form-note">
            Los datos de las ayudas del resultado se conservan mientras editas y vuelves a los
            valores calculados. Si calculas con valores distintos, las ayudas empiezan de nuevo.
            No se guardan al salir de la página ni se incluyen en el enlace compartido.
          </p>
        ) : null}

        {submitted && !hasValidationErrors && !resultIsCurrent ? (
          <p className="form-note calculator-import-note" role="status">
            Hay cambios sin calcular. Pulsa «Calcular mi tarifa orientativa» para actualizar
            el resultado y el enlace para compartir.
          </p>
        ) : null}

        {submitted && hasValidationErrors && (
          <p className="form-message" role="alert">
            Revisa los campos marcados antes de calcular.
          </p>
        )}
      </form>

      {submitted && !hasValidationErrors && (
        <>
          {trackServerConversion && (
            <script
              dangerouslySetInnerHTML={{
                __html: `window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};window.va('event',${JSON.stringify(
                  {
                    name: 'calculator_completed',
                    data: {
                      irpfMode,
                      selfEmployedFeeMode,
                    },
                  },
                )});`,
              }}
            />
          )}
        </>
      )}
      {/* Preserve drafts against transient edits without exposing a stale result.
          A confirmed different scenario starts fresh helpers, as before. */}
      <Activity mode={submitted && !hasValidationErrors && resultIsCurrent ? 'visible' : 'hidden'}>
        {result && calculatedValues ? (
          <ResultCard
            key={calculatedKey}
            ref={setResultRegionRef}
            result={result}
            hoursBillable={parseNumericValue(calculatedValues.billableHours)}
            hasIVA={calculatedValues.hasIVA}
            enableCopy={enableResultCopy}
            shareUrl={shareUrl}
          />
        ) : null}
      </Activity>
    </div>
  );
}
