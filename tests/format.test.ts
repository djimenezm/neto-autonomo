import { describe, expect, it } from 'vitest';
import { formatNumber } from '@/lib/format';

describe('formatNumber', () => {
  it('uses a Spanish decimal comma without discarding hundredths', () => {
    expect(formatNumber(16.62)).toBe('16,62');
    expect(formatNumber(15)).toBe('15');
  });
});
