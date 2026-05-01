'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ResultCard from '@/components/ResultCard';
import {
  AUTONOMOUS_COMMUNITY_LABELS,
  type AutonomousCommunity,
  calculateFreelanceBilling,
  type IrpfMode,
  type ReducedFeePeriod,
  type SelfEmployedFeeMode,
} from '@/lib/calculator';

type FieldName =
  | 'targetNet'
  | 'monthlyExpenses'
  | 'billableHours'
  | 'irpfRate'
  | 'selfEmployedFee';

type FormErrors = Partial<Record<FieldName, string>>;

export type CalculatorFormValues = {
  targetNet: string;
  monthlyExpenses: string;
  billableHours: string;
  irpfMode: IrpfMode;
  autonomousCommunity: AutonomousCommunity;
  irpfRate: string;
  hasIVA: boolean;
  selfEmployedFeeMode: SelfEmployedFeeMode;
  reducedFeePeriod: ReducedFeePeriod;
  selfEmployedFee: string;
};

type CalculatorFormProps = {
  initialValues?: Partial<CalculatorFormValues>;
  initiallySubmitted?: boolean;
  enableResultCopy?: boolean;
  trackServerConversion?: boolean;
};

const DEFAULT_FORM_VALUES: CalculatorFormValues = {
  targetNet: '1500',
  monthlyExpenses: '200',
  billableHours: '80',
  irpfMode: 'progressive',
  autonomousCommunity: 'common',
  irpfRate: '15',
  hasIVA: true,
  selfEmployedFeeMode: 'auto',
  reducedFeePeriod: 'initial',
  selfEmployedFee: '0',
};

declare global {
  interface Window {
    va?: (
      command: 'event',
      payload: {
        name: string;
        data?: Record<string, string>;
      },
    ) => void;
  }
}

function parseNumericValue(value: string) {
  const normalizedValue = value.replace(',', '.').trim();

  if (normalizedValue === '') {
    return Number.NaN;
  }

  return Number(normalizedValue);
}

function formatNormalizedNumber(value: number, maximumFractionDigits = 2) {
  return value.toLocaleString('en-US', {
    useGrouping: false,
    maximumFractionDigits,
  });
}

function normalizeFieldValue(field: FieldName, value: string) {
  const parsedValue = parseNumericValue(value);

  if (!Number.isFinite(parsedValue)) {
    return value.trim() === '' ? '' : value;
  }

  switch (field) {
    case 'targetNet':
      return formatNormalizedNumber(Math.max(0, parsedValue));
    case 'monthlyExpenses':
      return formatNormalizedNumber(Math.max(0, parsedValue));
    case 'billableHours':
      return formatNormalizedNumber(Math.max(0, Math.round(parsedValue)), 0);
    case 'irpfRate':
      return formatNormalizedNumber(Math.min(99, Math.max(0, parsedValue)), 1);
    case 'selfEmployedFee':
      return formatNormalizedNumber(Math.max(0, parsedValue));
  }
}

function trackCalculatorCompleted(data: Record<string, string>) {
  window.va?.('event', {
    name: 'calculator_completed',
    data,
  });
}

function getFieldError(field: FieldName, value: string) {
  const parsedValue = parseNumericValue(value);

  if (value.trim() === '') {
    switch (field) {
      case 'targetNet':
        return 'Indica tu neto mensual deseado.';
      case 'monthlyExpenses':
        return 'Indica tus gastos mensuales deducibles.';
      case 'billableHours':
        return 'Indica tus horas facturables al mes.';
      case 'irpfRate':
        return 'Indica el porcentaje de IRPF.';
      case 'selfEmployedFee':
        return 'Indica una cuota estimada de autónomos.';
    }
  }

  if (!Number.isFinite(parsedValue)) {
    switch (field) {
      case 'billableHours':
        return 'Introduce un número válido de horas.';
      case 'irpfRate':
        return 'Introduce un porcentaje válido.';
      default:
        return 'Introduce un importe válido.';
    }
  }

  if (field === 'billableHours' && parsedValue <= 0) {
    return 'Las horas facturables deben ser mayores que 0.';
  }

  if (field === 'billableHours' && !Number.isInteger(parsedValue)) {
    return 'Las horas facturables deben ser un número entero.';
  }

  if (field === 'targetNet' && parsedValue <= 0) {
    return 'El neto mensual debe ser mayor que 0.';
  }

  if (field === 'irpfRate' && parsedValue >= 100) {
    return 'El IRPF debe ser menor que 100.';
  }

  if (parsedValue < 0) {
    switch (field) {
      case 'targetNet':
        return 'El neto mensual no puede ser negativo.';
      case 'monthlyExpenses':
        return 'Los gastos mensuales no pueden ser negativos.';
      case 'billableHours':
        return 'Las horas facturables no pueden ser negativas.';
      case 'irpfRate':
        return 'El IRPF no puede ser negativo.';
      case 'selfEmployedFee':
        return 'La cuota de autónomos no puede ser negativa.';
    }
  }

  return '';
}

function validateForm(
  values: Record<FieldName, string>,
  irpfMode: IrpfMode,
  selfEmployedFeeMode: SelfEmployedFeeMode,
): FormErrors {
  const nextErrors: FormErrors = {};

  (Object.keys(values) as FieldName[]).forEach((field) => {
    if (field === 'irpfRate' && irpfMode !== 'manual') {
      return;
    }

    if (field === 'selfEmployedFee' && selfEmployedFeeMode !== 'manual') {
      return;
    }

    const error = getFieldError(field, values[field]);

    if (field === 'selfEmployedFee' && selfEmployedFeeMode === 'manual' && !error) {
      const parsedValue = parseNumericValue(values[field]);

      if (parsedValue <= 0) {
        nextErrors[field] = 'La cuota manual debe ser mayor que 0.';
      }

      return;
    }

    if (error) {
      nextErrors[field] = error;
    }
  });

  return nextErrors;
}

export default function CalculatorForm({
  initialValues,
  initiallySubmitted = false,
  enableResultCopy = true,
  trackServerConversion = false,
}: CalculatorFormProps = {}) {
  const values = { ...DEFAULT_FORM_VALUES, ...initialValues };
  const [targetNet, setTargetNet] = useState(values.targetNet);
  const [monthlyExpenses, setMonthlyExpenses] = useState(values.monthlyExpenses);
  const [billableHours, setBillableHours] = useState(values.billableHours);
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
  const [hasTrackedConversion, setHasTrackedConversion] = useState(initiallySubmitted);
  const [validSubmissionCount, setValidSubmissionCount] = useState(0);
  const resultRegionRef = useRef<HTMLElement | null>(null);

  const validationErrors = useMemo(
    () =>
      validateForm(
        {
          targetNet,
          monthlyExpenses,
          billableHours,
          irpfRate,
          selfEmployedFee,
        },
        irpfMode,
        selfEmployedFeeMode,
      ),
    [
      targetNet,
      monthlyExpenses,
      billableHours,
      irpfRate,
      selfEmployedFee,
      irpfMode,
      selfEmployedFeeMode,
    ],
  );

  const parsedHours = parseNumericValue(billableHours);
  const hasValidationErrors = Object.keys(validationErrors).length > 0;
  const showHoursError =
    Boolean(validationErrors.billableHours) &&
    (submitted || (billableHours.trim() !== '' && Number.isFinite(parsedHours) && parsedHours <= 0));

  const result = useMemo(() => {
    return calculateFreelanceBilling({
      targetNet: parseNumericValue(targetNet),
      monthlyExpenses: parseNumericValue(monthlyExpenses),
      billableHours: parseNumericValue(billableHours),
      irpfRate: parseNumericValue(irpfRate),
      irpfMode,
      autonomousCommunity,
      hasIVA,
      selfEmployedFee: parseNumericValue(selfEmployedFee),
      selfEmployedFeeMode,
      reducedFeePeriod,
    });
  }, [
    targetNet,
    monthlyExpenses,
    billableHours,
    irpfRate,
    irpfMode,
    autonomousCommunity,
    hasIVA,
    selfEmployedFee,
    selfEmployedFeeMode,
    reducedFeePeriod,
  ]);

  useEffect(() => {
    if (validSubmissionCount > 0) {
      resultRegionRef.current?.focus({ preventScroll: false });
    }
  }, [validSubmissionCount]);

  const setResultRegionRef = useCallback(
    (node: HTMLElement | null) => {
      resultRegionRef.current = node;

      if (node && validSubmissionCount > 0) {
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

      <form
        noValidate
        method="get"
        action="/#calculadora"
        aria-label="Calculadora de facturación"
        aria-describedby="calculator-intro"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);

          if (!hasValidationErrors) {
            setValidSubmissionCount((currentCount) => currentCount + 1);
          }

          if (!hasValidationErrors && !hasTrackedConversion) {
            trackCalculatorCompleted({
              irpfMode,
              selfEmployedFeeMode,
            });
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
            onChange={(event) => setTargetNet(event.target.value)}
            onBlur={(event) => setTargetNet(normalizeFieldValue('targetNet', event.target.value))}
            aria-invalid={submitted && Boolean(validationErrors.targetNet)}
            aria-describedby={submitted && validationErrors.targetNet ? 'target-net-error' : undefined}
          />
          {submitted && validationErrors.targetNet && (
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
            onChange={(event) => setMonthlyExpenses(event.target.value)}
            onBlur={(event) =>
              setMonthlyExpenses(normalizeFieldValue('monthlyExpenses', event.target.value))
            }
            aria-invalid={submitted && Boolean(validationErrors.monthlyExpenses)}
            aria-describedby={
              submitted && validationErrors.monthlyExpenses ? 'monthly-expenses-error' : undefined
            }
          />
          {submitted && validationErrors.monthlyExpenses && (
            <small className="field-error" id="monthly-expenses-error" role="alert">
              {validationErrors.monthlyExpenses}
            </small>
          )}
        </label>

        <label>
          <span>Horas facturables al mes</span>
          <input
            name="billableHours"
            type="number"
            min="1"
            step="1"
            value={billableHours}
            onChange={(event) => setBillableHours(event.target.value)}
            onBlur={(event) => setBillableHours(normalizeFieldValue('billableHours', event.target.value))}
            aria-invalid={showHoursError}
            aria-describedby={showHoursError ? 'billable-hours-error' : undefined}
          />
          {showHoursError && validationErrors.billableHours && (
            <small className="field-error" id="billable-hours-error" role="alert">
              {validationErrors.billableHours}
            </small>
          )}
        </label>

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
              onChange={(event) => setIrpfRate(event.target.value)}
              onBlur={(event) => setIrpfRate(normalizeFieldValue('irpfRate', event.target.value))}
              aria-invalid={submitted && Boolean(validationErrors.irpfRate)}
              aria-describedby={submitted && validationErrors.irpfRate ? 'irpf-rate-error' : undefined}
            />
            {submitted && validationErrors.irpfRate && (
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
              'Aplicamos una tarifa reducida de 80 EUR al mes y distinguimos entre el tramo inicial y su posible prórroga.'}
            {selfEmployedFeeMode === 'manual' &&
              'Usaremos exactamente la cuota que indiques para la simulación.'}
          </small>
        </label>

        {selfEmployedFeeMode === 'reduced' && (
          <label>
            <span>Periodo de la tarifa reducida</span>
            <select
              name="reducedFeePeriod"
              value={reducedFeePeriod}
              onChange={(event) => setReducedFeePeriod(event.target.value as ReducedFeePeriod)}
            >
              <option value="initial">Primeros 12 meses</option>
              <option value="extended">Prórroga 12 meses si sigues por debajo del SMI</option>
            </select>
            <small className="field-hint">
              Usamos como referencia el SMI de 2026, fijado en 1.221 EUR al mes.
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
              onChange={(event) => setSelfEmployedFee(event.target.value)}
              onBlur={(event) =>
                setSelfEmployedFee(normalizeFieldValue('selfEmployedFee', event.target.value))
              }
              aria-invalid={submitted && Boolean(validationErrors.selfEmployedFee)}
              aria-describedby={
                submitted && validationErrors.selfEmployedFee ? 'self-employed-fee-error' : undefined
              }
            />
            {submitted && validationErrors.selfEmployedFee && (
              <small className="field-error" id="self-employed-fee-error" role="alert">
                {validationErrors.selfEmployedFee}
              </small>
            )}
          </label>
        )}

        <fieldset className="radio-group">
          <legend>¿Tu actividad suele incluir IVA?</legend>
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
        </fieldset>

        <button type="submit" className="primary-button">
          Calcular mi tarifa orientativa
        </button>
        <p className="form-note">Puedes probar varios escenarios sin registrarte.</p>

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
          <ResultCard
            ref={setResultRegionRef}
            result={result}
            hoursBillable={parsedHours}
            hasIVA={hasIVA}
            enableCopy={enableResultCopy}
          />
        </>
      )}
    </div>
  );
}
