import { readStyles } from './readStyles';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('typography system', () => {
  it('uses optimized display and body fonts instead of the generic Arial stack', () => {
    const appShell = readFileSync(join(process.cwd(), 'pages/_app.tsx'), 'utf8');
    const fonts = readFileSync(join(process.cwd(), 'lib/fonts.ts'), 'utf8');
    const layout = readFileSync(join(process.cwd(), 'app/layout.tsx'), 'utf8');
    const styles = readStyles();

    expect(fonts).toContain("import { Instrument_Sans, Source_Serif_4 } from 'next/font/google'");
    expect(fonts).toContain("variable: '--font-body'");
    expect(fonts).toContain("variable: '--font-display'");
    expect(layout).toContain('className={fontVariables}');
    expect(appShell).toContain('font-root');
    expect(appShell).toContain('fontVariables');
    expect(styles).toMatch(
      /body\s*{[^}]*font-family:\s*var\(--font-body,\s*Aptos\),\s*Arial,\s*sans-serif/s,
    );
    expect(styles).toMatch(
      /\.font-root\s*{[^}]*font-family:\s*var\(--font-body,\s*Aptos\),\s*Arial,\s*sans-serif/s,
    );
    expect(styles).not.toMatch(/body\s*{[^}]*font-family:\s*Arial,\s*Helvetica,\s*sans-serif/s);
    expect(styles).toMatch(
      /h1,\s*h2\s*{[^}]*font-family:\s*var\(--font-display,\s*Georgia\),\s*serif/s,
    );
  });
});
