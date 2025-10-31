# SPEC-playwright-ui-regression

## Status

- Accepted

## Owners

- QA Lead (TBD)
- Frontend Maintainer (TBD)

## Date

- 2025-10-23

## Summary

- Introduce a Playwright-driven end-to-end regression suite that exercises the existing Alpine/Tailwind booking wizard end-to-end (new booking, edits, verification, deadlines, failure handling) so we can later migrate the frontend framework with confidence that core flows stay intact.

## Context

- The frontend will be replaced, but we currently lack automated UI coverage; only manual QA notes exist.
- Core risk: breaking the multi-step Nikolaus booking workflow or Strapi-backed validations when rewriting the UI.
- Product requires "no regression" assurance before green-lighting the framework migration; QA bandwidth is limited, so repeatable automated checks are necessary.
- Stakeholders: Product (ensures booking business rules stay intact), Engineering (needs stable signal during migration), Ops (must monitor test data cleanup), QA (owns suite).

## Goals (Acceptance criteria)

- Playwright suite covers all five booking steps for both first-time and resume-via-link scenarios, asserting form validations, API interactions, and UI state transitions.
- Tests verify deadline-driven read-only behaviour by manipulating config deadlines (before/after) and confirming UI locks.
- Time-slot selection flow validated for search, grouping, capacity, concurrency-conflict modal, and selection persistence.
- Children and additional-notes flows validated for add/remove, validation, and persistence.
- Error handling (network failure modal, unsaved changes prompt, email verification resend) is exercised via Playwright mocks or fixture scenarios.
- Suite runs headless in CI (Chromium) in <10 minutes and locally supports headed debugging; reports (HTML + JUnit) persisted.
- Frontend exposes a test-only API override hook so Playwright can stub responses without real HTTP requests; when present, the hook logs a single console warning per page load and the wizard relies on the provided stub data.
- Data seeding/cleanup automated via either the Strapi admin API **or** the hook-backed in-memory fixtures so tests are idempotent and do not leak bookings/time-slots.

## Non-goals

- Replacing or refactoring backend Strapi controllers/services.
- Testing outbound email contents beyond confirming resend request success.
- Browser visual regression snapshots (out of scope; only functional assertions planned).
- Mobile native app coverage (project has none).
- Automated accessibility or axe-core scans (handled in a future initiative).

## Decision

- Implement Playwright v1.48+ (use latest) with TypeScript in `frontend/tests/e2e`, using page-object helpers and test fixtures to orchestrate Strapi data and runtime configuration.
- Integrate Playwright run into CI (GitHub Actions or existing pipeline) gating every pull request.
- Add `data-testid` hooks to critical DOM nodes to stabilise selectors while keeping user-facing markup unchanged and reusing them post-framework migration.
- Standardise fixtures on fixed, deterministic timestamps reflecting key deadlines so assertions remain stable across runs.
- Provide local HTTP stubs around the Strapi Admin/Database REST API to create, mutate, and tear down bookings/config/time-slots without requiring direct database access.

### Alternatives considered

- **Cypress**: rejected due to slower cross-browser support, separate licensing for component testing, and heavier CI footprint.
- **Puppeteer-only scripts**: rejected because Playwright provides richer fixtures, test runner, and multi-browser parity without extra plumbing.
- **Backend-contract-only tests**: insufficient to catch DOM regressions targeted by the upcoming UI rewrite.

## Architecture and Design

- **Test directories**: `frontend/tests/e2e` housing suites grouped by wizard step (`contact.spec.ts`, `address.spec.ts`, etc.) plus `regression/full-journey.spec.ts` and `nonhappy/error-handling.spec.ts`.
- **Config**: `playwright.config.ts` loading base URL from env (`PLAYWRIGHT_BASE_URL`), defaulting to `http://localhost:4173` (Vite preview) or Docker frontend port. Parallelism tuned (2 workers CI, default locally).
- **Page objects**: `frontend/tests/e2e/pages/` with `WizardPage`, `ContactStep`, `AddressStep`, `TimeSlotStep`, `ChildrenStep`, `SummaryPage`, `ErrorModal`. Objects expose semantic actions and selectors via `data-testid`.
- **Fixtures**:
  - `TestDataClient` interacting with a purpose-built local stub that wraps the Strapi admin/database REST APIs; stub seeded using service tokens (`PLAYWRIGHT_ADMIN_TOKEN`) and reset between tests.
  - Scenario builders for: empty booking, pre-filled booking, nearly-full time slot, expired deadlines, network failure (via route interception).
  - Ensure cleanup in `afterEach`/`afterAll` by tracking created document IDs.
- **Selector strategy**: add `data-testid` attributes under a `qa-` namespace; for example `data-testid="contact-first-name"`, `data-testid="step-progress-contact"`, `data-testid="error-modal"`.
- **Network interception / hook**: introduce a guarded escape hatch in `frontend/src/index.html` (`window.__bookingTestApi`). When defined, `sendRequest` delegates to the hook; tests install an in-memory implementation via `page.addInitScript`. The hook emits a single console warning on first use per page to signal override. Existing `fetch` path remains untouched for production/manual runs.
- **CI integration**:
  - Extend `docker-compose.yml` or add `scripts/start-test-stack.sh` to boot Strapi + frontend headless.
  - GitHub Action job: install deps, run migrations/seed, run `pnpm --filter frontend exec playwright install --with-deps` followed by tests on every PR, upload HTML/JUnit artifacts, capture videos on failure.
- **Developer ergonomics**: provide `pnpm exec playwright codegen http://localhost:4173` script for authoring, plus README instructions.

## UI Feature Coverage Inventory

The entire `frontend/src/index.html` booking wizard has been reviewed end-to-end; the suite will cover the following user-accessible features:

- **Landing & Intro**
  - Page loads with Alpine initialised, hero title/subtitle rendered.
  - Introductory rich-text content renders via `RichTextBlocksRenderer` when provided.
  - "Jetzt anmelden" button transitions from intro view to steps.
  - Loading spinner visibility while async operations run.
- **Deadlines Banner**
  - Route planning and final deadline timestamps formatted via `formatDateTime`.
  - Deadline lines strike-through and disable edit sections when deadlines passed.
- **Global Behaviours**
  - Periodic `updateCanEdit` refresh toggles editability.
  - Unsaved changes prompt on navigation/back/close when form dirty.
  - Error modal lifecycle, detail toggle, close/retry behaviour.
  - Ask-to-reload flow when initial fetch fails.
- **Step Navigation**
  - Stepper buttons reflect `steps` metadata (anyFilled/allFilled) and respect `canJumpToAnyStep`.
  - Previous button availability and keyboard focus order.
- **Step 0: Kontaktinformationen**
  - Required fields (first name, last name, email, phone) validations and messaging.
  - Phone/email format constraints.
  - Read-only state after final deadline lapse.
  - Successful save creates booking, triggers email verification view, resumes on reload.
- **Email Verification View**
  - Messaging when verification pending.
  - "E-Mail erneut senden" flow with confirmation modal and API call.
- **Step 1: Adresse und Ort**
  - Required fields (street, house number, zip, place) validation.
  - House present location optional field handling.
  - Route planning deadline enforcement (read-only).
  - Save persists and advances to time slots.
- **Step 2: Zeitslot Auswahl**
  - Fetched slots grouped by date with labels/status (available/fully booked).
  - Search filtering by query string.
  - Max slot selection enforcement and warning banner.
  - Adding/removing slots updates summary list and order.
  - Deadline-driven read-only behaviour.
  - Concurrency conflict handling (error message and reload callback).
- **Step 3: Kinder & Hinweise**
  - Add/remove child cards, per-child fields (name required, identification trait optional, speech text area).
  - Validation messaging, especially missing names.
  - Additional notes area.
  - Skip button (setStep(4) without saving) path.
  - Deadline-based read-only toggles.
- **Step 4: Zusammenfassung**
  - Completion states (route planning filled, everything filled) banners.
  - Display of persisted contact/address/time-slot/children info.
  - Legal notice/privacy policy links visibility logic.
  - Advisories for incomplete sections.
- **Email Verification Needed Banner**
  - Displayed when view set accordingly, includes resend path.
- **Footer**
  - Dynamic current year render.
  - Legal notice/privacy policy links according to config.
  - Data deletion statement presence.
- **Miscellaneous**
  - Rich-text introduction content formatting (links, headings, lists).
  - Toggle of `view` between intro/steps/email verification as config and booking state change.
  - `fetchTimeSlots` behaviours including grouped output and persistence on reload.
  - `timeSlotSearchQuery` reset and filtering interactions.
  - Additional modals or confirm dialogs (confirmations for discard changes, remove child, resend email).

## Performance and Complexity

- Expect <40 Playwright test cases; each <15 seconds when backend local, targeting total runtime ≤ 8 minutes Chromium-only CI, ≤ 15 minutes when optionally running Firefox/WebKit locally.
- Limit network polling by reusing stored state where safe; use API shortcuts instead of UI for repetitive setup.
- Keep fixture creation O(n) in number of tests thanks to shared worker fixture; avoid N×M combinatorial scenarios by parameterising.

## Compatibility and Platforms

- Mandatory: Chromium latest in CI; optional nightly job for Firefox/WebKit to detect cross-browser issues.
- Ensure viewport coverage for 375px (mobile) and 1280px (desktop) via Playwright projects if responsive regressions must be caught.
- Support local runs on macOS, Windows, and Linux using Node 20 LTS (matches pnpm lockfile).

## Security, Privacy, and Compliance

- Use synthetic data only; never seed real participant info. Reset Strapi database between runs (Docker volume or `seed:reset`).
- Store admin/test tokens in `.env.test` and inject via CI secrets; do not log them in test output.
- Scrub Playwright traces/videos before sharing externally; they may include addresses entered during tests.

## Test Plan

- **Smoke**: Landing page loads, intro text rendered, wizard transitions to stepper (`smoke.spec.ts`).
- **Loading & intro states**: Spinner (`qa-loading`) appears during initial config fetch, clears once data resolves; when `introduction_text` is empty the wizard skips straight to `qa-view-steps`.
- **Contact step**: Required-field validation, phone/email formatting error messaging, successful submission triggers verification view then step advance after reload.
- **Resume flow**: Start with seeded booking ID; ensures query parameter preloads data, step badges reflect completion, unsaved-changes prompt triggers on navigation.
- **Stepper navigation guard**: New bookings cannot jump ahead—verify `qa-step-*` clicks/arrow buttons are inert until `canJumpToAnyStep` is true, and cancelling the unsaved-changes dialog keeps the user on the current step.
- **Address step**: Required validations, optional fields, post-save persistence, read-only state once route-planning deadline passed, summary flag toggles.
- **Deadlines banner**: With expired deadlines ensure `qa-deadline-route-planning` and `qa-deadline-final` render with the `line-through` class while edit controls stay disabled.
- **Time-slot step**:
  - Availability rendering grouped by day, search filter, max selection enforcement, removal UI, concurrency conflict (simulate by overbooking).
  - Deadline lock: verify cannot toggle when deadline passed.
  - Selected slot chips (`qa-selected-time-slot-*`) can be removed via `qa-remove-selected-slot-*`; summary warning for “Bitte … Zeitslots auswählen” shows when count < `options.max_time_slots`.
  - When `show_search_for_time_slots` is false, the search input stays hidden and the grouped list still renders all slots.
- **Children step**: Add/remove child, validation for missing name, speech persistence, additional notes optional, skip button path, deadline lock.
- **Final-deadline lock**: In read-only mode confirm children form controls and additional-notes textarea are non-editable yet summary still reflects stored data.
- **Summary**: Visual cues for incomplete sections, legal notice/privacy links visibility, final status toggles after deadlines, email verification resend card.
- **Route-complete banner**: Scenario with address/time slots filled but other data missing should surface `qa-summary-route-complete` alongside remaining warnings.
- **Error handling**: Modal content for network/offline, detail toggle, retry button reloads data, closing error resets state.
- **Error modal controls**: Expand details via `qa-error-details-toggle`, dismiss without retry (`qa-error-dismiss`), and cover failures from time-slot fetch plus the resend-verification endpoint.
- **Footer**: Current year render, legal/privacy links, data deletion text.
- **Footer toggles**: When config omits legal/privacy URLs the corresponding links stay hidden; when present they open in new tab via target assertions.
- **Cross-browser/responsive**: Minimal path executed under Firefox/WebKit in scheduled builds and under mobile viewport to catch layout regressions.
- Collect Playwright traces/videos on failure and HTML report on every run.

## Rollout and Monitoring

- Phase 1: Implement selectors + infrastructure, add smoke + full journey test; run nightly while stabilising.
- Phase 2: Layer remaining edge-case suites, enable CI gating once flake rate <1% over 10 runs.
- Phase 3: Require green Playwright job before merging framework migration PRs; document manual fallback steps if CI red.
- Monitoring: track Playwright job in CI dashboard, setup Slack/Email notification on failure; maintain flake triage rotation.
- Rollback: disable Playwright job via CI flag if blocking release; keep tests but mark as non-blocking while issues investigated.

## Risks and Mitigations

- **Flaky network/backend state**: Mitigate via API fixture control and deterministic data resets.
- **Selector brittleness during rewrite**: Use dedicated `data-testid` attributes and page objects.
- **Long runtime**: Parallelise tests, reuse seeded data, and keep cross-browser runs optional or scheduled.
- **Environment drift**: Document and automate stack startup; add healthcheck step before tests.
- **Access token leakage**: Store secrets in CI vault, mask logs, rotate tokens quarterly.

## Open Questions

- None; stakeholder clarifications incorporated (2025-10-23).

## References

- `frontend/src/index.html` booking wizard implementation.
- `backend/src/api/booking/controllers/booking.ts` for submit/update logic.
- Playwright Docs: https://playwright.dev/docs/test-intro

## History

- 2025-10-23: Proposed initial plan for regression automation.
