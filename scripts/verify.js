const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const suppressionPath = path.join(repoRoot, 'src', 'lib', 'server', 'suppression.ts');
const servicePath = path.join(
  repoRoot,
  'src',
  'lib',
  'server',
  'bigquery-dashboard-service.ts',
);

const checks = [];

function check(name, fn) {
  checks.push({ name, fn });
}

function loadSuppressionModule() {
  const source = fs.readFileSync(suppressionPath, 'utf8');
  const functionStart = source.indexOf('function toFiniteNumber');
  if (functionStart === -1) {
    throw new Error('Could not locate suppression utility implementation.');
  }

  const executableSource = `${source
    .slice(functionStart)
    .replace(
      'function toFiniteNumber(value: unknown): number | null',
      'function toFiniteNumber(value)',
    )
    .replace('function isUnsafeCount(value: unknown): boolean', 'function isUnsafeCount(value)')
    .replace('export function suppressCount(count: unknown): SuppressionResult', 'function suppressCount(count)')
    .replace(
      /export function suppressPercentage\(\s*numerator: unknown,\s*denominator: unknown,\s*\): SuppressionResult/,
      'function suppressPercentage(numerator, denominator)',
    )
    .replace(
      'export function suppressRecord(payload: unknown): SuppressRecordValue',
      'function suppressRecord(payload)',
    )
    .replace('const output: SuppressedRecord = {};', 'const output = {};')
    .replace('return payload as SuppressRecordValue;', 'return payload;')}

return { suppressCount, suppressPercentage, suppressRecord };`;

  return Function(executableSource)();
}

function assertSuppressedSmallCell(result) {
  assert.equal(result.displayValue, '<5');
  assert.equal(result.value, null);
  assert.equal(result.suppressed, true);
  assert.equal(result.suppression_reason, 'small_cell');
}

function assertInvalidCount(result) {
  assert.equal(result.displayValue, 'N/A');
  assert.equal(result.value, null);
  assert.equal(result.suppressed, true);
  assert.equal(result.suppression_reason, 'invalid_count');
}

function main() {
  const { suppressCount, suppressPercentage, suppressRecord } =
    loadSuppressionModule();

  check('suppressCount(0) remains unsuppressed', () => {
    assert.deepEqual(suppressCount(0), {
      displayValue: '0',
      value: 0,
      suppressed: false,
    });
  });

  for (const count of [1, 2, 3, 4]) {
    check(`suppressCount(${count}) returns <5 and suppressed`, () => {
      const result = suppressCount(count);
      assertSuppressedSmallCell(result);
      assert.notEqual(result.displayValue, String(count));
    });
  }

  check('suppressCount(5) remains visible', () => {
    assert.deepEqual(suppressCount(5), {
      displayValue: '5',
      value: 5,
      suppressed: false,
    });
  });

  check('null is handled safely', () => assertInvalidCount(suppressCount(null)));
  check('undefined is handled safely', () =>
    assertInvalidCount(suppressCount(undefined)));
  check('NaN is handled safely', () =>
    assertInvalidCount(suppressCount(Number.NaN)));
  check('non-numeric string is handled safely', () =>
    assertInvalidCount(suppressCount('3')));
  check('negative values are not valid reportable counts', () =>
    assertInvalidCount(suppressCount(-1)));

  check('suppressPercentage suppresses unsafe numerator', () => {
    assertSuppressedSmallCell(suppressPercentage(4, 20));
  });

  check('suppressPercentage suppresses unsafe denominator', () => {
    assertSuppressedSmallCell(suppressPercentage(20, 4));
  });

  check('suppressPercentage suppresses invalid denominator', () => {
    const result = suppressPercentage(20, 0);
    assert.equal(result.displayValue, 'N/A');
    assert.equal(result.value, null);
    assert.equal(result.suppressed, true);
    assert.equal(result.suppression_reason, 'invalid_denominator');
  });

  check('suppressPercentage allows safe numerator and denominator', () => {
    assert.deepEqual(suppressPercentage(10, 20), {
      displayValue: '50.0%',
      value: 50,
      suppressed: false,
    });
  });

  check('no raw 1, 2, 3, or 4 appears in suppressed displayValue', () => {
    for (const count of [1, 2, 3, 4]) {
      const result = suppressCount(count);
      assert.equal(result.suppressed, true);
      assert.equal(result.displayValue, '<5');
      assert(!['1', '2', '3', '4'].includes(result.displayValue));
    }
  });

  check('suppressRecord handles nested payloads safely', () => {
    const output = suppressRecord({
      district: 'Example',
      total: 5,
      female: 4,
      nested: {
        male: 1,
        other: 0,
      },
    });

    assert.deepEqual(output.total, {
      displayValue: '5',
      value: 5,
      suppressed: false,
    });
    assertSuppressedSmallCell(output.female);
    assertSuppressedSmallCell(output.nested.male);
    assert.deepEqual(output.nested.other, {
      displayValue: '0',
      value: 0,
      suppressed: false,
    });
  });

  check('top-level numeric payloads are handled safely', () => {
    assertSuppressedSmallCell(suppressRecord(2));
  });

  check('bigquery-dashboard-service imports and uses suppression utilities', () => {
    const serviceSource = fs.readFileSync(servicePath, 'utf8');
    assert.match(serviceSource, /from ['"]\.\/suppression['"]/);
    assert.match(serviceSource, /\bsuppressCount\b/);
    assert.match(serviceSource, /\bsuppressPercentage\b/);
    assert.match(serviceSource, /metadata:\s*\{[\s\S]*suppression/m);
    assert.match(serviceSource, /Numeric compatibility fields use 0/);
  });

  const failures = [];
  for (const item of checks) {
    try {
      item.fn();
    } catch (error) {
      failures.push({ name: item.name, error });
    }
  }

  if (failures.length > 0) {
    console.error('Verification failed.');
    for (const failure of failures) {
      console.error(`- ${failure.name}: ${failure.error.message}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Verification passed.');
  console.log(`Checks passed: ${checks.length}`);
  console.log('Scope: local suppression utilities and service wiring only.');
  console.log('No BigQuery calls, live routes, refresh scripts, credentials, or .env reads.');
}

main();
