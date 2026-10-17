import { render, screen, within } from '@testing-library/react';
import Guide, { metadata } from '@/app/horas-facturables-freelance/page';
import { availableMonthlyHours, billableHoursExamples, monthlyBillingExample } from '@/lib/billableHoursExamples';
import { formatCurrency } from '@/lib/format';

vi.mock('next/script', () => ({ default: () => null }));
vi.mock('@/components/LeadMagnetForm', () => ({ default: () => null }));

describe('billable hours evidence', () => {
  it('accounts for every hour once in each illustrative agenda', () => {
    expect(availableMonthlyHours).toBe(160);
    expect(billableHoursExamples.map((agenda) => agenda.billableHours)).toEqual([90, 110, 130]);
    for (const agenda of billableHoursExamples) {
      expect(agenda.administration + agenda.sales + agenda.learning + agenda.reserve
        + agenda.billableHours).toBe(availableMonthlyHours);
      expect(agenda.hourlyRate).toBe(monthlyBillingExample / agenda.billableHours);
    }
  });

  it('renders the same assumptions and prices as the example data', () => {
    render(<Guide />);
    const table = screen.getByRole('table');
    for (const agenda of billableHoursExamples) {
      const row = screen.getByRole('rowheader', { name: agenda.name }).closest('tr')!;
      expect(within(row).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(
        [agenda.administration, agenda.sales, agenda.learning, agenda.reserve, agenda.billableHours].map(String),
      );
      const expectedRate = `${formatCurrency(agenda.hourlyRate)}/h sin IVA`;
      expect(screen.getByText((_, node) => node?.tagName === 'STRONG' && node.textContent === expectedRate)).toBeVisible();
    }
    expect(within(table).getByRole('caption')).toHaveTextContent('160 h (20 días × 8 h)');
  });

  it('distinguishes hypothetical planning examples from industry observations', () => {
    render(<Guide />);
    expect(screen.getByText(/No proceden de una encuesta/)).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Rangos orientativos' })).not.toBeInTheDocument();
    expect(screen.getByText(/No es un sueldo neto/)).toBeVisible();
    expect(screen.getByText(/no un precio de mercado ni una garantía/)).toBeVisible();
  });

  it('keeps the existing canonical, named responsibility and accessible table', () => {
    render(<Guide />);
    expect(metadata.alternates?.canonical).toBe('/horas-facturables-freelance');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'contenido-principal');
    expect(screen.getByRole('region', { name: 'Ejemplos de agendas mensuales' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('link', { name: 'Diego Antonio Jiménez Moreno' })).toHaveAttribute('href', '/aviso-legal');
    expect(screen.getByText('17 de octubre de 2026')).toHaveAttribute('datetime', '2026-10-17');
  });
});
