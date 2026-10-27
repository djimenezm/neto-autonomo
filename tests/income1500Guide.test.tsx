import { render, screen, within } from '@testing-library/react';
import Guide, { metadata } from '@/app/cuanto-facturar-autonomo-1500-euros/page';
import { calculateExample, exampleAssumptions, formatEuro } from '@/lib/scenarioExamples';

vi.mock('next/script', () => ({
  default: (props: { id?: string; type?: string; dangerouslySetInnerHTML?: { __html: string } }) => (
    <script {...props} />
  ),
}));
vi.mock('@/components/LeadMagnetForm', () => ({ default: () => null }));

const scenarios = [
  { name: 'Estructura ligera', monthlyExpenses: 150, billableHours: 70 },
  { name: 'Más costes, más horas', monthlyExpenses: 500, billableHours: 90 },
];

describe('1500 euro income guide', () => {
  it('answers with the calculator result before the first call to action', () => {
    const { container } = render(<Guide />);
    const hero = container.querySelector('.hero')!;
    const expected = calculateExample(1500, scenarios[0]);
    const lead = hero.querySelector('.lead')!;
    expect(lead.textContent).toContain(`${formatEuro(expected.billingWithoutVAT)} al mes sin IVA`);
    expect(lead).toHaveTextContent('reserva orientativa');
    expect(lead.compareDocumentPosition(within(hero as HTMLElement).getByRole('link', {
      name: 'Ver y ajustar este ejemplo',
    }))).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(lead).toHaveTextContent(/ejemplo hipotético/i);
    const assumptions = screen.getByRole('group', { name: 'Supuestos del ejemplo inicial' });
    expect(assumptions.textContent).toContain(`Gastos: ${formatEuro(scenarios[0].monthlyExpenses)}/mes`);
    expect(assumptions.textContent).toContain(`Cuota: ${formatEuro(exampleAssumptions.selfEmployedFee)}/mes`);
    expect(assumptions).toHaveTextContent(`Reserva IRPF: ${exampleAssumptions.irpfRate} %`);
    expect(assumptions).toHaveTextContent(`${scenarios[0].billableHours} h facturables/mes`);
    expect(screen.queryByText(/una primera referencia razonable/)).not.toBeInTheDocument();
  });

  it('keeps the table, initial answer and detailed balance on the same assumptions', () => {
    render(<Guide />);
    const table = within(screen.getByRole('region', { name: 'Dos ejemplos para 1.500 euros netos' })).getByRole('table');
    for (const scenario of scenarios) {
      const result = calculateExample(1500, scenario);
      const row = within(table).getByRole('rowheader', { name: scenario.name }).closest('tr')!;
      expect(within(row).getAllByRole('cell').slice(0, 4).map((cell) => cell.textContent)).toEqual([
        formatEuro(scenario.monthlyExpenses), String(scenario.billableHours),
        formatEuro(result.billingWithoutVAT), `${formatEuro(result.hourlyRate)}/h`,
      ]);
      expect(result.billingWithoutVAT - result.monthlyExpenses - result.selfEmployedFee
        - result.estimatedIRPF).toBeCloseTo(1500, 2);
    }
    const lean = calculateExample(1500, scenarios[0]);
    expect(screen.getByText((_, element) => element?.tagName === 'P'
      && element.textContent?.startsWith('En el primer caso:') === true).textContent)
      .toContain(`${formatEuro(lean.estimatedIRPF)} de reserva de IRPF = ${formatEuro(1500)}`);
  });

  it('opens the calculator with exactly the assumptions shown, for both examples', () => {
    render(<Guide />);
    const primary = screen.getByRole('link', { name: 'Ver y ajustar este ejemplo' });
    const returning = screen.getByRole('link', { name: 'Ajustar el ejemplo de 1500 euros' });
    expect(primary.getAttribute('href')).toBe(returning.getAttribute('href'));
    for (const [index, scenario] of scenarios.entries()) {
      const row = screen.getByRole('rowheader', { name: scenario.name }).closest('tr')!;
      const links = index === 0 ? [primary, within(row).getByRole('link')] : [within(row).getByRole('link')];
      for (const link of links) {
        const url = new URL(link.getAttribute('href')!, 'http://localhost:3001');
        expect(url.pathname).toBe('/');
        expect(url.hash).toBe('#calculadora');
        expect(Object.fromEntries(url.searchParams)).toMatchObject({
          targetNet: '1500', monthlyExpenses: String(scenario.monthlyExpenses),
          billableHours: String(scenario.billableHours), irpfMode: 'manual',
          irpfRate: String(exampleAssumptions.irpfRate), selfEmployedFeeMode: 'manual',
          selfEmployedFee: String(exampleAssumptions.selfEmployedFee),
        });
      }
    }
  });

  it('places the two worked examples immediately after the hero with an accessible anchor', () => {
    const { container } = render(<Guide />);
    const sections = container.querySelectorAll('main > section');
    expect(sections[0]).toHaveClass('hero');
    expect(sections[1]).toHaveAttribute('aria-labelledby', 'ejemplos-1500');
    expect(screen.getByRole('link', { name: 'Comparar los dos casos' })).toHaveAttribute('href', '#ejemplos-1500');
    expect(screen.getByRole('region', { name: 'Dos ejemplos para 1.500 euros netos' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'contenido-principal');
  });

  it('keeps FAQ structured data identical to the visible monetary answer', () => {
    const { container } = render(<Guide />);
    const schema = JSON.parse(container.querySelector('#cuanto-facturar-1500-faq-schema')!.textContent!);
    for (const item of schema.mainEntity) {
      const question = screen.getByRole('heading', { name: item.name });
      expect(question.nextElementSibling?.textContent).toBe(item.acceptedAnswer.text);
    }
    expect(schema.mainEntity[0].acceptedAnswer.text).toContain(formatEuro(calculateExample(1500, scenarios[0]).billingWithoutVAT));
  });

  it('preserves the canonical and reports the substantive editorial date accurately', () => {
    const { container } = render(<Guide />);
    expect(metadata.alternates?.canonical).toBe('/cuanto-facturar-autonomo-1500-euros');
    expect(screen.getByText('27 de octubre de 2026')).toHaveAttribute('datetime', '2026-10-27');
    const article = JSON.parse(container.querySelector('#cuanto-facturar-1500-article-schema')!.textContent!);
    expect(article.dateModified).toBe('2026-10-27');
    expect(article.datePublished).toBe('2026-04-26');
  });
});
