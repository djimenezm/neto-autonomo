'use client';

import { useState } from 'react';
import { formatCurrency as formatEuro } from '@/lib/format';
import { parseSpanishNumber } from '@/lib/spanishNumber';
import { estimateRecurringCosts, expenseFields, paymentPeriods, recurringCostsExample, type PaymentPeriod, type ExpenseKey } from '@/lib/recurringCosts';
import styles from './MonthlyCostCalculator.module.css';

const costFields = [
  { key: 'fee', label: 'Cuota de autónomos' },
  ...expenseFields,
] as const;

type CostKey = (typeof costFields)[number]['key'];
type CostValues = Record<CostKey | 'hours', string>;

const initialValues: CostValues = {
  fee: String(recurringCostsExample.fee),
  advisor: String(recurringCostsExample.expenses.advisor.amount),
  software: String(recurringCostsExample.expenses.software.amount),
  insurance: String(recurringCostsExample.expenses.insurance.amount),
  other: String(recurringCostsExample.expenses.other.amount),
  hours: '80',
};

function parseCost(value: string) {
  return value.trim() === '' ? 0 : parseSpanishNumber(value);
}

export default function MonthlyCostCalculator() {
  const [values, setValues] = useState<CostValues>(initialValues);
  const [periods, setPeriods] = useState<Record<ExpenseKey, PaymentPeriod>>({
    advisor: recurringCostsExample.expenses.advisor.period,
    software: recurringCostsExample.expenses.software.period,
    insurance: recurringCostsExample.expenses.insurance.period,
    other: recurringCostsExample.expenses.other.period,
  });
  const [deductibleExpenses, setDeductibleExpenses] = useState('');
  const [transferAttempted, setTransferAttempted] = useState(false);
  const costs = estimateRecurringCosts({
    fee: parseCost(values.fee),
    expenses: {
      advisor: { amount: parseCost(values.advisor), period: periods.advisor },
      software: { amount: parseCost(values.software), period: periods.software },
      insurance: { amount: parseCost(values.insurance), period: periods.insurance },
      other: { amount: parseCost(values.other), period: periods.other },
    },
  });
  const hours = parseSpanishNumber(values.hours);
  const fee = costs.valid ? costs.monthlyFee : 0;
  const invalidHours = !Number.isFinite(hours) || hours <= 0;
  const isValid = costs.valid && !invalidHours;
  const monthlyTotal = costs.valid ? costs.monthlyTotal : 0;
  const otherCosts = costs.valid ? costs.monthlyOtherCosts : 0;
  const parsedDeductibleAmount = parseSpanishNumber(deductibleExpenses);
  const deductibleAmount = Math.round(parsedDeductibleAmount * 100) / 100;
  const validDeductibleAmount =
    deductibleExpenses.trim() !== '' &&
    Number.isFinite(deductibleAmount) &&
    parsedDeductibleAmount >= 0 &&
    deductibleAmount <= otherCosts;
  const canTransfer = isValid && fee > 0 && Number.isInteger(hours) && validDeductibleAmount;

  function updateValue(key: keyof CostValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className={`calculator-card monthly-cost-card ${styles.calculator}`} id="costes-mensuales">
      <h2>Calcula tus costes fijos</h2>
      <p className="card-intro">
        Ejemplo ficticio editable. Escribe el importe de cada pago y elige su frecuencia.
        La cuota sigue siendo mensual. Cambiar la frecuencia no cambia el importe escrito.
      </p>
      <noscript><p>Para cambiar los pagos necesitas JavaScript. Más abajo tienes el ejemplo completo y la cuenta para hacer el reparto a mano.</p></noscript>

      <div className="monthly-cost-inputs">
        {costFields.map(({ key, label }) => {
          const invalid = !costs.valid && Boolean(costs.errors[key]);

          return (
            <fieldset key={key} className={styles.costField}>
              <legend id={`monthly-cost-${key}-label`}>{label}</legend>
              <div className={styles.paymentRow}>
                <label htmlFor={`monthly-cost-${key}`}>
                  <span>Importe de cada pago</span>
                  <span className="monthly-cost-input-wrap">
                    <input
                      id={`monthly-cost-${key}`}
                      type="text"
                      inputMode="decimal"
                      value={values[key]}
                      onChange={(event) => updateValue(key, event.target.value)}
                      aria-invalid={invalid}
                      aria-labelledby={`monthly-cost-${key}-label`}
                      aria-describedby={invalid ? 'monthly-cost-error' : undefined}
                    />
                    <span aria-hidden="true">{key === 'fee' ? '€ / mes' : '€ / pago'}</span>
                  </span>
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
          <span>Horas facturables al mes</span>
          <span className="monthly-cost-input-wrap">
            <input
              id="monthly-cost-hours"
              type="text"
              inputMode="numeric"
              value={values.hours}
              onChange={(event) => updateValue('hours', event.target.value)}
              aria-invalid={invalidHours}
              aria-describedby={invalidHours ? 'monthly-cost-error' : undefined}
            />
            <span aria-hidden="true">h / mes</span>
          </span>
        </label>
      </div>

      {!isValid && (
        <p className="monthly-cost-error" id="monthly-cost-error" role="alert">
          Introduce importes válidos no negativos y al menos una hora facturable.
        </p>
      )}

      {isValid && (
        <div className="monthly-cost-results" aria-live="polite">
          <div className="monthly-cost-total">
            <span>Media mensual antes de pagarte</span>
            <strong>{formatEuro(monthlyTotal)}</strong>
          </div>
          <dl className="monthly-cost-stats">
            <div><dt>Al año según las frecuencias</dt><dd>{formatEuro(costs.valid ? costs.annualTotal : 0)}</dd></div>
            <div><dt>Por hora facturable</dt><dd>{formatEuro(monthlyTotal / hours)}/h</dd></div>
          </dl>
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
              }
            }}
          >
            <h3>Calcula tu tarifa con estos costes</h3>
            <p>
              Trasladaremos las medias mensuales, redondeadas a céntimos. La cuota de {formatEuro(fee)} se añadirá por separado.
              De los otros {formatEuro(otherCosts)} al mes, indica cuánto has comprobado que puedes deducir para tu previsión.
            </p>
            <label htmlFor="deductible-expenses">
              <span>Gastos deducibles, sin incluir la cuota</span>
              <span className="monthly-cost-input-wrap">
                <input
                  id="deductible-expenses"
                  type="text"
                  inputMode="decimal"
                  value={deductibleExpenses}
                  onChange={(event) => setDeductibleExpenses(event.target.value)}
                  aria-invalid={transferAttempted && !validDeductibleAmount}
                  aria-describedby="deductible-expenses-hint"
                />
                <span aria-hidden="true">€ / mes</span>
              </span>
            </label>
            <p id="deductible-expenses-hint">
              Escribe 0 si ninguno es deducible. El resto también se cubrirá con la tarifa, sin descontarlo del IRPF.
            </p>
            <input type="hidden" name="source" value="monthly-costs" />
            <input
              type="hidden"
              name="monthlyExpenses"
              value={validDeductibleAmount ? deductibleAmount.toFixed(2) : ''}
            />
            <input
              type="hidden"
              name="monthlyNonDeductibleExpenses"
              value={validDeductibleAmount ? (otherCosts - deductibleAmount).toFixed(2) : ''}
            />
            <input type="hidden" name="billableHours" value={values.hours} />
            <input type="hidden" name="selfEmployedFeeMode" value="manual" />
            <input type="hidden" name="selfEmployedFee" value={fee.toFixed(2)} />
            {transferAttempted && !canTransfer && (
              <p className="monthly-cost-error" role="alert">
                {fee <= 0
                  ? 'Indica una cuota mensual mayor que cero para trasladar este cálculo.'
                  : !Number.isInteger(hours)
                    ? 'Usa un número entero de horas para trasladar este cálculo.'
                    : `Indica un importe deducible entre 0 y ${formatEuro(otherCosts)}.`}
              </p>
            )}
            <button type="submit" className="primary-button">
              Usar estos datos en mi tarifa
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
