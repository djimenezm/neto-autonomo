import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import CalculatorForm from '@/components/CalculatorForm';

const reference = { targetNet: '2000', monthlyExpenses: '300', billableHours: '80', irpfMode: 'manual' as const, irpfRate: '15', selfEmployedFeeMode: 'manual' as const, selfEmployedFee: '320' };
const result = () => screen.getByRole('region', { name: 'Tu referencia mensual para presupuestar' });
const target = () => screen.getByRole('spinbutton', { name: 'Neto mensual deseado (EUR)' });
let originalScroll: PropertyDescriptor | undefined;
let scrollIntoView: MockInstance<HTMLElement['scrollIntoView']>;
let focus: MockInstance<HTMLElement['focus']>;
let frames: FrameRequestCallback[];

async function flushFrames() {
  await act(async () => {
    const pending = frames.splice(0);
    for (const frame of pending) frame(performance.now());
  });
}

function expectResultNavigation() {
  const region = result();
  expect(region).toHaveFocus();
  const scrollCalls = scrollIntoView.mock.calls.filter((_, index) => scrollIntoView.mock.contexts[index] === region);
  const focusCalls = focus.mock.calls.filter((_, index) => focus.mock.contexts[index] === region);
  expect(scrollCalls.length).toBeGreaterThan(0);
  expect(scrollCalls.every(([options]) => typeof options === 'object' && options.block === 'start' && options.behavior === 'instant')).toBe(true);
  expect(focusCalls.length).toBeGreaterThan(0);
  expect(focusCalls.every(([options]) => options?.preventScroll === true)).toBe(true);
}

describe('navigation to the main calculator result', () => {
  beforeEach(() => {
    window.va = vi.fn();
    window.gtag = vi.fn();
    originalScroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollIntoView');
    scrollIntoView = vi.fn<HTMLElement['scrollIntoView']>();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, writable: true, value: scrollIntoView });
    focus = vi.spyOn(HTMLElement.prototype, 'focus');
    frames = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => { frames.push(callback); return frames.length; });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalScroll) Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', originalScroll);
    else Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView');
  });

  it('focuses and explicitly aligns the result to the start after a valid calculate click', async () => {
    render(<CalculatorForm initialValues={reference} />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Calcular mi tarifa orientativa' })); });
    await flushFrames();

    expectResultNavigation();
    expect(new URL(window.location.href).searchParams.get('targetNet')).toBe('2000');
    expect(new URL(window.location.href).searchParams.get('selfEmployedFeeMode')).toBe('manual');
    expect((screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value).toContain('2972,94');
    expect(window.va).toHaveBeenCalledTimes(1);
    expect(window.gtag).toHaveBeenCalledTimes(2);
  });

  it('aligns again for repeated valid submissions on unchanged inputs and for a newly calculated target', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm initialValues={reference} />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Calcular mi tarifa orientativa' })); });
    await flushFrames();

    for (const value of ['2000', '2500']) {
      await user.click(target());
      await user.clear(target());
      await user.type(target(), value);
      scrollIntoView.mockClear();
      focus.mockClear();
      await act(async () => { fireEvent.submit(screen.getByRole('form', { name: 'Calculadora de facturación' })); });
      await flushFrames();

      expectResultNavigation();
      expect(new URL(window.location.href).searchParams.get('targetNet')).toBe(value);
    }
    expect(window.va).toHaveBeenCalledTimes(1);
    expect(window.gtag).toHaveBeenCalledTimes(2);
  });

  it('does not navigate to the result on initial load, editing, invalid submission or restoring calculated inputs', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm initialValues={reference} initiallySubmitted initialShareUrl="https://www.cuantofacturar.es/?targetNet=2000#calculadora" />);
    const previousUrl = window.location.href;
    await flushFrames();
    expect(result()).not.toHaveFocus();
    expect(scrollIntoView).not.toHaveBeenCalled();

    await user.click(target());
    await user.clear(target());
    await user.type(target(), '2500');
    expect(screen.queryByRole('region', { name: 'Tu referencia mensual para presupuestar' })).not.toBeInTheDocument();
    expect(scrollIntoView).not.toHaveBeenCalled();
    await user.clear(target());
    await user.type(target(), '0');
    await act(async () => { fireEvent.submit(screen.getByRole('form', { name: 'Calculadora de facturación' })); });
    await flushFrames();
    expect(target()).toHaveFocus();
    expect(target()).toHaveAttribute('aria-invalid', 'true');
    expect(scrollIntoView).not.toHaveBeenCalled();

    await user.clear(target());
    await user.type(target(), '2000');
    await flushFrames();
    expect(result()).toBeVisible();
    expect(target()).toHaveFocus();
    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(window.location.href).toBe(previousUrl);
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });
});
