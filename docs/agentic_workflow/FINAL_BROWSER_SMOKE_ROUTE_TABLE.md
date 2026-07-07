# FINAL_BROWSER_SMOKE_ROUTE_TABLE

Date: 2026-06-30
Environment: `C:\unfpa-mel-final-build-sandbox-013`
Server: `http://localhost:3050`
Status: `browser_smoke_passed_with_dashboard_index_route_caveat`

## Route Table

| Route | HTTP status | Page load success | Runtime error | Caveat visible | Suppression display safe | No final M&E claim | No live data claim | No live geography claim | No DP-004 claim | No production readiness claim |
| --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 307 | Yes, redirect response | No | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| `/dashboard` | 404 | No, no dashboard index route | No | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| `/dashboard/geographic-coverage` | 200 | Yes | No | Yes | Yes, safe caveat text only | Yes | Yes | Yes | Yes | Yes |
| `/dashboard/participant-reach` | 200 | Yes | No | Yes | Yes, safe caveat text only | Yes | Yes | Yes | Yes | Yes |
| `/dashboard/data-quality` | 200 | Yes | No | Yes | Yes, safe caveat text only | Yes | Yes | Yes | Yes | Yes |
| `/dashboard/ip-performance` | 200 | Yes | No | Yes | Yes, safe caveat text only | Yes | Yes | Yes | Yes | Yes |
| `/dashboard/indicator-progress` | 200 | Yes | No | Yes | Yes, safe caveat text only | Yes | Yes | Yes | Yes | Yes |
| `/dashboard/management-decision-centre` | 200 | Yes | No | Yes | Yes, safe caveat text only | Yes | Yes | Yes | Yes | Yes |
| `/dashboard/activity-detail` | 200 | Yes | No | Yes | Yes, safe caveat text only | Yes | Yes | Yes | Yes | Yes |
| `/dashboard/activity-progress` | 200 | Yes | No | Yes | Yes, safe caveat text only | Yes | Yes | Yes | Yes | Yes |
| `/dashboard/gbv-ocmc-summary` | 200 | Yes | No | Yes | Yes, safe caveat text only | Yes | Yes | Yes | Yes | Yes |

## Notes

- `/` returned HTTP 307 redirect and did not show a runtime error.
- `/dashboard` returned HTTP 404 because no dashboard index route is generated in the current app build. Concrete dashboard routes loaded successfully.
- Safe caveat text includes statements such as no personal identifiers or survivor-level GBV records are displayed. This is a safe privacy caveat, not an exposure finding.
- No route smoke result authorizes live production data, live geography, DP-004 clearance, final programme/M&E validation, or GBV/OCMC live activation.
