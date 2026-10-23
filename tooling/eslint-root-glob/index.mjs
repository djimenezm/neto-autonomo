import { isAbsolute } from 'node:path';
import { globSync as tinyGlobSync, isDynamicPattern } from 'tinyglobby';

export function globSync(pattern, options) {
  if (
    typeof pattern !== 'string' ||
    pattern.length === 0 ||
    !options ||
    options.onlyDirectories !== true ||
    Object.keys(options).some((key) => key !== 'onlyDirectories')
  ) {
    throw new TypeError('This adapter only supports Next.js root-directory globSync calls.');
  }

  // fast-glob excludes the base directory of a terminal globstar.
  const searchPattern = pattern.replace(/(^|\/)\*\*\/?$/, '$1**/*');
  const directories = tinyGlobSync(searchPattern, {
    onlyDirectories: true,
    expandDirectories: false,
    absolute: isAbsolute(pattern),
  });

  // Literal roots keep their spelling, including a trailing slash or "..".
  if (!isDynamicPattern(pattern)) {
    return directories.length === 0 ? [] : [pattern];
  }

  return directories.map((directory) =>
    directory === '/' || /^[A-Za-z]:\/$/.test(directory)
      ? directory
      : directory.replace(/\/$/, ''),
  );
}
