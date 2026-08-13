import {
  suppressComplementaryValue,
  suppressCount,
  suppressPercentage,
  suppressRecord,
  type SuppressionResult,
} from './suppression';

describe('server suppression utilities', () => {
  it('keeps count 0 unsuppressed', () => {
    expect(suppressCount(0)).toEqual({
      displayValue: '0',
      value: 0,
      suppressed: false,
    });
  });

  it('suppresses count 1', () => {
    expect(suppressCount(1)).toEqual({
      displayValue: '<5',
      value: null,
      suppressed: true,
      suppression_reason: 'small_cell',
    });
  });

  it('suppresses count 4', () => {
    expect(suppressCount(4)).toEqual({
      displayValue: '<5',
      value: null,
      suppressed: true,
      suppression_reason: 'small_cell',
    });
  });

  it('keeps count 5 unsuppressed', () => {
    expect(suppressCount(5)).toEqual({
      displayValue: '5',
      value: 5,
      suppressed: false,
    });
  });

  it('creates a non-numeric complementary suppression value', () => {
    expect(suppressComplementaryValue()).toEqual({
      displayValue: 'Suppressed',
      value: null,
      suppressed: true,
      suppression_reason: 'complementary_cell',
    });
  });

  it('handles null safely', () => {
    expect(suppressCount(null)).toEqual({
      displayValue: 'N/A',
      value: null,
      suppressed: true,
      suppression_reason: 'invalid_count',
    });
  });

  it('handles undefined safely', () => {
    expect(suppressCount(undefined)).toEqual({
      displayValue: 'N/A',
      value: null,
      suppressed: true,
      suppression_reason: 'invalid_count',
    });
  });

  it('handles NaN safely', () => {
    expect(suppressCount(Number.NaN)).toEqual({
      displayValue: 'N/A',
      value: null,
      suppressed: true,
      suppression_reason: 'invalid_count',
    });
  });

  it('handles negative values safely', () => {
    expect(suppressCount(-1)).toEqual({
      displayValue: 'N/A',
      value: null,
      suppressed: true,
      suppression_reason: 'invalid_count',
    });
  });

  it('handles string and non-numeric input safely', () => {
    expect(suppressCount('3')).toEqual({
      displayValue: 'N/A',
      value: null,
      suppressed: true,
      suppression_reason: 'invalid_count',
    });
    expect(suppressCount({ count: 3 })).toEqual({
      displayValue: 'N/A',
      value: null,
      suppressed: true,
      suppression_reason: 'invalid_count',
    });
  });

  it('suppresses percentage with a small numerator', () => {
    expect(suppressPercentage(4, 20)).toEqual({
      displayValue: '<5',
      value: null,
      suppressed: true,
      suppression_reason: 'small_cell',
    });
  });

  it('suppresses percentage with a small denominator', () => {
    expect(suppressPercentage(20, 4)).toEqual({
      displayValue: '<5',
      value: null,
      suppressed: true,
      suppression_reason: 'small_cell',
    });
  });

  it('suppresses percentage with an invalid denominator', () => {
    expect(suppressPercentage(20, 0)).toEqual({
      displayValue: 'N/A',
      value: null,
      suppressed: true,
      suppression_reason: 'invalid_denominator',
    });
  });

  it('returns a safe percentage when numerator and denominator are safe', () => {
    expect(suppressPercentage(10, 20)).toEqual({
      displayValue: '50.0%',
      value: 50,
      suppressed: false,
    });
  });

  it('does not expose raw 1-4 values as display values', () => {
    for (const count of [1, 2, 3, 4]) {
      const result = suppressCount(count);
      expect(result.displayValue).toBe('<5');
      expect(result.displayValue).not.toBe(String(count));
    }
  });

  it('suppresses nested payload numeric values', () => {
    const output = suppressRecord({
      district: 'Example',
      total: 5,
      female: 4,
      nested: {
        male: 1,
        other: 0,
      },
    }) as {
      total: SuppressionResult;
      female: SuppressionResult;
      nested: {
        male: SuppressionResult;
        other: SuppressionResult;
      };
    };

    expect(output.total).toMatchObject({ displayValue: '5', suppressed: false });
    expect(output.female).toMatchObject({
      displayValue: '<5',
      suppressed: true,
      suppression_reason: 'small_cell',
    });
    expect(output.nested.male).toMatchObject({
      displayValue: '<5',
      suppressed: true,
      suppression_reason: 'small_cell',
    });
    expect(output.nested.other).toMatchObject({
      displayValue: '0',
      suppressed: false,
    });
  });

  it('suppresses a top-level numeric record payload', () => {
    expect(suppressRecord(2)).toEqual({
      displayValue: '<5',
      value: null,
      suppressed: true,
      suppression_reason: 'small_cell',
    });
  });
});
