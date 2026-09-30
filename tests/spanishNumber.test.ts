import { describe, expect, it } from 'vitest';
import { parseSpanishNumber } from '@/lib/spanishNumber';

describe('parseSpanishNumber', () => {
  it.each([
    ['2500', 2500],
    ['2.500', 2500],
    ['2.500,50', 2500.5],
    ['2 500', 2500],
    ['2\u00a0500', 2500],
    ['2\u202f500', 2500],
    ['2.500,50 €', 2500.5],
    ['EUR 2.500,50', 2500.5],
    ['$2,500.50', 2500.5],
    ['2,5', 2.5],
  ])('parses %s as %d', (value, expected) => {
    expect(parseSpanishNumber(value)).toBe(expected);
  });

  it.each(['', 'EUR', 'importe 2500', '2.500,50 euros'])('rejects %s', (value) => {
    expect(parseSpanishNumber(value)).toBeNaN();
  });
});
