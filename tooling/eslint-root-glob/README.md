# ESLint root-directory adapter

## Why it exists

The pinned `@next/eslint-plugin-next@16.4.2` imports `fast-glob` only to call
`globSync(pattern, { onlyDirectories: true })` in `dist/utils/get-root-dirs.js`.
Its original dependency brings in `micromatch` and `braces@3.0.3`, affected by
[CVE-2026-93687](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
There was no patched braces release on 2026-10-23.

The root package replaces that one dependency with this private local package,
using an npm override scoped to the exact Next plugin version. The
`$fast-glob` reference points to the root development dependency, so npm resolves
the local package from the project rather than a nested dependency directory.

This is not a patched upstream release and is not a general fast-glob replacement.
It does not change ESLint presets, rules, severities or application code.

## Supported contract

Only synchronous directory queries with a non-empty string and exactly
`{ onlyDirectories: true }` are accepted. Other calls fail explicitly.

[Tinyglobby](https://superchupu.dev/tinyglobby/migration) performs the matching.
Directory expansion is disabled; absolute paths remain absolute; literal roots
retain their spelling; dynamic results have no trailing slash. A terminal
`**` excludes its base directory, matching the original Next plugin dependency.

The package uses synchronous `require(esm)` interop from the required Node.js
24.22.1 runtime. There is no top-level await, install script or runtime web hook.

## Verification and future updates

`tests/eslintRootGlob.test.ts` exercises the actual installed Next plugin helper,
absolute and relative paths, Windows separators, wildcards, braces, extglobs,
recursive roots, missing paths and arrays. Integration cases verify that Next.js,
TypeScript, Hooks and accessibility rules still detect deliberate mistakes.
The Next link rule is enabled only inside its integration tests, without changing
the application's ESLint configuration.

Before changing Next.js or this adapter:

1. Inspect the installed plugin for all uses of fast-glob.
2. Recheck the contract and the scoped override; do not widen it silently.
3. Run a clean `npm ci`, `npm ls`, `npm audit`, `npm run lint`, `npm test`
   and `npm run build`.
4. Remove this adapter when a compatible upstream dependency no longer needs it.

Do not replace this package with a direct tinyglobby alias: the two APIs have
different directory expansion defaults and result formatting. Do not use
`npm audit fix --force` to downgrade the Next.js ESLint configuration.
