# Data Pipeline Repository Inventory

**Repository Analyzed:** `H:\My Drive\unfpa_mel`

## 1. Repository Structure
- `.github/workflows`: Contains GitHub Action schedules for ingestion and checks.
- `sql/`: Contains BigQuery DDL and transformation queries.
- `metadata/`: Contains metadata templates (Kobo schema, indicator mappings, access rules).
- `src/`: Core Python pipeline source code.
  - `ingestion/`: KoboToolbox API client and parsing logic.
  - `warehouse/`: BigQuery loading and final sync execution.
  - `quality/`: Data quality checks and rules.
  - `backup/`: Backups to Google Sheets and Drive.
  - `sita_ai/`: AI narrative generation and semantic layer integration.
- `tests/`: Pytest suite for extraction, flattening, and quality checks.

## 2. Source Systems
- **KoboToolbox:** Primary source for raw field submission data. Pulled via API.

## 3. Extraction Scripts
- `src/ingestion/kobo_client.py`: Handles HTTP requests to the Kobo API.
- `src/ingestion/kobo_parser.py`: Parses the JSON response from Kobo.

## 4. Transformation Scripts
- `src/ingestion/flatten_summary.py`: Flattens parent-level submission summary fields.
- `src/ingestion/flatten_participants.py`: Flattens the nested participant repeating groups.
- `src/warehouse/sync_final.py`: Orchestrates final warehouse synchronization.

## 5. Load Scripts
- `src/warehouse/load_staging.py`: Loads the raw flattened CSV data into BigQuery staging tables (`participants_flat_staging`, `activity_summary_flat_staging`).
- `src/warehouse/create_summary_tables.py`: Executes SQL scripts to build final aggregated summary tables.

## 6. BigQuery Tables/Views Referenced
- `participants_flat_staging` / `participants_flat`
- `activity_summary_flat_staging` / `activity_summary_flat`
- `combined_activity_summary` (Derived view/table)
- `indicator_progress_summary` (Aggregated progress)
- `data_quality_summary` (DQA results)
- `ip_submission_status` (Refresh/status logs)

## 7. Scheduling Assumptions
- Driven by `.github/workflows` configurations (e.g., `kobo_sync.yml`, `data_quality_check.yml`, `build_sita_ai_tables.yml`).

## 8. Logs / Checks / DQA Rules / Deduplication
- **Logs/Checks:** Run during the GitHub Action pipelines. Output goes to BigQuery `data_quality_summary`.
- **DQA Rules:** Found in `src/quality/validation_rules.py` and `src/quality/missing_value_check.py`.
- **Deduplication:** Implemented in `src/quality/duplicate_check.py`.

## 9. Inactive / Deleted Handling
- Unspecified natively; standard staging -> final sync typically relies on latest submission ID logic or full replacement.

## 10. Known Blockers
- M&E Registry mappings for `indicator`, `activity`, and `output` codes are pending finalized M&E approval. Without canonical codes, downstream reporting views cannot fully function.
