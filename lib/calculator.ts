export type SelfEmployedFeeMode = 'auto' | 'reduced' | 'manual';
export type ReducedFeePeriod = 'initial' | 'extended';
export type IrpfMode = 'progressive' | 'manual';
export type AutonomousCommunity = 'common' | 'madrid' | 'cataluna' | 'andalucia' | 'valencia';

export const AUTONOMOUS_COMMUNITY_LABELS: Record<AutonomousCommunity, string> = {
  common: 'Territorio comun',
  madrid: 'Madrid',
  cataluna: 'Cataluna',
  andalucia: 'Andalucia',
  valencia: 'Comunitat Valenciana',
};

export type CalculatorInput = {
  targetNet: number;
  monthlyExpenses: number;
  billableHours: number;
  irpfRate: number;
  irpfMode?: IrpfMode;
  autonomousCommunity?: AutonomousCommunity;
  hasIVA: boolean;
  selfEmployedFee: number;
  selfEmployedFeeMode?: SelfEmployedFeeMode;
  reducedFeePeriod?: ReducedFeePeriod;
};

export type CalculationResult = {
  targetNet: number;
  monthlyExpenses: number;
  selfEmployedFee: number;
  selfEmployedFeeMode: SelfEmployedFeeMode;
  reducedFeePeriod: ReducedFeePeriod;
  irpfMode: IrpfMode;
  autonomousCommunity: AutonomousCommunity;
  irpfRate: number;
  annualPreTaxProfit: number;
  annualEstimatedIRPF: number;
  annualTaxableIrpfBase: number;
  annualRegionalTaxableIrpfBase: number;
  personalAllowance: number;
  regionalPersonalAllowance: number;
  preTaxProfit: number;
  estimatedNetReturnsForContributions: number;
  estimatedContributionBase: number;
  estimatedSelfEmployedFee: number;
  reducedContributionBase: number;
  reducedSelfEmployedFee: number;
  reducedFeeExtensionEligible: boolean;
  referenceSMI: number;
  usedCustomSelfEmployedFee: boolean;
  estimatedIRPF: number;
  estimatedVAT: number;
  billingWithoutVAT: number;
  hourlyRate: number;
};

function roundToTwo(value: number) {
  return Math.round(value * 100) / 100;
}

function safeNumber(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

const GENERAL_EXPENSE_REDUCTION = 0.07;
const SELF_EMPLOYED_CONTRIBUTION_RATE = 0.315;
const REDUCED_SELF_EMPLOYED_FEE = 80;
const REDUCED_SELF_EMPLOYED_BASE = 950.98;
const SMI_2026 = 1221;
const STATE_PERSONAL_ALLOWANCE_2026 = 5550;

const STATE_IRPF_BRACKETS_2026 = [
  { upTo: 12450, rate: 0.095 },
  { upTo: 20200, rate: 0.12 },
  { upTo: 35200, rate: 0.15 },
  { upTo: 60000, rate: 0.185 },
  { upTo: 300000, rate: 0.225 },
  { upTo: Number.POSITIVE_INFINITY, rate: 0.245 },
];

const REGIONAL_IRPF_CONFIG: Record<
  AutonomousCommunity,
  {
    brackets: { upTo: number; rate: number }[];
    personalAllowance: number;
  }
> = {
  common: {
    brackets: STATE_IRPF_BRACKETS_2026,
    personalAllowance: STATE_PERSONAL_ALLOWANCE_2026,
  },
  madrid: {
    brackets: [
      { upTo: 13362.22, rate: 0.085 },
      { upTo: 19004.63, rate: 0.107 },
      { upTo: 35425.68, rate: 0.128 },
      { upTo: 57320.4, rate: 0.174 },
      { upTo: Number.POSITIVE_INFINITY, rate: 0.205 },
    ],
    personalAllowance: 5956.65,
  },
  cataluna: {
    brackets: [
      { upTo: 12500, rate: 0.095 },
      { upTo: 22000, rate: 0.125 },
      { upTo: 33000, rate: 0.16 },
      { upTo: 53000, rate: 0.19 },
      { upTo: 90000, rate: 0.215 },
      { upTo: 120000, rate: 0.235 },
      { upTo: 175000, rate: 0.245 },
      { upTo: Number.POSITIVE_INFINITY, rate: 0.255 },
    ],
    personalAllowance: 5550,
  },
  andalucia: {
    brackets: [
      { upTo: 13000, rate: 0.095 },
      { upTo: 21100, rate: 0.12 },
      { upTo: 35200, rate: 0.15 },
      { upTo: 60000, rate: 0.185 },
      { upTo: Number.POSITIVE_INFINITY, rate: 0.225 },
    ],
    personalAllowance: 5790,
  },
  valencia: {
    brackets: [
      { upTo: 12000, rate: 0.09 },
      { upTo: 22000, rate: 0.12 },
      { upTo: 32000, rate: 0.15 },
      { upTo: 42000, rate: 0.175 },
      { upTo: 52000, rate: 0.2 },
      { upTo: 62000, rate: 0.225 },
      { upTo: 72000, rate: 0.25 },
      { upTo: 100000, rate: 0.265 },
      { upTo: 150000, rate: 0.275 },
      { upTo: 200000, rate: 0.285 },
      { upTo: Number.POSITIVE_INFINITY, rate: 0.295 },
    ],
    personalAllowance: 6105,
  },
};

const SELF_EMPLOYED_BRACKETS_2026 = [
  { maxNetReturn: 670, minBase: 653.59 },
  { maxNetReturn: 900, minBase: 718.95 },
  { maxNetReturn: 1166.7, minBase: 849.67 },
  { maxNetReturn: 1300, minBase: 950.98 },
  { maxNetReturn: 1500, minBase: 960.78 },
  { maxNetReturn: 1700, minBase: 960.78 },
  { maxNetReturn: 1850, minBase: 1143.79 },
  { maxNetReturn: 2030, minBase: 1209.15 },
  { maxNetReturn: 2330, minBase: 1274.51 },
  { maxNetReturn: 2760, minBase: 1356.21 },
  { maxNetReturn: 3190, minBase: 1437.91 },
  { maxNetReturn: 3620, minBase: 1519.61 },
  { maxNetReturn: 4050, minBase: 1601.31 },
  { maxNetReturn: 6000, minBase: 1732.03 },
  { maxNetReturn: Number.POSITIVE_INFINITY, minBase: 1928.1 },
];

function estimateSelfEmployedContribution(monthlyNetReturns: number) {
  const bracket =
    SELF_EMPLOYED_BRACKETS_2026.find((currentBracket) => monthlyNetReturns <= currentBracket.maxNetReturn) ??
    SELF_EMPLOYED_BRACKETS_2026[SELF_EMPLOYED_BRACKETS_2026.length - 1];
  const contributionBase = bracket.minBase;
  const fee = contributionBase * SELF_EMPLOYED_CONTRIBUTION_RATE;

  return {
    contributionBase,
    fee,
  };
}

function calculateProgressiveQuota(taxableBase: number, brackets: { upTo: number; rate: number }[]) {
  if (taxableBase <= 0) {
    return 0;
  }

  let remainingBase = taxableBase;
  let previousLimit = 0;
  let quota = 0;

  for (const bracket of brackets) {
    const currentSpan = Math.min(remainingBase, bracket.upTo - previousLimit);

    if (currentSpan <= 0) {
      break;
    }

    quota += currentSpan * bracket.rate;
    remainingBase -= currentSpan;
    previousLimit = bracket.upTo;
  }

  return quota;
}

function calculateSimplifiedAnnualIRPF(preTaxProfitAnnual: number, autonomousCommunity: AutonomousCommunity) {
  const regionalConfig = REGIONAL_IRPF_CONFIG[autonomousCommunity];
  const stateTaxableBase = Math.max(0, preTaxProfitAnnual - STATE_PERSONAL_ALLOWANCE_2026);
  const regionalTaxableBase = Math.max(0, preTaxProfitAnnual - regionalConfig.personalAllowance);
  const stateQuota = calculateProgressiveQuota(stateTaxableBase, STATE_IRPF_BRACKETS_2026);
  const regionalQuota = calculateProgressiveQuota(regionalTaxableBase, regionalConfig.brackets);

  return {
    annualStateTaxableBase: stateTaxableBase,
    annualRegionalTaxableBase: regionalTaxableBase,
    annualIRPF: stateQuota + regionalQuota,
  };
}

function solveAnnualPreTaxProfit(targetNetAnnual: number, autonomousCommunity: AutonomousCommunity) {
  if (targetNetAnnual <= 0) {
    return 0;
  }

  let low = targetNetAnnual;
  let high = Math.max(targetNetAnnual, 1);

  while (high - calculateSimplifiedAnnualIRPF(high, autonomousCommunity).annualIRPF < targetNetAnnual) {
    high *= 2;
  }

  for (let iteration = 0; iteration < 80; iteration += 1) {
    const middle = (low + high) / 2;
    const estimatedNet = middle - calculateSimplifiedAnnualIRPF(middle, autonomousCommunity).annualIRPF;

    if (estimatedNet >= targetNetAnnual) {
      high = middle;
    } else {
      low = middle;
    }
  }

  return high;
}

export function calculateFreelanceBilling({
  targetNet,
  monthlyExpenses,
  billableHours,
  irpfRate,
  irpfMode = 'progressive',
  autonomousCommunity = 'common',
  hasIVA,
  selfEmployedFee,
  selfEmployedFeeMode = 'auto',
  reducedFeePeriod = 'initial',
}: CalculatorInput): CalculationResult {
  const safeTargetNet = Math.max(0, safeNumber(targetNet));
  const safeExpenses = Math.max(0, safeNumber(monthlyExpenses));
  const safeHours = Math.max(1, safeNumber(billableHours, 1));
  const safeIrpfRatePercent = Math.min(99, Math.max(0, safeNumber(irpfRate)));
  const safeIrpfRate = safeIrpfRatePercent / 100;
  const safeManualFee = Math.max(0, safeNumber(selfEmployedFee));
  const targetNetAnnual = safeTargetNet * 12;
  const annualPreTaxProfit =
    irpfMode === 'manual'
      ? safeTargetNet / Math.max(0.01, 1 - safeIrpfRate) * 12
      : solveAnnualPreTaxProfit(targetNetAnnual, autonomousCommunity);
  const {
    annualStateTaxableBase,
    annualRegionalTaxableBase,
    annualIRPF: progressiveAnnualIRPF,
  } = calculateSimplifiedAnnualIRPF(annualPreTaxProfit, autonomousCommunity);
  const annualEstimatedIRPF = irpfMode === 'manual' ? annualPreTaxProfit * safeIrpfRate : progressiveAnnualIRPF;
  const preTaxProfit = annualPreTaxProfit / 12;
  const estimatedNetReturnsForContributions = preTaxProfit * (1 - GENERAL_EXPENSE_REDUCTION);
  const { contributionBase, fee: estimatedSelfEmployedFee } = estimateSelfEmployedContribution(
    estimatedNetReturnsForContributions,
  );
  const reducedFeeExtensionEligible = estimatedNetReturnsForContributions <= SMI_2026;
  let appliedFeeMode: SelfEmployedFeeMode = 'auto';
  let appliedSelfEmployedFee = estimatedSelfEmployedFee;

  if (selfEmployedFeeMode === 'reduced') {
    appliedFeeMode = 'reduced';
    appliedSelfEmployedFee = REDUCED_SELF_EMPLOYED_FEE;
  } else if (selfEmployedFeeMode === 'manual' && safeManualFee > 0) {
    appliedFeeMode = 'manual';
    appliedSelfEmployedFee = safeManualFee;
  }

  const usedCustomSelfEmployedFee = appliedFeeMode === 'manual';
  const estimatedIRPF = annualEstimatedIRPF / 12;
  const effectiveIrpfRate = annualPreTaxProfit > 0 ? (annualEstimatedIRPF / annualPreTaxProfit) * 100 : 0;
  const billingWithoutVAT = preTaxProfit + safeExpenses + appliedSelfEmployedFee;
  const estimatedVAT = hasIVA ? billingWithoutVAT * 0.21 : 0;
  const hourlyRate = billingWithoutVAT / safeHours;

  return {
    targetNet: roundToTwo(safeTargetNet),
    monthlyExpenses: roundToTwo(safeExpenses),
    selfEmployedFee: roundToTwo(appliedSelfEmployedFee),
    selfEmployedFeeMode: appliedFeeMode,
    reducedFeePeriod,
    irpfMode,
    autonomousCommunity,
    irpfRate: roundToTwo(irpfMode === 'manual' ? safeIrpfRatePercent : effectiveIrpfRate),
    annualPreTaxProfit: roundToTwo(annualPreTaxProfit),
    annualEstimatedIRPF: roundToTwo(annualEstimatedIRPF),
    annualTaxableIrpfBase: roundToTwo(annualStateTaxableBase),
    annualRegionalTaxableIrpfBase: roundToTwo(annualRegionalTaxableBase),
    personalAllowance: roundToTwo(STATE_PERSONAL_ALLOWANCE_2026),
    regionalPersonalAllowance: roundToTwo(REGIONAL_IRPF_CONFIG[autonomousCommunity].personalAllowance),
    preTaxProfit: roundToTwo(preTaxProfit),
    estimatedNetReturnsForContributions: roundToTwo(estimatedNetReturnsForContributions),
    estimatedContributionBase: roundToTwo(contributionBase),
    estimatedSelfEmployedFee: roundToTwo(estimatedSelfEmployedFee),
    reducedContributionBase: roundToTwo(REDUCED_SELF_EMPLOYED_BASE),
    reducedSelfEmployedFee: roundToTwo(REDUCED_SELF_EMPLOYED_FEE),
    reducedFeeExtensionEligible,
    referenceSMI: roundToTwo(SMI_2026),
    usedCustomSelfEmployedFee,
    estimatedIRPF: roundToTwo(estimatedIRPF),
    estimatedVAT: roundToTwo(estimatedVAT),
    billingWithoutVAT: roundToTwo(billingWithoutVAT),
    hourlyRate: roundToTwo(hourlyRate),
  };
}
