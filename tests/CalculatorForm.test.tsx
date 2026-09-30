import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CalculatorForm from '@/components/CalculatorForm';

describe('CalculatorForm', () => {
  beforeEach(() => {
    window.va = vi.fn();
    window.gtag = vi.fn();
  });

  it('shows an error and blocks results when billable hours are 0', async () => {
    const user = userEvent.setup();

    render(<CalculatorForm />);

    const hoursInput = screen.getByRole('spinbutton', {
      name: /horas facturables al mes/i,
    });

    await user.clear(hoursInput);
    await user.type(hoursInput, '0');
    await user.click(screen.getByRole('button', { name: /calcular/i }));

    expect(screen.getByText('Las horas facturables deben ser mayores que 0.')).toBeInTheDocument();
    expect(screen.getByText('Revisa los campos marcados antes de calcular.')).toBeInTheDocument();
    expect(window.va).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('heading', { name: /tu referencia mensual para presupuestar/i }),
    ).not.toBeInTheDocument();
  });

  it('can submit as a plain GET form when JavaScript is disabled', () => {
    render(<CalculatorForm />);

    const form = screen.getByRole('form');

    expect(form).toHaveAttribute('method', 'get');
    expect(form).toHaveAttribute('action', '/#calculadora');
    expect(screen.getByRole('spinbutton', { name: /neto mensual deseado/i })).toHaveAttribute(
      'name',
      'targetNet',
    );
    expect(screen.getByRole('combobox', { name: /cómo quieres estimar el irpf/i })).toHaveAttribute(
      'name',
      'irpfMode',
    );
  });

  it('prefills imported costs without calculating until the target net is reviewed', async () => {
    const user = userEvent.setup();

    render(
      <CalculatorForm
        importedFromCosts
        initialValues={{
          monthlyExpenses: '100',
          monthlyNonDeductibleExpenses: '60',
          billableHours: '80',
          selfEmployedFeeMode: 'manual',
          selfEmployedFee: '320',
        }}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent(/hemos traído tus costes y horas/i);
    expect(screen.getByRole('spinbutton', { name: /gastos mensuales deducibles/i })).toHaveValue(100);
    expect(screen.getByRole('spinbutton', { name: /gastos mensuales no deducibles/i })).toHaveValue(60);
    expect(screen.getByRole('combobox', { name: /cómo quieres calcular la cuota/i })).toHaveValue('manual');
    expect(screen.getByRole('spinbutton', { name: /cuota manual/i })).toHaveValue(320);
    expect(screen.queryByRole('heading', { name: /tu referencia mensual para presupuestar/i }))
      .not.toBeInTheDocument();
    expect(window.va).toHaveBeenCalledWith('event', { name: 'monthly_costs_transferred' });

    await user.click(screen.getByRole('button', { name: /calcular mi tarifa/i }));

    expect(screen.getByText(/costes no deducibles cubiertos/i)).toBeInTheDocument();
    expect(window.va).toHaveBeenCalledWith('event', { name: 'monthly_costs_tariff_calculated' });
    expect(window.location.search).toContain('monthlyNonDeductibleExpenses=60');
  });

  it('renders a server-submitted result without the copy button when requested', () => {
    render(<CalculatorForm initiallySubmitted enableResultCopy={false} />);

    expect(
      screen.getByRole('heading', { name: /tu referencia mensual para presupuestar/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /copiar resumen/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/resumen rápido para guardar/i)).not.toBeInTheDocument();
  });

  it('renders share actions for a server-submitted result when a share URL is provided', () => {
    render(
      <CalculatorForm
        initiallySubmitted
        enableResultCopy={false}
        initialShareUrl="https://www.cuantofacturar.es/?targetNet=1500#calculadora"
      />,
    );

    expect(screen.queryByRole('button', { name: /copiar resumen/i })).not.toBeInTheDocument();
    const shareText = screen.getByLabelText(/resumen detallado para compartir/i);

    expect((shareText as HTMLTextAreaElement).value).toContain('Resumen de cálculo - Cuánto Facturar');
    expect((shareText as HTMLTextAreaElement).value).toContain('Calculadora: https://www.cuantofacturar.es/');
    expect(screen.queryByRole('link', { name: /linkedin/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /whatsapp/i })).toHaveAttribute(
      'href',
      expect.stringContaining('Resumen%20de%20c%C3%A1lculo'),
    );
    expect(screen.getByRole('link', { name: /whatsapp/i })).toHaveAttribute(
      'data-share-channel',
      'whatsapp',
    );
  });

  it('shows an error when the target net is 0', async () => {
    const user = userEvent.setup();

    render(<CalculatorForm />);

    const targetNetInput = screen.getByRole('spinbutton', {
      name: /neto mensual deseado/i,
    });

    await user.clear(targetNetInput);
    await user.type(targetNetInput, '0');
    await user.click(screen.getByRole('button', { name: /calcular/i }));

    expect(screen.getByText('El neto mensual debe ser mayor que 0.')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /tu referencia mensual para presupuestar/i }),
    ).not.toBeInTheDocument();
  });

  it('renders the result card when the form is valid', async () => {
    const user = userEvent.setup();

    render(<CalculatorForm />);

    await user.click(screen.getByRole('button', { name: /calcular/i }));

    expect(window.va).toHaveBeenCalledWith('event', {
      name: 'calculator_completed',
      data: {
        irpfMode: 'progressive',
        selfEmployedFeeMode: 'auto',
      },
    });
    expect(window.gtag).toHaveBeenCalledWith('event', 'calculator_completed', {
      irpfMode: 'progressive',
      selfEmployedFeeMode: 'auto',
    });
    expect(window.gtag).toHaveBeenCalledWith('event', 'conversion', {
      send_to: 'AW-18153863846/8a21CPLC-qocEKb1t9BD',
    });
    expect(
      screen.getByRole('heading', { name: /tu referencia mensual para presupuestar/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/facturación objetivo sin iva/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/beneficio antes de irpf/i)).toBeInTheDocument();
    expect(screen.getByText(/esta simulación sitúa tu objetivo en/i)).toBeInTheDocument();
    expect(screen.getByText(/revisa esta tarifa antes de enviarla/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /quiero el kit/i })).toHaveAttribute(
      'href',
      '#kit-tarifa-form',
    );
    expect(screen.getByRole('link', { name: /quiero el kit/i })).toHaveAttribute(
      'data-result-kit-cta',
      'result-card',
    );
    expect(screen.getByText(/tipo efectivo aproximado/i)).toBeInTheDocument();
    expect(screen.getByText(/hemos estimado una cuota mínima orientativa/i)).toBeInTheDocument();
    expect(screen.queryByText('Revisa los campos marcados antes de calcular.')).not.toBeInTheDocument();
  });

  it('tracks the result kit CTA in Vercel Analytics and Google tags', async () => {
    const user = userEvent.setup();

    render(<CalculatorForm />);

    await user.click(screen.getByRole('button', { name: /calcular/i }));
    await user.click(screen.getByRole('link', { name: /quiero el kit/i }));

    expect(window.va).toHaveBeenCalledWith('event', {
      name: 'result_kit_cta_clicked',
      data: { source: 'result-card' },
    });
    expect(window.gtag).toHaveBeenCalledWith('event', 'result_kit_cta_clicked', {
      source: 'result-card',
    });
  });

  it('updates the URL with a shareable calculation after a valid submit', async () => {
    const user = userEvent.setup();

    render(<CalculatorForm />);

    await user.click(screen.getByRole('button', { name: /calcular/i }));

    expect(window.location.search).toContain('targetNet=1500');
    expect(window.location.search).toContain('billableHours=80');
    expect(window.location.hash).toBe('#calculadora');
    const shareText = screen.getByLabelText(/resumen detallado para compartir/i);

    expect((shareText as HTMLTextAreaElement).value).toContain('Calculadora: http://localhost:3000/');
    expect(screen.getByRole('link', { name: /whatsapp/i })).toHaveAttribute(
      'href',
      expect.stringContaining('Resumen%20de%20c%C3%A1lculo'),
    );
  });

  it('can calculate without changing the URL when embedded in another landing', async () => {
    const user = userEvent.setup();

    window.history.replaceState(null, '', '/cuanto-cuesta-ser-autonomo');
    render(<CalculatorForm updateUrlOnSubmit={false} enableResultCopy={false} />);

    await user.click(screen.getByRole('button', { name: /calcular/i }));

    expect(window.location.pathname).toBe('/cuanto-cuesta-ser-autonomo');
    expect(window.location.search).toBe('');
    expect(
      screen.getByRole('heading', { name: /tu referencia mensual para presupuestar/i }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/resumen detallado para compartir/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/resumen rápido para guardar/i)).not.toBeInTheDocument();
  });

  it('uses the detailed result summary in social share links', async () => {
    const user = userEvent.setup();

    render(<CalculatorForm />);

    await user.click(screen.getByRole('button', { name: /calcular/i }));

    const whatsappLink = screen.getByRole('link', { name: /whatsapp/i });
    const xLink = screen.getByRole('link', { name: 'X' });
    const emailLink = screen.getByRole('link', { name: /email/i });

    expect(whatsappLink).toHaveAttribute('href', expect.stringContaining('Neto%20objetivo'));
    expect(whatsappLink).toHaveAttribute('href', expect.stringContaining('Facturaci%C3%B3n%20objetivo'));
    expect(whatsappLink).toHaveAttribute('href', expect.stringContaining('Calculadora%3A%20http'));
    expect(whatsappLink).toHaveAttribute('data-share-channel', 'whatsapp');
    expect(xLink).toHaveAttribute('data-share-channel', 'x');
    expect(emailLink).toHaveAttribute('data-share-channel', 'email');
    expect(xLink).toHaveAttribute('href', expect.stringContaining('Tarifa%20media%20orientativa'));
    expect(emailLink).toHaveAttribute('href', expect.stringContaining('body=Resumen%20de%20c%C3%A1lculo'));
  });

  it('moves focus to the result card after a successful calculation', async () => {
    const user = userEvent.setup();

    render(<CalculatorForm />);

    await user.click(screen.getByRole('button', { name: /calcular/i }));

    const resultCardHeading = screen.getByRole('heading', {
      name: /tu referencia mensual para presupuestar/i,
    });
    const resultCard = resultCardHeading.closest('section');

    expect(resultCard).not.toBeNull();
    expect(resultCard).toHaveAttribute('tabindex', '-1');
    await waitFor(() => {
      expect(resultCard).toHaveFocus();
    });
  });

  it('copies a concise calculation summary', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText,
      },
    });

    render(<CalculatorForm />);

    await user.click(screen.getByRole('button', { name: /calcular/i }));
    await user.click(screen.getByRole('button', { name: /copiar resumen/i }));

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Facturación objetivo sin IVA'));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Tarifa media orientativa'));
    expect(screen.getByText('Resumen copiado.')).toBeInTheDocument();
  });

  it('keeps fractional billable hours visible for correction', async () => {
    const user = userEvent.setup();

    render(<CalculatorForm />);

    const hoursInput = screen.getByRole('spinbutton', {
      name: /horas facturables al mes/i,
    });

    await user.clear(hoursInput);
    await user.type(hoursInput, '80.4');
    await user.tab();

    expect(hoursInput).toHaveValue(80.4);
  });

  it('preserves an invalid expense and focuses it after submission', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm />);

    const expensesInput = screen.getByRole('spinbutton', { name: /gastos mensuales deducibles/i });
    await user.clear(expensesInput);
    await user.type(expensesInput, '-100');
    await user.click(screen.getByRole('button', { name: /calcular/i }));

    expect(expensesInput).toHaveValue(-100);
    expect(screen.getByText('Los gastos mensuales no pueden ser negativos.')).toBeInTheDocument();
    await waitFor(() => expect(expensesInput).toHaveFocus());
    expect(screen.queryByRole('heading', { name: /tu referencia mensual para presupuestar/i })).not.toBeInTheDocument();
  });

  it('normalizes a pasted Spanish currency amount', async () => {
    const user = userEvent.setup();

    render(<CalculatorForm />);

    const targetInput = screen.getByRole('spinbutton', {
      name: /neto mensual deseado/i,
    });

    await user.click(targetInput);
    await user.paste('2.500,50 €');

    expect(targetInput).toHaveValue(2500.5);
  });

  it('uses the selected autonomous community in the progressive IRPF explanation', async () => {
    const user = userEvent.setup();

    render(<CalculatorForm />);

    await user.selectOptions(
      screen.getByRole('combobox', {
        name: /comunidad autónoma para el irpf/i,
      }),
      'madrid',
    );
    await user.click(screen.getByRole('button', { name: /calcular/i }));

    expect(screen.getByText(/referencia autonómica de/i)).toBeInTheDocument();
    expect(screen.getAllByText(/madrid/i).length).toBeGreaterThan(0);
  });

  it('renders the reduced-fee explanation when the user selects the new autonomous mode', async () => {
    const user = userEvent.setup();

    render(<CalculatorForm />);

    await user.selectOptions(
      screen.getByRole('combobox', {
        name: /cómo quieres calcular la cuota de autónomos/i,
      }),
      'reduced',
    );
    await user.click(screen.getByRole('button', { name: /calcular/i }));

    expect(screen.getByText(/hemos aplicado la tarifa reducida inicial/i)).toBeInTheDocument();
    expect(screen.getByText(/base mínima del tramo 1 de la tabla general/i)).toBeInTheDocument();
  });

  it('tracks the conversion only once per visit even if the user recalculates', async () => {
    const user = userEvent.setup();

    render(<CalculatorForm />);

    const submitButton = screen.getByRole('button', { name: /calcular/i });

    await user.click(submitButton);
    await user.click(submitButton);

    expect(window.va).toHaveBeenCalledTimes(1);
  });

  it('shows the SMI warning when the user chooses the reduced-fee extension', async () => {
    const user = userEvent.setup();

    render(<CalculatorForm />);

    await user.selectOptions(
      screen.getByRole('combobox', {
        name: /cómo quieres calcular la cuota de autónomos/i,
      }),
      'reduced',
    );
    await user.selectOptions(
      screen.getByRole('combobox', {
        name: /período de la tarifa reducida/i,
      }),
      'extended',
    );
    await user.click(screen.getByRole('button', { name: /calcular/i }));

    expect(screen.getByText(/hemos aplicado la prórroga estimada de la tarifa reducida/i)).toBeInTheDocument();
    expect(screen.getByText(/así que esa prórroga podría no corresponderte/i)).toBeInTheDocument();
  });

  it('asks for correction when manual IRPF reaches 100', async () => {
    const user = userEvent.setup();

    render(<CalculatorForm />);

    await user.selectOptions(
      screen.getByRole('combobox', {
        name: /cómo quieres estimar el irpf/i,
      }),
      'manual',
    );

    const irpfInput = screen.getByRole('spinbutton', {
      name: /irpf manual/i,
    });

    await user.clear(irpfInput);
    await user.type(irpfInput, '100');
    await user.click(screen.getByRole('button', { name: /calcular/i }));

    expect(irpfInput).toHaveValue(100);
    expect(screen.getByText('El IRPF debe ser menor que 100.')).toBeInTheDocument();
    await waitFor(() => expect(irpfInput).toHaveFocus());
    expect(
      screen.queryByRole('heading', { name: /tu referencia mensual para presupuestar/i }),
    ).not.toBeInTheDocument();
  });
});
