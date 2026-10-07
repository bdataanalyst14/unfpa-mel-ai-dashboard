import type { AggregateRow } from './aggregate-contract';

export function numeric(value: string | undefined): number | null {
  return value !== undefined && /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) ? Number(value) : null;
}

export function ratio(numerator: string | undefined, denominator: string | undefined, percent = true): string {
  const a = numeric(numerator), b = numeric(denominator);
  return a === null || b === null || b === 0 ? 'Not available' : `${(a / b * (percent ? 100 : 1)).toFixed(1)}${percent ? '%' : ''}`;
}

export function concentration(rows: AggregateRow[], top: number): string {
  const values = rows.map(row => numeric(row.events));
  if (!values.length || values.some(value => value === null)) return 'Not available';
  const sorted = (values as number[]).sort((a, b) => b - a);
  return ratio(String(sorted.slice(0, top).reduce((a, b) => a + b, 0)), String(sorted.reduce((a, b) => a + b, 0)));
}
