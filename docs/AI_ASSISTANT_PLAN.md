# AI-Assistant Integration Plan

This document outlines the architecture for integrating natural language processing, automated narrative drafting, and anomaly warning agents.

## Architectural Design

The AI-Assistant will act as a co-pilot for program monitoring and decision support, working across three key domains:

### 1. Natural Language Querying (NLQ)
- **Goal**: Enable senior executives to query dashboard metrics using speech or text (e.g., "Which partners in Lumbini are behind on SRHR uploads?").
- **Integration**: A semantic layer matching text inputs to SQL/GraphQL parameters on the database.

### 2. Narrative Synthesis & Generator
- **Goal**: Auto-generate donor-ready quarterly narrative drafts using active KPI achievements.
- **Integration**: Feed-forward pipeline sending target achievement ratios to a LLM prompt template loaded with country program document outcomes.

### 3. Warning and Anomaly Alert System
- **Goal**: Automatically scan incoming partner logs for delayed uploads, disaggregation math failures, or indicator trend degradation.
- **Integration**: Hourly validation workers matching records to rules, writing outputs to the `ai_insights` table.
