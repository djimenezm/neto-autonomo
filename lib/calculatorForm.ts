import {
  type AutonomousCommunity,
  type IrpfMode,
  type ReducedFeePeriod,
  type SelfEmployedFeeMode,
} from '@/lib/calculator';
import { parseSpanishNumber } from '@/lib/spanishNumber';

export type FieldName =
  | 'targetNet'
  | 'monthlyExpenses'
  | 'monthlyNonDeductibleExpenses'
  | 'billableHours'
  | 'irpfRate'
  | 'selfEmployedFee';

type FormErrors = Partial<Record<FieldName, string>>;

export type CalculatorFormValues = {
  targetNet: string;
  monthlyExpenses: string;
  monthlyNonDeductibleExpenses: string;
  billableHours: string;
  irpfMode: IrpfMode;
  autonomousCommunity: AutonomousCommunity;
  irpfRate: string;
  hasIVA: boolean;
  selfEmployedFeeMode: SelfEmployedFeeMode;
  reducedFeePeriod: ReducedFeePeriod;
  selfEmployedFee: string;
};

export const DEFAULT_FORM_VALUES: CalculatorFormValues = {
  targetNet: '1500',
  monthlyExpenses: '200',
  monthlyNonDeductibleExpenses: '0',
  billableHours: '80',
  irpfMode: 'progressive',
  autonomousCommunity: 'common',
  irpfRate: '15',
  hasIVA: true,
  selfEmployedFeeMode: 'auto',
  reducedFeePeriod: 'initial',
  selfEmployedFee: '0',
};

function formatNormalizedNumber(value: number, maximumFractionDigits = 2) {
  return value.toLocaleString('en-US', {
    useGrouping: false,
    maximumFractionDigits,
  });
}

export function normalizeFieldValue(field: FieldName, value: string) {
  const parsedValue = parseSpanishNumber(value);

  if (!Number.isFinite(parsedValue) || getFieldError(field, value)) {
    return value.trim() === '' ? '' : value;
  }

  switch (field) {
    case 'targetNet':
    case 'monthlyExpenses':
    case 'monthlyNonDeductibleExpenses':
    case 'selfEmployedFee':
      return formatNormalizedNumber(Math.max(0, parsedValue));
    case 'billableHours':
      return formatNormalizedNumber(Math.max(0, Math.round(parsedValue)), 0);
    case 'irpfRate':
      return formatNormalizedNumber(Math.min(99, Math.max(0, parsedValue)), 1);
  }
}

export function getNormalizedPastedValue(field: FieldName, value: string) {
  const parsedValue = parseSpanishNumber(value);
  return Number.isFinite(parsedValue)
    ? normalizeFieldValue(field, String(parsedValue))
    : null;
}

export function buildCalculatorUrl(values: CalculatorFormValues, currentUrl: string) {
  const url = new URL(currentUrl);
  url.pathname = '/';
  url.hash = 'calculadora';
  url.search = '';
  url.searchParams.set('targetNet', values.targetNet);
  url.searchParams.set('monthlyExpenses', values.monthlyExpenses);
  url.searchParams.set('monthlyNonDeductibleExpenses', values.monthlyNonDeductibleExpenses);
  url.searchParams.set('billableHours', values.billableHours);
  url.searchParams.set('irpfMode', values.irpfMode);
  url.searchParams.set('autonomousCommunity', values.autonomousCommunity);
  url.searchParams.set('irpfRate', values.irpfRate);
  url.searchParams.set('hasIVA', values.hasIVA ? 'yes' : 'no');
  url.searchParams.set('selfEmployedFeeMode', values.selfEmployedFeeMode);
  url.searchParams.set('reducedFeePeriod', values.reducedFeePeriod);
  url.searchParams.set('selfEmployedFee', values.selfEmployedFee);

  return url.toString();
}

function getFieldError(field: FieldName, value: string) {
  const parsedValue = parseSpanishNumber(value);

  if (value.trim() === '') {
    switch (field) {
      case 'targetNet':
        return 'Indica tu neto mensual deseado.';
      case 'monthlyExpenses':
        return 'Indica tus gastos mensuales deducibles.';
      case 'monthlyNonDeductibleExpenses':
        return 'Indica los gastos mensuales no deducibles, aunque sean cero.';
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
      case 'monthlyNonDeductibleExpenses':
        return 'Los gastos no deducibles no pueden ser negativos.';
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

export function validateForm(
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
      const parsedValue = parseSpanishNumber(values[field]);

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
