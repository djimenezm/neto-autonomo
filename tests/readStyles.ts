import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export function readStyles() {
  const appDirectory = join(process.cwd(), 'app');
  const entry = readFileSync(join(appDirectory, 'globals.css'), 'utf8');
  const imports = [...entry.matchAll(/^@import '\.\/styles\/([^']+\.css)';$/gm)];

  if (imports.length === 0) {
    throw new Error('No CSS imports found in app/globals.css');
  }

  return imports
    .map(([, filename]) => readFileSync(join(appDirectory, 'styles', filename), 'utf8'))
    .join('\n');
}
