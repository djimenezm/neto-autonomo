import { estimateMonthlyNet, netReferenceFromResult } from '@/lib/monthlyNet';
import { calculateExample } from '@/lib/scenarioExamples';

const original = calculateExample(2000);
export const monthlyNetExampleReference = netReferenceFromResult(original);
export const monthlyNetExampleRows = [2500, original.billingWithoutVAT, 3500].map((monthlyBilling) => estimateMonthlyNet(monthlyNetExampleReference, monthlyBilling));
