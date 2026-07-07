import os, json, pandas as pd

BASE = r"H:/My Drive/unfpa-mel-ai-dashboard"

# Paths
fix_dir = os.path.join(BASE, "docs", "mel-review", "fix-candidates")
review_dir = os.path.join(BASE, "docs", "mel-review")
workflow_dir = os.path.join(BASE, "docs", "agentic_workflow")

required_files = [
    os.path.join(fix_dir, "MEL_SAFE_AUTOFIX_LOG.md"),
    os.path.join(fix_dir, "MEL_SAFE_AUTOFIXED_REVIEW_ROWS.csv"),
    os.path.join(fix_dir, "MEL_PROPOSED_REGISTRY_FIXES.xlsx"),
    os.path.join(fix_dir, "registry_update_proposal.json"),
    os.path.join(fix_dir, "MEL_HUMAN_DECISION_REQUIRED.csv"),
    os.path.join(fix_dir, "MEL_HUMAN_DECISION_REQUIRED.md"),
    os.path.join(fix_dir, "MEL_FIX_READINESS_SUMMARY.md"),
    os.path.join(review_dir, "MEL_REVIEW_MASTER_TRACKER.xlsx"),
    os.path.join(review_dir, "ip-review-packs"),
    os.path.join(review_dir, "ip-fix-notes"),
]

# Helper to check file exists and non‑empty
file_status = {}
for f in required_files:
    exists = os.path.isfile(f) or os.path.isdir(f)
    size = os.path.getsize(f) if exists and os.path.isfile(f) else 0
    file_status[f] = {"exists": exists, "size": size}

summary = {"files": file_status}

# Load CSVs if present
csv_paths = {
    "autofixed": os.path.join(fix_dir, "MEL_SAFE_AUTOFIXED_REVIEW_ROWS.csv"),
    "human": os.path.join(fix_dir, "MEL_HUMAN_DECISION_REQUIRED.csv"),
}
for name, path in csv_paths.items():
    if os.path.isfile(path) and os.path.getsize(path) > 0:
        df = pd.read_csv(path)
        summary[f"{name}_rows"] = len(df)
        # Count safe autofixes (requires_human column false)
        if name == "autofixed":
            summary["safe_autofix_count"] = int(df.get("requires_human", pd.Series([False]*len(df))).astype(bool).sum() == 0)
        if name == "human":
            summary["human_approval_count"] = int(df.get("requires_human", pd.Series([True]*len(df))).astype(bool).sum())
    else:
        summary[f"{name}_rows"] = 0

# Load Excel workbook for proposed fixes
prop_path = os.path.join(fix_dir, "MEL_PROPOSED_REGISTRY_FIXES.xlsx")
if os.path.isfile(prop_path):
    xl = pd.ExcelFile(prop_path)
    expected_sheets = [
        "Proposed Safe Autofixes",
        "Proposed Activity-Indicator Fixes",
        "Proposed Target Fixes",
        "Proposed Evidence Fixes",
        "Proposed IP Name Normalization",
        "Proposed Duplicate Handling",
        "Human Decision Required",
        "Do Not Auto-Fix",
    ]
    sheet_status = {sheet: sheet in xl.sheet_names for sheet in expected_sheets}
    summary["proposed_workbook"] = {"sheets_present": sheet_status, "sheet_count": len(xl.sheet_names)}
else:
    summary["proposed_workbook"] = {"sheets_present": {}, "sheet_count": 0}

# Load Master Tracker workbook
master_path = os.path.join(review_dir, "MEL_REVIEW_MASTER_TRACKER.xlsx")
if os.path.isfile(master_path):
    xl_master = pd.ExcelFile(master_path)
    helper_sheets = ["Fix Readiness", "Proposed Fix Summary", "Human Decision Required"]
    helper_status = {sh: sh in xl_master.sheet_names for sh in helper_sheets}
    summary["master_tracker"] = {"helper_sheets": helper_status, "sheet_count": len(xl_master.sheet_names)}
else:
    summary["master_tracker"] = {"helper_sheets": {}, "sheet_count": 0}

# Count IP review packs (files in ip-review-packs folder)
ip_review_dir = os.path.join(review_dir, "ip-review-packs")
if os.path.isdir(ip_review_dir):
    ip_packs = [f for f in os.listdir(ip_review_dir) if f.lower().endswith('.csv')]
    summary["ip_review_packs_updated"] = len(ip_packs)
else:
    summary["ip_review_packs_updated"] = 0

# Count IP fix notes (files in ip-fix-notes folder)
ip_fix_dir = os.path.join(review_dir, "ip-fix-notes")
if os.path.isdir(ip_fix_dir):
    ip_notes = [f for f in os.listdir(ip_fix_dir) if f.lower().endswith('.md')]
    summary["ip_fix_notes_created"] = len(ip_notes)
else:
    summary["ip_fix_notes_created"] = 0

# Simple validation checks – placeholder logic
# e.g., ensure default status column is "pending_review" when present
for df_name, path in csv_paths.items():
    if os.path.isfile(path) and os.path.getsize(path) > 0:
        df = pd.read_csv(path)
        if "me_review_status" in df.columns:
            default_ok = (df["me_review_status"].fillna('') == 'pending_review').all()
            summary[f"{df_name}_default_status_ok"] = bool(default_ok)

# Output JSON summary to stdout
print(json.dumps(summary, indent=2))
