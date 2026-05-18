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

  it('renders a server-submitted result without the copy button when requested', () => {
    render(<CalculatorForm initiallySubmitted enableResultCopy={false} />);

    expect(
      screen.getByRole('heading', { name: /tu referencia mensual para presupuestar/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /copiar resumen/i })).not.toBeInTheDocument();
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

  it('normalizes decimal billable hours to a whole number on blur', async () => {
    const user = userEvent.setup();

    render(<CalculatorForm />);

    const hoursInput = screen.getByRole('spinbutton', {
      name: /horas facturables al mes/i,
    });

    await user.clear(hoursInput);
    await user.type(hoursInput, '80.4');
    await user.tab();

    expect(hoursInput).toHaveValue(80);
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
        name: /periodo de la tarifa reducida/i,
      }),
      'extended',
    );
    await user.click(screen.getByRole('button', { name: /calcular/i }));

    expect(screen.getByText(/hemos aplicado la prórroga estimada de la tarifa reducida/i)).toBeInTheDocument();
    expect(screen.getByText(/así que esa prórroga podría no corresponderte/i)).toBeInTheDocument();
  });

  it('normalizes IRPF manual values above 99 before calculating', async () => {
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

    expect(irpfInput).toHaveValue(99);
    expect(
      screen.getByRole('heading', { name: /tu referencia mensual para presupuestar/i }),
    ).toBeInTheDocument();
  });
});
