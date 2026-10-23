// @vitest-environment node
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { basename, isAbsolute, join, relative, resolve } from 'node:path';
import { ESLint } from 'eslint';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const projectRequire = createRequire(resolve('package.json'));
const nextRequire = createRequire(projectRequire.resolve('@next/eslint-plugin-next/package.json'));
const { globSync } = nextRequire('fast-glob') as {
  globSync: (pattern: unknown, options?: Record<string, unknown>) => string[];
};
const { getRootDirs } = nextRequire('./dist/utils/get-root-dirs.js') as {
  getRootDirs: (context: { cwd: string; settings: { next?: { rootDir?: unknown } } }) => string[];
};
const directories = { onlyDirectories: true };
const slashes = (path: string) => path.replaceAll('\\', '/');
let fixture: string;
let absoluteRoot: string;
let relativeRoot: string;

beforeAll(() => {
  fixture = mkdtempSync(join(tmpdir(), 'calculadoras-eslint-roots-'));
  absoluteRoot = slashes(fixture);
  relativeRoot = slashes(relative(process.cwd(), fixture));
  for (const directory of [
    'apps/alpha/pages', 'apps/alpha/nested/deep', 'apps/beta/pages',
    'apps/.hidden', 'apps/with space', 'apps/1', 'apps/2', 'apps/3',
  ]) {
    mkdirSync(join(fixture, directory), { recursive: true });
  }
  writeFileSync(join(fixture, 'apps/alpha/pages/about.tsx'), 'export default function Page() {}');
  writeFileSync(join(fixture, 'apps/beta/pages/contact.tsx'), 'export default function Page() {}');
  writeFileSync(join(fixture, 'apps/note.txt'), 'not a directory');
});

afterAll(() => {
  if (!fixture) return;
  const insideTemp = relative(tmpdir(), resolve(fixture));
  if (isAbsolute(insideTemp) || insideTemp.startsWith('..') ||
      !basename(fixture).startsWith('calculadoras-eslint-roots-')) {
    throw new Error('Refusing to remove a fixture outside its temporary directory.');
  }
  rmSync(fixture, { recursive: true, force: true });
});

describe('scoped Next.js root-directory adapter', () => {
  it('replaces only the pinned Next plugin dependency with the reviewed local package', () => {
    const manifest = JSON.parse(readFileSync(resolve('package.json'), 'utf8'));
    expect(manifest.overrides['@next/eslint-plugin-next@16.4.2'])
      .toEqual({ 'fast-glob': '$fast-glob' });
    expect(manifest.devDependencies['fast-glob']).toBe('file:./tooling/eslint-root-glob');
    expect(nextRequire('./package.json').version).toBe('16.4.2');
    expect(nextRequire('fast-glob/package.json').name).toBe('@calculadoras/eslint-root-glob');
  });

  it('removes the vulnerable dependency chain from the lockfile, rather than hiding it', () => {
    const lock = JSON.parse(readFileSync(resolve('package-lock.json'), 'utf8'));
    const paths = Object.keys(lock.packages);
    expect(paths.some((path) => /(^|\/)node_modules\/(braces|micromatch)$/.test(path))).toBe(false);
    expect(lock.packages['tooling/eslint-root-glob'].dependencies).toEqual({ tinyglobby: '0.2.17' });
  });

  for (const mode of ['absolute', 'relative'] as const) {
    describe(mode + ' paths', () => {
      const prefix = () => mode === 'absolute' ? absoluteRoot : relativeRoot;

      it.each(['alpha', 'alpha/', 'alpha/.', 'alpha/../beta', 'with space', '.hidden'])(
        'preserves a literal root: %s',
        (suffix) => {
          const pattern = prefix() + '/apps/' + suffix;
          expect(globSync(pattern, directories)).toEqual([pattern]);
        },
      );

      it.each(['*', '{alpha,beta}', '@(alpha|beta)', '{1..3}', '**/pages', '**'])(
        'matches directory roots without expanding literal directories: %s',
        (suffix) => {
          const base = prefix() + '/apps/';
          const expected = suffix === '*' ? ['1', '2', '3', 'alpha', 'beta', 'with space']
            : suffix === '{1..3}' ? ['1', '2', '3']
            : suffix === '**/pages' ? ['alpha/pages', 'beta/pages']
            : suffix === '**' ? [
              '1', '2', '3', 'alpha', 'alpha/pages', 'alpha/nested', 'alpha/nested/deep',
              'beta', 'beta/pages', 'with space',
            ] : ['alpha', 'beta'];
          expect(globSync(base + suffix, directories).sort())
            .toEqual(expected.map((path) => base + path).sort());
        },
      );

      it.each(['missing', 'apps/note.txt'])('does not return missing paths or files: %s', (suffix) => {
        expect(globSync(prefix() + '/' + suffix, directories)).toEqual([]);
      });
    });
  }

  it('keeps the real Next.js helper working with defaults, Windows paths and arrays', () => {
    expect(getRootDirs({ cwd: process.cwd(), settings: {} })).toEqual([process.cwd()]);
    expect(getRootDirs({
      cwd: process.cwd(), settings: { next: { rootDir: absoluteRoot.replaceAll('/', '\\') + '\\apps\\alpha' } },
    })).toEqual([absoluteRoot + '/apps/alpha']);
    expect(getRootDirs({
      cwd: process.cwd(),
      settings: { next: { rootDir: [absoluteRoot + '/apps/{alpha,beta}', null, 3] } },
    }).sort()).toEqual([absoluteRoot + '/apps/alpha', absoluteRoot + '/apps/beta']);
  });

  it.each([
    [[], directories], ['', directories], ['app', undefined],
    ['app', { onlyDirectories: false }], ['app', { onlyDirectories: true, cwd: '/' }],
  ])('fails explicitly on unsupported future calls: %j', (pattern, options) => {
    expect(() => globSync(pattern, options)).toThrow(TypeError);
  });
});

describe('ESLint integration without weakened rules', () => {
  const filePath = resolve('components/LintProbe.tsx');
  let eslint: ESLint;

  beforeAll(async () => {
    eslint = new ESLint();
    await eslint.calculateConfigForFile(filePath);
  }, 90000);

  it('accepts a valid component', async () => {
    const [result] = await eslint.lintText(
      'export default function Probe() { return <div>Valid component</div>; }', { filePath },
    );
    expect(result.messages).toEqual([]);
  }, 15000);

  it.each([
    ['@next/next/no-sync-scripts',
      'export default function Probe() { return <script src="/script.js" />; }'],
    ['@typescript-eslint/no-explicit-any', 'export type Unsafe = any;'],
    ['react-hooks/rules-of-hooks',
      'import { useState } from "react"; export default function Probe({ enabled }: { enabled: boolean }) { if (enabled) { useState(0); } return null; }'],
    ['jsx-a11y/alt-text',
      'export default function Probe() { return <img src="/image.png" />; }'],
  ])('still reports %s', async (rule, source) => {
    const [result] = await eslint.lintText(source, { filePath });
    expect(result.messages.map((message) => message.ruleId)).toContain(rule);
  }, 15000);

  it.each(['alpha', '{alpha,beta}', '*'])(
    'the actual Next link rule finds pages through the adapter: %s',
    async (pattern) => {
      const eslint = new ESLint({
        overrideConfig: {
          settings: { next: { rootDir: absoluteRoot + '/apps/' + pattern } },
          rules: { '@next/next/no-html-link-for-pages': 'error' },
        },
      });
      const [result] = await eslint.lintText(
        'export default function Probe() { return <a href="/about">About</a>; }', { filePath },
      );
      expect(result.messages.map((message) => message.ruleId))
        .toContain('@next/next/no-html-link-for-pages');
    }, 15000,
  );
});
