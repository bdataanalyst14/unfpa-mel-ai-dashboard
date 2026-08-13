import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ['scripts/**/*.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  globalIgnores([
    '.agent/**',
    '.agents/**',
    '.codex/**',
    '.continue/**',
    '.next/**',
    '.node-lts-test/**',
    '.npm/**',
    'clean_install/**',
    'coverage/**',
    'dist/**',
    'figmaprototype/**',
    'Figma_dashboard/**',
    'google stitch dashboard_v1/**',
    'google_stitich_dashboard_v2/**',
    'node_modules/**',
    'node_modules_old/**',
    'out/**',
    'playwright-report/**',
    'test-results/**',
    'blob-report/**',
    'playwright/.cache/**',
    'UNFPA Nepal MEL Dashboard Prototype/**',
    'next-env.d.ts',
  ]),
])

export default eslintConfig
