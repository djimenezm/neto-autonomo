'use client';

import { useEffect, useRef, useState } from 'react';
import NumericTextInput from '@/components/NumericTextInput';
import { AUTONOMOUS_COMMUNITY_LABELS } from '@/lib/calculator';
import { DEFAULT_FORM_VALUES } from '@/lib/calculatorForm';
import { formatCurrency as formatEuro, formatNumber } from '@/lib/format';
import { parseSpanishNumber } from '@/lib/spanishNumber';
import { estimateRecurringCosts, expenseFields, paymentPeriods, recurringCostsExample, roundCostToCents, type PaymentPeriod, type ExpenseKey } from '@/lib/recurringCosts';
import styles from './MonthlyCostCalculator.module.css';

const costFields = [
  { key: 'fee', label: 'Cuota de autónomos' },
  ...expenseFields,
] as const;

type CostKey = (typeof costFields)[number]['key'];
type CostValues = Record<CostKey | 'hours', string>;
type CostPeriods = Record<ExpenseKey, PaymentPeriod>;
type CostDraft = { values: CostValues; periods: CostPeriods; deductibleExpenses: string };

const emptyValues: CostValues = { fee: '', advisor: '', software: '', insurance: '', other: '', hours: '' };
const monthlyPeriods: CostPeriods = { advisor: 'monthly', software: 'monthly', insurance: 'monthly', other: 'monthly' };
const euroUnitError = 'Introduce un importe en euros. Puedes usar € o EUR.';

const initialValues: CostValues = {
  fee: String(recurringCostsExample.fee),
  advisor: String(recurringCostsExample.expenses.advisor.amount),
  software: String(recurringCostsExample.expenses.software.amount),
  insurance: String(recurringCostsExample.expenses.insurance.amount),
  other: String(recurringCostsExample.expenses.other.amount),
  hours: '80',
};

function parseCost(value: string) {
  return value.trim() === '' ? 0 : parseSpanishNumber(value, 'EUR');
}

function hasMismatchedUnit(value: string, parsed: number) {
  return Number.isNaN(parsed) && Number.isFinite(parseSpanishNumber(value));
}

export default function MonthlyCostCalculator() {
  const [values, setValues] = useState<CostValues>(initialValues);
  const [periods, setPeriods] = useState<CostPeriods>({
    advisor: recurringCostsExample.expenses.advisor.period,
    software: recurringCostsExample.expenses.software.period,
    insurance: recurringCostsExample.expenses.insurance.period,
    other: recurringCostsExample.expenses.other.period,
  });
  const [deductibleExpenses, setDeductibleExpenses] = useState('');
  const [transferAttempted, setTransferAttempted] = useState(false);
  const [costsBeforeStart, setCostsBeforeStart] = useState<CostDraft | null>(null);
  const [draftFeedback, setDraftFeedback] = useState('');
  const [draftActionCount, setDraftActionCount] = useState(0);
  const feeInput = useRef<HTMLInputElement>(null);
  const hoursInput = useRef<HTMLInputElement>(null);
  const deductibleInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (draftActionCount === 0 || !feeInput.current) return;
    // Recovery controls change the height above the field. Focus after commit,
    // then keep the input clear of the sticky header, including on narrow screens.
    feeInput.current.focus({ preventScroll: true });
    feeInput.current.scrollIntoView?.({ block: 'center', behavior: 'instant' });
  }, [draftActionCount]);
  const payments = {
    fee: parseCost(values.fee),
    advisor: parseCost(values.advisor),
    software: parseCost(values.software),
    insurance: parseCost(values.insurance),
    other: parseCost(values.other),
  };
  const costs = estimateRecurringCosts({
    fee: payments.fee,
    expenses: {
      advisor: { amount: payments.advisor, period: periods.advisor },
      software: { amount: payments.software, period: periods.software },
      insurance: { amount: payments.insurance, period: periods.insurance },
      other: { amount: payments.other, period: periods.other },
    },
  });
  const hours = parseSpanishNumber(values.hours, 'none');
  const fee = costs.valid ? costs.monthlyFee : 0;
  const validHours = Number.isFinite(hours) && hours > 0;
  const transferHoursValid = validHours && Number.isInteger(hours);
  const hoursUnitError = hasMismatchedUnit(values.hours, hours)
    ? 'Escribe solo el número de horas, sin moneda ni porcentaje.'
    : null;
  const hoursError = !validHours && (values.hours.trim() !== '' || transferAttempted)
    ? hoursUnitError ?? 'Indica un número válido de horas mayor que cero.'
    : transferAttempted && validHours && !Number.isInteger(hours)
      ? 'Usa un número entero de horas mayor que cero para trasladar este cálculo.'
      : null;
  const monthlyTotal = costs.valid ? costs.monthlyTotal : 0;
  const otherCosts = costs.valid ? costs.monthlyOtherCosts : 0;
  const parsedDeductibleAmount = parseSpanishNumber(deductibleExpenses, 'EUR');
  const deductibleCents = roundCostToCents(parsedDeductibleAmount);
  const otherCostCents = roundCostToCents(otherCosts);
  const deductibleAmount = deductibleCents / 100;
  const validDeductibleAmount =
    deductibleExpenses.trim() !== '' &&
    Number.isSafeInteger(deductibleCents) &&
    parsedDeductibleAmount >= 0 &&
    deductibleCents <= otherCostCents;
  const nonDeductibleAmount = validDeductibleAmount ? (otherCostCents - deductibleCents) / 100 : 0;
  const canTransfer = costs.valid && fee > 0 && transferHoursValid && validDeductibleAmount;
  const feeTransferError = transferAttempted && costs.valid && fee <= 0
    ? 'Indica una cuota mensual mayor que cero para trasladar este cálculo.'
    : null;
  const deductibleUnitError = hasMismatchedUnit(deductibleExpenses, parsedDeductibleAmount) ? euroUnitError : null;
  const deductibleError = deductibleUnitError ?? (transferAttempted && costs.valid && !validDeductibleAmount
    ? `Indica un importe deducible entre 0 y ${formatEuro(otherCosts)}.`
    : null);

  function updateValue(key: keyof CostValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function startOwnCosts() {
    setCostsBeforeStart((previous) => previous ?? {
      values: { ...values }, periods: { ...periods }, deductibleExpenses,
    });
    setValues(emptyValues);
    setPeriods(monthlyPeriods);
    setDeductibleExpenses('');
    setTransferAttempted(false);
    setDraftFeedback('Campos preparados. Añade tus pagos y revisa las frecuencias.');
    setDraftActionCount((count) => count + 1);
  }

  function recoverCosts() {
    if (!costsBeforeStart) return;
    setValues(costsBeforeStart.values);
    setPeriods(costsBeforeStart.periods);
    setDeductibleExpenses(costsBeforeStart.deductibleExpenses);
    setCostsBeforeStart(null);
    setTransferAttempted(false);
    setDraftFeedback('Costes anteriores recuperados. Los totales se actualizan con esos datos.');
    setDraftActionCount((count) => count + 1);
  }

  return (
    <div className={`calculator-card monthly-cost-card ${styles.calculator}`} id="costes-mensuales">
      <h2>Calcula tus costes fijos</h2>
      <p className="card-intro">
        Los valores iniciales son un ejemplo ficticio editable. Escribe el importe de cada pago y elige su frecuencia.
        Puedes escribir los importes en euros con € o EUR.
        La cuota sigue siendo mensual. Cambiar la frecuencia no cambia el importe escrito.
        Redondeamos cada pago a céntimos antes de aplicar su frecuencia.
      </p>
      <noscript><p>Para cambiar los pagos necesitas JavaScript. Más abajo tienes el ejemplo completo y la cuenta para hacer el reparto a mano.</p></noscript>

      <div className={styles.draftControls}>
        <div className="button-row">
          <button type="button" className="secondary-button" onClick={startOwnCosts} aria-describedby="monthly-cost-start-hint">Empezar con mis costes</button>
          {costsBeforeStart ? <button type="button" className="link-button" onClick={recoverCosts} aria-describedby="monthly-cost-recovery-hint">Recuperar mis costes anteriores</button> : null}
        </div>
        <p className="form-note" id="monthly-cost-start-hint">
          Vacía importes, horas y deducibles; deja las cuatro frecuencias en «Cada mes». Los importes vacíos cuentan como 0.
        </p>
        {costsBeforeStart ? <p className="form-note" id="monthly-cost-recovery-hint">Puedes recuperar los datos anteriores al primer inicio, incluso incompletos. Recuperarlos sustituye los actuales. Repetir el inicio conserva esta copia, que se pierde al salir o recargar.</p> : null}
        <div role="status" aria-label="Preparación de costes" aria-live="polite" aria-atomic="true">
          {draftFeedback ? <p className="form-note">{draftFeedback}</p> : null}
        </div>
      </div>

      <div className="monthly-cost-inputs">
        {costFields.map(({ key, label }) => {
          const paymentError = hasMismatchedUnit(values[key], payments[key])
            ? euroUnitError
            : !costs.valid ? costs.errors[key] : undefined;
          const invalid = Boolean(paymentError);
          const transferError = key === 'fee' ? feeTransferError : null;

          return (
            <fieldset key={key} className={styles.costField}>
              <legend id={`monthly-cost-${key}-label`}>{label}</legend>
              <div className={styles.paymentRow}>
                <label htmlFor={`monthly-cost-${key}`}>
                  <span>Importe de cada pago</span>
                  <span className="monthly-cost-input-wrap">
                    <NumericTextInput
                      ref={key === 'fee' ? feeInput : undefined}
                      id={`monthly-cost-${key}`}
                      inputMode="decimal"
                      value={values[key]}
                      onValueChange={(nextValue) => updateValue(key, nextValue)}
                      aria-invalid={invalid || Boolean(transferError)}
                      aria-labelledby={`monthly-cost-${key}-label`}
                      aria-describedby={invalid ? `monthly-cost-${key}-payment-error` : transferError ? 'monthly-cost-fee-error' : undefined}
                    />
                    <span aria-hidden="true">{key === 'fee' ? '€ / mes' : '€ / pago'}</span>
                  </span>
                  {paymentError ? <small className="field-error" id={`monthly-cost-${key}-payment-error`} role="alert">{paymentError}</small> : null}
                  {transferError ? <small className="field-error" id="monthly-cost-fee-error" role="alert">{transferError}</small> : null}
                </label>
                {key !== 'fee' ? (
                  <label htmlFor={`monthly-cost-${key}-period`}>
                    <span>Frecuencia</span>
                    <select
                      id={`monthly-cost-${key}-period`}
                      aria-label={`Frecuencia de ${label.toLocaleLowerCase('es-ES')}`}
                      value={periods[key]}
                      onChange={(event) => setPeriods((current) => ({ ...current, [key]: event.target.value as PaymentPeriod }))}
                    >
                      {paymentPeriods.map((period) => <option key={period.value} value={period.value}>{period.label}</option>)}
                    </select>
                  </label>
                ) : <p className={styles.feeNote}>Usa tu cuota mensual real; no se estima con esta suma.</p>}
              </div>
            </fieldset>
          );
        })}
        <label htmlFor="monthly-cost-hours">
          <span id="monthly-cost-hours-label">Horas facturables al mes</span>
          <span className="monthly-cost-input-wrap">
            <NumericTextInput
              ref={hoursInput}
              id="monthly-cost-hours"
              inputMode="numeric"
              value={values.hours}
              onValueChange={(nextValue) => updateValue('hours', nextValue)}
              aria-labelledby="monthly-cost-hours-label"
              aria-invalid={Boolean(hoursError)}
              aria-describedby={`monthly-cost-hours-hint${hoursError ? ' monthly-cost-hours-error' : ''}`}
            />
            <span aria-hidden="true">h / mes</span>
          </span>
          <small className="field-hint" id="monthly-cost-hours-hint">
            No necesitas horas para sumar los costes. Para ver el coste por hora, indica horas
            mayores que cero; para trasladar los datos, deben ser enteras.
          </small>
          {hoursError ? (
            <small className="field-error" id="monthly-cost-hours-error" role="alert">{hoursError}</small>
          ) : null}
        </label>
      </div>

      {!costs.valid && (
        <p className="monthly-cost-error" id="monthly-cost-error" role="alert">
          Introduce importes de pago válidos, iguales o mayores que cero.
        </p>
      )}

      {costs.valid && (
        <div className="monthly-cost-results" aria-live="polite">
          <div className="monthly-cost-total">
            <span>Media mensual antes de pagarte</span>
            <strong>{formatEuro(monthlyTotal)}</strong>
          </div>
          <dl className="monthly-cost-stats">
            <div><dt>Al año según las frecuencias</dt><dd>{formatEuro(costs.valid ? costs.annualTotal : 0)}</dd></div>
            {validHours ? <div><dt>Por hora facturable</dt><dd>{formatEuro(monthlyTotal / hours)}/h</dd></div> : null}
          </dl>
          {!validHours ? <p>Añade tus horas cuando las conozcas para ver el coste por hora. La suma mensual y anual no depende de ellas.</p> : null}
          <p>La media reparte el coste anual entre 12 meses; no indica cuándo vence cada recibo. No se aparta dinero automáticamente.</p>
          {costs.valid ? (
            <details className={styles.breakdown}>
              <summary>Ver cómo se reparte el coste anual</summary>
              <div className={styles.tableScroll} role="region" aria-label="Desglose de pagos de actividad" tabIndex={0}>
                <table>
                  <caption>Pagos en un año completo.</caption>
                  <thead><tr><th scope="col">Concepto</th><th scope="col">Cada pago</th><th scope="col">Pagos/año</th><th scope="col">Al año</th></tr></thead>
                  <tbody>{costs.lines.map((line) => <tr key={line.key}><th scope="row">{line.label}</th><td>{formatEuro(line.amountPerPayment)}</td><td>{line.paymentsPerYear}</td><td>{formatEuro(line.annualAmount)}</td></tr>)}</tbody>
                </table>
              </div>
            </details>
          ) : null}
          <p>
            Esta suma no añade sueldo, IRPF ni IVA a los importes que has escrito. Tampoco implica que todos los gastos sean
            deducibles: compruébalo para tu actividad antes de trasladarlos a una previsión fiscal.
          </p>

          <form
            className="monthly-cost-transfer"
            action="/#calculadora"
            method="get"
            noValidate
            onSubmit={(event) => {
              if (!canTransfer) {
                event.preventDefault();
                setTransferAttempted(true);
                if (fee <= 0) feeInput.current?.focus();
                else if (!transferHoursValid) hoursInput.current?.focus();
                else if (!validDeductibleAmount) deductibleInput.current?.focus();
              }
            }}
          >
            <h3>Calcula tu tarifa con estos costes</h3>
            <p>
              Trasladaremos las medias mensuales, redondeadas a céntimos. La cuota de {formatEuro(fee)} se añadirá por separado.
              De los otros {formatEuro(otherCosts)} al mes, indica cuánto has comprobado que puedes deducir para tu previsión.
            </p>
            <p className="form-note" id="monthly-cost-transfer-scenario">
              Abriremos un cálculo nuevo. Este traslado no recupera el escenario que tuvieras antes.
              {' '}El punto de partida será {formatEuro(Number(DEFAULT_FORM_VALUES.targetNet))} netos al mes,
              {' '}{DEFAULT_FORM_VALUES.irpfMode === 'progressive'
                ? 'estimación progresiva de IRPF'
                : `reserva manual de IRPF del ${formatNumber(Number(DEFAULT_FORM_VALUES.irpfRate))} %`}
              {' '}en {AUTONOMOUS_COMMUNITY_LABELS[DEFAULT_FORM_VALUES.autonomousCommunity]} y
              {' '}{DEFAULT_FORM_VALUES.hasIVA ? 'IVA simulado al 21 %' : 'sin IVA'}.
              {' '}Revisa el neto, el criterio de IRPF, la comunidad y el IVA antes de calcular tu tarifa.
            </p>
            <label htmlFor="deductible-expenses">
              <span id="deductible-expenses-label">Gastos deducibles, sin incluir la cuota</span>
              <span className="monthly-cost-input-wrap">
                <NumericTextInput
                  ref={deductibleInput}
                  id="deductible-expenses"
                  inputMode="decimal"
                  value={deductibleExpenses}
                  onValueChange={setDeductibleExpenses}
                  aria-labelledby="deductible-expenses-label"
                  aria-invalid={Boolean(deductibleError)}
                  aria-describedby={`deductible-expenses-hint${deductibleError ? ' deductible-expenses-error' : ''}`}
                />
                <span aria-hidden="true">€ / mes</span>
              </span>
              {deductibleError ? <small className="field-error" id="deductible-expenses-error" role="alert">{deductibleError}</small> : null}
            </label>
            <p id="deductible-expenses-hint">
              Escribe 0 si ninguno es deducible. El resto también se cubrirá con la tarifa, sin descontarlo del IRPF.
              El importe deducible se redondea a céntimos.
            </p>
            {canTransfer ? (
              <p className="form-note" role="status" aria-label="Datos que se trasladarán a la tarifa">
                Se trasladarán {formatEuro(deductibleAmount)} de gastos deducibles,
                {' '}{formatEuro(nonDeductibleAmount)} de costes no deducibles y
                {' '}{formatEuro(fee)} de cuota mensual, con {hours} h/mes.
              </p>
            ) : null}
            <input type="hidden" name="source" value="monthly-costs" />
            <input
              type="hidden"
              name="monthlyExpenses"
              value={validDeductibleAmount ? deductibleAmount.toFixed(2) : ''}
            />
            <input
              type="hidden"
              name="monthlyNonDeductibleExpenses"
              value={validDeductibleAmount ? nonDeductibleAmount.toFixed(2) : ''}
            />
            <input type="hidden" name="billableHours" value={validHours ? String(hours) : ''} />
            <input type="hidden" name="selfEmployedFeeMode" value="manual" />
            <input type="hidden" name="selfEmployedFee" value={fee.toFixed(2)} />
            <button type="submit" className="primary-button" aria-describedby="monthly-cost-transfer-scenario">
              Usar estos datos en mi tarifa
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
