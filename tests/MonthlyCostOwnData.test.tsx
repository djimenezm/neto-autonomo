import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import MonthlyCostCalculator from '@/components/MonthlyCostCalculator';

const labels = { fee: 'Cuota de autónomos', advisor: 'Gestoría o asesoría', software: 'Software y herramientas', insurance: 'Seguros', other: 'Otros gastos de actividad', hours: 'Horas facturables al mes' } as const;
const costKeys = ['fee', 'advisor', 'software', 'insurance', 'other', 'hours'] as const;
const periodKeys = ['advisor', 'software', 'insurance', 'other'] as const;
const field = (key: keyof typeof labels) => screen.getByRole('textbox', { name: labels[key] }) as HTMLInputElement;
const period = (key: (typeof periodKeys)[number]) => screen.getByRole('combobox', { name: `Frecuencia de ${labels[key].toLocaleLowerCase('es-ES')}` }) as HTMLSelectElement;
const deductible = () => screen.getByRole('textbox', { name: 'Gastos deducibles, sin incluir la cuota' }) as HTMLInputElement;
const change = (input: HTMLElement, value: string) => fireEvent.change(input, { target: { value } });
const start = () => userEvent.click(screen.getByRole('button', { name: 'Empezar con mis costes' }));
const recover = () => userEvent.click(screen.getByRole('button', { name: 'Recuperar mis costes anteriores' }));
const draft = () => ({ values: Object.fromEntries(costKeys.map(key => [key, field(key).value])), periods: Object.fromEntries(periodKeys.map(key => [key, period(key).value])), deductible: deductible().value });
let originalScroll: PropertyDescriptor | undefined;
let scrollIntoView: MockInstance<HTMLElement['scrollIntoView']>;

describe('prepare personal costs without retaining the example amounts', () => {
  beforeEach(() => {
    window.va = vi.fn();
    window.gtag = vi.fn();
    originalScroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollIntoView');
    scrollIntoView = vi.fn<HTMLElement['scrollIntoView']>();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, writable: true, value: scrollIntoView });
  });
  afterEach(() => {
    vi.restoreAllMocks();
    if (originalScroll) Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', originalScroll);
    else Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView');
  });

  it('retains the initial worked example and clears every input and frequency only on request', async () => {
    render(<MonthlyCostCalculator />);
    expect(draft()).toEqual({ values: { fee: '320', advisor: '165', software: '420', insurance: '360', other: '40', hours: '80' }, periods: { advisor: 'quarterly', software: 'annual', insurance: 'annual', other: 'monthly' }, deductible: '' });
    expect(screen.getByText('Media mensual antes de pagarte').parentElement).toHaveTextContent('480,00');
    expect(screen.getByText('Al año según las frecuencias').nextElementSibling).toHaveTextContent('5760,00');
    expect(field('fee')).not.toHaveFocus();
    expect(scrollIntoView).not.toHaveBeenCalled();

    await start();

    for (const key of costKeys) expect(field(key)).toHaveValue('');
    for (const key of periodKeys) expect(period(key)).toHaveValue('monthly');
    expect(deductible()).toHaveValue('');
    expect(field('fee')).toHaveFocus();
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'center', behavior: 'instant' });
    expect(scrollIntoView.mock.contexts.at(-1)).toBe(field('fee'));
    expect(screen.getByText('Media mensual antes de pagarte').parentElement).toHaveTextContent('0,00');
    expect(screen.getByText('Al año según las frecuencias').nextElementSibling).toHaveTextContent('0,00');
    expect(screen.queryByText('Por hora facturable')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('status', { name: 'Datos que se trasladarán a la tarifa' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Empezar con mis costes' })).toHaveAttribute('type', 'button');
    expect(screen.getByRole('button', { name: 'Recuperar mis costes anteriores' })).toHaveAttribute('type', 'button');
  });

  it('recovers the original precise amounts, hours, deductible split and all payment periods', async () => {
    render(<MonthlyCostCalculator />);
    for (const [key, value] of Object.entries({ fee: ' 350,555 ', advisor: ' 225,005 ', software: '48,075', insurance: '97,005', other: ' 84,005 ', hours: ' 080,00 ' })) change(field(key as keyof typeof labels), value);
    for (const [key, value] of Object.entries({ advisor: 'quarterly', software: 'quarterly', insurance: 'annual', other: 'annual' })) change(period(key as (typeof periodKeys)[number]), value);
    change(deductible(), ' 17,005 ');
    const original = draft();
    await start();
    change(field('fee'), '500');
    change(field('hours'), '100');
    change(deductible(), '20');
    const navigationBeforeRecovery = scrollIntoView.mock.calls.length;
    await recover();

    expect(draft()).toEqual(original);
    expect(field('fee')).toHaveFocus();
    expect(scrollIntoView.mock.calls.length).toBeGreaterThan(navigationBeforeRecovery);
    expect(scrollIntoView.mock.lastCall).toEqual([{ block: 'center', behavior: 'instant' }]);
    expect(scrollIntoView.mock.contexts.at(-1)).toBe(field('fee'));
    expect(screen.queryByRole('button', { name: 'Recuperar mis costes anteriores' })).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Datos que se trasladarán a la tarifa' })).toHaveTextContent('17,01');
  });

  it('keeps the first copy across repeated preparation and starts a fresh recovery cycle after consuming it', async () => {
    render(<MonthlyCostCalculator />);
    change(field('fee'), '400');
    change(field('hours'), '90');
    change(deductible(), '75');
    const original = draft();
    await start();
    await start();
    change(field('fee'), '500');
    change(period('advisor'), 'annual');
    change(deductible(), '20');
    await start();
    await recover();
    expect(draft()).toEqual(original);

    change(field('fee'), ' 600,125 ');
    change(field('hours'), '75');
    change(deductible(), '45');
    const next = draft();
    await start();
    await recover();
    expect(draft()).toEqual(next);
    expect(field('fee')).toHaveFocus();
    expect(screen.queryByRole('button', { name: 'Recuperar mis costes anteriores' })).not.toBeInTheDocument();
  });

  it('restores an unfinished invalid payment and its hidden deductible draft without reviving old transfer errors', async () => {
    render(<MonthlyCostCalculator />);
    change(field('fee'), '0');
    change(field('hours'), '1,5');
    change(deductible(), '200');
    await userEvent.click(screen.getByRole('button', { name: 'Usar estos datos en mi tarifa' }));
    expect(screen.getAllByRole('alert')).toHaveLength(3);
    change(field('software'), ' 1,,50 ');
    expect(screen.queryByRole('textbox', { name: 'Gastos deducibles, sin incluir la cuota' })).not.toBeInTheDocument();

    await start();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await recover();

    expect(field('fee')).toHaveValue('0');
    expect(field('hours')).toHaveValue('1,5');
    expect(field('software')).toHaveValue(' 1,,50 ');
    expect(field('fee')).toHaveFocus();
    expect(field('software')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Introduce importes de pago válidos, iguales o mayores que cero.')).toHaveAttribute('role', 'alert');
    expect(screen.queryByText('Media mensual antes de pagarte')).not.toBeInTheDocument();
    change(field('software'), '420');
    expect(deductible()).toHaveValue('200');
    for (const input of [field('fee'), field('hours'), deductible()]) expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Usar estos datos en mi tarifa' }));
    expect(field('fee')).toHaveFocus();
    expect(screen.getAllByRole('alert')).toHaveLength(3);
  });

  it('calculates a personal quarterly cost without retaining any other example amount and previews the same GET split', async () => {
    const { container } = render(<MonthlyCostCalculator />);
    await start();
    change(field('fee'), '350');
    change(field('advisor'), '60');
    change(period('advisor'), 'quarterly');
    change(field('hours'), '80');
    change(deductible(), '10');

    for (const key of ['software', 'insurance', 'other'] as const) expect(field(key)).toHaveValue('');
    expect(screen.getByText('Media mensual antes de pagarte').parentElement).toHaveTextContent('370,00');
    expect(screen.getByText('Al año según las frecuencias').nextElementSibling).toHaveTextContent('4440,00');
    const preview = screen.getByRole('status', { name: 'Datos que se trasladarán a la tarifa' });
    expect(preview).toHaveTextContent('10,00');
    expect(preview).toHaveTextContent('350,00');
    expect(preview).toHaveTextContent('80 h/mes');
    expect(Object.fromEntries(new FormData(container.querySelector('form')!))).toEqual({ source: 'monthly-costs', monthlyExpenses: '10.00', monthlyNonDeductibleExpenses: '10.00', billableHours: '80', selfEmployedFeeMode: 'manual', selfEmployedFee: '350.00' });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('keeps preparation and recovery in memory without changing the URL, storage, network or events', async () => {
    const storageRead = vi.spyOn(Storage.prototype, 'getItem');
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const storageRemove = vi.spyOn(Storage.prototype, 'removeItem');
    const fetch = vi.spyOn(globalThis, 'fetch');
    const previousUrl = window.location.href;
    const { container } = render(<MonthlyCostCalculator />);
    change(deductible(), '100');
    const before = [...new FormData(container.querySelector('form')!).entries()];
    await start();
    change(field('fee'), '500');
    change(field('hours'), '60');
    await recover();

    expect([...new FormData(container.querySelector('form')!).entries()]).toEqual(before);
    expect(window.location.href).toBe(previousUrl);
    expect(storageRead).not.toHaveBeenCalled();
    expect(storageWrite).not.toHaveBeenCalled();
    expect(storageRemove).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });
});
