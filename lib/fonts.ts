import { Instrument_Sans, Source_Serif_4 } from 'next/font/google';

export const bodyFont = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
  fallback: ['Aptos', 'Arial', 'sans-serif'],
});

export const displayFont = Source_Serif_4({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: 'variable',
  axes: ['opsz'],
  fallback: ['Georgia', 'serif'],
});

export const fontVariables = `${bodyFont.variable} ${displayFont.variable}`;
