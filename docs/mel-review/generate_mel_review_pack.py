# generate_mel_review_pack.py
import os, pandas as pd

# Base directory (use raw string to handle spaces)
base_dir = r"H:/My Drive/unfpa-mel-ai-dashboard"
validation_dir = os.path.join(base_dir, "docs", "registry-validation")
mel_review_dir = os.path.join(base_dir, "docs", "mel-review")
ip_pack_dir = os.path.join(mel_review_dir, "ip-review-packs")

# Ensure output directories exist
os.makedirs(mel_review_dir, exist_ok=True)
os.makedirs(ip_pack_dir, exist_ok=True)

# Load CSV sources (ignore missing files for robustness)
source_files = {
    "unresolved": "unresolved_mapping_review.csv",
    "crosswalk": "activity_indicator_crosswalk_validation.csv",
    "target": "target_registry_validation.csv",
    "evidence": "evidence_requirement_validation.csv",
    "nrcs": "nrcs_peacewin_gap_review.csv",
    "ip_registry": "ip_registry_validation.csv",
}

dfs = {}
for key, fname in source_files.items():
    path = os.path.join(validation_dir, fname)
    if os.path.isfile(path):
        dfs[key] = pd.read_csv(path)
    else:
        dfs[key] = pd.DataFrame()

# List of IPs (as requested)
ips = ["Aasaman", "ADRA", "CMC", "FPAN", "GNI", "JURI", "KIDS", "NRCS", "PeaceWin", "Plan International", "SAATHI", "SOSEC", "SPN", "TPO", "WOREC"]

# Helper to filter rows for a given IP (case‑insensitive)
def filter_ip(df, ip):
    for col in ["ip_name", "IP", "partner_name", "partner", "normalized_ip_name"]:
        if col in df.columns:
            return df[df[col].astype(str).str.lower() == ip.lower()]
    return pd.DataFrame(columns=df.columns)

# Create per‑IP CSV packs
for ip in ips:
    frames = []
    for name, df in dfs.items():
        ip_df = filter_ip(df, ip)
        if not ip_df.empty:
            # Prefix columns to keep source identifiable
            prefixed = ip_df.add_prefix(f"{name}_")
            frames.append(prefixed)
    if frames:
        merged = pd.concat(frames, axis=1)
        out_path = os.path.join(ip_pack_dir, f"{ip.replace(' ', '_')}_review_pack.csv")
        merged.to_csv(out_path, index=False)

# Create master review tracker Excel with required sheets and columns
master_path = os.path.join(mel_review_dir, "MEL_REVIEW_MASTER_TRACKER.xlsx")
writer = pd.ExcelWriter(master_path, engine="openpyxl")

sheet_names = [
    "Review Dashboard",
    "Priority Issues",
    "IP-wise Review Status",
    "Activity-Indicator Crosswalk Review",
    "Target Review",
    "Evidence Requirement Review",
    "NRCS-Aasaman-PeaceWin Focus Review",
    "Kobo Label-List Review",
    "Decision Log",
    "Sign-off Checklist",
]

columns = [
    "review_priority",
    "review_reason",
    "ip_name",
    "activity_name",
    "indicator_name",
    "target_value",
    "evidence_requirement",
    "issue_type",
    "suggested_reviewer",
    "me_review_status",
    "me_corrected_value",
    "me_comments",
    "approved_by",
    "approved_date",
]

for sheet in sheet_names:
    pd.DataFrame(columns=columns).to_excel(writer, sheet_name=sheet, index=False)

writer.close()

# Helper to write markdown files
def write_md(path, content):
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

# Priority issue summary
priority_md = os.path.join(mel_review_dir, "MEL_REVIEW_PRIORITY_ISSUES.md")
write_md(priority_md, "# Priority Issue Summary\n\n*Critical, High, Medium, Low* issues grouped by category.\n\n**Kobo limitation:** Kobo XLSForms do not provide extractable canonical activity_code, output_code, or outcome_code. Review is limited to label/list‑name, form structure, geography choices and evidence/attachment fields.\n")

# Briefing note
brief_md = os.path.join(mel_review_dir, "MEL_REVIEW_BRIEFING_NOTE.md")
write_md(brief_md, "# M&E Review Briefing Note\n\n## Purpose\nPrepare M&E colleagues for reviewing the registry validation package.\n\n## Prepared Assets\n- Master review tracker (Excel)\n- IP‑wise CSV review packs\n- Priority issue summary (MD)\n- Meeting agenda (MD)\n- Sign‑off template (MD)\n\n## Decisions Required\nHuman reviewers must approve or request corrections for each issue. No dashboard connection or registry status change is performed at this stage.\n\n## Review Sequence\n1. Review Dashboard sheet\n2. Prioritise issues\n3. IP‑wise status review\n4. Crosswalk, target, evidence reviews\n5. Kobo label/list review (limited)\n6. Record decisions in the tracker.\n\n## Files to Review\n- `MEL_REVIEW_MASTER_TRACKER.xlsx`\n- CSV packs in `ip-review-packs/`\n- `MEL_REVIEW_PRIORITY_ISSUES.md`\n\n## Expected Output\nPopulated tracker rows and a completed sign‑off note.\n\n## Boundaries\n- Registry remains draft.\n- No dashboard routes are connected.\n- No deployment actions are taken.\n")

# Meeting agenda
agenda_md = os.path.join(mel_review_dir, "MEL_REVIEW_MEETING_AGENDA.md")
write_md(agenda_md, "# M&E Review Meeting Agenda (60‑90 min)\n\n1. Introduction (5 min) – Lead M&E\n2. Review Dashboard sheet (15 min) – Data team\n3. Priority Issues walk‑through (20 min) – Review leads\n4. IP‑wise status review (15 min) – IP leads\n5. Kobo label/list review & limitations (10 min) – Kobo specialist\n6. Decisions & sign‑off planning (10 min) – M&E manager\n7. Next steps (5 min) – All\n\n**Participants:** M&E leads, IP data owners, Kobo specialist, Data engineering liaison.\n**Decisions Required:** Approve, request correction, or defer each issue.\n")

# Sign‑off note template
signoff_md = os.path.join(mel_review_dir, "MEL_REGISTRY_SIGN_OFF_NOTE_TEMPLATE.md")
write_md(signoff_md, "# Registry Sign‑off Note (Template)\n\n**Registry Version:** \n**Date Reviewed:** \n**Reviewers:** \n\n**Scope Reviewed:**\n- Activity‑Indicator Crosswalk\n- Targets\n- Evidence Requirements\n- Kobo Label/List Review\n\n**Issues Approved:** \n- List approved issues here\n\n**Issues Pending:** \n- List pending issues here\n\n**Conditions Before Dashboard Connection:**\n- All pending issues resolved\n- Registry status changed to approved by governance\n\n**Approval Statement:**\n_The above‑listed issues are approved for proceeding to dashboard integration._\n\n**Signature:** _______________________  **Name:** _______________________  **Date:** __________\n")

print("Generation complete")
