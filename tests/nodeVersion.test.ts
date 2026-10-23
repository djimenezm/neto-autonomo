// @vitest-environment node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

const source = readFileSync(resolve('scripts/check-node-version.mjs'), 'utf8');

function checkVersion(version: string) {
  const info = vi.fn();
  runInNewContext(source, { process: { versions: { node: version } }, console: { info } });
  return info;
}

describe('Node.js security baseline', () => {
  it.each(['20.9.0', '22.23.4', '24.15.0', '24.22.0', '25.0.0', '26.12.1'])(
    'rejects unsupported runtime %s',
    (version) => {
      expect(() => checkVersion(version)).toThrow('Use Node.js >=24.22.1 <25');
    },
  );

  it.each(['24.22.1', '24.22.2', '24.23.0'])('accepts patched runtime %s', (version) => {
    expect(checkVersion(version)).toHaveBeenCalledWith(
      `Node.js ${version}: security baseline verified.`,
    );
  });

  it('keeps installation, local selection and build checks aligned', () => {
    const manifest = JSON.parse(readFileSync(resolve('package.json'), 'utf8'));
    const localVersion = readFileSync(resolve('.nvmrc'), 'utf8').trim();

    expect(manifest.engines.node).toBe('^24.22.1');
    expect(localVersion).toBe('24.22.1');
    for (const hook of ['predev', 'prebuild', 'prestart']) {
      expect(manifest.scripts[hook]).toBe('node scripts/check-node-version.mjs');
    }
    expect(() => checkVersion(localVersion)).not.toThrow();
  });
});
