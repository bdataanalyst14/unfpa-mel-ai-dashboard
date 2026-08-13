import 'server-only';

import {
  closeSync,
  constants,
  fstatSync,
  openSync,
  readFileSync,
  realpathSync,
} from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';

const PRIVATE_KEY_FILE_ERROR = 'Invalid private-key file configuration.';

function isStrictlyContained(directory: string, candidate: string): boolean {
  const relativePath = relative(directory, candidate);
  return (
    relativePath !== '' &&
    relativePath !== '..' &&
    !relativePath.startsWith(`..${sep}`) &&
    !isAbsolute(relativePath)
  );
}

export function readPrivateKeyFile(
  privateKeyFile: string,
  allowedDirectory: string,
): string {
  try {
    if (!isAbsolute(privateKeyFile)) {
      throw new Error(PRIVATE_KEY_FILE_ERROR);
    }

    const resolvedDirectory = resolve(allowedDirectory);
    const resolvedFile = resolve(privateKeyFile);
    if (!isStrictlyContained(resolvedDirectory, resolvedFile)) {
      throw new Error(PRIVATE_KEY_FILE_ERROR);
    }

    const realDirectory = realpathSync(resolvedDirectory);
    const realFile = realpathSync(resolvedFile);
    if (!isStrictlyContained(realDirectory, realFile)) {
      throw new Error(PRIVATE_KEY_FILE_ERROR);
    }

    const descriptor = openSync(
      realFile,
      constants.O_RDONLY | constants.O_NOFOLLOW,
    );
    try {
      if (!fstatSync(descriptor).isFile()) {
        throw new Error(PRIVATE_KEY_FILE_ERROR);
      }
      return readFileSync(descriptor, 'utf8').trim();
    } finally {
      closeSync(descriptor);
    }
  } catch {
    throw new Error(PRIVATE_KEY_FILE_ERROR);
  }
}
