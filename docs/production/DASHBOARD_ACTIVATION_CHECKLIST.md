# UNFPA Nepal MEL Dashboard - BigQuery Activation Checklist

> Historical/optional Ubuntu checklist. It is not part of the current Vercel deployment path.

This checklist defines the steps required to transition the UNFPA MEL Dashboard from safe mock fallback mode to live BigQuery-backed data.

## Phase 1: Prerequisites
- [ ] Offline production preflight command passes successfully:
  ```bash
  npm run production:preflight
  ```
- [ ] The service account key file is provisioned at `/etc/unfpa-mel/secrets/google-private-key.pem` with permissions `600` (read-only by owner).
- [ ] Next.js production build is successfully built:
  ```bash
  npm run build
  ```

## Phase 2: Live Preflight Check (Authorized)
- [ ] Request explicit authorization to execute the live preflight check.
- [ ] Run the live preflight command to inspect database schemas, confirm table locations (`asia-south1`), verify row presence, and assert no prohibited columns:
  ```bash
  npm run production:bigquery-preflight
  ```
- [ ] Confirm a new evidence file is successfully generated at:
  `/var/lib/unfpa-mel-dashboard/bigquery-readonly-preflight.json`
- [ ] Verify the evidence file contains `"valid": true` and lists row counts for all four aggregate objects.

## Phase 3: Activation (Apply Mode)
- [ ] Obtain the signed **Production Approval Reference** (e.g. `APP-202607-001`).
- [ ] Execute the activation command with the approval reference and `--apply` option:
  ```bash
  npm run production:activate-bigquery -- --approval <REF> --apply
  ```
- [ ] Verify the script prints the success configuration JSON indicating `dashboardDataMode: "bigquery"`.
- [ ] Confirm a backup of `/etc/unfpa-mel/dashboard.env` has been created in `/var/backups/unfpa-mel-dashboard/`.

## Phase 4: Service Restart & Verification
- [ ] Restart the systemd service to pick up the updated environment:
  ```bash
  sudo systemctl restart unfpa-mel-dashboard.service
  ```
- [ ] Query the local application health endpoint and confirm HTTP 200:
  ```bash
  curl -f http://127.0.0.1:3000/api/health
  ```
- [ ] Load the dashboard executive overview API page and confirm `"dataSource": "bigquery"` is indicated in the metadata:
  ```bash
  curl -f "http://127.0.0.1:3000/api/dashboard/executive-overview"
  ```
- [ ] Confirm that no raw participant-level table fields are exposed in response JSON.
