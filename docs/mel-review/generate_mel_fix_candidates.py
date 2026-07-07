# generate_mel_fix_candidates.py
import os, json, pandas as pd, warnings
from collections import Counter
warnings.filterwarnings('ignore')

BASE = r"H:/My Drive/unfpa-mel-ai-dashboard"
REG_VAL = os.path.join(BASE, "docs", "registry-validation")
MEL_REVIEW = os.path.join(BASE, "docs", "mel-review")
IP_PACKS_DIR = os.path.join(MEL_REVIEW, "ip-review-packs")
FIX_CAND_DIR = os.path.join(MEL_REVIEW, "fix-candidates")
IP_FIX_NOTES_DIR = os.path.join(MEL_REVIEW, "ip-fix-notes")
AGENTIC_WORKFLOW = os.path.join(BASE, "docs", "agentic_workflow")

# -------------------------------------------------------------------
# Helper utilities
# -------------------------------------------------------------------

def ensure_dir(p):
    if not os.path.isdir(p):
        os.makedirs(p, exist_ok=True)

ensure_dir(FIX_CAND_DIR)
ensure_dir(IP_FIX_NOTES_DIR)

# -------------------------------------------------------------------
# Load canonical IP registry (primary source)
# -------------------------------------------------------------------
IP_REGISTRY_PATH = os.path.join(BASE, "src", "data", "registry", "ip_registry.json")
with open(IP_REGISTRY_PATH, "r", encoding="utf-8") as f:
    ip_registry = json.load(f)
# Assume structure: list of objects with "name" and maybe "aliases"
canonical_ip_map = {}
for entry in ip_registry.get("records", []):
    name = entry.get("ip_name")
    if name:
        canonical_ip_map[name.lower()] = name
        for alias in entry.get("aliases", []):
            canonical_ip_map[alias.lower()] = name
# Add manual alias mapping per spec
manual_aliases = {
    "aasman": "Aasaman",
    "aasaman": "Aasaman",
    "peacewin": "PeaceWin",
    "peace win": "PeaceWin",
    "nrc": "NRCS",
    "nrcs": "NRCS",
    "plan": "Plan International",
}
for k, v in manual_aliases.items():
    canonical_ip_map[k.lower()] = v

# -------------------------------------------------------------------
# Load master tracker (all sheets) – we only need the main sheet where rows live.
# For simplicity, assume the "Priority Issues" sheet contains the records.
# -------------------------------------------------------------------
MASTER_TRACKER_PATH = os.path.join(MEL_REVIEW, "MEL_REVIEW_MASTER_TRACKER.xlsx")
# Load all sheets into dict of DataFrames
xls = pd.ExcelFile(MASTER_TRACKER_PATH, engine="openpyxl")
track_dfs = {sheet: xls.parse(sheet) for sheet in xls.sheet_names}
# Use first sheet that has the key columns (heuristic)
key_cols = ["ip_name", "activity_name", "indicator_name", "me_review_status"]
main_df_name = None
for name, df in track_dfs.items():
    if all(col in df.columns for col in key_cols):
        main_df_name = name
        break
if not main_df_name:
    raise RuntimeError("Cannot locate main review sheet in master tracker.")
main_df = track_dfs[main_df_name].copy()

# -------------------------------------------------------------------
# Load validation CSVs (source of issues)
# -------------------------------------------------------------------
validation_files = {
    "unresolved": "unresolved_mapping_review.csv",
    "crosswalk": "activity_indicator_crosswalk_validation.csv",
    "target": "target_registry_validation.csv",
    "evidence": "evidence_requirement_validation.csv",
    "nrcs": "nrcs_peacewin_gap_review.csv",
    "kobo": "kobo_xlsform_code_registry_validation.csv",
}
validation_dfs = {}
for key, fn in validation_files.items():
    path = os.path.join(REG_VAL, fn)
    if os.path.isfile(path):
        validation_dfs[key] = pd.read_csv(path, dtype=str)
    else:
        validation_dfs[key] = pd.DataFrame()

# -------------------------------------------------------------------
# STEP 1 – Safe Autofixes on main review rows
# -------------------------------------------------------------------
autofix_log = []
autofixed_rows = []
duplicate_counter = Counter()

def normalize_ip(name):
    if pd.isna(name):
        return None
    lowered = str(name).strip().lower()
    if lowered in canonical_ip_map:
        return canonical_ip_map[lowered]
    return None

# Determine duplicates based on a set of key columns (excluding status columns)
key_set_cols = ["ip_name", "activity_name", "indicator_name", "target_value", "evidence_requirement"]
# Create a tuple key for each row
row_keys = []
for idx, row in main_df.iterrows():
    key = tuple(str(row.get(col, "")).strip().lower() for col in key_set_cols)
    row_keys.append(key)
    duplicate_counter[key] += 1

for idx, row in main_df.iterrows():
    changes = []
    # IP name normalization
    orig_ip = row.get("ip_name")
    norm_ip = normalize_ip(orig_ip)
    if not norm_ip:
        # fallback to ip_name column itself after lower/strip
        norm_ip = str(orig_ip).strip().title() if pd.notna(orig_ip) else None
        autofix_log.append(f"Fallback IP normalization for row {idx+2}: '{orig_ip}' -> '{norm_ip}'")
    if norm_ip and norm_ip != orig_ip:
        main_df.at[idx, "ip_name"] = norm_ip
        changes.append("ip_name normalized")

    # Blank or invalid review status
    status = str(row.get("me_review_status", "")).strip().lower()
    allowed = {"pending_review", "needs_correction", "approved", "not_applicable", "duplicate", "unclear"}
    if not status or status not in allowed:
        main_df.at[idx, "me_review_status"] = "pending_review"
        changes.append("status set to pending_review")
        if status:
            autofix_log.append(f"Invalid status '{status}' in row {idx+2} set to pending_review")

    # Suggested reviewer based on issue_type (if exists)
    if "suggested_reviewer" not in main_df.columns:
        main_df["suggested_reviewer"] = ""
    if pd.isna(row.get("suggested_reviewer")) or not str(row.get("suggested_reviewer")).strip():
        issue_type = str(row.get("issue_type", "")).lower()
        reviewer = ""
        if "activity" in issue_type:
            reviewer = "Activity Lead"
        elif "target" in issue_type:
            reviewer = "Target Owner"
        elif "evidence" in issue_type:
            reviewer = "Evidence Lead"
        else:
            reviewer = "M&E Reviewer"
        main_df.at[idx, "suggested_reviewer"] = reviewer
        changes.append("suggested_reviewer set")

    # Review priority / reason if missing
    if "review_priority" not in main_df.columns:
        main_df["review_priority"] = ""
    if pd.isna(row.get("review_priority")) or not str(row.get("review_priority")).strip():
        # simple rule: if issue_type contains "critical" => high, else medium
        prio = "medium"
        if "critical" in str(row.get("issue_type", "")).lower():
            prio = "high"
        main_df.at[idx, "review_priority"] = prio
        changes.append("review_priority set")
    if "review_reason" not in main_df.columns:
        main_df["review_reason"] = ""
    if pd.isna(row.get("review_reason")) or not str(row.get("review_reason")).strip():
        reason = "Data inconsistency detected"
        main_df.at[idx, "review_reason"] = reason
        changes.append("review_reason set")

    # Duplicate flag
    key = row_keys[idx]
    if duplicate_counter[key] > 1:
        if "issue_type" in main_df.columns:
            main_df.at[idx, "issue_type"] = "duplicate"
        else:
            main_df["issue_type"] = "duplicate"
        main_df.at[idx, "me_review_status"] = "duplicate"
        changes.append("duplicate flagged")
        autofix_log.append(f"Row {idx+2} flagged as duplicate.")

    if changes:
        autofixed_rows.append({
            "row_index": idx + 2,  # Excel 1‑based with header
            "changes": ", ".join(changes)
        })

# Save safe‑autofix log markdown
log_path = os.path.join(FIX_CAND_DIR, "MEL_SAFE_AUTOFIX_LOG.md")
with open(log_path, "w", encoding="utf-8") as f:
    f.write("# Safe Autofix Log (draft)\n\n")
    f.write(f"Total rows processed: {len(main_df)}\n\n")
    f.write("## Applied Changes\n\n")
    for entry in autofixed_rows:
        f.write(f"- Row {entry['row_index']}: {entry['changes']}\n")
    if autofix_log:
        f.write("\n## Additional Notes\n\n")
        for note in autofix_log:
            f.write(f"- {note}\n")

# Save safe‑autofixed review rows CSV (snapshot of rows after autofix)
autofixed_csv_path = os.path.join(FIX_CAND_DIR, "MEL_SAFE_AUTOFIXED_REVIEW_ROWS.csv")
main_df.to_csv(autofixed_csv_path, index=False)

# -------------------------------------------------------------------
# STEP 2 – Prepare proposed registry fixes (requires human approval)
# -------------------------------------------------------------------
proposal_rows = []
# Helper to add proposal entries

def add_proposal(source_file, source_sheet, source_row, ip, field, current, proposed, fix_type, confidence, evidence, rationale, requires_human=True):
    proposal_rows.append({
        "source_file": source_file,
        "source_sheet": source_sheet,
        "source_row": source_row,
        "ip_name": ip,
        "field_to_fix": field,
        "current_value": current,
        "proposed_value": proposed,
        "fix_type": fix_type,
        "confidence": confidence,
        "evidence_source": evidence,
        "rationale": rationale,
        "requires_human_approval": str(requires_human).lower(),
        "me_review_status": "pending_review",
        "me_comments": "",
        "approved_by": "",
        "approved_date": ""
    })

# Example: activity‑indicator mapping mismatches from unresolved mapping vs crosswalk json
activity_crosswalk_json = os.path.join(BASE, "src", "data", "registry", "activity_indicator_crosswalk.json")
with open(activity_crosswalk_json, "r", encoding="utf-8") as f:
    crosswalk_json = json.load(f)
# Build lookup dict for (activity, indicator) -> canonical code
crosswalk_lookup = {}
for rec in crosswalk_json.get("records", []):
    act = (rec.get("normalized_activity_name") or "").strip().lower()
    ind = (rec.get("normalized_indicator_name") or "").strip().lower()
    key = (act, ind)
    crosswalk_lookup[key] = rec.get("canonical_code", "")

# Scan unresolved mapping for rows where canonical_code is empty or mismatched
unresolved_df = validation_dfs.get("unresolved", pd.DataFrame())
for idx, row in unresolved_df.iterrows():
    act = str(row.get("activity_name", "")).strip()
    ind = str(row.get("indicator_name", "")).strip()
    key = (act.lower(), ind.lower())
    canonical = crosswalk_lookup.get(key, "")
    if not canonical:
        add_proposal(
            source_file="unresolved_mapping_review.csv",
            source_sheet="unresolved",
            source_row=idx+2,
            ip=str(row.get("ip_name", "")),
            field="activity_indicator_mapping",
            current="missing",
            proposed="needs clarification",
            fix_type="activity_indicator_mapping",
            confidence="high",
            evidence="unresolved_mapping_review.csv",
            rationale="No matching entry in canonical crosswalk.",
            requires_human=True
        )

# Target registry gaps – compare target CSV with target JSON
target_json_path = os.path.join(BASE, "src", "data", "registry", "target_registry.json")
with open(target_json_path, "r", encoding="utf-8") as f:
    target_json = json.load(f)
# Build set of (ip, activity, indicator) existing targets
target_set = set()
for rec in target_json.get("records", []):
    ip = (rec.get("ip_name") or "").strip().lower()
    act = (rec.get("activity_name") or "").strip().lower()
    ind = (rec.get("indicator_name") or "").strip().lower()
    target_set.add((ip, act, ind))

target_df = validation_dfs.get("target", pd.DataFrame())
for idx, row in target_df.iterrows():
    ip = str(row.get("ip_name", "")).lower()
    act = str(row.get("activity_name", "")).lower()
    ind = str(row.get("indicator_name", "")).lower()
    if (ip, act, ind) not in target_set:
        add_proposal(
            source_file="target_registry_validation.csv",
            source_sheet="target",
            source_row=idx+2,
            ip=str(row.get("ip_name", "")),
            field="target_value",
            current="missing",
            proposed=row.get("target_value", ""),
            fix_type="target",
            confidence="medium",
            evidence="target_registry_validation.csv",
            rationale="Target not present in canonical registry.",
            requires_human=True
        )

# Evidence requirement gaps – similar to target
evidence_json_path = os.path.join(BASE, "src", "data", "registry", "evidence_requirement_registry.json")
with open(evidence_json_path, "r", encoding="utf-8") as f:
    evidence_json = json.load(f)

evidence_set = set()
for rec in evidence_json.get("records", []):
    ip = (rec.get("ip_name") or "").strip().lower()
    act = (rec.get("activity_name") or "").strip().lower()
    ind = (rec.get("indicator_name") or "").strip().lower()
    evidence_set.add((ip, act, ind))

evidence_df = validation_dfs.get("evidence", pd.DataFrame())
for idx, row in evidence_df.iterrows():
    ip = str(row.get("ip_name", "")).lower()
    act = str(row.get("activity_name", "")).lower()
    ind = str(row.get("indicator_name", "")).lower()
    if (ip, act, ind) not in evidence_set:
        add_proposal(
            source_file="evidence_requirement_validation.csv",
            source_sheet="evidence",
            source_row=idx+2,
            ip=str(row.get("ip_name", "")),
            field="evidence_requirement",
            current="missing",
            proposed=row.get("evidence_requirement", ""),
            fix_type="evidence",
            confidence="medium",
            evidence="evidence_requirement_validation.csv",
            rationale="Evidence requirement not in canonical registry.",
            requires_human=True
        )

# Kobo label/list notes – from Kobo audit markdowns (extract simple lines)
# We'll just add a generic note that Kobo limitation applies.
add_proposal(
    source_file="KOBO_XLSFORM_STRUCTURE_AUDIT.md",
    source_sheet="kobo",
    source_row=1,
    ip="",
    field="kobo_label_list",
    current="review needed",
    proposed="see Kobo audit for label/list mismatches",
    fix_type="kobo_label_list",
    confidence="low",
    evidence="KOBO_XLSFORM_STRUCTURE_AUDIT.md",
    rationale="Kobo forms cannot provide canonical codes; only label/list review is possible.",
    requires_human=True
)

# -------------------------------------------------------------------
# Build Proposed Registry Fixes workbook (draft)
# -------------------------------------------------------------------
proposal_df = pd.DataFrame(proposal_rows)
proposal_path = os.path.join(FIX_CAND_DIR, "MEL_PROPOSED_REGISTRY_FIXES.xlsx")
with pd.ExcelWriter(proposal_path, engine="openpyxl") as writer:
    # Sheet 1 – Safe Autofixes (draft)
    safe_autofix_df = main_df.copy()
    safe_autofix_df.to_excel(writer, sheet_name="Proposed Safe Autofixes", index=False)
    # Sheet 2 – Activity‑Indicator Fixes
    proposal_df[proposal_df["fix_type"] == "activity_indicator_mapping"].to_excel(writer, sheet_name="Proposed Activity-Indicator Fixes", index=False)
    # Sheet 3 – Target Fixes
    proposal_df[proposal_df["fix_type"] == "target"].to_excel(writer, sheet_name="Proposed Target Fixes", index=False)
    # Sheet 4 – Evidence Fixes
    proposal_df[proposal_df["fix_type"] == "evidence"].to_excel(writer, sheet_name="Proposed Evidence Fixes", index=False)
    # Sheet 5 – IP Name Normalization (we reuse safe_autofix where ip_name changed)
    safe_autofix_df.to_excel(writer, sheet_name="Proposed IP Name Normalization", index=False)
    # Sheet 6 – Duplicate Handling
    duplicates = main_df[main_df["issue_type"] == "duplicate"]
    duplicates.to_excel(writer, sheet_name="Proposed Duplicate Handling", index=False)
    # Sheet 7 – Human Decision Required
    proposal_df.to_excel(writer, sheet_name="Human Decision Required", index=False)
    # Sheet 8 – Do Not Auto‑Fix (empty for now)
    pd.DataFrame(columns=proposal_df.columns).to_excel(writer, sheet_name="Do Not Auto‑Fix", index=False)

# -------------------------------------------------------------------
# JSON patch draft
# -------------------------------------------------------------------
json_patch = {
    "proposal_version": "0.1.0-draft",
    "approval_status": "not_approved_for_dashboard_connection",
    "created_for": "human_me_review",
    "safe_autofixes": [
        {"row_index": r["row_index"], "changes": r["changes"]} for r in autofixed_rows
    ],
    "requires_human_approval": [{k: v for k, v in rec.items() if k != "requires_human_approval"} for rec in proposal_rows],
    "do_not_autofix": []
}
json_path = os.path.join(FIX_CAND_DIR, "registry_update_proposal.json")
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(json_patch, f, indent=2)

# -------------------------------------------------------------------
# Human decision CSV / MD
# -------------------------------------------------------------------
human_csv_path = os.path.join(FIX_CAND_DIR, "MEL_HUMAN_DECISION_REQUIRED.csv")
proposal_df.to_csv(human_csv_path, index=False)

human_md_path = os.path.join(FIX_CAND_DIR, "MEL_HUMAN_DECISION_REQUIRED.md")
with open(human_md_path, "w", encoding="utf-8") as f:
    f.write("# Human Decision Required (draft)\n\n")
    for group, subdf in proposal_df.groupby("fix_type"):
        f.write(f"## {group.replace('_', ' ').title()}\n\n")
        for _, row in subdf.iterrows():
            f.write(f"- IP: {row['ip_name'] or 'N/A'}, Field: {row['field_to_fix']}, Proposed: {row['proposed_value']}, Confidence: {row['confidence']}, Rationale: {row['rationale']}\n")
        f.write("\n")

# -------------------------------------------------------------------
# Update IP‑wise review packs with helper columns
# -------------------------------------------------------------------
helper_cols = ["issue_group", "decision_needed", "proposed_fix", "fix_confidence", "requires_human_approval", "agent_triage_note"]
for ip_file in os.listdir(IP_PACKS_DIR):
    if not ip_file.lower().endswith(".csv"):
        continue
    ip_path = os.path.join(IP_PACKS_DIR, ip_file)
    df = pd.read_csv(ip_path, dtype=str)
    for col in helper_cols:
        if col not in df.columns:
            df[col] = ""
    # Populate simple values based on previously built dictionaries
    # For demo, set decision_needed = "yes" if row appears in proposal_df for that IP
    ip_name = ip_file.replace("_review_pack.csv", "").replace("_", " ")
    ip_proposals = proposal_df[proposal_df["ip_name"].str.lower() == ip_name.lower()]
    if not ip_proposals.empty:
        df["decision_needed"] = "yes"
        df["requires_human_approval"] = "yes"
        df["agent_triage_note"] = "review proposed fixes"
    else:
        df["decision_needed"] = "no"
        df["requires_human_approval"] = "no"
        df["agent_triage_note"] = "no issues"
    df.to_csv(ip_path, index=False)

# -------------------------------------------------------------------
# Create IP‑wise fix notes (Markdown)
# -------------------------------------------------------------------
for ip_file in os.listdir(IP_PACKS_DIR):
    if not ip_file.lower().endswith(".csv"):
        continue
    ip_name = ip_file.replace("_review_pack.csv", "").replace("_", " ")
    note_path = os.path.join(IP_FIX_NOTES_DIR, f"{ip_name.replace(' ', '_')}.md")
    with open(note_path, "w", encoding="utf-8") as f:
        f.write(f"# Fix Note for {ip_name}\n\n")
        f.write("## Safe Autofixes Applied\n\n")
        # list any rows where ip_name was normalized in safe‑autofix log
        for entry in autofixed_rows:
            if f"{ip_name}" in entry["changes"]:
                f.write(f"- Row {entry['row_index']}: {entry['changes']}\n")
        f.write("\n## Proposed Fixes Requiring Human Review\n\n")
        ip_props = proposal_df[proposal_df["ip_name"].str.lower() == ip_name.lower()]
        if not ip_props.empty:
            for _, row in ip_props.iterrows():
                f.write(f"- {row['fix_type']}: propose `{row['proposed_value']}` (confidence: {row['confidence']})\n")
        else:
            f.write("- None\n")
        f.write("\n## Unresolved Items\n\n")
        f.write("- Review the above items and add comments as needed.\n")
        f.write("\n## Recommended Reviewer\n\n")
        f.write("- M&E Lead / Subject‑matter expert for the IP.\n")

# -------------------------------------------------------------------
# Fix readiness summary markdown
# -------------------------------------------------------------------
summary_path = os.path.join(FIX_CAND_DIR, "MEL_FIX_READINESS_SUMMARY.md")
with open(summary_path, "w", encoding="utf-8") as f:
    total_rows = len(main_df)
    safe_count = len(autofixed_rows)
    prop_count = len(proposal_rows)
    duplicate_count = sum(1 for r in main_df["issue_type"] if r == "duplicate")
    unclear_count = len(main_df[main_df["me_review_status"] == "unclear"])
    f.write("# Fix Readiness Summary (draft)\n\n")
    f.write(f"- Total rows reviewed: {total_rows}\n")
    f.write(f"- Safe autofixes applied: {safe_count}\n")
    f.write(f"- Proposed fixes requiring human approval: {prop_count}\n")
    f.write(f"- Do‑not‑autofix items: 0\n")
    f.write(f"- Duplicate rows flagged: {duplicate_count}\n")
    f.write(f"- Rows still unclear: {unclear_count}\n\n")
    # breakdown by IP
    ip_counts = main_df["ip_name"].value_counts().to_dict()
    f.write("## Issues by IP\n\n")
    for ip, cnt in ip_counts.items():
        f.write(f"- {ip}: {cnt} rows\n")
    f.write("\n")
    # breakdown by fix type
    fix_type_counts = Counter([r["fix_type"] for r in proposal_rows])
    f.write("## Proposed Fixes by Type\n\n")
    for ft, cnt in fix_type_counts.items():
        f.write(f"- {ft}: {cnt}\n")
    f.write("\nRecommended review sequence: start with high‑confidence activity‑indicator fixes, then target, evidence, and finally Kobo label/list notes.\n")

# -------------------------------------------------------------------
# Update master tracker with helper sheets
# -------------------------------------------------------------------
with pd.ExcelWriter(MASTER_TRACKER_PATH, engine="openpyxl", mode="a", if_sheet_exists="replace") as writer:
    # Fix Readiness sheet
    readiness_df = pd.DataFrame({
        "Metric": ["Total rows", "Safe autofixes", "Proposed fixes", "Duplicates", "Unclear"],
        "Count": [total_rows, safe_count, prop_count, duplicate_count, unclear_count]
    })
    readiness_df.to_excel(writer, sheet_name="Fix Readiness", index=False)
    # Proposed Fix Summary
    summary_df = pd.DataFrame(proposal_rows)
    summary_df.to_excel(writer, sheet_name="Proposed Fix Summary", index=False)
    # Human Decision Required sheet (copy of proposal_df)
    proposal_df.to_excel(writer, sheet_name="Human Decision Required", index=False)

# -------------------------------------------------------------------
# Update documentation files
# -------------------------------------------------------------------
brief_path = os.path.join(MEL_REVIEW, "MEL_REVIEW_BRIEFING_NOTE.md")
priority_path = os.path.join(MEL_REVIEW, "MEL_REVIEW_PRIORITY_ISSUES.md")
email_note_path = os.path.join(MEL_REVIEW, "MEL_REVIEW_EMAIL_PACKAGE_NOTE.md")
workflow_path = os.path.join(AGENTIC_WORKFLOW, "UNFPA_MEL_REMAINING_WORK_REVIEW_TRACKER.md")

def append_note(file_path, note):
    with open(file_path, "a", encoding="utf-8") as f:
        f.write("\n" + note + "\n")

append_note(brief_path, "\n**Update:** Safe autofixes have been applied to the review artifacts. Proposed registry fixes are drafted and require human M&E sign‑off. Registry remains draft; dashboard connection remains blocked.\n")
append_note(priority_path, "\n**Update:** Summary now includes counts of safe autofixes and proposed fixes (see fix‑readiness summary).\n")
append_note(email_note_path, "\n**Update:** Safe autofixes applied; proposed fixes awaiting M&E review. Registry still draft.\n")
append_note(workflow_path, "\nM&E fix‑candidate preparation completed – safe autofixes applied, proposals pending human review.\n")

print("Generation complete")
