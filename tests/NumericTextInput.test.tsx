import { createRef, useState, type ClipboardEventHandler, type KeyboardEventHandler, type Ref } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NumericTextInput from '@/components/NumericTextInput';
import { parseSpanishNumber } from '@/lib/spanishNumber';

function Editor({ initial = '', inputRef, onKeyDown, onPaste }: {
  initial?: string;
  inputRef?: Ref<HTMLInputElement>;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  onPaste?: ClipboardEventHandler<HTMLInputElement>;
}) {
  const [value, setValue] = useState(initial);
  const invalid = Number.isNaN(parseSpanishNumber(value));
  return (
    <>
      <NumericTextInput aria-label="Importe" aria-describedby="amount-hint" aria-invalid={invalid}
        inputMode="decimal" ref={inputRef} value={value} onValueChange={setValue} onKeyDown={onKeyDown} onPaste={onPaste} />
      <p id="amount-hint">Escribe un único importe.</p>
      <pre data-testid="source-value">{JSON.stringify(value)}</pre>
      <p role="status">{invalid ? 'Dato inválido' : 'Dato válido'}</p>
    </>
  );
}

describe('controlled numeric text input', () => {
  it.each([
    ['100\n200', '100 ↵ 200'],
    ['100\r\n200', '100 ↵ 200'],
    ['100\t200', '100 ⇥ 200'],
    ['100\u2028200', '100 ↵ 200'],
    ['100\u2029200', '100 ↵ 200'],
  ])('keeps pasted cells visibly invalid through blur and Enter: %j', async (text, visible) => {
    const user = userEvent.setup();
    render(<Editor initial="12,50" />);
    await user.click(screen.getByRole('textbox', { name: 'Importe' }));
    await user.paste(text);
    expect(screen.getByRole('textbox', { name: 'Importe' })).toHaveAttribute('title', 'Has pegado varias celdas. Introduce un solo número.');
    expect(screen.getByRole('textbox', { name: 'Importe' })).toHaveAccessibleDescription('Escribe un único importe.');
    await user.click(screen.getByRole('status'));
    await user.click(screen.getByRole('textbox', { name: 'Importe' }));
    await user.keyboard('{Enter}');
    expect(screen.getByTestId('source-value').textContent).toBe(JSON.stringify(visible));
    expect(screen.getByRole('textbox', { name: 'Importe' })).toHaveValue(visible);
    expect(screen.getByRole('textbox', { name: 'Importe' })).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Dato inválido');
  });

  it.each(['100\n', '\n100\r\n', '\t100\t'])('allows outer copied whitespace around one amount: %j', async (text) => {
    const user = userEvent.setup();
    const onPaste = vi.fn();
    render(<Editor onPaste={onPaste} />);
    await user.click(screen.getByRole('textbox', { name: 'Importe' }));
    await user.paste(text);
    expect(onPaste).toHaveBeenCalledOnce();
    expect(screen.getByRole('textbox', { name: 'Importe' })).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByRole('status')).toHaveTextContent('Dato válido');
  });

  it('preserves description IDs and removes the paste explanation after correction', async () => {
    const user = userEvent.setup();
    render(<Editor />);
    const input = screen.getByRole('textbox', { name: 'Importe' });
    await user.click(input);
    await user.paste('100\n200');
    expect(input).toHaveAttribute('aria-describedby', 'amount-hint');
    expect(input).toHaveAccessibleDescription('Escribe un único importe.');
    expect(input).toHaveAttribute('title', 'Has pegado varias celdas. Introduce un solo número.');
    await user.clear(input);
    await user.type(input, '100');
    expect(input).not.toHaveAttribute('title');
    expect(input).not.toHaveAttribute('aria-description');
    expect(input).toHaveAttribute('aria-describedby', 'amount-hint');
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('retains explicit descriptions and titles while marking copied cells', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<>
      <p id="monthly-hint">Importe mensual.</p>
      <NumericTextInput aria-label="Importe" aria-invalid={false} aria-describedby="monthly-hint" title="Dato de planificación."
        value="100 ⇥ 200" onValueChange={onValueChange} />
    </>);
    const input = screen.getByRole('textbox', { name: 'Importe' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('title', 'Dato de planificación. Has pegado varias celdas. Introduce un solo número.');
    expect(input).toHaveAccessibleDescription('Importe mensual.');
    rerender(<>
      <p id="monthly-hint">Importe mensual.</p>
      <NumericTextInput aria-label="Importe" aria-invalid={false} aria-describedby="monthly-hint" title="Dato de planificación."
        value="100" onValueChange={onValueChange} />
    </>);
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).toHaveAttribute('title', 'Dato de planificación.');
    expect(input).toHaveAccessibleDescription('Importe mensual.');
  });

  it('leaves ordinary paste replacement and caret placement to the native input', async () => {
    const user = userEvent.setup();
    const onPaste = vi.fn();
    render(<Editor initial="1234,56" onPaste={onPaste} />);
    const input = screen.getByRole('textbox', { name: 'Importe' }) as HTMLInputElement;
    await user.click(input);
    input.setSelectionRange(2, 4);
    await user.paste('99');
    expect(input).toHaveValue('1299,56');
    expect(input.selectionStart).toBe(4);
    expect(input.selectionEnd).toBe(4);
    expect(onPaste).toHaveBeenCalledOnce();
    expect(screen.getByRole('status')).toHaveTextContent('Dato válido');
  });

  it('passes refs, keyboard handlers and accessible input attributes through', async () => {
    const user = userEvent.setup();
    const inputRef = createRef<HTMLInputElement>();
    const onKeyDown = vi.fn();
    render(<Editor inputRef={inputRef} onKeyDown={onKeyDown} />);
    const input = screen.getByRole('textbox', { name: 'Importe' });
    expect(inputRef.current).toBe(input);
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('inputmode', 'decimal');
    expect(input).toHaveAttribute('aria-describedby', 'amount-hint');
    await user.click(input);
    await user.type(input, '12,50{Enter}');
    expect(input).toHaveValue('12,50');
    expect(onKeyDown.mock.calls.some(([event]) => event.key === 'Enter')).toBe(true);
    expect(screen.getByRole('status')).toHaveTextContent('Dato válido');
  });
});
