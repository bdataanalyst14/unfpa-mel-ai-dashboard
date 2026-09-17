# Pre-UAT dependency review

7 September 2026. Registry-backed npm audit initially reproduced 4 high, 3 moderate, 1 low, 0 critical. The installed-tree audit after remediation reports 0 high, 0 critical, 3 moderate, 1 low. This is not a waiver of the remaining advisories.

## Minimal remediation and compatibility

| Installed vulnerable package | Patched version | Change and compatibility basis |
|---|---|---|
| brace-expansion 5.0.8 | 5.0.9 | Exact-version scoped override; same major/patch release, satisfies minimatch's ^5.0.5; Node engine 20 or >=22 |
| browserslist 4.28.2 | 4.28.7 | Exact-version scoped override; same major/patch release, satisfies callers' ^4.23.0 and ^4.24.0; Node 24 supported |
| js-yaml 4.3.0 | 4.3.1 | Exact-version scoped override; same major/patch release, satisfies @eslint/eslintrc's ^4.3.0 |
| nanoid 3.3.16 | 3.3.18 | Exact-version scoped override; same major/patch release, satisfies postcss's ^3.3.16; retains CommonJS-compatible 3.x line |

The application requires Node >=24.18.0 <25. Existing Next 16.2.11, React, PostCSS, sharp and minimatch pins were retained. No --force, broad npm update, major upgrade or automatic audit fix was used. Overrides target only the previously installed vulnerable versions; future deliberate updates still require an audit. Compatibility evidence is the clean install, full offline regression suite, lint/typecheck, readiness and production build recorded in the release checklist.

Reviewed advisories: [brace-expansion](https://github.com/advisories/GHSA-rgw5-rvv9-x895), [Browserslist memory growth](https://github.com/advisories/GHSA-c83g-rgw3-j3cx), [Browserslist custom stats](https://github.com/advisories/GHSA-73wf-gq98-2v4g), [js-yaml](https://github.com/advisories/GHSA-5p4m-2wfm-xmqj), [nanoid](https://github.com/advisories/GHSA-2v37-7h3g-55p8). Patched versions were also checked with npm view and verified with the installed-tree audit.

The lockfile changed eight package versions: the four above plus Browserslist's required supporting data: baseline-browser-mapping 2.10.35 -> 2.11.21; caniuse-lite 1.0.30001797 -> 1.0.30001810; electron-to-chromium 1.5.371 -> 1.5.422; node-releases 2.0.47 -> 2.0.54. These can change browser-target resolution; the build is the relevant compatibility check. No unrelated top-level dependency versions changed.

## Exact dependency paths

Paths come from npm ls and npm explain on the installed tree. Arrows denote dependency edges; repeated paths share the same installed node_modules package.

brace-expansion is reached through minimatch@10.2.5 -> brace-expansion@5.0.9. Every inbound minimatch path is:

- eslint@9.39.5 -> minimatch@10.2.5
- eslint@9.39.5 -> @eslint/config-array@0.21.2 -> minimatch@10.2.5
- eslint@9.39.5 -> @eslint/eslintrc@3.3.6 -> minimatch@10.2.5
- eslint-config-next@16.2.11 -> eslint-plugin-import@2.32.0 -> minimatch@10.2.5
- eslint-config-next@16.2.11 -> eslint-plugin-jsx-a11y@6.10.2 -> minimatch@10.2.5
- eslint-config-next@16.2.11 -> eslint-plugin-react@7.37.5 -> minimatch@10.2.5
- eslint-config-next@16.2.11 -> typescript-eslint@8.65.0 -> @typescript-eslint/typescript-estree@8.65.0 -> minimatch@10.2.5
- The same typescript-eslint root also reaches typescript-estree through @typescript-eslint/parser; @typescript-eslint/utils; and @typescript-eslint/eslint-plugin -> @typescript-eslint/type-utils or @typescript-eslint/utils. type-utils also reaches utils. All @typescript-eslint nodes on these paths are 8.65.0. Each ends in the same typescript-estree -> minimatch -> brace-expansion edge.

Other high-severity paths:

- autoprefixer@10.4.19 -> browserslist@4.28.7
- eslint-config-next@16.2.11 -> eslint-plugin-react-hooks@7.1.1 -> @babel/core@7.29.7 -> @babel/helper-compilation-targets@7.29.7 -> browserslist@4.28.7
- eslint@9.39.5 -> @eslint/eslintrc@3.3.6 -> js-yaml@4.3.1
- postcss@8.5.22 -> nanoid@3.3.18
- next@16.2.11 -> postcss@8.5.22 -> nanoid@3.3.18
- tailwindcss@3.4.4 -> postcss@8.5.22 -> nanoid@3.3.18; Tailwind's postcss-import@15.1.0, postcss-js@4.1.0, postcss-load-config@4.0.2 and postcss-nested@6.2.0 also resolve/peer-resolve to the same PostCSS package.

## Remaining findings

| Finding | Exact paths | Decision |
|---|---|---|
| PostCSS sourceMappingURL file access, moderate | Root postcss@8.5.22; next@16.2.11 -> same; tailwindcss@3.4.4 and its PostCSS helpers -> same | Retained existing pin in this high/critical-only remediation. No runtime CSS-processing endpoint added. Requires owner risk acceptance or separately tested remediation before live UAT entry; not dismissed as dev-only because Next is a production dependency. |
| next and tailwindcss, moderate | Root next@16.2.11 and tailwindcss@3.4.4 inherit the PostCSS advisory | These are two additional npm findings caused by the same vulnerable PostCSS node, not two newly discovered independent flaws. |
| postcss-selector-parser AST recursion, low | tailwindcss@3.4.4 -> postcss-selector-parser@6.1.2; tailwindcss -> postcss-nested@6.2.0 -> same | Outside requested high/critical remediation. Remains recorded for risk acceptance or follow-up patch 6.1.3. |

Sources: [PostCSS advisory](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp), [selector parser advisory](https://github.com/advisories/GHSA-w9m9-85wc-3x92). npm audit without an audit-level still exits 1 for these four remaining findings; do not represent that exit as a clean full audit.

## Commands

- npm audit --json (registry-backed baseline): exit 1, 8 findings.
- npm ls brace-expansion browserslist js-yaml nanoid postcss postcss-selector-parser --all: exit 0, original dependency tree.
- npm view brace-expansion@5.0.9 version engines --json; npm view browserslist@4.28.7 version engines --json; npm view js-yaml@4.3.1 version engines --json; npm view nanoid@3.3.18 version engines --json: patched versions available and compatible engine metadata.
- npm install --package-lock-only --ignore-scripts --legacy-peer-deps: exit 0, scoped lockfile update.
- npm ci --legacy-peer-deps: exit 0, 614 installed packages; 4 remaining findings.
- npm explain brace-expansion browserslist js-yaml nanoid postcss postcss-selector-parser: resolved patched nodes and paths above.
- npm audit --json (registry-backed installed tree): exit 1, high 0 / critical 0 / moderate 3 / low 1.

See PRODUCTION_RELEASE_CHECKLIST.md for final test/build evidence. No live data/configuration/credential changes were made.
