import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Planner from '@/components/CashDatePlanner';
import { cashDatesExample, type CashDatesInput } from '@/lib/cashDates';
import { decodeCashDatesFile, encodeCashDatesFile, MAX_CASH_DATES_FILE_BYTES } from '@/lib/cashDatesFile';

const result = () => screen.getByRole('status', { name: 'Caja por fechas' });
const feedback = () => screen.getByRole('status', { name: 'Archivo del plan' });
const initial = () => screen.getByLabelText('Saldo antes del primer movimiento (EUR)');
const chooser = () => screen.getByLabelText('Abrir un plan guardado');
function fixture(input: CashDatesInput = cashDatesExample, fictional = true) {
  const encoded = encodeCashDatesFile(input, fictional);
  if (!encoded.valid) throw new Error('Invalid test fixture');
  return new File([encoded.text], 'plan-caja-fechas.json', { type: 'application/json' });
}
function blobText(blob: Blob): Promise<string> {
  return new Promise((resolve) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.readAsText(blob); });
}

describe('save and reopen cash date plans', () => {
  beforeEach(() => {
    window.va = vi.fn(); window.gtag = vi.fn();
    const NativeURL = URL;
    class TestURL extends NativeURL { static createObjectURL = vi.fn(() => 'blob:cash-plan-fixture'); static revokeObjectURL = vi.fn(); }
    vi.stubGlobal('URL', TestURL);
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

  it('opens valid inputs, recomputes the result and retains a saved fictional marker', async () => {
    render(<Planner />);
    expect(screen.queryByRole('button', { name: 'Guardar este plan en un archivo' })).not.toBeInTheDocument();
    await userEvent.upload(chooser(), fixture());
    await waitFor(() => expect(feedback()).toHaveTextContent('Plan abierto con 3 movimientos'));
    expect(initial()).toHaveValue('1000');
    expect(screen.getByLabelText('Fecha del movimiento 2')).toHaveValue('2026-11-20');
    expect(result()).toHaveTextContent('movimientos ficticios');
    expect(within(result()).getByText('Saldo tras la última fecha').nextElementSibling).toHaveTextContent('700,00');
    expect(within(result()).getByText('Saldo mínimo con este orden supuesto').nextElementSibling).toHaveTextContent('-800,00');
    expect(chooser()).toHaveValue('');
    expect(document.querySelector('form')).toBeNull();
    expect(document.querySelector('[name]')).toBeNull();
    expect(window.va).not.toHaveBeenCalled(); expect(window.gtag).not.toHaveBeenCalled();
  });

  it('generates a real input-only blob for the checked plan and removes saving when inputs change', async () => {
    render(<Planner />);
    await userEvent.click(screen.getByRole('button', { name: 'Probar las fechas ficticias' }));
    await userEvent.click(screen.getByRole('button', { name: 'Guardar este plan en un archivo' }));
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledOnce();
    expect(document.querySelector('a[download]')).toBeNull();
    const blob = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob;
    expect(blob.type).toBe('application/json;charset=utf-8');
    const text = await blobText(blob);
    expect(decodeCashDatesFile(text)).toEqual({ valid: true, fictional: true, input: cashDatesExample });
    expect(JSON.parse(text)).not.toHaveProperty('finalBalance');
    expect(screen.getByRole('status', { name: 'Descarga del plan' })).toHaveTextContent('Archivo del plan generado');
    fireEvent.change(initial(), { target: { value: '2000' } });
    expect(result()).toBeEmptyDOMElement();
    expect(screen.queryByRole('button', { name: 'Guardar este plan en un archivo' })).not.toBeInTheDocument();
    expect(window.va).not.toHaveBeenCalled(); expect(window.gtag).not.toHaveBeenCalled();
  });

  it.each([
    new File(['not a plan'], 'invalid.json', { type: 'application/json' }),
    new File(['x'.repeat(MAX_CASH_DATES_FILE_BYTES + 1)], 'large.json', { type: 'application/json' }),
  ])('preserves the current inputs and result when a file is invalid or too large', async (file) => {
    render(<Planner />);
    await userEvent.click(screen.getByRole('button', { name: 'Probar las fechas ficticias' }));
    const previous = result().textContent;
    await userEvent.upload(chooser(), file);
    await waitFor(() => expect(feedback().querySelector('.field-error')).toBeInTheDocument());
    expect(initial()).toHaveValue('1000'); expect(result().textContent).toBe(previous);
    expect(screen.getByLabelText('Fecha del movimiento 2')).toHaveValue('2026-11-20');
  });

  it('replaces the plan only after validation and allows reopening the same named file', async () => {
    render(<Planner />);
    await userEvent.upload(chooser(), fixture());
    await waitFor(() => expect(feedback()).toHaveTextContent('Plan abierto con 3 movimientos'));
    const input = { initialBalance: 0, movements: [{ date: '2026-12-01', kind: 'receipt' as const, amount: 10 }] };
    await userEvent.upload(chooser(), fixture(input, false));
    await waitFor(() => expect(feedback()).toHaveTextContent('Plan abierto con 1 movimiento.'));
    expect(initial()).toHaveValue('0'); expect(screen.getAllByRole('combobox')).toHaveLength(1);
    expect(result()).not.toHaveTextContent('movimientos ficticios');
    expect(within(result()).getByText('Saldo tras la última fecha').nextElementSibling).toHaveTextContent('10,00');
  });

  it('reports a file read error and keeps the current plan', async () => {
    render(<Planner />);
    await userEvent.click(screen.getByRole('button', { name: 'Probar las fechas ficticias' }));
    vi.spyOn(FileReader.prototype, 'readAsText').mockImplementation(function (this: FileReader) { this.dispatchEvent(new ProgressEvent('error')); });
    await userEvent.upload(chooser(), fixture());
    await waitFor(() => expect(feedback()).toHaveTextContent('No se ha podido leer el archivo'));
    expect(initial()).toHaveValue('1000'); expect(result()).toHaveTextContent('700,00');
  });

  it('does not let a delayed file read overwrite a later user edit', async () => {
    render(<Planner />);
    await userEvent.click(screen.getByRole('button', { name: 'Probar las fechas ficticias' }));
    const pending: FileReader[] = [];
    vi.spyOn(FileReader.prototype, 'readAsText').mockImplementation(function (this: FileReader) { pending.push(this); });
    await userEvent.upload(chooser(), fixture());
    expect(feedback()).toHaveTextContent('Abriendo el archivo');
    fireEvent.change(initial(), { target: { value: '2000' } });
    const encoded = encodeCashDatesFile(cashDatesExample, true);
    if (!encoded.valid) throw new Error('Invalid test plan');
    await act(async () => {
      Object.defineProperty(pending[0], 'result', { value: encoded.text });
      pending[0].dispatchEvent(new ProgressEvent('load'));
    });
    expect(initial()).toHaveValue('2000'); expect(result()).toBeEmptyDOMElement(); expect(feedback()).toBeEmptyDOMElement();
  });

  it('reports a failed download without losing the checked plan', async () => {
    render(<Planner />);
    await userEvent.click(screen.getByRole('button', { name: 'Probar las fechas ficticias' }));
    vi.mocked(URL.createObjectURL).mockImplementationOnce(() => { throw new Error('Blocked download'); });
    await userEvent.click(screen.getByRole('button', { name: 'Guardar este plan en un archivo' }));
    expect(screen.getByRole('status', { name: 'Descarga del plan' })).toHaveTextContent('No se ha podido generar el archivo');
    expect(result()).toHaveTextContent('700,00'); expect(initial()).toHaveValue('1000');
  });
});
