# DASH-MAP-001 - Local Unit Shapefile Integration

Date: 2026-06-05

## Discovery

The Local Unit shapefile was discovered with repo-relative lookup at:

```text
./Local Unit
```

No source code uses the local Windows drive path.

## Shapefile Components

- `Local Unit/local_unit.shp`
- `Local Unit/local_unit.shx`
- `Local Unit/local_unit.dbf`
- `Local Unit/local_unit.prj`
- Optional spatial index files are also present: `.sbn`, `.sbx`

Projection from `.prj`:

```text
GEOGCS["NepalDD",DATUM["D_Everest_Bangladesh",SPHEROID["Everest_Adjustment_1937",6377276.345,300.8017]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]
```

## Attribute Fields

DBF fields found:

- `STATE_CODE`
- `DISTRICT`
- `GaPa_NaPa`
- `Type_GN`
- `Province`

Likely dashboard fields:

- Province: `Province`
- District: `DISTRICT`
- Local unit name: `GaPa_NaPa`
- Local unit code/ID: `STATE_CODE`

## Generated Asset

Generated web map asset:

```text
public/maps/local-units.geojson
```

Validation summary:

- Type: `FeatureCollection`
- Features: 777
- First geometry type: `Polygon`
- Size: 3,649,342 bytes

## Implementation

- Added `scripts/prepare-local-unit-map.js`
- Added `scripts/validate-local-unit-map.js`
- Added `src/lib/map-data.ts`
- Added `src/components/dashboard/local-unit-coverage-map.tsx`
- Updated `src/app/dashboard/geographic-coverage/page.tsx`
- Updated `package.json` with:
  - `prepare:local-unit-map`
  - `validate:local-unit-map`

## Verification

Initial commands run:

```text
node scripts/prepare-local-unit-map.js
node scripts/validate-local-unit-map.js
node --check scripts/prepare-local-unit-map.js
node --check scripts/validate-local-unit-map.js
.\node_modules\.bin\tsc --noEmit
node node_modules\.typescript-AOkQb1dH\bin\tsc --noEmit
```

Results:

- Conversion: Pass
- GeoJSON validation: Pass
- Node syntax checks: Pass
- TypeScript check: Blocked by broken local `node_modules` TypeScript shim/package layout in this working folder.

The project tracker file could not be updated because it is not valid UTF-8 and append attempts timed out in the synced-drive working folder.

## Final Map Verification - DASH-MAP-FINAL

Date: 2026-06-05

Required map files confirmed:

- `public/maps/local-units.geojson`
- `src/lib/map-data.ts`
- `src/components/dashboard/local-unit-coverage-map.tsx`
- `src/app/dashboard/geographic-coverage/page.tsx`

Commands run:

```text
npm run validate:local-unit-map
npx tsc --noEmit
npm run lint
npm run build
npx --yes --package typescript@5.5.4 tsc --noEmit
rg path-pattern checks across src, scripts, docs, package.json, and public/maps/local-units.geojson
```

Results:

- Local Unit map validation: Pass.
- TypeScript: Blocked by dependency environment. Local `npx tsc --noEmit` fails with a missing path, and temporary TypeScript execution reaches corrupted `node_modules/@types/d3-path/index.d.ts`.
- Lint/build: Blocked by dependency environment. Both fail before Next starts with `The system cannot find the path specified.`
- Hard-coded runtime path check: Pass for map runtime source. No laptop drive or synced-folder references were found in `src`, `scripts`, `docs`, `package.json`, or the generated map asset. The repository-name hits are the package name and older non-map documentation file links.

## Deployment Verification Attempt - DASH-MAP-DEPLOY-001

Date: 2026-06-05

Dependency environment used:

- Current folder is not a Git worktree; `.git` is absent, so `git diff --name-only` could not be used to verify the changed-file set.
- A clean temporary verification copy was created at the OS temp location, excluding the broken source `node_modules` and build artifacts.
- No lockfile was present, so `npm install --no-package-lock` was attempted for verification only.
- The first install failed on the existing peer conflict between `eslint@9.9.0` and `eslint-config-next@14.2.3`.
- `npm install --no-package-lock --legacy-peer-deps` was attempted without changing package versions or writing a lockfile, but timed out and left an incomplete dependency tree.

Verification results:

- `npm run validate:local-unit-map`: Pass in the clean temporary copy.
- `npx tsc --noEmit`: Blocked because the temporary dependency install did not create usable TypeScript binary shims.
- Direct TypeScript compiler check: Reached compilation, but failed on unrelated copied prototype folders included by the current `tsconfig.json`; no Local Unit map TypeScript error was identified.
- `npm run lint`: Blocked because the incomplete temp `next` package was missing `dist/server/require-hook.js`.
- `npm run build`: Blocked for the same incomplete temp `next` package.
- Deployment: Not run because build did not pass.

Hard-coded path checks:

- No laptop-specific drive or synced-folder strings were found in map runtime source, scripts, package metadata, or the generated map asset.
- `Local Unit` appears only as repo-relative discovery paths, documentation, and user-facing source description text.

Final map status:

- Local Unit map implementation and GeoJSON validation remain complete.
- Deployment remains blocked by dependency environment and absent Git worktree metadata in this runtime.
