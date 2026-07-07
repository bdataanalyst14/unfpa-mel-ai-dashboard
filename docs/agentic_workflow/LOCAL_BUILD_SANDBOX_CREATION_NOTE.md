# LOCAL_BUILD_SANDBOX_CREATION_NOTE

Date: 2026-06-30
Source: `H:\My Drive\unfpa-mel-ai-dashboard-clean`
Target: `C:\unfpa-mel-final-build-sandbox-013`
Status: `local_build_sandbox_created`

## Copy Method

The local build sandbox was refreshed outside Google Drive to avoid sync and file-system permission issues. Existing contents under the exact target path were removed after path verification, then project files were copied from the clean sandbox.

## Exclusions

Directories excluded:

- `node_modules`
- `.next`
- `.git`
- `.cache`
- `cache`
- `tmp`
- `temp`
- `logs`

File patterns excluded:

- `*.log`
- `.env`
- `.env.*`
- `*credential*`
- `*credentials*`
- `*service-account*`
- `*secret*`
- `*token*`

## Copy Result

- Robocopy exit code: `1`
- Files copied/present in target: `889`
- Directories copied/present in target: `124`
- Excluded top-level paths found after copy: ``

No dependency command was run in Google Drive or the main repo during sandbox creation.
