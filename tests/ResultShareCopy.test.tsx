import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Children, isValidElement, type ComponentProps, type ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import Head from 'next/head';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ResultCard from '@/components/ResultCard';
import CalculatorForm from '@/components/CalculatorForm';
import HomePage from '@/components/HomePage';
import IndexPage, { getServerSideProps } from '@/pages/index';
import { calculateFreelanceBilling, type CalculatorInput } from '@/lib/calculator';
import { getScenarioPath } from '@/lib/monthlyScenarios';
import { siteConfig } from '@/lib/site';

const input: CalculatorInput = { targetNet: 2000, monthlyExpenses: 300, monthlyNonDeductibleExpenses: 0, billableHours: 80, irpfMode: 'manual', irpfRate: 15, autonomousCommunity: 'common', selfEmployedFeeMode: 'manual', selfEmployedFee: 320, reducedFeePeriod: 'initial', hasIVA: true };
const label = 'Copiar resumen y enlace';
const success = 'Resumen y enlace copiados.';
const failure = 'No se ha podido copiar automáticamente. El resumen queda seleccionado para que lo copies manualmente.';
const textarea = () => screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement;
const feedback = () => screen.getByRole('status', { name: 'Copia del resumen y enlace' });
const modernButton = () => screen.getByRole('button', { name: label });
let originalClipboard: PropertyDescriptor | undefined;
let originalExecCommand: PropertyDescriptor | undefined;

function propsFor(targetNet = 2000): ComponentProps<typeof ResultCard> {
  const scenario = { ...input, targetNet };
  return { result: calculateFreelanceBilling(scenario), hoursBillable: scenario.billableHours, hasIVA: scenario.hasIVA, shareUrl: new URL(getScenarioPath(scenario), siteConfig.url).toString(), enableCopy: false, enableShareCopy: true };
}

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((accept, refuse) => { resolve = accept; reject = refuse; });
  return { promise, resolve, reject };
}

function clipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
}

function expectSelected() {
  expect(textarea()).toHaveFocus();
  expect(textarea()).toHaveAttribute('readonly');
  expect(textarea().selectionStart).toBe(0);
  expect(textarea().selectionEnd).toBe(textarea().value.length);
}

describe('directly copying the displayed summary and its calculation link', () => {
  beforeEach(() => {
    window.va = vi.fn();
    window.gtag = vi.fn();
    originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    originalExecCommand = Object.getOwnPropertyDescriptor(document, 'execCommand');
  });
  afterEach(() => {
    vi.restoreAllMocks();
    if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard);
    else Reflect.deleteProperty(navigator, 'clipboard');
    if (originalExecCommand) Object.defineProperty(document, 'execCommand', originalExecCommand);
    else Reflect.deleteProperty(document, 'execCommand');
  });

  it('keeps the new action opt-in independently of the legacy copy flag and requires a shareable result', () => {
    const props = propsFor();
    const { rerender } = render(<ResultCard {...props} enableShareCopy={undefined} />);
    expect(textarea()).toBeVisible();
    expect(screen.queryByRole('button', { name: label })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Copiar resumen' })).not.toBeInTheDocument();
    rerender(<ResultCard {...props} enableShareCopy={undefined} enableCopy />);
    expect(screen.getByRole('button', { name: 'Copiar resumen' })).toBeVisible();
    expect(screen.queryByRole('button', { name: label })).not.toBeInTheDocument();
    rerender(<ResultCard {...props} />);
    expect(modernButton()).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Copiar resumen' })).not.toBeInTheDocument();
    rerender(<ResultCard {...props} shareUrl={undefined} />);
    expect(screen.queryByRole('button', { name: label })).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Resumen detallado para compartir' })).not.toBeInTheDocument();
  });

  it('copies exactly the visible textarea with its link, waits for success and preserves channels, URL and events', async () => {
    const user = userEvent.setup();
    const pending = deferred();
    const writeText = vi.fn().mockReturnValue(pending.promise);
    clipboard(writeText);
    const fetch = vi.spyOn(globalThis, 'fetch');
    render(<ResultCard {...propsFor()} />);
    const previousUrl = window.location.href;
    const text = textarea().value;
    const hrefs = Object.fromEntries(['WhatsApp', 'X', 'Email'].map(name => [name, screen.getByRole('link', { name }).getAttribute('href')]));
    const encoded = new URL(text.split('\n\nCalculadora: ')[1]);
    expect(encoded.searchParams.get('targetNet')).toBe('2000');
    expect(encoded.searchParams.get('utm_source')).toBe('email');
    expect(encoded.searchParams.get('utm_medium')).toBe('share_link');
    expect(encoded.searchParams.get('utm_campaign')).toBe('shared_calculator_result');
    const button = modernButton();
    expect(button).toHaveAttribute('type', 'button');
    expect(button).not.toHaveAttribute('data-share-channel');
    await user.click(button);
    expect(writeText).toHaveBeenCalledExactlyOnceWith(text);
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(feedback()).not.toHaveTextContent(success);
    await act(async () => { pending.resolve(); });
    expect(button).toBeEnabled();
    expect(feedback()).toHaveTextContent(success);
    for (const name of ['WhatsApp', 'X', 'Email']) expect(screen.getByRole('link', { name })).toHaveAttribute('href', hrefs[name]!);
    expect(textarea()).toHaveValue(text);
    expect(window.location.href).toBe(previousUrl);
    expect(fetch).not.toHaveBeenCalled();
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('selects the existing read-only text and reports failure when the Clipboard API rejects', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockRejectedValue(new Error('Clipboard denied'));
    clipboard(writeText);
    render(<ResultCard {...propsFor()} />);
    const text = textarea().value;
    await user.click(modernButton());

    expect(writeText).toHaveBeenCalledExactlyOnceWith(text);
    expect(feedback()).toHaveTextContent(failure);
    expect(feedback()).not.toHaveTextContent(success);
    expect(modernButton()).toBeEnabled();
    expectSelected();
    expect(document.querySelectorAll('textarea')).toHaveLength(1);
  });

  it.each([true, false, 'throws'] as const)('uses the existing fallback and cleans up its temporary textarea for copy outcome %j', async (outcome) => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    const seen: { command: string; text: string | undefined }[] = [];
    const execCommand = vi.fn((command: string) => {
      const temporary = [...document.querySelectorAll('textarea')].find(node => node.style.left === '-9999px');
      seen.push({ command, text: temporary?.value });
      if (outcome === 'throws') throw new Error('Copy command unavailable');
      return outcome;
    });
    Object.defineProperty(document, 'execCommand', { configurable: true, value: execCommand });
    render(<ResultCard {...propsFor()} />);
    const text = textarea().value;
    await user.click(modernButton());

    expect(execCommand).toHaveBeenCalledExactlyOnceWith('copy');
    expect(seen).toEqual([{ command: 'copy', text }]);
    expect(document.querySelectorAll('textarea')).toHaveLength(1);
    expect(modernButton()).toBeEnabled();
    expect(feedback()).toHaveTextContent(outcome === true ? success : failure);
    if (outcome !== true) expectSelected();
  });

  it('keeps the old summary payload and feedback independent when both copy actions are enabled', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    clipboard(writeText);
    const { container } = render(<ResultCard {...propsFor()} enableCopy />);
    const oldText = container.querySelector('.result-copy-preview')!.textContent!;
    const linkedText = textarea().value;
    await user.click(screen.getByRole('button', { name: 'Copiar resumen' }));
    expect(writeText).toHaveBeenLastCalledWith(oldText);
    expect(oldText).not.toContain('\n\nCalculadora: ');
    expect(feedback().textContent).toBe('');
    expect(screen.getByText('Resumen copiado.')).toBeVisible();
    await user.click(modernButton());
    expect(writeText).toHaveBeenLastCalledWith(linkedText);
    expect(feedback()).toHaveTextContent(success);
    expect(container.querySelector('.result-copy-preview')!.textContent).toBe(oldText);
    expect(screen.getByText('Resumen copiado.')).toBeVisible();
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('discards pending feedback and old failure focus after the displayed calculation changes', async () => {
    for (const outcome of ['success', 'failure']) {
      const user = userEvent.setup();
      const pending = deferred();
      clipboard(vi.fn().mockReturnValue(pending.promise));
      const { rerender, unmount } = render(<ResultCard {...propsFor()} />);
      const previousText = textarea().value;
      await user.click(modernButton());
      expect(modernButton()).toBeDisabled();
      rerender(<ResultCard {...propsFor(2500)} />);
      const nextText = textarea().value;
      expect(nextText).not.toBe(previousText);
      expect(modernButton()).toBeEnabled();
      expect(feedback().textContent).toBe('');
      const selections = [textarea().selectionStart, textarea().selectionEnd];
      const link = screen.getByRole('link', { name: 'X' });
      act(() => { link.focus(); });
      await act(async () => { if (outcome === 'success') pending.resolve(); else pending.reject(new Error('Old request rejected')); });
      expect(link).toHaveFocus();
      expect(textarea()).toHaveValue(nextText);
      expect([textarea().selectionStart, textarea().selectionEnd]).toEqual(selections);
      expect(modernButton()).toBeEnabled();
      expect(feedback().textContent).toBe('');
      unmount();
    }
  });

  it('enables the action on the real index route while keeping legacy controls off and invalid SSR metadata generic', async () => {
    const query = { targetNet: '2000', monthlyExpenses: '300', billableHours: '80', irpfMode: 'manual', irpfRate: '15', selfEmployedFeeMode: 'manual', selfEmployedFee: '320' };
    for (const targetNet of ['2000', '0']) {
      const response = await getServerSideProps({ query: { ...query, targetNet }, res: { setHeader: vi.fn() } } as unknown as Parameters<typeof getServerSideProps>[0]);
      if (!('props' in response)) throw new Error('Expected index props.');
      const page = IndexPage(await response.props);
      const nodes = Children.toArray(page.props.children);
      const home = nodes.find(node => isValidElement(node) && node.type === HomePage);
      if (!isValidElement<ComponentProps<typeof HomePage>>(home)) throw new Error('Expected the actual homepage.');
      expect(home.props.enableResultCopy).toBe(false);
      expect(home.props.enableResultShareCopy).toBe(true);
      const html = new DOMParser().parseFromString(renderToString(<HomePage {...home.props} />), 'text/html');
      const buttons = [...html.querySelectorAll('button')].map(node => node.textContent);
      expect(buttons).not.toContain('Copiar resumen');
      expect(buttons.includes(label)).toBe(targetNet === '2000');
      expect(Boolean(html.querySelector('textarea[aria-label="Resumen detallado para compartir"]'))).toBe(targetNet === '2000');
      if (targetNet === '0') {
        const head = nodes.find(node => isValidElement(node) && node.type === Head);
        if (!isValidElement<{ children: ReactNode }>(head)) throw new Error('Expected metadata.');
        const image = Children.toArray(head.props.children).find(node => isValidElement<{ property?: string }>(node) && node.props.property === 'og:image');
        if (!isValidElement<{ content: string }>(image)) throw new Error('Expected image metadata.');
        expect(image.props.content).toBe(`${siteConfig.url}/opengraph-image`);
      }
    }
    render(<CalculatorForm initiallySubmitted enableResultCopy={false} enableResultShareCopy initialValues={{ targetNet: '2000', irpfMode: 'manual', irpfRate: '15', selfEmployedFeeMode: 'manual', selfEmployedFee: '320' }} initialShareUrl="https://www.cuantofacturar.es/?targetNet=2000#calculadora" />);
    expect(modernButton()).toBeVisible();
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });
});
