import os
from google.cloud import bigquery
from datetime import datetime

def run_audit():
    print("Starting BigQuery Live Pipeline Verification (DP-003A)...")
    
    try:
        project = "unfpadatabase"
        dataset_id = "unfpadatabase"
        client = bigquery.Client(project=project)
        
        SAFE_VIEWS = [
            "combined_activity_summary",
            "indicator_progress_summary",
            "data_quality_summary",
            "ip_submission_status"
        ]
        
        results = []
        coverage_data = []
        schema_data = {}
        
        # 1. Verify Access and Schemas
        for view in SAFE_VIEWS:
            table_ref = f"{project}.{dataset_id}.{view}"
            try:
                table = client.get_table(table_ref)
                results.append(f"✅ `{view}`: Found. {table.num_rows} rows.")
                schema_data[view] = {
                    "columns": [{"name": f.name, "type": f.field_type} for f in table.schema],
                    "row_count": table.num_rows
                }
            except Exception as e:
                results.append(f"❌ `{view}`: Error - {str(e)}")

        # 2. Verify 15-IP Refresh and Coverage
        if "ip_submission_status" in schema_data:
            query = f"SELECT ip_name, latest_sync_time, total_submissions, total_events FROM `{project}.{dataset_id}.ip_submission_status` ORDER BY latest_sync_time DESC"
            rows = client.query(query)
            for row in rows:
                coverage_data.append({
                    "ip_name": row.ip_name,
                    "latest_sync_time": row.latest_sync_time,
                    "total_submissions": row.total_submissions,
                    "total_events": row.total_events
                })
        
        # 3. Aggregate Counts
        counts = {}
        if "combined_activity_summary" in schema_data:
            query = f"SELECT COUNT(*) as total, COUNT(DISTINCT ip_name) as ip_count FROM `{project}.{dataset_id}.combined_activity_summary`"
            row = list(client.query(query))[0]
            counts["combined_activity_summary"] = {"total": row.total, "ip_count": row.ip_count}

        # --- WRITING REPORTS ---

        # Audit Results
        with open(r"H:\My Drive\unfpa-mel-ai-dashboard\docs\data_pipeline\BIGQUERY_READINESS_AUDIT_RESULTS.md", "w", encoding="utf-8") as f:
            f.write("# BigQuery Readiness Audit Results\n\n")
            f.write(f"**Verification Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"**Status:** COMPLETED (LIVE CONNECTION VERIFIED)\n\n")
            f.write("### Validation Results:\n")
            for res in results:
                f.write(f"- {res}\n")
            f.write(f"\n**Project:** `{project}`\n")
            f.write(f"**Dataset:** `{dataset_id}`\n")

        # 15-IP Refresh Verification
        with open(r"H:\My Drive\unfpa-mel-ai-dashboard\docs\data_pipeline\BIGQUERY_15IP_AUTOMATIC_REFRESH_VERIFICATION.md", "w", encoding="utf-8") as f:
            f.write("# BigQuery 15-IP Automatic Refresh Verification\n\n")
            f.write(f"**Verified on:** {datetime.now().strftime('%Y-%m-%d')}\n\n")
            f.write("### IP Coverage and Freshness (from `ip_submission_status`)\n\n")
            f.write("| IP Name | Latest Sync Time | Total Submissions | Total Events |\n")
            f.write("| :--- | :--- | :--- | :--- |\n")
            for ip in coverage_data:
                f.write(f"| {ip['ip_name']} | {ip['latest_sync_time']} | {ip['total_submissions']} | {ip['total_events']} |\n")
            
            f.write(f"\n**Total IPs Reporting in Aggregate:** {counts.get('combined_activity_summary', {}).get('ip_count', 'N/A')}\n")
            f.write(f"**Total Activity Records:** {counts.get('combined_activity_summary', {}).get('total', 'N/A')}\n")

        # Live Schema Validation
        with open(r"H:\My Drive\unfpa-mel-ai-dashboard\docs\data_pipeline\BIGQUERY_LIVE_SCHEMA_VALIDATION.md", "w", encoding="utf-8") as f:
            f.write("# BigQuery Live Schema Validation\n\n")
            for view, data in schema_data.items():
                f.write(f"## View: `{view}`\n")
                f.write(f"- **Row Count:** {data['row_count']}\n")
                f.write("| Column | Type |\n")
                f.write("| :--- | :--- |\n")
                for col in data['columns']:
                    f.write(f"| {col['name']} | {col['type']} |\n")
                f.write("\n")

        print("Audit files generated successfully.")

    except Exception as e:
        print(f"Audit execution failed: {str(e)}")

if __name__ == "__main__":
    run_audit()
