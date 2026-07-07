# DASHBOARD_INDEX_ROUTE_CAVEAT_NOTE

Date: 2026-06-30
Status: `accepted_for_smt_demo_with_caveat`

## What The Caveat Is

The dashboard index route passed browser smoke with a documented caveat. The local smoke evidence recorded `/dashboard` as HTTP 404 because the current app build does not generate a dashboard index route, while the concrete dashboard pages loaded successfully.

## SMT Demo Impact

This does not prevent SMT demo use. The demo should navigate directly to the concrete dashboard pages that passed smoke testing, such as Geographic Coverage, Participant Reach, Data Quality, IP Performance, Indicator Progress, Management Decision Centre, Activity Detail, Activity Progress, and GBV/OCMC Summary.

## Production Impact

This does not authorize production. The route caveat should be reviewed during final live API/browser QA before production. Production remains blocked.

## Presenter Verbal Caveat

Use: "The demo uses the validated dashboard pages directly. The dashboard index route has a documented caveat and will be reviewed during final live API/browser QA. This remains demo_ready_with_caveats, not production readiness."

## Follow-Up After SMT Demo

- Decide whether `/dashboard` should redirect to a default page, render a dashboard landing page, or remain intentionally unavailable.
- Validate the selected behavior during final live API/browser QA.
- Keep DP-004, production, live geography, and GBV/OCMC live activation blocked until their gates close.
