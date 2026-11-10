# Pinned toolchain and frontend CI gate

## Rationale

The user requested Renovate-managed version variables for unpinned tools and the missing CI tests after the merge-readiness discussion.
The user approved the concrete scope and independent security report, then requested autonomous completion.
The accepted proposal covers global npm tool installs in four Dockerfiles and a frontend check job gating image builds.

## Concept overview / diagram

```text
Renovate comments -> pinned npm tool variables -> existing Docker builds
PR / main push / release tag / manual run
  -> frontend-checks (check, lint, coverage and browser tests)
  -> existing build job (Strapi guard, image builds and publishing)
```

## Implementation phases

### Phase 1: Pin existing global npm tools

Goal: Existing Docker installation paths use the approved direct tool versions.

#### Acceptance criteria (AC)

- [x] Four frontend/backend development/production Dockerfiles declare `PNPM_VERSION=12.9.0`, with the supplied Renovate comment immediately above each declaration.
- [x] Backend builder stages declare `NODE_GYP_VERSION=11.2.0` with the corresponding comment; all global npm installs consume the declared versions.
- [x] Multi-stage declarations remain available to each consuming stage; existing install/build behavior and comments remain intact.
- [x] The existing Renovate regex extracts each version declaration with its correct dependency and datasource.

### Phase 2: Gate image builds on frontend checks

Goal: Failed frontend checks prevent the existing image job from starting.

#### Acceptance criteria (AC)

- [ ] Existing workflow gains `frontend-checks` on its existing triggers, using the approved digest-pinned Playwright 1.59.1 Noble image and `ubuntu-24.04` runner.
- [ ] Job uses Node `22.23.4` and pnpm `12.9.0`, declared as Renovate-managed version variables; new setup/upload actions use the approved full SHAs.
- [ ] Frontend frozen install, `pnpm check`, `pnpm lint`, and `pnpm test` execute sequentially with failure propagation; the existing scripts own coverage and production build/preview.
- [ ] Test job has only `contents: read`, checkout credential persistence disabled, image browsers selected, browser acquisition disabled, and no supplied secrets or added cache/socket/privileges.
- [ ] Coverage, Playwright report and test results upload after non-cancelled runs, including failures, with seven-day retention and hidden files excluded.
- [ ] Existing `build` declares `needs: frontend-checks`; existing Strapi guard and publishing behavior remain intact.
- [ ] Frontend README names the required status check and explains that the GitHub main-branch ruleset must require it; CI validation limitations are documented here.

## Out of Scope

- Application dependency changes, lockfile regeneration, Corepack, new test frameworks, application test changes, screenshot updates or relaxed assertions.
- Docker base/runtime upgrades, OS package pinning, devcontainer changes, existing action upgrades and backend test expansion.
- Local software acquisition, image builds/pulls, remote workflow dispatch, repository ruleset changes and VCS authoring operations.

## Technical details

- Security identities and commands: [approved review](../security-reviews/security-review-ci-toolchain-2026-11-10.md).
- Playwright image: `mcr.microsoft.com/playwright:v1.59.1-noble@sha256:b0ab6f3cb99aa7803adbc14d9027ec1785fc6e433b97e134e0f8fe61683b6b53`.
- New setup action: `actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020` (`v4.4.0`).
- New upload action: `actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02` (`v4.6.2`).
- Use existing checkout action version and standard Renovate action/image management; no expressions in `uses` references.
- Read-only inspection and installed-tool validation only; do not install missing validators or use package runners that download tools.
- Validate CI through an actual GitHub run when available, not application tests asserting workflow source text.

### Sibling map

- Frontend development and production pnpm installs: same tool version and annotation; existing frozen installs unchanged.
- Backend development/production builders: same pnpm/node-gyp versions and annotations; existing production-only install difference retained.
- Backend production runtime: same pnpm version; no node-gyp because that stage has no existing node-gyp install.
- New CI job mirrors existing frontend README check/test commands, using synthetic fixtures instead of live backend credentials.
- Image publishing job remains separate because its write permissions must not reach frontend tests.

## Notes / risks / open questions

- Existing Docker Node runtimes retain the separately disclosed security concerns; this task does not upgrade them.
- Test image and npm Playwright versions must remain aligned on future updates.
- Native tool hooks and test code execute inside containers; approved isolation and artifact limits remain mandatory.
- November 11 security release requires rechecking before execution on or after that date.
- Docker and remote Actions execution unavailable locally; no successful container/CI run claimed without evidence.
