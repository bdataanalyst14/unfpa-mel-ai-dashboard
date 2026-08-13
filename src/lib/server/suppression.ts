import 'server-only';

export type SuppressionReason =
  | 'small_cell'
  | 'complementary_cell'
  | 'invalid_count'
  | 'invalid_denominator';

export type SuppressionResult = {
  displayValue: string;
  value: number | null;
  suppressed: boolean;
  suppression_reason?: SuppressionReason;
};

export type SuppressRecordPrimitive = string | boolean | null | undefined;

export type SuppressedRecordArray = Array<
    | SuppressionResult
    | SuppressedRecord
    | SuppressedRecordArray
    | SuppressRecordPrimitive
  >;

export interface SuppressedRecord {
  [key: string]:
    | SuppressionResult
    | SuppressedRecord
    | SuppressedRecordArray
    | SuppressRecordPrimitive;
}

export type SuppressRecordValue =
  | SuppressionResult
  | SuppressedRecord
  | SuppressedRecordArray
  | SuppressRecordPrimitive;

function toFiniteNumber(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return value;
}

function isUnsafeCount(value: unknown): boolean {
  const count = toFiniteNumber(value);
  return count !== null && count >= 1 && count < 5;
}

export function suppressCount(count: unknown): SuppressionResult {
  const parsed = toFiniteNumber(count);

  if (parsed === null || parsed < 0) {
    return {
      displayValue: 'N/A',
      value: null,
      suppressed: true,
      suppression_reason: 'invalid_count',
    };
  }

  if (parsed > 0 && parsed < 5) {
    return {
      displayValue: '<5',
      value: null,
      suppressed: true,
      suppression_reason: 'small_cell',
    };
  }

  return {
    displayValue: String(parsed),
    value: parsed,
    suppressed: false,
  };
}

export function suppressComplementaryValue(): SuppressionResult {
  return {
    displayValue: 'Suppressed',
    value: null,
    suppressed: true,
    suppression_reason: 'complementary_cell',
  };
}

export function suppressPercentage(
  numerator: unknown,
  denominator: unknown,
): SuppressionResult {
  const parsedNumerator = toFiniteNumber(numerator);
  const parsedDenominator = toFiniteNumber(denominator);

  if (
    parsedNumerator === null ||
    parsedNumerator < 0 ||
    parsedDenominator === null ||
    parsedDenominator < 0
  ) {
    return {
      displayValue: 'N/A',
      value: null,
      suppressed: true,
      suppression_reason: 'invalid_count',
    };
  }

  if (parsedDenominator === 0) {
    return {
      displayValue: 'N/A',
      value: null,
      suppressed: true,
      suppression_reason: 'invalid_denominator',
    };
  }

  if (isUnsafeCount(parsedNumerator) || isUnsafeCount(parsedDenominator)) {
    return {
      displayValue: '<5',
      value: null,
      suppressed: true,
      suppression_reason: 'small_cell',
    };
  }

  const percentage = (parsedNumerator / parsedDenominator) * 100;
  return {
    displayValue: `${percentage.toFixed(1)}%`,
    value: percentage,
    suppressed: false,
  };
}

export function suppressRecord(payload: unknown): SuppressRecordValue {
  if (typeof payload === 'number') {
    return suppressCount(payload);
  }

  if (Array.isArray(payload)) {
    return payload.map((item) => suppressRecord(item));
  }

  if (payload && typeof payload === 'object') {
    const output: SuppressedRecord = {};
    for (const [key, value] of Object.entries(payload)) {
      output[key] =
        typeof value === 'number' ? suppressCount(value) : suppressRecord(value);
    }
    return output;
  }

  return payload as SuppressRecordValue;
}
