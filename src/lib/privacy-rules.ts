/**
 * Privacy rules for GBV/OCMC data and participant protection.
 * - Suppress GBV counts between 1-4 (small cell suppression)
 * - Never display individual survivor records
 * - Never display personal identifiers
 */

export const PRIVACY_BANNER_TEXT = 'Aggregated GBV service data only. No individual survivor records are displayed.';

export const DATA_FRESHNESS_FOOTER = 'Data as of {{date}} NPT – refreshed daily. Figures are provisional where validation, evidence, or data quality checks are pending. No personal identifiers or survivor-level GBV records are displayed.';

export function suppressSmallCount(count: number): string {
  if (count >= 1 && count <= 4) return '< 5';
  return count.toLocaleString();
}

export function isSmallCell(count: number): boolean {
  return count >= 1 && count <= 4;
}

export function isPiiField(fieldName: string): boolean {
  const piiFields = [
    'name', 'fullName', 'firstName', 'lastName',
    'phone', 'phoneNumber', 'mobile',
    'email', 'emailAddress',
    'address', 'homeAddress',
    'nationalId', 'citizenshipNumber',
    'survivorId', 'caseId', 'clientId',
  ];
  return piiFields.some(f => fieldName.toLowerCase().includes(f.toLowerCase()));
}

export function getDataFreshnessText(): string {
  const now = new Date();
  const formatted = now.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Kathmandu',
  });
  return DATA_FRESHNESS_FOOTER.replace('{{date}}', formatted);
}
