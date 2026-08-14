export const CONTRACT_VERSION: number;
export const MANIFEST_RELATIVE_PATH: string;
export const APPROVED_OBJECTS: readonly string[];
export function loadAndValidateManifest(env: NodeJS.ProcessEnv, manifestPath?: string): boolean;
