import { readStyles } from './readStyles';
import { describe, expect, it } from 'vitest';

describe('reduced motion accessibility', () => {
  it('disables smooth scrolling and control transitions when requested', () => {
    const styles = readStyles();

    expect(styles).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
    expect(styles).toMatch(/scroll-behavior:\s*auto/);
    expect(styles).toMatch(/transition-duration:\s*0\.01ms/);
  });
});
