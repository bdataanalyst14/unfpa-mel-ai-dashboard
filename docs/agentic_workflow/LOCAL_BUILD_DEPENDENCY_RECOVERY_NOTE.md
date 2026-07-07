# LOCAL_BUILD_DEPENDENCY_RECOVERY_NOTE

Date: 2026-06-30
Environment: `C:\unfpa-mel-final-build-sandbox-013`
Status: `dependency_recovery_passed`

## Command Run

```powershell
npm ci
```

## Result

`npm ci` completed successfully in the local build sandbox only.

## Output Summary

```text
added 549 packages in 1m
165 packages are looking for funding
  run `npm fund` for details
```

Warnings observed:

- Several cached tarballs were reported as corrupted and refreshed by npm.
- Deprecated package warnings were emitted for `inflight`, `@humanwhocodes/config-array`, `rimraf`, `glob`, `@humanwhocodes/object-schema`, `node-domexception`, `recharts@2.x`, and `eslint@8.57.0`.

These warnings did not fail dependency recovery.

## Prohibited Action Confirmation

- `npm install` was not run.
- No dependency command was run in the Google Drive clean sandbox.
- No dependency command was run in the main repo.
- No deployment, refresh script, BigQuery query, connector activation, credential access, `.env` edit, SQL/migration change, or protected map/geography edit was performed.
