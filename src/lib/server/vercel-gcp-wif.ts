import 'server-only';

import { getVercelOidcToken } from '@vercel/oidc';
import {
  IdentityPoolClient,
  type SubjectTokenSupplier,
} from 'google-auth-library';

const STS_URL = 'https://sts.googleapis.com/v1/token';
const IMPERSONATION_BASE_URL =
  'https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts';
const SUBJECT_TOKEN_TYPE = 'urn:ietf:params:oauth:token-type:jwt';

export type VercelWifConfig = {
  projectNumber: string;
  serviceAccountEmail: string;
  poolId: string;
  providerId: string;
};

export function buildVercelWifAudience(config: VercelWifConfig): string {
  return `//iam.googleapis.com/projects/${config.projectNumber}/locations/global/workloadIdentityPools/${config.poolId}/providers/${config.providerId}`;
}

export function buildServiceAccountImpersonationUrl(config: VercelWifConfig): string {
  return `${IMPERSONATION_BASE_URL}/${encodeURIComponent(config.serviceAccountEmail)}:generateAccessToken`;
}

export function createVercelSubjectTokenSupplier(
  tokenProvider: () => Promise<string> = getVercelOidcToken,
): SubjectTokenSupplier {
  return {
    async getSubjectToken() {
      const token = await tokenProvider();
      if (!token) throw new Error('Vercel OIDC token is unavailable in the current request context.');
      return token;
    },
  };
}

export function createVercelWifAuthClient(
  config: VercelWifConfig,
  tokenProvider?: () => Promise<string>,
): IdentityPoolClient {
  return new IdentityPoolClient({
    type: 'external_account',
    audience: buildVercelWifAudience(config),
    subject_token_type: SUBJECT_TOKEN_TYPE,
    token_url: STS_URL,
    service_account_impersonation_url: buildServiceAccountImpersonationUrl(config),
    subject_token_supplier: createVercelSubjectTokenSupplier(tokenProvider),
  });
}
