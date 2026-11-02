import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Comparator from '@/components/MonthlyScenarioComparator';
import CalculatorForm from '@/components/CalculatorForm';
import { monthlyScenarioInput as reference } from '@/lib/monthlyScenarioExample';

const costLabel = 'Gastos deducibles del escenario alternativo (EUR/mes)';
const hoursLabel = 'Horas facturables del escenario alternativo (mes)';
const costs = () => screen.getByRole('textbox', { name: costLabel }) as HTMLInputElement;
const hours = () => screen.getByRole('textbox', { name: hoursLabel }) as HTMLInputElement;
const result = () => screen.getByRole('status', { name: 'Comparación de escenarios' });
const load = () => userEvent.click(screen.getByRole('button', { name: 'Cargar los datos de partida' }));
const recover = () => userEvent.click(screen.getByRole('button', { name: 'Recuperar mi alternativa anterior' }));
const compare = () => userEvent.click(screen.getByRole('button', { name: 'Comparar escenarios' }));
const write = (costValue: string, hoursValue: string) => {
  fireEvent.change(costs(), { target: { value: costValue } });
  fireEvent.change(hours(), { target: { value: hoursValue } });
};

function expectRecoveryFinished() {
  expect(screen.queryByRole('button', { name: 'Recuperar mi alternativa anterior' })).not.toBeInTheDocument();
  expect(screen.queryByText(/sustituye los cambios que ves ahora/)).not.toBeInTheDocument();
  expect(result()).toHaveTextContent('Alternativa anterior recuperada. Vuelve a comparar los escenarios para actualizar los resultados.');
  expect(result().querySelector('dl')).toBeNull();
  expect(result()).not.toHaveTextContent('Revisa los campos');
  expect(screen.queryByRole('link', { name: 'Abrir la alternativa en la calculadora' })).not.toBeInTheDocument();
  expect(costs()).toHaveAttribute('aria-invalid', 'false');
  expect(hours()).toHaveAttribute('aria-invalid', 'false');
  expect(costs()).toHaveFocus();
}

function expectReset() {
  expect(costs()).toHaveValue('');
  expect(hours()).toHaveValue('');
  expect(result()).toBeEmptyDOMElement();
  expect(screen.queryByRole('button', { name: 'Recuperar mi alternativa anterior' })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Abrir la alternativa en la calculadora' })).not.toBeInTheDocument();
}

describe('recover the alternative replaced by loading starting values', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });
  afterEach(() => vi.restoreAllMocks());

  it('restores the raw unfinished alternative without calculating, storing or sending it', async () => {
    const storageRead = vi.spyOn(Storage.prototype, 'getItem');
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const storageRemove = vi.spyOn(Storage.prototype, 'removeItem');
    const fetch = vi.spyOn(globalThis, 'fetch');
    const previousUrl = window.location.href;
    render(<Comparator reference={reference} />);
    write(' 450,,555 € ', ' 06, ');
    await load();
    expect(costs()).toHaveValue('300');
    expect(hours()).toHaveValue('80');
    const recovery = screen.getByRole('button', { name: 'Recuperar mi alternativa anterior' });
    expect(recovery).toHaveAttribute('type', 'button');
    expect(recovery).toHaveAccessibleDescription(/sustituye los cambios que ves ahora/);
    expect(recovery).toHaveAccessibleDescription(/referencia/);
    await recover();

    expect(costs()).toHaveValue(' 450,,555 € ');
    expect(hours()).toHaveValue(' 06, ');
    expectRecoveryFinished();
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getAllByRole('textbox')).toHaveLength(2);
    expect(document.querySelector('form')).toBeNull();
    expect(document.querySelector('[name]')).toBeNull();
    expect(window.location.href).toBe(previousUrl);
    expect(storageRead).not.toHaveBeenCalled();
    expect(storageWrite).not.toHaveBeenCalled();
    expect(storageRemove).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('keeps the first precise alternative through repeated loads and valid or invalid comparisons', async () => {
    render(<Comparator reference={reference} />);
    write(' 450,555 ', ' 060 ');
    await load();
    await compare();
    expect(screen.getByRole('link', { name: 'Abrir la alternativa en la calculadora' })).toBeInTheDocument();
    await load();
    write('650,005', '50');
    await compare();
    expect(costs()).toHaveValue('650,01');
    await load();
    write('1,,5', '1,5');
    await compare();
    expect(costs()).toHaveAttribute('aria-invalid', 'true');
    expect(hours()).toHaveAttribute('aria-invalid', 'true');
    await recover();

    expect(costs()).toHaveValue(' 450,555 ');
    expect(hours()).toHaveValue(' 060 ');
    expectRecoveryFinished();
    await compare();
    expect(costs()).toHaveValue('450,56');
    expect(hours()).toHaveValue('60');
    expect(screen.getByRole('link', { name: 'Abrir la alternativa en la calculadora' })).toHaveAttribute('href', expect.stringContaining('monthlyExpenses=450.56'));
    expect(screen.getByRole('link', { name: 'Abrir la alternativa en la calculadora' })).toHaveAttribute('href', expect.stringContaining('billableHours=60'));
    expect(result()).not.toHaveTextContent('Alternativa anterior recuperada');
  });

  it('does not copy empty fields or untouched loaded values even after comparing with Enter', async () => {
    render(<Comparator reference={reference} />);
    expectReset();
    await load();
    await compare();
    fireEvent.keyDown(hours(), { key: 'Enter' });
    await load();
    await load();
    expect(costs()).toHaveValue('300');
    expect(hours()).toHaveValue('80');
    expect(screen.queryByRole('button', { name: 'Recuperar mi alternativa anterior' })).not.toBeInTheDocument();

    fireEvent.change(hours(), { target: { value: '65' } });
    await load();
    await recover();
    expect(costs()).toHaveValue('300');
    expect(hours()).toHaveValue('65');
    expectRecoveryFinished();
  });

  it('recovers deliberate zeroes and partial alternatives without turning them into checked results', async () => {
    render(<Comparator reference={reference} />);
    for (const [costValue, hoursValue] of [['0', '0'], ['', '45'], ['0', '']]) {
      write(costValue, hoursValue);
      await load();
      await recover();
      expect(costs()).toHaveValue(costValue);
      expect(hours()).toHaveValue(hoursValue);
      expectRecoveryFinished();
    }
    write('0', '60');
    await load();
    await recover();
    expectRecoveryFinished();
    await compare();
    expect(costs()).toHaveAttribute('aria-invalid', 'false');
    expect(hours()).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByRole('link', { name: 'Abrir la alternativa en la calculadora' })).toHaveAttribute('href', expect.stringContaining('monthlyExpenses=0'));
  });

  it('consumes recovery and captures the next alternative rather than reviving the old one', async () => {
    render(<Comparator reference={reference} />);
    write('450', '60');
    await load();
    await recover();
    expectRecoveryFinished();
    write(' 750,125 ', ' 090 ');
    await load();
    await recover();
    expect(costs()).toHaveValue(' 750,125 ');
    expect(hours()).toHaveValue(' 090 ');
    expectRecoveryFinished();
  });

  it('retains an equivalent reference but resets fields, recovery and feedback for changed assumptions', async () => {
    const { rerender } = render(<Comparator reference={reference} />);
    write('450,555', '60');
    await load();
    rerender(<Comparator reference={{ ...reference }} />);
    expect(screen.getByRole('button', { name: 'Recuperar mi alternativa anterior' })).toBeInTheDocument();
    for (const nextReference of [{ ...reference, monthlyExpenses: 500 }, { ...reference, irpfMode: 'progressive' as const }]) {
      rerender(<Comparator reference={nextReference} />);
      expectReset();
      rerender(<Comparator reference={reference} />);
      expectReset();
      write('350', '70');
      await load();
    }
    await recover();
    expectRecoveryFinished();
    rerender(<Comparator reference={{ ...reference, billableHours: 90 }} />);
    expectReset();
    rerender(<Comparator reference={reference} />);
    expectReset();
  });

  it('keeps the main calculation, GET controls and shared summary unchanged when recovering', async () => {
    render(<CalculatorForm initiallySubmitted initialValues={{ targetNet: '2000', monthlyExpenses: '300', billableHours: '80', irpfMode: 'manual', irpfRate: '15', selfEmployedFeeMode: 'manual', selfEmployedFee: '320' }} initialShareUrl="https://www.cuantofacturar.es/?targetNet=2000#calculadora" />);
    const main = screen.getByRole('form', { name: 'Calculadora de facturación' }) as HTMLFormElement;
    const beforeControls = [...new FormData(main).entries()];
    const beforeSummary = (screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value;
    await userEvent.click(screen.getByText('Comparar cambios en mis gastos y horas'));
    write('450,555', '60');
    await load();
    await compare();
    await recover();

    expect(costs()).toHaveValue('450,555');
    expect(hours()).toHaveValue('60');
    expectRecoveryFinished();
    const group = screen.getByRole('group', { name: 'Los dos datos que quieres comparar' });
    expect(within(group).getAllByRole('textbox').every(field => !field.hasAttribute('name'))).toBe(true);
    expect([...new FormData(main).entries()]).toEqual(beforeControls);
    expect((screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value).toBe(beforeSummary);
    expect(screen.getByRole('spinbutton', { name: /Horas facturables al mes/ })).toHaveValue(80);
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });
});
