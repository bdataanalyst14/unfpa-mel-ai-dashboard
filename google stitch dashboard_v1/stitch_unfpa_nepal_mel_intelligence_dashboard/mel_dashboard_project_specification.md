# UNFPA Nepal MEL Intelligence Dashboard - Design Specification

## Overview
A high-fidelity UI/UX prototype for an Monitoring, Evaluation, and Learning (MEL) dashboard, designed for senior management at UNFPA Nepal. The design is optimized for later implementation in Looker Studio/Google Data Studio.

## Design Principles
- **Executive Focus:** High-level KPIs first, followed by actionable insights.
- **Visual Hierarchy:** Clean separation of filters, navigation, and data regions.
- **UN Branding:** UNFPA Blue as the core brand color, Orange as a precise accent.
- **Privacy First:** Aggregated data only; no PII (Personally Identifiable Information).

## Screen List
1. **Executive Overview:** The "Home" screen with top-level KPIs, AI insights, and program health.
2. **Activity Progress:** Detailed tracking of events, IPs, and timelines.
3. **Participant & Reach Profile:** Demographic breakdowns (Sex, Age, Disability, Caste).
4. **Indicator Progress:** CPD/UNSDCF indicator tracking (Target vs. Actual).
5. **Data Quality & Evidence:** Monitoring the integrity of KoBo/Google Sheets submissions.

## Data Structure Reference
- **MainData:** Activity-level submissions.
- **RepeatData:** Participant-level details.
- **IndicatorData:** Baseline, Target, Actuals (Q1-Q4).
- **GBV Data:** Aggregated service summary.

## Global Filters
- Year, Quarter, Project, Outcome, Output, IP/Partner, Province, District, Palika, Fund Code, Event Type.
