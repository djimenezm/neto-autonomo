const PREFIX_UNIT = /^(?:\b(?:CHF|EUR|GBP|USD)\b|[€$£¥%]) */i;
const SUFFIX_UNIT = / *(?:\b(?:CHF|EUR|GBP|USD)\b|[€$£¥%])$/i;
const GROUPED_INTEGER = {
  '.': /^\d{1,3}(?:\.\d{3})+$/,
  ',': /^\d{1,3}(?:,\d{3})+$/,
  ' ': /^\d{1,3}(?: \d{3})+$/,
};

function integerDigits(value: string, separator: keyof typeof GROUPED_INTEGER = ' ') {
  if (/^\d*$/.test(value)) return value;
  return GROUPED_INTEGER[separator].test(value) ? value.split(separator).join('') : null;
}

function decimalNumber(integer: string, fraction: string, grouping?: keyof typeof GROUPED_INTEGER) {
  const digits = integerDigits(integer, grouping);
  if (digits === null || !/^\d*$/.test(fraction)) return null;
  return (digits || '0') + (fraction ? '.' + fraction : '');
}

export function parseSpanishNumber(value: string) {
  let text = value.normalize('NFKC').replace(/\u2212/g, '-').trim();
  // A copied table row or column is not one number. Keep outer whitespace,
  // but never join cells by deleting tabs, line breaks or interior currency.
  if (!text || /[\u0000-\u001f\u007f\u2028\u2029]/.test(text)) return Number.NaN;

  let sign = '';
  if (/^[+-]/.test(text)) {
    sign = text[0];
    text = text.slice(1).trimStart();
  }
  const prefix = text.match(PREFIX_UNIT);
  const suffix = text.match(SUFFIX_UNIT);
  if (prefix && suffix) return Number.NaN;
  if (prefix) text = text.slice(prefix[0].length);
  if (suffix) text = text.slice(0, -suffix[0].length);
  if (!sign && /^[+-]/.test(text)) {
    sign = text[0];
    text = text.slice(1).trimStart();
  }
  if (!/^[\d., ]+$/.test(text) || !/\d/.test(text)) return Number.NaN;

  const lastComma = text.lastIndexOf(',');
  const lastDot = text.lastIndexOf('.');
  let normalized: string | null;
  if (lastComma >= 0 && lastDot >= 0) {
    const decimal = lastComma > lastDot ? ',' : '.';
    const parts = text.split(decimal);
    normalized = parts.length === 2
      ? decimalNumber(parts[0], parts[1], decimal === ',' ? '.' : ',')
      : null;
  } else if (lastComma >= 0 || lastDot >= 0) {
    const separator = lastComma >= 0 ? ',' : '.';
    const parts = text.split(separator);
    // Preserve Spanish dot-grouping and comma decimals. Repeated separators
    // are accepted only as complete, consistently grouped thousands.
    normalized = parts.length > 2 || (separator === '.' && parts[0] !== '' && parts[1].length === 3)
      ? integerDigits(text, separator)
      : decimalNumber(parts[0], parts[1]);
  } else {
    normalized = integerDigits(text);
  }
  if (normalized === null) return Number.NaN;
  const parsedValue = Number(sign + normalized);
  return Number.isFinite(parsedValue) ? parsedValue : Number.NaN;
}
