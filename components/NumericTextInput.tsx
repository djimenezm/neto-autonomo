import { useId, type ComponentPropsWithRef } from 'react';

type NumericTextInputProps = Omit<ComponentPropsWithRef<'input'>, 'type' | 'value' | 'defaultValue' | 'onChange'> & {
  value: string;
  onValueChange: (value: string) => void;
};

const MULTICELL_HINT = 'Has pegado varias celdas. Introduce un solo número.';

export default function NumericTextInput({ value, onValueChange, onPaste, ...props }: NumericTextInputProps) {
  const pasteHintId = `${useId()}-paste-hint`;
  const hasPastedCells = /[↵⇥�]/.test(value);
  return (
    <>
      <input {...props} type="text" value={value}
        title={hasPastedCells ? [props.title, MULTICELL_HINT].filter(Boolean).join(' ') : props.title}
        aria-invalid={hasPastedCells ? true : props['aria-invalid']}
        aria-describedby={hasPastedCells ? [props['aria-describedby'], pasteHintId].filter(Boolean).join(' ') : props['aria-describedby']}
        onChange={(event) => onValueChange(event.currentTarget.value)}
        onPaste={(event) => {
          const text = event.clipboardData.getData('text').trim();
          // Text inputs remove line breaks, including during later blur events.
          // Visible markers keep a copied table fragment invalid and identifiable.
          if (/[\u0000-\u001f\u007f\u2028\u2029]/.test(text)) {
            event.preventDefault();
            onValueChange(text
              .replace(/\r\n|[\n\r\u2028\u2029]/g, ' ↵ ')
              .replace(/\t/g, ' ⇥ ')
              .replace(/[\u0000-\u001f\u007f]/g, ' � '));
            return;
          }
          onPaste?.(event);
        }} />
      {hasPastedCells ? <small id={pasteHintId} className="field-error numeric-paste-error" role="alert">{MULTICELL_HINT}</small> : null}
    </>
  );
}
