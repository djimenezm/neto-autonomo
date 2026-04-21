import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import CalculatorForm from '@/components/CalculatorForm';

describe('CalculatorForm', () => {
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
    expect(screen.queryByRole('heading', { name: /tu estimacion mensual/i })).not.toBeInTheDocument();
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
    expect(screen.queryByRole('heading', { name: /tu estimacion mensual/i })).not.toBeInTheDocument();
  });

  it('renders the result card when the form is valid', async () => {
    const user = userEvent.setup();

    render(<CalculatorForm />);

    await user.click(screen.getByRole('button', { name: /calcular/i }));

    expect(screen.getByRole('heading', { name: /tu estimacion mensual/i })).toBeInTheDocument();
    expect(screen.getByText(/facturacion mensual sin iva/i)).toBeInTheDocument();
    expect(screen.getByText(/beneficio antes de irpf/i)).toBeInTheDocument();
    expect(screen.getByText(/esta simulacion situa tu objetivo en/i)).toBeInTheDocument();
    expect(screen.getByText(/tipo efectivo aproximado/i)).toBeInTheDocument();
    expect(screen.getByText(/hemos estimado una cuota minima orientativa/i)).toBeInTheDocument();
    expect(screen.queryByText('Revisa los campos marcados antes de calcular.')).not.toBeInTheDocument();
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
        name: /comunidad autonoma para el irpf/i,
      }),
      'madrid',
    );
    await user.click(screen.getByRole('button', { name: /calcular/i }));

    expect(screen.getByText(/referencia autonomica de/i)).toBeInTheDocument();
    expect(screen.getAllByText(/madrid/i).length).toBeGreaterThan(0);
  });

  it('renders the reduced-fee explanation when the user selects the new autonomous mode', async () => {
    const user = userEvent.setup();

    render(<CalculatorForm />);

    await user.selectOptions(
      screen.getByRole('combobox', {
        name: /como quieres calcular la cuota de autonomos/i,
      }),
      'reduced',
    );
    await user.click(screen.getByRole('button', { name: /calcular/i }));

    expect(screen.getByText(/hemos aplicado la tarifa reducida inicial/i)).toBeInTheDocument();
    expect(screen.getByText(/base minima del tramo 1 de la tabla general/i)).toBeInTheDocument();
  });

  it('shows the SMI warning when the user chooses the reduced-fee extension', async () => {
    const user = userEvent.setup();

    render(<CalculatorForm />);

    await user.selectOptions(
      screen.getByRole('combobox', {
        name: /como quieres calcular la cuota de autonomos/i,
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

    expect(screen.getByText(/hemos aplicado la prorroga estimada de la tarifa reducida/i)).toBeInTheDocument();
    expect(screen.getByText(/asi que esa prorroga podria no corresponderte/i)).toBeInTheDocument();
  });

  it('normalizes IRPF manual values above 99 before calculating', async () => {
    const user = userEvent.setup();

    render(<CalculatorForm />);

    await user.selectOptions(
      screen.getByRole('combobox', {
        name: /como quieres estimar el irpf/i,
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
    expect(screen.getByRole('heading', { name: /tu estimacion mensual/i })).toBeInTheDocument();
  });
});
