import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import userEvent from '@testing-library/user-event';
import CalculatorForm from '@/components/CalculatorForm';
import { calculateExample } from '@/lib/scenarioExamples';
import { formatCurrency } from '@/lib/format';
import type { CalculatorFormValues } from '@/lib/calculatorForm';

const manualValues: Partial<CalculatorFormValues> = {
  targetNet: '2000', monthlyExpenses: '300', billableHours: '80',
  irpfMode: 'manual', irpfRate: '15', selfEmployedFeeMode: 'manual', selfEmployedFee: '320',
};
const resultName = 'Tu referencia mensual para presupuestar';
const submitName = 'Calcular mi tarifa orientativa';

function summaryAndLink() {
  const summary = (screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value;
  return { summary, link: new URL(summary.split('Calculadora: ')[1]) };
}

describe('calculated results and shared scenarios stay together', () => {
  beforeEach(() => {
    window.va = vi.fn();
    window.gtag = vi.fn();
    window.history.replaceState(null, '', '/');
  });

  it('withholds a changed result and its share controls until both can be renewed by submission', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm initialValues={manualValues} />);
    await user.click(screen.getByRole('button', { name: submitName }));
    const oldUrl = window.location.href;
    const calls = [vi.mocked(window.va!).mock.calls.length, vi.mocked(window.gtag!).mock.calls.length];

    fireEvent.change(screen.getByRole('spinbutton', { name: 'Neto mensual deseado (EUR)' }), { target: { value: '2500' } });
    expect(screen.getByRole('status')).toHaveTextContent('Hay cambios sin calcular');
    expect(screen.queryByRole('heading', { name: resultName })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'WhatsApp' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Copiar resumen' })).not.toBeInTheDocument();
    expect(window.location.href).toBe(oldUrl);
    expect([vi.mocked(window.va!).mock.calls.length, vi.mocked(window.gtag!).mock.calls.length]).toEqual(calls);

    await user.click(screen.getByRole('button', { name: submitName }));
    const { summary, link } = summaryAndLink();
    expect(link.searchParams.get('targetNet')).toBe('2500');
    expect(summary).toContain(`Facturación objetivo sin IVA: ${formatCurrency(calculateExample(2500).billingWithoutVAT)}`);
    expect(screen.queryByText(/Hay cambios sin calcular/)).not.toBeInTheDocument();
    expect([vi.mocked(window.va!).mock.calls.length, vi.mocked(window.gtag!).mock.calls.length]).toEqual(calls);
    await waitFor(() => expect(screen.getByRole('heading', { name: resultName }).closest('section')).toHaveFocus());
  });

  it.each([
    ['Gastos mensuales deducibles (EUR)', '475'],
    ['Gastos mensuales no deducibles (EUR)', '60'],
    ['Horas facturables al mes', '60'],
    ['IRPF manual (%)', '18'],
    ['Cuota manual de autónomos (EUR)', '350'],
  ])('requires recalculation after editing %s', async (name, value) => {
    render(<CalculatorForm initialValues={manualValues} initiallySubmitted />);
    fireEvent.change(screen.getByRole('spinbutton', { name: new RegExp(name.split(' (')[0]) }), { target: { value } });
    expect(screen.queryByRole('heading', { name: resultName })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Hay cambios sin calcular');
  });

  it('also catches a pasted value and requires a valid calculation after a failed first attempt', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm />);
    const net = screen.getByRole('spinbutton', { name: 'Neto mensual deseado (EUR)' });
    await user.clear(net);
    await user.click(screen.getByRole('button', { name: submitName }));
    await user.click(net);
    await user.paste('2.500,50 €');
    expect(net).toHaveValue(2500.5);
    expect(screen.queryByRole('heading', { name: resultName })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Hay cambios sin calcular');
    expect(window.va).not.toHaveBeenCalled();
  });

  it('keeps the Enter calculation and the encoded percentage identical after rounding', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm initialValues={manualValues} />);
    const rate = screen.getByRole('spinbutton', { name: 'IRPF manual (%)' });
    await user.clear(rate);
    await user.type(rate, '15.55{Enter}');
    const { summary, link } = summaryAndLink();
    expect(rate).toHaveValue(15.6);
    expect(link.searchParams.get('irpfRate')).toBe('15.6');
    expect(summary).toContain(`Facturación objetivo sin IVA: ${formatCurrency(calculateExample(2000, { irpfRate: 15.6 }).billingWithoutVAT)}`);
    expect(screen.queryByText(/Hay cambios sin calcular/)).not.toBeInTheDocument();
  });

  it('does not mark an equivalent number as changed or steal focus when edits restore the saved scenario', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm initialValues={manualValues} />);
    await user.click(screen.getByRole('button', { name: submitName }));
    const net = screen.getByRole('spinbutton', { name: 'Neto mensual deseado (EUR)' });
    await user.click(net);
    fireEvent.change(net, { target: { value: '2000.00' } });
    expect(screen.getByRole('heading', { name: resultName })).toBeVisible();
    fireEvent.change(net, { target: { value: '2500' } });
    expect(screen.queryByRole('heading', { name: resultName })).not.toBeInTheDocument();
    fireEvent.change(net, { target: { value: '2000' } });
    expect(screen.getByRole('heading', { name: resultName })).toBeVisible();
    await waitFor(() => expect(net).toHaveFocus());
    expect(summaryAndLink().link.searchParams.get('targetNet')).toBe('2000');
  });

  it('invalidates tax modes and VAT changes, without generating conversion events', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm initialValues={manualValues} initiallySubmitted />);
    await user.click(screen.getByRole('radio', { name: 'No' }));
    expect(screen.queryByRole('heading', { name: resultName })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: submitName }));
    expect(summaryAndLink().link.searchParams.get('hasIVA')).toBe('no');
    await user.selectOptions(screen.getByRole('combobox', { name: /Cómo quieres calcular la cuota/ }), 'reduced');
    expect(screen.queryByRole('heading', { name: resultName })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: submitName }));
    await user.selectOptions(screen.getByRole('combobox', { name: /Período de la tarifa reducida/ }), 'extended');
    expect(screen.queryByRole('heading', { name: resultName })).not.toBeInTheDocument();
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('renews an existing share link in an embedded calculator while keeping the address intact', async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, '', '/guia');
    render(<CalculatorForm initialValues={manualValues} initiallySubmitted updateUrlOnSubmit={false} initialShareUrl="https://www.cuantofacturar.es/?targetNet=2000#calculadora" />);
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Neto mensual deseado (EUR)' }), { target: { value: '2500' } });
    await user.click(screen.getByRole('button', { name: submitName }));
    expect(window.location.pathname).toBe('/guia');
    expect(window.location.search).toBe('');
    expect(summaryAndLink().link.searchParams.get('targetNet')).toBe('2500');
  });

  it('keeps server-rendered and plain GET calculations available', () => {
    const html = renderToStaticMarkup(<CalculatorForm initiallySubmitted initialValues={manualValues} initialShareUrl="https://www.cuantofacturar.es/?targetNet=2000#calculadora" />);
    expect(html).toContain(resultName);
    expect(html).toContain('2972,94');
    expect(html).toContain('method="get"');
    expect(html).toContain('action="/#calculadora"');
    expect(html).not.toContain('Hay cambios sin calcular');
  });
});
