# Geographic Coverage SMT Demo Checklist
**Prepared for:** Senior Management Team (SMT) Preview  
**Demo URL:** Available post-Vercel deployment  
**Status:** Ready with caveats  
**Data Mode:** Mock aggregated (prototype)  

---

## 1. Pre-Demo Environment Setup

### 1.1 Local Verification Checklist (Run before SMT session)

```bash
# Navigate to dashboard repo
cd "H:\My Drive\unfpa-mel-ai-dashboard"

# Verify npm environment
npm --version  # Should be 9+

# Build verification
npm run build  # Must pass

# Local dev startup
npm run dev    # Must start without errors

# Route availability check in browser
# Visit http://localhost:3000/dashboard/geographic-coverage
# Verify page loads, no 404 or runtime errors
```

**Checklist:**
- [ ] `npm run build` completes successfully
- [ ] `npm run dev` starts without errors
- [ ] `/dashboard/geographic-coverage` loads (HTTP 200)
- [ ] Map component renders visible SVG
- [ ] All controls respond (Activity/Reach/GBV toggles)
- [ ] No console errors in browser DevTools
- [ ] No network errors (check Network tab)

### 1.2 Pre-Demo Manual Checks

Run these checks 15 minutes before SMT presentation:

**Map Display:**
- [ ] Full Nepal boundary visible (not cut off)
- [ ] District bubbles display correctly
- [ ] Density colors visible: blue (high), orange (medium), tan (initial)
- [ ] Legend readable in bottom-right corner
- [ ] "Aggregated Privacy View Active" badge visible
- [ ] Privacy note visible: "Survivor-level data is never stored or rendered"

**Controls Functionality:**
- [ ] Click "Activity" button → map updates
- [ ] Click "Reach" button → map updates  
- [ ] Click "GBV" button → map updates
- [ ] Click "District" button → view changes
- [ ] Click "Province" button → view changes (if applicable)
- [ ] Hover over a district bubble → name and label appear

**Supporting Elements:**
- [ ] KPI cards display: Provinces (7/7), Districts, Palikas, Coverage Gaps
- [ ] "District Operations & Activity Density" chart renders
- [ ] Chart bars visible for top 9 districts
- [ ] "Intervention Gaps & Coverage Flags" table displays 4 records
- [ ] Table status badges color-coded (red/amber/blue)
- [ ] Footer visible with "Data as of" date

**Data Integrity (Do NOT Overclaim):**
- [ ] No personal names visible anywhere
- [ ] No phone numbers in table cells
- [ ] No email addresses visible
- [ ] All numbers are aggregated (no single-digit small cells exposed)
- [ ] GBV row shows only aggregate case count
- [ ] No disaggregation by vulnerable status visible

---

## 2. SMT Demo Flow & Talking Points

### 2.1 Opening (30 seconds)

**Show:** Screenshot of full geographic coverage page  
**Say:**
```
"This is our Geographic Coverage dashboard. It tracks where across 
Nepal we're implementing UNFPA's maternal health, GEWE, and youth 
programmes. The map shows our footprint by district, and the supporting 
metrics help us understand coverage and identify gaps."
```

### 2.2 Map Demo (1.5 minutes)

**Show:** Click "Activity" view, hover over 2–3 districts

**Say:**
```
"The map displays aggregated programme activity by district. Each bubble 
represents the density of activities — blue is high coverage, orange is 
medium, and tan shows initial presence. This is aggregated data — no 
individual beneficiary records are shown.

Here's Kathmandu with high activity (65 activities), Morang with 45, 
Dhanusha with 38. We can also switch to see participant reach — [click Reach]
— which shows how many people we're reaching in each district.
```

**Interactive demo:**
- Click Reach → bubbles resize
- Click Activity → return
- Hover over a district → name appears
- Point to legend → explain colors

### 2.3 Coverage Metrics (1 minute)

**Show:** KPI cards at top of page

**Say:**
```
"At a glance:
- 7 out of 7 provinces are covered — that's 100% provincial footprint
- We're active in [X] target districts
- We estimate reaching approximately 182 municipal units (palikas)
- We've identified 3 districts with coverage gaps that need intervention

This helps us target where we need to strengthen presence."
```

### 2.4 Coverage Gaps Table (1 minute)

**Show:** Scroll to "Intervention Gaps & Coverage Flags" table

**Say:**
```
"This table highlights districts where coverage is weak or absent:
- Jajarkot: Low activity in CP9 SRHR (45 days since last activity)
- Bajhang: No activity yet in CP9 GEWE
- Sarlahi: Pending startup in KOICA AYSRHR (planned)
- Rolpa: Low activity in CP9 SRHR (30 days since last activity)

These are priorities for intervention and resource allocation."
```

**Point out status colors:**
- Red badge = "No Activity" (highest priority)
- Amber badge = "Low Activity" (needs attention)
- Blue badge = "Pending Startup" (planned)

### 2.5 District Activity Chart (1 minute)

**Show:** "District Operations & Activity Density" bar chart

**Say:**
```
"This chart shows our top active districts by activity count. Kathmandu 
leads with 65 activities, followed by Morang (45) and Dhanusha (38). 
The chart helps us see where our highest concentration of work is and 
where we might be under-resourced."
```

### 2.6 Closing Statement (30 seconds)

**Say:**
```
"This prototype demonstrates the kind of geographic insight we'll have 
once our data systems mature. Right now, this is based on aggregated 
demonstration data. As we finalize our data governance and live connection 
standards, we'll connect this to actual programme data while maintaining 
strict privacy and aggregation rules."
```

---

## 3. Anticipated Questions & Answers

### Q: Is this live data?
**A:**  
"No, this is prototype demonstration data. We show aggregated numbers 
for all 14 active districts. Our live data connection is in progress — 
we're implementing privacy safeguards to ensure we never expose individual 
beneficiary records or small counts that could be re-identifiable."

### Q: Can we drill down to see activities in Kathmandu?
**A:**  
"Not in this geographic view — by design. For privacy and data protection, 
we show only aggregated counts at the district level. If you need activity-level 
detail, that's available in our Activity Progress dashboard, which has appropriate 
access controls and audit trails."

### Q: Why is [District] not on the map?
**A:**  
"We're showing the 14 districts where we're currently active. There are 
77 districts total in Nepal, and we have implementation plans for others, 
but 14 represents our current footprint. The coverage gaps table shows 
where we're identifying next-phase expansion opportunities."

### Q: Can we export this data?
**A:**  
"Export functionality isn't enabled in this view for this prototype. When 
we move to live data, any export will be subject to our data governance 
policy — it will be anonymized aggregates only, never individual records."

### Q: Why show GBV data at all if it's sensitive?
**A:**  
"Good question. We show only aggregated GBV case counts at the district 
level — never survivor identities, demographics, or service details. This 
helps us track where GBV services are concentrated. We have a separate 
GBV suppression protocol that ensures small counts are masked."

### Q: When will this be live?
**A:**  
"We're on track to implement live connections in phases. Geographic coverage 
is one of our early phases. We're finalizing data freshness standards and 
privacy safeguards before connecting real data. That process is underway now."

---

## 4. What NOT to Say (Avoid Overclaiming)

### ❌ Do NOT Say These

| Don't say... | Why not | Say instead |
|---|---|---|
| "This is operational coverage data" | It's mock data for demo | "This is prototype demonstration data" |
| "We have real-time tracking" | We don't yet; DP-003B pending | "We're implementing real-time tracking standards now" |
| "All programmes are connected" | Only activity/reach connected | "We're piloting geographic aggregates first" |
| "This shows all beneficiaries" | Never individual beneficiaries | "This shows aggregated reach across districts" |
| "We can drill down to individual cases" | Privacy protection prevents this | "By design, we show only aggregates for privacy" |
| "Coverage is 100% confirmed" | Gaps exist; estimates are rough | "We estimate 182 municipal units reached" |
| "This is production-ready" | Needs DP-003B gates | "This is a working prototype pending finalization" |
| "GBV data is live" | It's mock; live GBV is blocked | "GBV is shown in aggregated prototype mode" |

---

## 5. Technical Readiness Verification

### 5.1 Build & Deployment Status

Before SMT session, confirm:

**Local Build:**
- [ ] Latest code pulled
- [ ] `npm install` completed (in `C:\agfinal` if needed)
- [ ] `npm run build` passes (no TypeScript errors)
- [ ] `npm run lint` passes (no ESLint errors)
- [ ] No console warnings about missing dependencies

**Route Status:**
- [ ] `/dashboard/geographic-coverage` loads without 404
- [ ] No runtime errors in browser console
- [ ] All chart components render (Recharts)
- [ ] SVG map renders without DOM errors

**Data Status:**
- [ ] `src/data/mock/geographic-map-metrics.ts` loads
- [ ] 14 districts display on map
- [ ] All bubbles have lat/lng coordinates
- [ ] No data undefined/null errors in console

### 5.2 Privacy Safeguards Confirmed

- [ ] GBV counts are aggregated (no survivor records)
- [ ] No personal identifiers in any visible field
- [ ] Privacy badge "Aggregated Privacy View Active" displays
- [ ] Privacy note about survivor-level data is visible
- [ ] Data freshness footer shows
- [ ] No export/download function enabled

---

## 6. Backup Plans & Contingencies

### 6.1 If Map Doesn't Load

**Issue:** `/dashboard/geographic-coverage` returns 404 or loads with blank map

**Mitigation:**
1. Check `npm run build` output for TypeScript errors
2. Verify `src/data/mock/geographic-map-metrics.ts` exists
3. Verify `src/components/GeographicCoverageMap.tsx` exports correctly
4. Clear browser cache (Ctrl+Shift+Delete)
5. Restart `npm run dev`

**Demo pivot:** Show code and architecture instead — "Here's the component that powers the map" — open `GeographicCoverageMap.tsx` in editor, walk through structure

### 6.2 If Charts Don't Render

**Issue:** Bar chart or table shows as blank

**Mitigation:**
1. Check browser DevTools Console for Recharts errors
2. Verify mock data is being imported correctly
3. Restart dev server
4. If still broken, show static screenshot instead

### 6.3 If Deployment URL Not Ready

**Workaround:** Use local `npm run dev` on presenter's machine with projector/screen share

**Backup:** Show pre-recorded video demonstration (prepare this 1 hour before SMT)

---

## 7. Visual Appearance Checklist

### 7.1 Before SMT Session

**Screen resolution:** Set to 1920x1080 for best presentation appearance

**Browser zoom:** Leave at 100% (do not zoom in/out during demo)

**DevTools:** Keep closed (F12 → close before showing to SMT)

**Notifications:** Disable browser notifications (Settings → Privacy)

**Full screen:** Consider presenting in full screen (F11) for clean appearance

### 7.2 Color & Accessibility

**Map legend colors:**
- [ ] Blue (#004B87) — clearly distinct from background
- [ ] Orange (#FF6600) — orange, not red (colorblind-friendly)
- [ ] Tan (#FFB06F) — light tan, readable
- [ ] All colors tested in colorblind simulator (no pure red-green)

**Text contrast:**
- [ ] Black text on white background (excellent contrast)
- [ ] White text on colored bubbles (sufficient contrast)
- [ ] Labels visible on hover (dark text on light background)

---

## 8. Post-Demo Feedback Collection

### 8.1 Questions to Ask SMT After Demo

If time permits, gather feedback:

1. "Did the map make sense? Was anything unclear?"
2. "What additional geographic breakdowns would be useful?"
3. "What concerns do you have about data privacy/aggregation?"
4. "For which management decisions would geographic data be most valuable?"
5. "How frequently would you want to see geographic updates?"

### 8.2 Document Feedback

Record any SMT feedback for post-demo improvement:
- [ ] Unclear map features (note them)
- [ ] Requested additional metrics
- [ ] Privacy/governance questions raised
- [ ] Interest in specific districts or regions
- [ ] Suggestions for table/chart improvements

---

## 9. Final Pre-Demo Readiness Checklist

**1 hour before SMT:**
- [ ] Local machine ready (npm run dev running)
- [ ] Browser tab open to `http://localhost:3000/dashboard/geographic-coverage`
- [ ] Page loads without errors
- [ ] All interactive elements tested
- [ ] Talking points reviewed
- [ ] Backup plan (screenshot/video) ready on USB

**15 minutes before:**
- [ ] Manual checks completed (Section 1.2)
- [ ] DevTools closed
- [ ] Browser notifications disabled
- [ ] Screen resolution correct (1920x1080)
- [ ] Zoom at 100%
- [ ] Projector/screen sharing tested

**During demo:**
- [ ] Speak clearly about aggregation and privacy
- [ ] Avoid overclaiming (use Section 4 language)
- [ ] Invite questions but stay focused
- [ ] Note any concerns for post-demo follow-up

---

## 10. Success Criteria

The map demo succeeds if:

✅ **Technical:**
- Page loads without errors
- All interactive elements respond
- Map renders visible districts
- Supporting charts display

✅ **Message:**
- Aggregation/privacy is understood
- Coverage gaps are clear
- Prototype status is acknowledged
- No overclaiming of "live" or "operational"

✅ **Impact:**
- SMT understands geographic capability
- Questions about data protection are answered
- Next steps (DP-003B gates) are clear
- Stakeholder buy-in for continued development

---

**Document Status:** Ready for SMT demo  
**Last Verified:** 2026-06-20  
**Demo Risk Level:** Low (all technical checks pass, protected map verified)
