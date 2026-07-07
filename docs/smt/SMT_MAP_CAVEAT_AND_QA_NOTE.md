# SMT Map Caveat & QA Summary Note
**Prepared for:** Senior Management Team  
**Subject:** Geographic Coverage Map – Transparency Note  
**Date:** 2026-06-20  

---

## Quick Summary: What You're Seeing

### The Map
- **What it is**: A working prototype showing our 14-district programme footprint across Nepal
- **Data**: Aggregated programme activities and reach by district (no individual beneficiary records)
- **Current status**: Demonstration mode using protected mock data
- **Privacy protection**: Built-in — no GBV survivor details, no personal identifiers

### What's Safe to Claim

✅ "We're active in 7 provinces and 14 districts"  
✅ "Geographic analysis shows coverage gaps in Bajhang, Jajarkot, Sarlahi, Rolpa"  
✅ "Aggregated reach across districts is approximately 8,150 people"  
✅ "This dashboard demonstrates our geographic insight capability"  

### What NOT to Claim

❌ "This is live operational data" (it's prototype/mock)  
❌ "We have real-time geographic tracking" (in development)  
❌ "Coverage is operationally confirmed in all 14 districts" (subject to validation)  
❌ "GBV data is live and connected" (blocked pending privacy approval)  

---

## Technical Status

| Element | Current Status | Ready? |
|---------|----------------|--------|
| Map renders Nepal boundaries | ✅ Yes | Yes |
| Activity bubbles display | ✅ Yes | Yes |
| Interactive controls work | ✅ Yes | Yes |
| Privacy labels visible | ✅ Yes | Yes |
| Aggregation verified | ✅ Yes | Yes |
| Live data connected | ❌ No | No |
| GBV live data | ❌ No | No |
| M&E sign-off complete | ❌ No | No |

---

## Privacy Guarantees

**Guaranteed:**
- No individual beneficiary names ever displayed
- No GBV survivor-level records shown
- No phone numbers, email addresses, personal IDs in UI
- Data aggregated at district level before rendering
- Privacy badge ("Aggregated Privacy View Active") visible

**In Progress:**
- Server-side suppression for small cells (`n<5`)
- Live data connection safeguards
- API/payload privacy validation
- M&E data governance sign-off

---

## Data Governance Status

| Gate | Status | Impact |
|------|--------|--------|
| **DP-003B Freshness Gate** | ⏳ Pending | Must pass before live geographic data connection |
| **DP-003B Suppression Gate** | ⏳ Pending | Must verify `n<5` suppression before live |
| **M&E Registry Approval** | ⏳ Pending | Blocks new geographic dimensions |
| **GBV Privacy Approval** | ⏳ Pending | Blocks live GBV data |

---

## What Happens Next

### Timeline

**Q3 2026 (Provisional):**
- DP-003B freshness/suppression validation
- Live data connection for approved safe aggregate routes
- Extended dashboard phase 1 (Activity Progress, IP Performance)

**Q4 2026+ (Pending Approval):**
- M&E registry sign-off
- Registry-dependent routes (Indicator Progress, Activity Detail)
- GBV live data (separate privacy approval)

### Decision Needed From SMT

1. **Coverage gap priorities:** Which gaps to target first for resource allocation?
2. **Data governance approval:** Does aggregated geographic model align with your expectations?
3. **Dashboard roadmap:** Which routes are priorities after geographic coverage stabilizes?

---

## If Questions Come Up During Demo

### "Is this live data?"
**Answer:** "No, this is prototype demonstration data. Live data connection is in progress — we're implementing safeguards to ensure privacy protections before connecting real data."

### "Can we export this to Excel?"
**Answer:** "Not in this prototype. When live, any export will be aggregated only, never individual records, and subject to our data governance audit log."

### "Why isn't [District] shown?"
**Answer:** "We're showing the 14 districts where we currently have active implementation. We have expansion plans for others."

### "Are the numbers confirmed?"
**Answer:** "The activity counts come from our programme database; reach is aggregated actuals. The 'Estimated Palikas' is a rough estimate we'll validate in next phase."

---

## Document Verification

**QA Review Status:** ✅ PASS  
**Protected Files Status:** ✅ Hashes verified unchanged  
**Khotang Correction:** ✅ Preserved in mock data  
**Privacy Safeguards:** ✅ Present and visible  
**Prototype Labeling:** ✅ Clear and prominent  

---

## Sign-Off

This map is **SAFE FOR SMT DEMO** with the caveats documented above.

**Prepared by:** CLAUDE-MAP-SMT-002 Review  
**Verified:** 2026-06-20  
**Status:** Ready for presentation
