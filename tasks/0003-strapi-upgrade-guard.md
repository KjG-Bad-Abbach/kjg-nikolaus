# Strapi upgrade guard

## Rationale

Dependency-only Strapi upgrades must fail CI until their codemods have been applied.
Direct Strapi package versions must agree across backend and frontend.
Core is `5.30.0`; the user subsequently set the last-applied marker to `5.0.0`, which this work preserves.

Requirement sources:

- Initial request: backend version marker, apply command, marker update only on success, CI detection of dependency-only upgrades.
- Implementation request: consistent Strapi package versions and clear failure/recovery instructions.
- Follow-up: extend version checks across backend and frontend; initialize the last-applied version to `5.30.0`.
- Scope correction: detection and apply scripts only; do not align dependencies or upgrade/downgrade application packages.
- Latest approval: implement both scripts now; execution of `@strapi/upgrade` approved after the report, without authorization for dependency alignment.
- On-demand follow-up: replace the local tool prerequisite with pinned `npx` acquisition while retaining per-file checks and marker handling; user selected option 1.
- Simplification follow-up: reduce total maintained code by removing redundant API/catalog guards and unused report-counter validation, with permission to remove their tests; retain reliable automatic marker updates.
- Current decision: replace the API adapter with an interactive Bash wrapper using the public CLI; require selection, per-codemod, recovery, and final marker confirmations.
- Cleanup approved: remove unused apply/adapter/resolver scripts and replace their obsolete tests; retain shared version validation and checker coverage.

## Concept overview / diagram

Backend and frontend dependency declarations → shared version validation → CI gate.
Backend marker + target version → applicable codemods → successful execution → updated marker.

## Implementation phases

### Phase 1: Version and marker guard

Goal: Reject inconsistent direct Strapi dependency declarations and stale codemod tracking before image builds.

#### Acceptance criteria (AC)

- [x] Check direct `@strapi/*` dependencies and devDependencies in both package manifests against backend core's exact version; reject ranges and mismatches with package and location details.
- [x] Fail for missing, invalid, or unequal `backend/.last-applied-codemods-version` with actionable recovery instructions.
- [x] Initialize the marker to the user-confirmed `5.30.0`.
- [x] Run the read-only guard before Docker build/publish steps; report actual and expected values and recovery commands.
- [x] Verify passing and failing behavior with focused tooling tests, not application test classes; run them before the live check in CI.

### Phase 2: Apply codemods

Goal: Provide a command that applies the required codemods and records successful completion.

#### Acceptance criteria (AC)

- [x] Provide a backend command applying every applicable codemod newer than the marker and no newer than current core.
- [x] Verify the loaded upgrade tool matches the target version before treating its codemod set as complete; give install/update instructions on mismatch.
- [x] Write the current version to the marker only after all applicable codemods succeed, including the no-applicable-codemods case; preserve the marker on failure.
- [x] Reuse version validation without requiring marker equality before applying codemods.
- [x] Document check/apply commands, initial baseline, recovery, and transformation review in backend README; link from frontend README for cross-project validation.
- [x] Verify execution selection, success/no-op, and failure behavior without downloading or running unapproved third-party code.

### Phase 3: Acquire the pinned tool on demand

Goal: Apply pending codemods without requiring a project-local upgrade dependency.

#### Acceptance criteria (AC)

- [x] Acquire `@strapi/upgrade` at the exact validated backend core version through `npx` when a pending interval exists, without changing project dependencies, lockfiles, or `node_modules`.
- [x] Skip acquisition for an already-current marker or failed preconditions.
- [x] Load the acquired package's exported API only after verifying its name and exact version; retain existing interval, per-file report, post-transform, and atomic marker checks.
- [x] Preserve the marker on acquisition or resolution failure, with actionable diagnostics and no floating-version or installation fallback.
- [x] Exercise acquisition and module resolution with authored fixtures and fake subprocesses, retaining existing required behavior tests; perform real acquisition only after approval of its security report.
- [x] Update backend usage instructions for on-demand acquisition and its cache/network requirements; keep implementation details here rather than in the README.
- [x] Simplify the existing adapter rather than layering another framework around it; keep tool identity, bounded selection, complete zero-error result coverage, final version validation, and safe marker publication.

### Phase 4: Interactive public CLI wrapper

- [x] Reuse shared version extraction and retain the CI checker.
- [x] Confirm the complete selection, every result, recovery of any failures, and final marker advancement.
- [x] Preserve normal npx prompts; show red warnings and offer continue/stop after errors.
- [x] Remove obsolete Node apply, API adapter, and resolver scripts; replace their tests with shell-workflow coverage.
- [x] Verify with authored fake commands only: 98 tests passing, including all 34 checker tests and first-download prompt regressions; Bash syntax, formatting, and lint checks passing.

## Out of Scope

Database migration, automatic commits, automatic dependency upgrades, transitive package-wide version equality, and unrelated frontend dependency alignment.
Application dependency changes and lockfile regeneration are also excluded.
Only the version-pinned upgrade tool may be acquired on demand into the npm cache; no application upgrade/install commands or automatic runtime-tool installation.

## Technical details

Phases 2–3 above record the superseded API implementation.
The current entry point is `scripts/apply-strapi-codemods.sh`, wired through the existing backend command.
It imports the shared validator and marker reader through a Node snippet; the CI checker remains unchanged.
From `backend/`, it calls `npx @strapi/upgrade@<core> codemods ls --range '>marker <=core'`, then `codemods run <UID>` for each confirmed UID.
Normal npx stdin/output and download confirmation are preserved, without `--yes` or additional npm configuration overrides.
The wrapper accepts the inspected CLI table or explicit empty result and rejects ambiguous or failed listings.
Already-current tracking and invalid preconditions require no acquisition.

Users confirm the complete selection, inspect and confirm each result, and choose whether to continue after failed or unconfirmed runs.
Nonzero exits display a red warning; continuing does not establish success.
Any failed or unconfirmed result requires a separate confirmation that all such results were resolved before the final marker confirmation.
Core and marker are revalidated before atomic marker publication; cancellation, EOF, or failed validation preserves tracking.
CLI success can conceal per-file errors: human verification deliberately replaces the former private API report checks.
Top-level pinning does not freeze transitive dependencies, and normal npx installation can execute hooks.
The [CLI security review](../security-reviews/strapi-cli-5.30.0-2026-11-10.md) records approval for implementation and fake-command verification only.

### Sibling map

- CI guard: `.github/workflows/docker-image.yml` existing pre-build steps; run before registry login and publishing.
- Backend command: existing `backend/package.json` scripts; use pnpm consistently.
- Tooling tests: keep separate from `backend/tests` application suites, per testing standards.
- User instructions: `backend/README.md` owns recovery commands; frontend README references them.

## Notes / risks / open questions

The [security report](../security-reviews/strapi-upgrade-5.30.0-2026-11-10.md) recommends deferring the combined dependency change: downgrades introduce known vulnerable mail and GraphQL dependencies.
Dependency alignment was removed from scope after the user's correction.
The user approved execution of `@strapi/upgrade` and later selected on-demand acquisition.
After the [acquisition report](../security-reviews/strapi-npx-5.30.0-2026-11-10.md), the user approved implementing the on-demand route and simplifying redundant checks/tests.
Verification is fixture-only: no real `npx` acquisition or workspace apply invocation by the agent.
The user's current marker is `5.0.0`, not the original `5.30.0` initializer; preserve it unchanged during this work.
Phase 1 uses manual file/search tracing because the code-intelligence integration is unavailable; no replacement integration will be installed.
A marker records completion but does not prevent manual falsification.
An actual hosted CI run cannot be claimed from local checks.
Existing backend suite baseline: 3 files and 13 tests passed locally using the installed Vitest with coverage disabled.
The Phase 2 tooling baseline passes 78 tests locally.
The user subsequently aligned application package declarations and changed the marker to `5.0.0`; this work preserves those changes and does not run the workspace apply command.
Live acquisition and real Strapi transformations remain unverified; Phase 3 verification uses authored fixtures and fake subprocesses only.
Phase 3 passes 89 tooling tests, including exact acquisition pinning for two target versions; a hardcoded-version mutation is rejected.
Runtime complexity is reduced; added acquisition fixtures increase test code, without requiring an unrelated fixture redesign merely to force aggregate line-count reduction.
Scoped formatting passes with the frontend Prettier configuration, run from `frontend/` so its plugins resolve.
