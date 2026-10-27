import { render, screen, within } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { calculateFreelanceBilling } from '@/lib/calculator';
import { ANNUAL_SMI_2026, isBelowAnnualSMI, reducedFeeSources } from '@/lib/reducedFee2026';
import { reducedFeeExamples } from '@/lib/reducedFeeExamples';
import ResultCard from '@/components/ResultCard';
import CalculatorForm from '@/components/CalculatorForm';
import Guide, { metadata } from '@/app/cuota-autonomos-2026/page';

describe('reduced fee and annual extension comparison', () => {
  it('uses the published total including MEI, and includes it once in billing, VAT and the hourly rate', () => {
    const input = { ...reducedFeeExamples[0].input, reducedFeePeriod: 'initial' as const };
    const result = calculateFreelanceBilling(input);
    const manual80 = calculateFreelanceBilling({ ...input, selfEmployedFeeMode: 'manual', selfEmployedFee: 80 });
    expect(result.selfEmployedFee).toBe(88.64);
    expect(result.billingWithoutVAT).toBe(1700.4);
    expect(result.hourlyRate).toBe(21.26);
    expect(result.billingWithoutVAT - manual80.billingWithoutVAT).toBeCloseTo(8.64, 2);
    expect(result.estimatedVAT).toBeCloseTo(result.billingWithoutVAT * 0.21, 2);
    expect(result.estimatedIRPF).toBe(manual80.estimatedIRPF);
    expect(result.estimatedSelfEmployedFee).toBe(manual80.estimatedSelfEmployedFee);
    expect(calculateFreelanceBilling({ ...input, selfEmployedFeeMode: 'manual', selfEmployedFee: 88.56 }).selfEmployedFee).toBe(88.56);
  });

  it('does not reject a monthly average above 1221 when the annual estimate is below 17094', () => {
    const { result } = reducedFeeExamples[0];
    expect(result.estimatedNetReturnsForContributions).toBe(1312.94);
    expect(result.annualEstimatedNetReturnsForContributions).toBe(15755.29);
    expect(result.referenceAnnualSMI).toBe(17094);
    expect(result.reducedFeeExtensionEligible).toBe(true);
    // Do not multiply a monthly value already rounded to cents.
    expect(result.annualEstimatedNetReturnsForContributions).not.toBe(result.estimatedNetReturnsForContributions * 12);
  });

  it('keeps a reduced-fee scenario explicit when its annual estimate does not meet the limit', () => {
    const { result } = reducedFeeExamples[1];
    expect(result.annualEstimatedNetReturnsForContributions).toBe(18381.18);
    expect(result.reducedFeeExtensionEligible).toBe(false);
    expect(result.selfEmployedFeeMode).toBe('reduced');
    expect(result.selfEmployedFee).toBe(88.64);
  });

  it.each([[ANNUAL_SMI_2026 - 0.01, true], [ANNUAL_SMI_2026, false], [ANNUAL_SMI_2026 + 0.01, false], [NaN, false], [Infinity, false], [-1, false]] as const)('checks the strict annual boundary for %s', (value, expected) => {
    expect(isBelowAnnualSMI(value)).toBe(expected);
  });

  it('shows annual units and a limited conclusion before the amount grid', () => {
    const { result, input } = reducedFeeExamples[0];
    render(<ResultCard result={result} hoursBillable={input.billableHours} hasIVA={input.hasIVA} enableCopy={false} />);
    const note = screen.getByRole('note', { name: 'Revisión de la prórroga de cuota reducida' });
    expect(note).toHaveTextContent('15.755,29');
    expect(note).toHaveTextContent('17.094,00');
    expect(note).toHaveTextContent('Cumplir este límite en el modelo no acredita el derecho');
    expect(note).toHaveTextContent('dos años naturales');
    const grid = document.querySelector('.result-grid')!;
    expect(note.compareDocumentPosition(grid) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole('link', { name: 'guía de Importass' })).toHaveAttribute('href', reducedFeeSources.importass);
  });

  it('makes the failed check visible and preserves all other inputs in the ordinary-fee link', () => {
    const { result, input } = reducedFeeExamples[1];
    render(<ResultCard result={result} hoursBillable={input.billableHours} hasIVA={input.hasIVA} enableCopy={false} />);
    const note = screen.getByRole('note', { name: 'Revisión de la prórroga de cuota reducida' });
    expect(note).toHaveTextContent('La estimación no queda por debajo');
    expect(note).toHaveTextContent('conserva la cuota reducida que has seleccionado');
    const path = within(note).getByRole('link', { name: 'Ver el mismo cálculo con cuota ordinaria' }).getAttribute('href')!;
    const url = new URL(path, 'https://www.cuantofacturar.es');
    expect(url.searchParams.get('selfEmployedFeeMode')).toBe('auto');
    expect(url.searchParams.get('targetNet')).toBe('1400');
    expect(url.searchParams.get('monthlyExpenses')).toBe('200');
    expect(url.searchParams.get('billableHours')).toBe('80');
    expect(url.searchParams.get('irpfMode')).toBe('manual');
    expect(url.searchParams.get('irpfRate')).toBe('15');
    expect(url.searchParams.get('hasIVA')).toBe('yes');
    expect(url.hash).toBe('#calculadora');
  });

  it('does not apply the extension warning to the initial period', () => {
    const result = calculateFreelanceBilling({ ...reducedFeeExamples[1].input, reducedFeePeriod: 'initial' });
    render(<ResultCard result={result} hoursBillable={80} hasIVA enableCopy={false} />);
    expect(screen.queryByRole('note', { name: 'Revisión de la prórroga de cuota reducida' })).not.toBeInTheDocument();
  });

  it('explains MEI and the annual reference in the reduced-mode form', () => {
    render(<CalculatorForm initialValues={{ selfEmployedFeeMode: 'reduced', reducedFeePeriod: 'extended' }} />);
    expect(screen.getByText(/con MEI incluido, según el total publicado por Importass/)).toHaveTextContent('88,64');
    expect(screen.getByText(/Comparamos rendimientos anuales estimados/)).toHaveTextContent('17.094,00');
  });

  it('renders both worked cases and their exact extended-period links without running client scripts', () => {
    const doc = new DOMParser().parseFromString(renderToStaticMarkup(<Guide />), 'text/html');
    expect(doc.body.textContent).toContain('15.755,29');
    expect(doc.body.textContent).toContain('18.381,18');
    const exampleLinks = [...doc.querySelectorAll('a')].filter((a) => a.textContent?.startsWith('Probar caso de'));
    expect(exampleLinks).toHaveLength(2);
    for (const link of exampleLinks) {
      const params = new URL(link.getAttribute('href')!, 'https://www.cuantofacturar.es').searchParams;
      expect(params.get('selfEmployedFeeMode')).toBe('reduced');
      expect(params.get('reducedFeePeriod')).toBe('extended');
      expect(params.get('monthlyExpenses')).toBe('200');
    }
    const schemas = [...doc.querySelectorAll('script[type="application/ld+json"]')].map((s) => JSON.parse(s.textContent!));
    expect(schemas.map((s) => s['@type'])).toEqual(['Article', 'BreadcrumbList', 'FAQPage']);
    expect(schemas[0].dateModified).toBe('2026-10-27');
    expect(schemas[2].mainEntity).toHaveLength(5);
    expect(doc.querySelector('main')?.getAttribute('id')).toBe('contenido-principal');
    expect(doc.querySelectorAll('h1')).toHaveLength(1);
    expect(metadata.alternates?.canonical).toBe('/cuota-autonomos-2026');
  });
});
