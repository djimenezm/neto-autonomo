'use client';

import { useState } from 'react';
import { formatEuro } from '@/lib/scenarioExamples';
import { parseSpanishNumber } from '@/lib/spanishNumber';

const costFields = [
  { key: 'fee', label: 'Cuota de autónomos' },
  { key: 'advisor', label: 'Gestoría o asesoría' },
  { key: 'software', label: 'Software y herramientas' },
  { key: 'insurance', label: 'Seguros' },
  { key: 'other', label: 'Otros gastos de actividad' },
] as const;

type CostKey = (typeof costFields)[number]['key'];
type CostValues = Record<CostKey | 'hours', string>;

const initialValues: CostValues = {
  fee: '320',
  advisor: '55',
  software: '35',
  insurance: '30',
  other: '40',
  hours: '80',
};

function parseCost(value: string) {
  return value.trim() === '' ? 0 : parseSpanishNumber(value);
}

export default function MonthlyCostCalculator() {
  const [values, setValues] = useState<CostValues>(initialValues);
  const [deductibleExpenses, setDeductibleExpenses] = useState('');
  const [transferAttempted, setTransferAttempted] = useState(false);
  const monthlyCosts = costFields.map((field) => ({
    ...field,
    amount: parseCost(values[field.key]),
  }));
  const hours = parseSpanishNumber(values.hours);
  const fee = monthlyCosts[0].amount;
  const invalidCosts = monthlyCosts.some(({ amount }) => !Number.isFinite(amount) || amount < 0);
  const invalidHours = !Number.isFinite(hours) || hours <= 0;
  const isValid = !invalidCosts && !invalidHours;
  const monthlyTotal = isValid
    ? monthlyCosts.reduce((total, field) => total + field.amount, 0)
    : 0;
  const otherCosts = isValid ? monthlyTotal - fee : 0;
  const deductibleAmount = parseSpanishNumber(deductibleExpenses);
  const validDeductibleAmount =
    deductibleExpenses.trim() !== '' &&
    Number.isFinite(deductibleAmount) &&
    deductibleAmount >= 0 &&
    deductibleAmount <= otherCosts + 0.001;
  const canTransfer = isValid && fee > 0 && Number.isInteger(hours) && validDeductibleAmount;

  function updateValue(key: keyof CostValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="calculator-card monthly-cost-card" id="costes-mensuales">
      <h2>Calcula tus costes fijos</h2>
      <p className="card-intro">
        Ejemplo editable. Escribe lo que pagas tú; si un gasto es anual, introduce aquí su equivalente mensual.
      </p>

      <div className="monthly-cost-inputs">
        {costFields.map(({ key, label }) => {
          const amount = parseCost(values[key]);
          const invalid = !Number.isFinite(amount) || amount < 0;

          return (
            <label key={key} htmlFor={`monthly-cost-${key}`}>
              <span>{label}</span>
              <span className="monthly-cost-input-wrap">
                <input
                  id={`monthly-cost-${key}`}
                  type="text"
                  inputMode="decimal"
                  value={values[key]}
                  onChange={(event) => updateValue(key, event.target.value)}
                  aria-invalid={invalid}
                  aria-describedby={invalid ? 'monthly-cost-error' : undefined}
                />
                <span aria-hidden="true">€ / mes</span>
              </span>
            </label>
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
            <span>Coste mensual antes de pagarte</span>
            <strong>{formatEuro(monthlyTotal)}</strong>
          </div>
          <dl className="monthly-cost-stats">
            <div><dt>Al año</dt><dd>{formatEuro(monthlyTotal * 12)}</dd></div>
            <div><dt>Por hora facturable</dt><dd>{formatEuro(monthlyTotal / hours)}/h</dd></div>
          </dl>
          <p>
            Este coste no incluye tu sueldo, IRPF ni IVA. Tampoco implica que todos los gastos sean
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
              La cuota de {formatEuro(fee)} se añadirá por separado. De los otros {formatEuro(otherCosts)},
              indica cuánto puedes deducir.
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
