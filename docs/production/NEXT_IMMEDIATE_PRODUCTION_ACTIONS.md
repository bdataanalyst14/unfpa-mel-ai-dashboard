# Next Immediate Production Actions

## 1. Single Immediate Task

Bind the merged immutable management-review validator into generation dry-run evidence, the validation manifest and the generation fingerprint.

Repository:

`C:\Users\buchaudhary_unfpa\CodexWork\unfpa-mel-pipeline`

Create an isolated branch from current main:

`recovery/bind-management-review-to-generation`

Required output:

- generation accepts an immutable management-review file;
- exception without approval returns management review required;
- valid approval returns management review approved;
- approval digest is included in dry-run evidence;
- approval digest is included in the validation manifest;
- manifest and generation fingerprints change when the approval digest changes;
- approval artifact remains unchanged;
- all offline tests and CI pass.

Do not implement generation apply or activation revalidation in this checkpoint.

## 2. Next Three Dependent Tasks

### Task 2 — Apply and Activation Revalidation

After the immediate checkpoint is merged:

- bind the immutable approval digest into generation apply validation;
- reject changed or missing approval evidence;
- bind the approval digest into stable-view activation revalidation;
- add rollback evidence requirements;
- merge only after offline CI passes.

### Task 3 — Fresh Supported Recovery Validation

After all recovery code changes are merged:

- create one immutable source snapshot;
- regenerate source preflight evidence;
- create or renew management approval bound to that snapshot when required;
- execute the supported CLI generation dry run;
- require all eight projected objects and all technical gates to pass;
- do not contact BigQuery during the dry run.

### Task 4 — Controlled BigQuery Generation

Only after the supported dry run passes:

- obtain separate written authorization;
- execute one controlled generation apply;
- create only eight generation-scoped objects;
- validate schemas, row counts, organization coverage, fingerprints and privacy;
- do not activate stable views during generation.

## 3. Parallel Work for Cline or Antigravity

Dashboard work that can proceed without BigQuery:

- verify the dashboard production-readiness branch against current main;
- create an actual dashboard PR when none exists;
- run offline build and fixture tests;
- harden the four-object query allowlist;
- verify participants_flat and staging-table prohibition;
- verify activation evidence validation;
- verify mock rollback;
- validate Ubuntu deployment scripts using syntax checks only;
- update production runbooks and approval templates.

Cline or Antigravity must not:

- modify the pipeline recovery branch owned by the code agent;
- rewrite management approval artifacts;
- run KoBo extraction;
- contact BigQuery;
- activate dashboard BigQuery mode;
- deploy to Ubuntu.

## 4. Work Requiring Codex or Equivalent Code Agent

- generation evidence and manifest binding;
- generation apply revalidation;
- activation fingerprint revalidation;
- immutable snapshot orchestration;
- controlled recovery generation implementation review;
- stable-view activation and compensating rollback review.

## 5. Work Requiring Management Approval

Separate approvals are required for:

1. management-reviewed data exceptions;
2. controlled BigQuery generation apply;
3. validation of generated objects;
4. aggregate-view activation;
5. dashboard BigQuery activation;
6. restricted-UAT deployment;
7. domain and TLS;
8. SSO/access control;
9. credential rotation and storage cleanup;
10. public production release.

## 6. Prohibited Actions Until the Immediate Gate Passes

Do not:

- run generation with `--apply`;
- create BigQuery generation objects;
- activate stable aggregate views;
- change dashboard DATA_MODE to BigQuery;
- deploy the dashboard;
- expose port 8080 publicly;
- configure public domain or TLS;
- remove preserved Git stashes or worktrees;
- classify experimental scratch-script evidence as production-valid;
- modify approved management-review artifacts automatically.

## 7. Completion Gate

The immediate task is complete only when:

- implementation is committed;
- an actual pull request exists;
- required CI passes;
- the PR is merged;
- main is synchronized;
- protected approval artifacts remain unchanged;
- no live system was contacted.