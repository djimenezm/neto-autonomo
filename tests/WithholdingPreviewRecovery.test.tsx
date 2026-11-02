import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Preview from '@/components/WithholdingPreview';
import { withholdingExample } from '@/lib/withholdingPreview';

const label = 'Retención que quieres comprobar (%)';
const reference = { ...withholdingExample, context: 'monthly' as const };
const field = () => screen.getByRole('textbox', { name: label }) as HTMLInputElement;
const result = () => screen.getByRole('status', { name: 'Importe a cobrar con retención' });
const example = () => userEvent.click(screen.getByRole('button', { name: 'Probar una retención ficticia del 15 %' }));
const restore = () => userEvent.click(screen.getByRole('button', { name: 'Recuperar mi retención anterior' }));
const check = () => userEvent.click(screen.getByRole('button', { name: 'Comprobar importe a cobrar' }));
const write = (value: string) => fireEvent.change(field(), { target: { value } });

function expectRecoveryFinished() {
  expect(screen.queryByRole('button', { name: 'Recuperar mi retención anterior' })).not.toBeInTheDocument();
  expect(screen.queryByText(/sustituye los cambios que ves ahora/)).not.toBeInTheDocument();
  expect(screen.getAllByRole('status')).toHaveLength(1);
  expect(result()).toHaveTextContent('Retención anterior recuperada. Vuelve a comprobar el importe a cobrar para actualizar los resultados.');
  expect(result().querySelector('dl')).toBeNull();
  expect(result()).not.toHaveTextContent('Retención ficticia');
  expect(result()).not.toHaveTextContent('Indica un porcentaje');
  expect(field()).toHaveAttribute('aria-invalid', 'false');
  expect(field()).toHaveFocus();
}

function expectResetPreview() {
  expect(field()).toHaveValue('');
  expect(result()).toBeEmptyDOMElement();
  expect(screen.queryByRole('button', { name: 'Recuperar mi retención anterior' })).not.toBeInTheDocument();
  expect(screen.queryByText(/sustituye los cambios que ves ahora/)).not.toBeInTheDocument();
}

describe('recover a withholding percentage and retain the fictional origin until editing', () => {
  beforeEach(() => { window.va = vi.fn(); window.gtag = vi.fn(); });
  afterEach(() => vi.restoreAllMocks());

  it('keeps the fictional warning after checking again with the button or Enter until the field is edited', async () => {
    render(<Preview {...reference} />);
    await example();
    expect(result()).toHaveTextContent('Retención ficticia del 15 %');
    await check();
    expect(result()).toHaveTextContent('Retención ficticia del 15 %');
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(result()).toHaveTextContent('Retención ficticia del 15 %');

    write('7');
    expect(result()).toBeEmptyDOMElement();
    write('15');
    await check();
    expect(result()).toHaveTextContent('Importe a cobrar con este supuesto');
    expect(result()).not.toHaveTextContent('Retención ficticia');
  });

  it('restores the unfinished raw percentage without calculating, storing or sending personal data', async () => {
    const storageRead = vi.spyOn(Storage.prototype, 'getItem');
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const storageRemove = vi.spyOn(Storage.prototype, 'removeItem');
    const fetch = vi.spyOn(globalThis, 'fetch');
    const previousUrl = window.location.href;
    render(<Preview {...reference} />);
    const original = ' 07,,125 % ';
    write(original);
    await example();
    const recovery = screen.getByRole('button', { name: 'Recuperar mi retención anterior' });
    expect(recovery).toHaveAttribute('type', 'button');
    expect(recovery).toHaveAccessibleDescription(/sustituye los cambios que ves ahora/);
    expect(recovery).toHaveAccessibleDescription(/base/);
    expect(recovery).toHaveAccessibleDescription(/IVA/);
    expect(recovery).toHaveAccessibleDescription(/referencia/);
    await restore();

    expect(field()).toHaveValue(original);
    expectRecoveryFinished();
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
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

  it('keeps the first precise percentage through repeats and valid or invalid checks, clearing old output on recovery', async () => {
    render(<Preview {...reference} />);
    const original = ' 7,125 ';
    write(original);
    await example();
    await check();
    await example();
    write('10,005');
    await check();
    expect(field()).toHaveValue('10,01');
    expect(result()).toHaveTextContent('Importe a cobrar con este supuesto');
    await example();
    write('101');
    await check();
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    expect(result()).toHaveTextContent('Indica un porcentaje');
    await restore();

    expect(field()).toHaveValue(original);
    expectRecoveryFinished();
    await check();
    expect(field()).toHaveValue('7,13');
    expect(result()).toHaveTextContent('Importe a cobrar con este supuesto');
    expect(result()).not.toHaveTextContent('Retención ficticia');
    expect(result()).not.toHaveTextContent('Retención anterior recuperada');
  });

  it('does not copy an empty field or untouched examples even after rechecking and repeating them', async () => {
    render(<Preview {...reference} />);
    expectResetPreview();
    await example();
    await check();
    fireEvent.keyDown(field(), { key: 'Enter' });
    await example();
    expect(result()).toHaveTextContent('Retención ficticia del 15 %');
    expect(screen.queryByRole('button', { name: 'Recuperar mi retención anterior' })).not.toBeInTheDocument();
  });

  it('recovers an explicit zero and waits for a new check before showing a receipt without withholding', async () => {
    render(<Preview {...reference} />);
    write('0');
    await example();
    await restore();

    expect(field()).toHaveValue('0');
    expectRecoveryFinished();
    await check();
    expect(field()).toHaveAttribute('aria-invalid', 'false');
    expect(result()).toHaveTextContent('= 1210,00');
    expect(result()).not.toHaveTextContent('Retención ficticia');
  });

  it('consumes recovery and captures the next draft instead of reviving the previous percentage', async () => {
    render(<Preview {...reference} />);
    write('7');
    await example();
    await restore();
    expectRecoveryFinished();
    const nextDraft = ' 12,345 ';
    write(nextDraft);
    await example();
    await restore();

    expect(field()).toHaveValue(nextDraft);
    expectRecoveryFinished();
  });

  it('resets the field, copy and feedback separately for a changed base, VAT or context without reviving old drafts', async () => {
    const { rerender } = render(<Preview {...reference} />);
    const nextReferences = [
      { ...reference, baseAmount: 2000 },
      { ...reference, vatAmount: 0 },
      { ...reference, context: 'example' as const },
    ];
    for (const nextReference of nextReferences) {
      write('7,125');
      await example();
      rerender(<Preview {...reference} />);
      expect(screen.getByRole('button', { name: 'Recuperar mi retención anterior' })).toBeInTheDocument();
      rerender(<Preview {...nextReference} />);
      expectResetPreview();
      rerender(<Preview {...reference} />);
      expectResetPreview();
    }

    write('7');
    await example();
    await restore();
    expectRecoveryFinished();
    rerender(<Preview {...reference} vatAmount={0} />);
    expectResetPreview();
  });
});
