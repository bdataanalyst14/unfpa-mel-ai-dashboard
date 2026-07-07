# Dashboard Use-Readiness Guide for Managers

This guide explains how to access, navigate, and interpret the UNFPA MEL AI Dashboard once staging access is enabled.

---

## 1. Accessing the Dashboard
* **Preview URL:** [https://unfpa-mel-ai-dashboard-clean-kyi2653uz-bdataanalyst14s-projects.vercel.app](https://unfpa-mel-ai-dashboard-clean-kyi2653uz-bdataanalyst14s-projects.vercel.app)
* **Access Prerequisite:** The Vercel project owner must first disable preview protection or provide secure credentials to bypass the Vercel gateway.

---

## 2. Initial Setup Checks
Before reviewing metrics, verify the active data mode badge in the header/footer of the dashboard:
* **Mock Mode (Default):** Displays high-fidelity synthetic data for review.
* **BigQuery Mode:** Displays live data from BigQuery data views (disabled by default; requires database credentials and separate authorization).

---

## 3. Route-by-Route Use Flow

### 1. Executive Overview (`/dashboard/executive-overview`)
* **Purpose:** High-level summary of program performance.
* **What to Check:** Validate core KPI cards (Reach, Activity Completion, Budget Utilization) and program milestone charts.

### 2. Activity Progress (`/dashboard/activity-progress`)
* **Purpose:** Track status of planned activities against the work plan.
* **What to Check:** Status bars showing "Completed", "On Track", "Delayed", or "Not Started".

### 3. Indicator Progress (`/dashboard/indicator-progress`)
* **Purpose:** Monitor targets versus achievements for logical framework indicators.
* **What to Check:** Percentage achievement gauges and indicator-by-indicator tables.

### 4. Participant Reach (`/dashboard/participant-reach`)
* **Purpose:** Demographic and geographic breakdown of program participants.
* **What to Check:** Age, gender, and district reach charts. Keep in mind small-cell suppression rules here.

### 5. Data Quality (`/dashboard/data-quality`)
* **Purpose:** Monitor registry validation status, missing variables, and data pipeline health.
* **What to Check:** Error counts, validation flags, and synchronization timestamps.

### 6. GBV/OCMC Summary (`/dashboard/gbv-ocmc-summary`)
* **Purpose:** Summarize OCMC clinical/psychosocial support metrics (Highly Sensitive).
* **What to Check:** Ensure all small cells (1–4 cases) are suppressed to `<5`. Null values must show as `N/A`.

### 7. IP Performance (`/dashboard/ip-performance`)
* **Purpose:** Compare implementing partner progress and budget utilization.
* **What to Check:** Partner scorecards and compliance ratings.

### 8. Activity Detail (`/dashboard/activity-detail`)
* **Purpose:** Granular log of specific work plan sub-activities.
* **What to Check:** Filter capabilities (by partner, district, or program area) and detailed logs.

### 9. Management Decision Centre (`/dashboard/management-decision-centre`)
* **Purpose:** Generate AI-assisted narrative drafts and decision support.
* **What to Check:** Select an indicator, click "Generate Draft narrative", verify it populates, and use the copy narrative draft function.

### 10. Geographic Coverage (`/dashboard/geographic-coverage`)
* **Purpose:** Visual mapping of activities across Nepal districts.
* **What to Check:** Ensure the custom offline SVG map loads, highlighting districts with active implementation.

---

## 4. Interpretation and Guardrails

### A. How to Interpret Dashboard Elements
* **KPI Cards:** Show aggregated metrics. If a metric value is suppressed, it will render as `<5`.
* **Charts/Graphs:** Tooltips and data labels are protected by suppression rules.
* **Data Caveats:** Standard footnotes state the source (KoBo data extraction dates) and mock-state markers.
* **AI Advisory Labels:** All AI narrative generation contains warning banners reminding users that drafts must be edited and approved by a human.
* **Map Limitations:** Districts not included in current project datasets will remain grayed out (partial geography caveat).

### B. What NOT to Claim
1. **No Full Production Readiness:** The dashboard is a staging prototype.
2. **No Live BigQuery Claims:** Unless BigQuery credentials are explicitly configured, data is mock-served.
3. **No National Map Coverage:** The map only renders districts with active data records, not the entire national system.
4. **No Autonomous Decisions:** The AI features do not execute commands or make funding/programming decisions.

### C. Privacy and Safeguarding Reminders
> [!CAUTION]
> * **Zero Personal Data:** Survivor, beneficiary, or complainant names are never stored or displayed.
> * **Aggregate Only:** Interpret all dashboard panels at the aggregate level. If any raw count displays 1, 2, 3, or 4, report it immediately as a security bug.
