import { describe, expect, it } from 'vitest';
import { calculateFreelanceBilling } from '@/lib/calculator';

describe('calculateFreelanceBilling', () => {
  it('uses the progressive IRPF estimate by default', () => {
    const result = calculateFreelanceBilling({
      targetNet: 1500,
      monthlyExpenses: 200,
      billableHours: 80,
      irpfRate: 15,
      hasIVA: true,
      selfEmployedFee: 0,
      selfEmployedFeeMode: 'auto',
    });

    expect(result.irpfMode).toBe('progressive');
    expect(result.autonomousCommunity).toBe('common');
    expect(result.selfEmployedFeeMode).toBe('auto');
    expect(result.selfEmployedFee).toBe(result.estimatedSelfEmployedFee);
    expect(result.personalAllowance).toBe(5550);
    expect(result.regionalPersonalAllowance).toBe(5550);
    expect(result.reducedFeePeriod).toBe('initial');
    expect(result.annualPreTaxProfit).toBeGreaterThan(20000);
    expect(result.annualEstimatedIRPF).toBeGreaterThan(3000);
    expect(result.annualTaxableIrpfBase).toBeGreaterThan(15000);
    expect(result.annualRegionalTaxableIrpfBase).toBeGreaterThan(15000);
    expect(result.irpfRate).toBeGreaterThan(10);
    expect(result.irpfRate).toBeLessThan(20);
    expect(result.billingWithoutVAT).toBeCloseTo(
      result.preTaxProfit + result.monthlyExpenses + result.selfEmployedFee,
      1,
    );
    expect(result.estimatedVAT).toBeCloseTo(result.billingWithoutVAT * 0.21, 2);
  });

  it('applies the reduced fee for new autonomous workers when selected', () => {
    const result = calculateFreelanceBilling({
      targetNet: 1500,
      monthlyExpenses: 200,
      billableHours: 80,
      irpfRate: 15,
      hasIVA: true,
      selfEmployedFee: 0,
      selfEmployedFeeMode: 'reduced',
      reducedFeePeriod: 'initial',
    });

    expect(result.irpfMode).toBe('progressive');
    expect(result.selfEmployedFeeMode).toBe('reduced');
    expect(result.reducedFeePeriod).toBe('initial');
    expect(result.selfEmployedFee).toBe(80);
    expect(result.reducedSelfEmployedFee).toBe(80);
    expect(result.estimatedSelfEmployedFee).toBeGreaterThan(result.selfEmployedFee);
    expect(result.billingWithoutVAT).toBeCloseTo(
      result.preTaxProfit + result.monthlyExpenses + result.selfEmployedFee,
      2,
    );
    expect(result.estimatedVAT).toBeCloseTo(result.billingWithoutVAT * 0.21, 2);
  });

  it('flags when the reduced-fee extension does not fit the estimated SMI threshold', () => {
    const result = calculateFreelanceBilling({
      targetNet: 1500,
      monthlyExpenses: 200,
      billableHours: 80,
      irpfRate: 15,
      hasIVA: true,
      selfEmployedFee: 0,
      selfEmployedFeeMode: 'reduced',
      reducedFeePeriod: 'extended',
    });

    expect(result.selfEmployedFee).toBe(80);
    expect(result.reducedFeePeriod).toBe('extended');
    expect(result.reducedFeeExtensionEligible).toBe(false);
    expect(result.referenceSMI).toBe(1221);
  });

  it('adjusts the progressive IRPF estimate when a specific autonomous community is selected', () => {
    const commonResult = calculateFreelanceBilling({
      targetNet: 2500,
      monthlyExpenses: 300,
      billableHours: 90,
      irpfRate: 15,
      hasIVA: true,
      selfEmployedFee: 0,
      irpfMode: 'progressive',
      autonomousCommunity: 'common',
      selfEmployedFeeMode: 'auto',
    });
    const madridResult = calculateFreelanceBilling({
      targetNet: 2500,
      monthlyExpenses: 300,
      billableHours: 90,
      irpfRate: 15,
      hasIVA: true,
      selfEmployedFee: 0,
      irpfMode: 'progressive',
      autonomousCommunity: 'madrid',
      selfEmployedFeeMode: 'auto',
    });

    expect(madridResult.autonomousCommunity).toBe('madrid');
    expect(madridResult.regionalPersonalAllowance).toBe(5956.65);
    expect(madridResult.annualRegionalTaxableIrpfBase).not.toBe(commonResult.annualRegionalTaxableIrpfBase);
    expect(madridResult.annualEstimatedIRPF).not.toBe(commonResult.annualEstimatedIRPF);
  });

  it('rounds billable hours to a whole number before calculating the hourly rate', () => {
    const result = calculateFreelanceBilling({
      targetNet: 1500,
      monthlyExpenses: 200,
      billableHours: 80.4,
      irpfRate: 15,
      hasIVA: true,
      selfEmployedFee: 0,
      selfEmployedFeeMode: 'auto',
    });

    expect(result.hourlyRate).toBeCloseTo(result.billingWithoutVAT / 80, 2);
  });

  it('respects the manual autonomous fee when the user provides one', () => {
    const result = calculateFreelanceBilling({
      targetNet: 1500,
      monthlyExpenses: 200,
      billableHours: 80,
      irpfRate: 15,
      irpfMode: 'manual',
      hasIVA: true,
      selfEmployedFee: 320,
      selfEmployedFeeMode: 'manual',
    });

    expect(result.selfEmployedFee).toBe(320);
    expect(result.selfEmployedFeeMode).toBe('manual');
    expect(result.reducedFeePeriod).toBe('initial');
    expect(result.irpfMode).toBe('manual');
    expect(result.autonomousCommunity).toBe('common');
    expect(result.irpfRate).toBe(15);
    expect(result.estimatedSelfEmployedFee).toBe(302.65);
    expect(result.usedCustomSelfEmployedFee).toBe(true);
    expect(result.annualPreTaxProfit).toBe(21176.47);
    expect(result.annualEstimatedIRPF).toBe(3176.47);
    expect(result.billingWithoutVAT).toBe(2284.71);
  });

  it('sanitizes invalid numeric values before calculating', () => {
    const result = calculateFreelanceBilling({
      targetNet: Number.NaN,
      monthlyExpenses: -50,
      billableHours: 0,
      irpfRate: 120,
      hasIVA: false,
      selfEmployedFee: -10,
    });

    expect(result).toEqual(
      expect.objectContaining({
        targetNet: 0,
        monthlyExpenses: 0,
        selfEmployedFee: 205.88,
        selfEmployedFeeMode: 'auto',
        reducedFeePeriod: 'initial',
        irpfMode: 'progressive',
        autonomousCommunity: 'common',
        preTaxProfit: 0,
        annualPreTaxProfit: 0,
        annualEstimatedIRPF: 0,
        annualTaxableIrpfBase: 0,
        annualRegionalTaxableIrpfBase: 0,
        estimatedContributionBase: 653.59,
        estimatedSelfEmployedFee: 205.88,
        reducedContributionBase: 950.98,
        reducedSelfEmployedFee: 80,
        reducedFeeExtensionEligible: true,
        referenceSMI: 1221,
        personalAllowance: 5550,
        regionalPersonalAllowance: 5550,
        usedCustomSelfEmployedFee: false,
        estimatedIRPF: 0,
        estimatedVAT: 0,
        billingWithoutVAT: 205.88,
        hourlyRate: 205.88,
      }),
    );
  });
});
