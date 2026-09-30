const CURRENCY_CODES = /\b(?:CHF|EUR|GBP|USD)\b/gi;
const CURRENCY_SYMBOLS = /[€$£¥%]/g;
const SPACING_CHARACTERS = /[\s\u00a0\u2007\u200b-\u200d\u202f\u2060\ufeff]/g;

function normalizeRepeatedSeparator(value: string, separator: ',' | '.') {
  const parts = value.split(separator);

  if (parts.length === 2) {
    const [integerPart, fractionPart] = parts;

    if (separator === '.' && fractionPart.length === 3 && integerPart.length > 0) {
      return `${integerPart}${fractionPart}`;
    }

    return `${integerPart || '0'}.${fractionPart}`;
  }

  const groupsAfterFirst = parts.slice(1);
  const isThousandsGrouping = groupsAfterFirst.every((part) => part.length === 3);

  if (isThousandsGrouping) {
    return parts.join('');
  }

  const fractionPart = parts.at(-1) ?? '';
  const integerPart = parts.slice(0, -1).join('');
  return `${integerPart || '0'}.${fractionPart}`;
}

export function parseSpanishNumber(value: string) {
  const cleanedValue = value
    .normalize('NFKC')
    .replace(/\u2212/g, '-')
    .replace(CURRENCY_CODES, '')
    .replace(CURRENCY_SYMBOLS, '')
    .replace(SPACING_CHARACTERS, '');

  if (!cleanedValue || !/^[+-]?[\d.,]+$/.test(cleanedValue)) {
    return Number.NaN;
  }

  const sign = cleanedValue.startsWith('-') ? '-' : '';
  const unsignedValue = cleanedValue.replace(/^[+-]/, '');

  if (!/\d/.test(unsignedValue)) {
    return Number.NaN;
  }

  const lastComma = unsignedValue.lastIndexOf(',');
  const lastDot = unsignedValue.lastIndexOf('.');
  let normalizedValue = unsignedValue;

  if (lastComma >= 0 && lastDot >= 0) {
    const decimalIndex = Math.max(lastComma, lastDot);
    const integerPart = unsignedValue.slice(0, decimalIndex).replace(/[.,]/g, '');
    const fractionPart = unsignedValue.slice(decimalIndex + 1).replace(/[.,]/g, '');
    normalizedValue = fractionPart
      ? `${integerPart || '0'}.${fractionPart}`
      : integerPart || '0';
  } else if (lastComma >= 0) {
    normalizedValue = normalizeRepeatedSeparator(unsignedValue, ',');
  } else if (lastDot >= 0) {
    normalizedValue = normalizeRepeatedSeparator(unsignedValue, '.');
  }

  const parsedValue = Number(`${sign}${normalizedValue}`);
  return Number.isFinite(parsedValue) ? parsedValue : Number.NaN;
}
