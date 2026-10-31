import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CalculatorForm from '@/components/CalculatorForm';

const projectDisclosure = 'Comprobar cuántos encargos necesito y si caben';
const portfolioDisclosure = 'Combinar encargos de distintos precios y horas';
const resultHeading = 'Tu referencia mensual para presupuestar';
const portfolioStatus = { name: 'Plan de servicios combinados' };
type User = ReturnType<typeof userEvent.setup>;

const groupField = (group: number, field: 'quantity' | 'price' | 'hours') => screen.getByRole('textbox', {
  name: field === 'quantity'
    ? `Cantidad del grupo ${group}`
    : field === 'price'
      ? `Precio por servicio del grupo ${group} sin IVA (EUR)`
      : `Horas por servicio del grupo ${group}`,
});

function disclosure(title: string) {
  const details = screen.getByText(title).closest('details');
  if (!details) throw new Error(`Falta la ayuda: ${title}`);
  return details;
}

async function openDisclosure(user: User, title: string) {
  if (!disclosure(title).open) await user.click(screen.getByText(title));
}

function renderCalculatedForm(initiallySubmitted = true) {
  render(<CalculatorForm
    initiallySubmitted={initiallySubmitted}
    initialValues={{
      targetNet: '1500', monthlyExpenses: '150', billableHours: '70',
      irpfMode: 'manual', irpfRate: '15',
      selfEmployedFeeMode: 'manual', selfEmployedFee: '320',
    }}
    initialShareUrl={window.location.href}
  />);
}

async function prepareManualDrafts(user: User) {
  await openDisclosure(user, projectDisclosure);
  await user.type(screen.getByRole('textbox', { name: 'Precio por encargo sin IVA (EUR)' }), '525');
  await user.type(screen.getByRole('textbox', { name: 'Horas totales por encargo' }), '8,5');
  await user.click(screen.getByRole('button', { name: 'Comprobar encargos' }));
  await openDisclosure(user, portfolioDisclosure);
  await user.type(groupField(1, 'quantity'), '3');
  await user.type(groupField(1, 'price'), '425,5');
  await user.type(groupField(1, 'hours'), '7,25');
  await user.click(screen.getByRole('button', { name: 'Añadir otro grupo' }));
  await user.type(groupField(2, 'quantity'), '1');
  await user.type(groupField(2, 'price'), '980');
  await user.type(groupField(2, 'hours'), '18,5');
  await user.click(screen.getByRole('button', { name: 'Comprobar combinación' }));
  return {
    planText: screen.getByRole('status', portfolioStatus).textContent,
    summary: (screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value,
  };
}

function expectManualDrafts(planText: string | null) {
  expect(disclosure(projectDisclosure)).toHaveAttribute('open');
  expect(disclosure(portfolioDisclosure)).toHaveAttribute('open');
  expect(screen.getByRole('textbox', { name: 'Precio por encargo sin IVA (EUR)' })).toHaveValue('525');
  expect(screen.getByRole('textbox', { name: 'Horas totales por encargo' })).toHaveValue('8,5');
  expect(groupField(1, 'quantity')).toHaveValue('3');
  expect(groupField(1, 'price')).toHaveValue('425,5');
  expect(groupField(1, 'hours')).toHaveValue('7,25');
  expect(groupField(2, 'quantity')).toHaveValue('1');
  expect(groupField(2, 'price')).toHaveValue('980');
  expect(groupField(2, 'hours')).toHaveValue('18,5');
  expect(screen.getByRole('status', portfolioStatus).textContent).toBe(planText);
}

function expectResultUnavailable() {
  expect(screen.queryByRole('heading', { name: resultHeading })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'WhatsApp' })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'X' })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Email' })).not.toBeInTheDocument();
  expect(screen.queryByRole('textbox', { name: 'Resumen detallado para compartir' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Comprobar combinación' })).not.toBeInTheDocument();
}

describe('calculator helper drafts while editing the main reference', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/?targetNet=1500#calculadora');
    window.va = vi.fn();
    window.gtag = vi.fn();
  });

  afterEach(() => vi.restoreAllMocks());

  it.each(['another valid value', 'an empty field', 'a malformed paste'] as const)(
    'recovers manual helper drafts and open disclosures after %s is restored',
    async (edit) => {
      const user = userEvent.setup();
      renderCalculatedForm();
      const { planText, summary } = await prepareManualDrafts(user);
      const previousUrl = window.location.href;
      const replaceState = vi.spyOn(window.history, 'replaceState');
      const target = screen.getByRole('spinbutton', { name: 'Neto mensual deseado (EUR)' });
      await user.click(target);

      if (edit === 'another valid value') {
        fireEvent.change(target, { target: { value: '2500' } });
      } else if (edit === 'an empty field') {
        await user.clear(target);
      } else {
        await user.paste('100\n200');
        expect(target).toHaveAttribute('aria-invalid', 'true');
        expect(target).toHaveAccessibleDescription(/Pega un solo número/);
      }

      expectResultUnavailable();
      expect(target).toHaveFocus();
      expect(window.location.href).toBe(previousUrl);
      expect(replaceState).not.toHaveBeenCalled();
      expect(window.va).not.toHaveBeenCalled();
      expect(window.gtag).not.toHaveBeenCalled();

      fireEvent.change(target, { target: { value: '1500' } });

      expect(screen.getByRole('heading', { name: resultHeading })).toBeVisible();
      expectManualDrafts(planText);
      expect((screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value).toBe(summary);
      expect(target).toHaveFocus();
      expect(window.location.href).toBe(previousUrl);
      expect(replaceState).not.toHaveBeenCalled();
      expect(window.va).not.toHaveBeenCalled();
      expect(window.gtag).not.toHaveBeenCalled();
    },
  );

  it('preserves manual drafts when submitting the same confirmed values again', async () => {
    const user = userEvent.setup();
    renderCalculatedForm();
    const { planText, summary } = await prepareManualDrafts(user);
    await user.click(screen.getByRole('button', { name: 'Calcular mi tarifa orientativa' }));

    expectManualDrafts(planText);
    expect((screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value).toContain(summary.split('\n\n')[0]);
    const result = screen.getByRole('heading', { name: resultHeading }).closest('section');
    await waitFor(() => expect(result).toHaveFocus());
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('keeps focus in the edited field when recovering drafts after the first user calculation', async () => {
    const user = userEvent.setup();
    renderCalculatedForm(false);
    expectResultUnavailable();
    await user.click(screen.getByRole('button', { name: 'Calcular mi tarifa orientativa' }));
    const result = screen.getByRole('heading', { name: resultHeading }).closest('section');
    await waitFor(() => expect(result).toHaveFocus());
    const { planText, summary } = await prepareManualDrafts(user);
    const previousUrl = window.location.href;
    const replaceState = vi.spyOn(window.history, 'replaceState');
    const analyticsCalls = vi.mocked(window.va!).mock.calls.length;
    const googleCalls = vi.mocked(window.gtag!).mock.calls.length;
    const target = screen.getByRole('spinbutton', { name: 'Neto mensual deseado (EUR)' });
    await user.click(target);
    fireEvent.change(target, { target: { value: '2500' } });

    expectResultUnavailable();
    expect(target).toHaveFocus();
    fireEvent.change(target, { target: { value: '1500' } });
    // Let any focus scheduled when the result reappears run before asserting.
    await act(async () => {
      await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
    });

    expect(screen.getByRole('heading', { name: resultHeading })).toBeVisible();
    expectManualDrafts(planText);
    expect((screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value).toBe(summary);
    expect(target).toHaveFocus();
    expect(window.location.href).toBe(previousUrl);
    expect(replaceState).not.toHaveBeenCalled();
    expect(window.va).toHaveBeenCalledTimes(analyticsCalls);
    expect(window.gtag).toHaveBeenCalledTimes(googleCalls);
  });

  it('resets the portfolio when a different reference is explicitly calculated', async () => {
    const user = userEvent.setup();
    renderCalculatedForm();
    const { summary } = await prepareManualDrafts(user);
    const previousUrl = window.location.href;
    const replaceState = vi.spyOn(window.history, 'replaceState');
    const target = screen.getByRole('spinbutton', { name: 'Neto mensual deseado (EUR)' });
    await user.click(target);
    fireEvent.change(target, { target: { value: '2500' } });

    expectResultUnavailable();
    expect(target).toHaveFocus();
    expect(window.location.href).toBe(previousUrl);
    expect(replaceState).not.toHaveBeenCalled();
    expect(window.va).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Calcular mi tarifa orientativa' }));

    expect(screen.getByRole('heading', { name: resultHeading })).toBeVisible();
    await openDisclosure(user, projectDisclosure);
    await openDisclosure(user, portfolioDisclosure);
    expect(groupField(1, 'quantity')).toHaveValue('');
    expect(groupField(1, 'price')).toHaveValue('');
    expect(groupField(1, 'hours')).toHaveValue('');
    expect(screen.queryByRole('textbox', { name: 'Cantidad del grupo 2' })).not.toBeInTheDocument();
    expect(screen.getByRole('status', portfolioStatus)).toBeEmptyDOMElement();
    expect((screen.getByRole('textbox', { name: 'Resumen detallado para compartir' }) as HTMLTextAreaElement).value).not.toBe(summary);
    expect(new URL(window.location.href).searchParams.get('targetNet')).toBe('2500');
    expect(replaceState).toHaveBeenCalledTimes(1);
  });
});
