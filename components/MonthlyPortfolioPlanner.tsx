'use client';

import { useEffect, useId, useRef, useState } from 'react';
import NumericTextInput from '@/components/NumericTextInput';
import { examplePortfolioGroups, MAX_PORTFOLIO_GROUPS, planMonthlyPortfolio, type PortfolioGroupInput } from '@/lib/projectPortfolio';
import { formatCurrency, formatNumber } from '@/lib/format';
import { parseSpanishNumber } from '@/lib/spanishNumber';
import styles from './MonthlyPortfolioPlanner.module.css';

type Row = { id: number; quantity: string; pricePerProject: string; hoursPerProject: string };
type RemovedGroup = { row: Row; index: number };
type Reference = { monthlyBilling: number; billableHours: number };
const fields = [
  { key: 'quantity', label: (group: number) => `Cantidad del grupo ${group}`, hint: 'Número de servicios iguales que prevés completar y facturar este mes.' },
  { key: 'pricePerProject', label: (group: number) => `Precio por servicio del grupo ${group} sin IVA (EUR)`, hint: 'Precio de uno, no del grupo completo. Puedes indicar cero para trabajo gratuito.' },
  { key: 'hoursPerProject', label: (group: number) => `Horas por servicio del grupo ${group}`, hint: 'Todo el tiempo de uno: preparación, reuniones, ejecución y revisiones. 1,5 significa una hora y media.' },
] as const;

function PortfolioEditor({ monthlyBilling, billableHours }: Reference) {
  const id = useId();
  const nextId = useRef(2);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});
  const focusAfterChange = useRef<number | null>(null);
  const [rows, setRows] = useState<Row[]>([{ id: 1, quantity: '', pricePerProject: '', hoursPerProject: '' }]);
  const [plan, setPlan] = useState<ReturnType<typeof planMonthlyPortfolio> | null>(null);
  const [isExample, setIsExample] = useState(false);
  const [changeMessage, setChangeMessage] = useState('');
  const [combinationBeforeExample, setCombinationBeforeExample] = useState<Row[] | null>(null);
  const [recoveryFeedback, setRecoveryFeedback] = useState('');
  const [removedGroup, setRemovedGroup] = useState<RemovedGroup | null>(null);

  useEffect(() => {
    if (focusAfterChange.current !== null) {
      inputs.current[`${focusAfterChange.current}-quantity`]?.focus();
      focusAfterChange.current = null;
    }
  }, [rows]);

  function check(nextRows = rows) {
    const result = planMonthlyPortfolio({ monthlyBilling, billableHours, groups: nextRows.map((row): PortfolioGroupInput => ({
      quantity: parseSpanishNumber(row.quantity), pricePerProject: parseSpanishNumber(row.pricePerProject), hoursPerProject: parseSpanishNumber(row.hoursPerProject),
    })) });
    setPlan(result);
    setChangeMessage('');
    setRecoveryFeedback('');
    if (result.valid) {
      setRows(nextRows.map((row, index) => ({ id: row.id, quantity: formatNumber(result.groups[index].quantity, 0), pricePerProject: formatNumber(result.groups[index].pricePerProject), hoursPerProject: formatNumber(result.groups[index].hoursPerProject) })));
    } else {
      const rowIndex = result.errors.rows.findIndex((row) => Object.keys(row).length);
      const invalid = fields.find(({ key }) => result.errors.rows[rowIndex]?.[key]);
      inputs.current[`${nextRows[Math.max(rowIndex, 0)].id}-${invalid?.key ?? 'quantity'}`]?.focus();
    }
  }

  function changeRows(nextRows: Row[], message: string, focusId?: number) {
    focusAfterChange.current = focusId ?? null;
    setRows(nextRows);
    setPlan(null);
    setIsExample(false);
    setChangeMessage(message);
    setRecoveryFeedback('');
  }

  function loadExample() {
    // Keep the first draft, including incomplete text, while the example is
    // edited or loaded again. Row IDs stay stable and nextId keeps increasing.
    setCombinationBeforeExample((previous) => previous ?? rows.map((row) => ({ ...row })));
    setRemovedGroup(null);
    const exampleRows = examplePortfolioGroups.map((group) => ({ id: nextId.current++, quantity: formatNumber(group.quantity), pricePerProject: formatNumber(group.pricePerProject), hoursPerProject: formatNumber(group.hoursPerProject) }));
    setRows(exampleRows);
    setIsExample(true);
    check(exampleRows);
  }

  function recoverCombination() {
    if (!combinationBeforeExample) return;
    setRemovedGroup(null);
    focusAfterChange.current = combinationBeforeExample[0].id;
    setRows(combinationBeforeExample);
    setPlan(null);
    setIsExample(false);
    setChangeMessage('');
    setCombinationBeforeExample(null);
    setRecoveryFeedback('Combinación anterior recuperada. Vuelve a comprobarla para actualizar los resultados.');
  }

  function undoRemoval() {
    if (!removedGroup || rows.length >= MAX_PORTFOLIO_GROUPS) return;
    const { row, index } = removedGroup;
    changeRows([...rows.slice(0, index), row, ...rows.slice(index)],
      `Grupo recuperado en la posición ${index + 1}. Vuelve a comprobar la combinación para actualizar los resultados.`, row.id);
    setRemovedGroup(null);
  }

  return (
    <div className={styles.planner}>
      <p className={styles.reference} id={`${id}-reference`}>Referencia de este cálculo: <strong>{formatCurrency(monthlyBilling)} sin IVA al mes</strong> y <strong>{formatNumber(billableHours)} h disponibles para encargos</strong>.</p>
      <p>Agrupa servicios con el mismo precio y tiempo. Una cuota recurrente cuenta con su importe y sus horas de un mes. Si un trabajo abarca varios meses, revisa su reparto antes de incluirlo aquí. Redondeamos el precio y las horas de uno a dos decimales antes de multiplicar.</p>
      <noscript><p>El comprobador necesita JavaScript. La guía incluye un <a href="/cuanto-facturar-autonomo-3000-euros#combinar-encargos">ejemplo de servicios combinados</a>.</p></noscript>
      <div aria-describedby={`${id}-reference`} onKeyDown={(event) => {
        if (event.key === 'Enter' && event.target instanceof HTMLInputElement) { event.preventDefault(); check(); }
      }}>
        {rows.map((row, index) => (
          <fieldset key={row.id} className={styles.group}>
            <legend>Grupo {index + 1} de servicios iguales</legend>
            <div className={styles.fields}>
              {fields.map(({ key, label, hint }) => {
                const error = plan && !plan.valid ? plan.errors.rows[index]?.[key] : undefined;
                const inputId = `${id}-${row.id}-${key}`;
                return (
                  <label key={key} htmlFor={inputId}>
                    <span id={`${inputId}-label`}>{label(index + 1)}</span>
                    <NumericTextInput id={inputId} ref={(node) => { inputs.current[`${row.id}-${key}`] = node; }} inputMode={key === 'quantity' ? 'numeric' : 'decimal'} value={row[key]}
                      onValueChange={(nextValue) => changeRows(rows.map((item) => item.id === row.id ? { ...item, [key]: nextValue } : item), '')}
                      aria-labelledby={`${inputId}-label`} aria-invalid={Boolean(error)} aria-describedby={`${inputId}-hint${error ? ` ${inputId}-error` : ''}`} />
                    <small id={`${inputId}-hint`}>{hint}</small>
                    {error ? <small className="field-error" id={`${inputId}-error`}>{error}</small> : null}
                  </label>
                );
              })}
            </div>
            {rows.length > 1 ? <button type="button" className="link-button" onClick={() => {
              const remaining = rows.filter((item) => item.id !== row.id);
              changeRows(remaining, `Grupo ${index + 1} eliminado. Quedan ${remaining.length} grupos. Puedes deshacer la última eliminación.`, remaining[Math.min(index, remaining.length - 1)].id);
              setRemovedGroup({ row: { ...row }, index });
            }}>Quitar grupo {index + 1}</button> : null}
          </fieldset>
        ))}
      </div>
      <div className={styles.actions}>
        <button type="button" className="link-button" disabled={rows.length >= MAX_PORTFOLIO_GROUPS} onClick={() => {
          const rowId = nextId.current++;
          changeRows([...rows, { id: rowId, quantity: '', pricePerProject: '', hoursPerProject: '' }],
            `Grupo ${rows.length + 1} añadido.${removedGroup ? ' Ya no se puede deshacer la eliminación anterior.' : ''}`, rowId);
          setRemovedGroup(null);
        }}>Añadir otro grupo</button>
        {removedGroup ? <button type="button" className="secondary-button" onClick={undoRemoval}
          aria-describedby={`${id}-removal-hint`}>Deshacer la última eliminación</button> : null}
      </div>
      {removedGroup ? <p className={styles.note} id={`${id}-removal-hint`}>
        Recupera el último grupo eliminado en su posición anterior, sin cambiar los demás grupos.
        Editar los campos o comprobar la combinación mantiene esta opción. Otra eliminación sustituye la copia;
        añadir un grupo, probar el ejemplo, recuperar la combinación anterior, cambiar la referencia mensual,
        salir o recargar la página la descarta.
      </p> : null}
      <p className={styles.note}>Hasta {MAX_PORTFOLIO_GROUPS} grupos. No necesitas escribir nombres de clientes.</p>
      <div role="status" aria-label="Cambios en la combinación" aria-live="polite" aria-atomic="true">
        <div className={styles.changeMessage}>{changeMessage}</div>
      </div>
      {combinationBeforeExample ? <p className={styles.note} id={`${id}-recovery-hint`}>Conservamos en esta página la combinación anterior al primer ejemplo. Recuperarla sustituye los cambios que ves ahora. La copia se pierde al salir o cambiar el cálculo de referencia.</p> : null}
      <div className={styles.actions}>
        <button type="button" className="primary-button" onClick={() => check()}>Comprobar combinación</button>
        <button type="button" className="link-button" onClick={loadExample}>Probar dos servicios ficticios</button>
        {combinationBeforeExample ? <button type="button" className="link-button" onClick={recoverCombination} aria-describedby={`${id}-recovery-hint`}>Recuperar mi combinación anterior</button> : null}
      </div>
      <div role="status" aria-label="Recuperación de la combinación" aria-live="polite" aria-atomic="true">{recoveryFeedback ? <p>{recoveryFeedback}</p> : null}</div>
      <div role="status" aria-label="Plan de servicios combinados" aria-live="polite" aria-atomic="true">
        {plan && !plan.valid ? <p>{plan.errors.monthlyBilling ?? plan.errors.billableHours ?? plan.errors.groups ?? 'Revisa los campos indicados antes de comprobar la combinación.'}</p> : null}
        {plan?.valid ? (
          <div className={styles.result}>
            {isExample ? <p><strong>Precios, cantidades y horas ficticios; se usa la referencia mensual de arriba.</strong></p> : null}
            <ul>{plan.groups.map((group, index) => <li key={rows[index].id}>Grupo {index + 1}: {formatNumber(group.quantity)} × {formatCurrency(group.pricePerProject)} = {formatCurrency(group.billing)} sin IVA; {formatNumber(group.quantity)} × {formatNumber(group.hoursPerProject)} h = {formatNumber(group.hours)} h.</li>)}</ul>
            <dl>
              <div><dt>Facturación prevista sin IVA</dt><dd>{formatCurrency(plan.plannedBilling)}</dd></div>
              <div><dt>Horas necesarias para la combinación</dt><dd>{formatNumber(plan.plannedHours)} h</dd></div>
              <div><dt>Diferencia de facturación frente al objetivo</dt><dd>{plan.billingDifference > 0 ? '+' : ''}{formatCurrency(plan.billingDifference)}</dd></div>
              <div><dt>Horas disponibles menos horas del plan</dt><dd>{formatNumber(plan.remainingHours)} h</dd></div>
            </dl>
            <p className={plan.coversBilling ? styles.fits : styles.shortfall}><strong>{plan.coversBilling
              ? plan.billingDifference === 0 ? 'La facturación coincide con el objetivo.' : `La facturación supera el objetivo en ${formatCurrency(plan.billingDifference)}.`
              : `Faltan ${formatCurrency(-plan.billingDifference)} para la facturación objetivo.`}</strong> La diferencia es facturación, no beneficio neto.</p>
            <p className={plan.fitsHours ? styles.fits : styles.shortfall}><strong>{plan.fitsHours
              ? plan.remainingHours === 0 ? 'Cabe por horas, sin holgura.' : `Cabe por horas; quedan ${formatNumber(plan.remainingHours)} h.`
              : `No cabe por horas: faltan ${formatNumber(-plan.remainingHours)} h de capacidad.`}</strong> La disponibilidad total no comprueba si las entregas coinciden en las mismas fechas.</p>
          </div>
        ) : null}
      </div>
      <p className={styles.note}>Cuenta cada servicio y cada hora una vez. Incluye todo el trabajo del cliente; la gestión general ya debe estar descontada de tu capacidad. El plan no acredita ventas ni cobros, no recalcula tu neto ni costes adicionales de estos servicios. No cambia el resultado principal ni su enlace compartido. Los campos solo se usan en esta página, sin guardarlos ni enviarlos.</p>
    </div>
  );
}

export default function MonthlyPortfolioPlanner(props: Reference) {
  return <PortfolioEditor key={`${props.monthlyBilling}:${props.billableHours}`} {...props} />;
}
