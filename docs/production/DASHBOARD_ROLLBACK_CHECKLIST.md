# UNFPA Nepal MEL Dashboard - Rollback Checklist

> Historical/optional Ubuntu checklist. Vercel rollback is a separate deployment checkpoint.

Follow these steps if the live BigQuery connection encounters errors, schema mismatches, billing limits, or latency issues, to safely revert the dashboard to the mock fallback.

## Step 1: Assess Incident Severity
Revert to mock fallback immediately if:
- [ ] Database query timeouts exceed 10 seconds.
- [ ] Next.js logs indicate database exceptions (`BigQuery request failed. Check server configuration...`).
- [ ] Wrong location errors are thrown or schema validations fail.
- [ ] Any credentials or database structure details are leaked in API responses.

## Step 2: Execute Rollback Command
- [ ] Run the rollback command in dry-run mode to verify the target configuration:
  ```bash
  npm run production:rollback-mock
  ```
- [ ] Execute the rollback in apply mode, specifying the rollback reason:
  ```bash
  npm run production:rollback-mock -- --apply --reason "BigQuery connection timeouts observed"
  ```
- [ ] Confirm that `/etc/unfpa-mel/dashboard.env` has been updated with `DATA_MODE=mock` and `DASHBOARD_DATA_MODE=mock`.

## Step 3: Restart Services
- [ ] Restart the application systemd service:
  ```bash
  sudo systemctl restart unfpa-mel-dashboard.service
  ```

## Step 4: Verify Mock Operation
- [ ] Verify that the local health check returns HTTP 200:
  ```bash
  curl -f http://127.0.0.1:3000/api/health
  ```
- [ ] Verify that the dashboard api route falls back to mock data:
  ```bash
  curl -f "http://127.0.0.1:3000/api/dashboard/executive-overview"
  ```
  Confirm the metadata fields read:
  - `"dataSource": "mock"`
  - `"sourceLabel": "Mock fallback"`
- [ ] Review the rollback log `/var/lib/unfpa-mel-dashboard/rollback.log` to confirm the timestamp and reason were successfully appended.
