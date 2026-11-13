# Svelte booking parity

## Rationale

The user requested a fully working Svelte frontend with the same functionality as the existing Alpine frontend, accepting the preceding proposal to port its regression suite and restore missing behavior before removing the old implementation.
The Alpine source and existing behavioral assertions were authoritative during the migration.

Post-migration cleanup retired `frontend-alpine.js/` and the unused historical screenshot set with user approval, including deletion of the duplicate legacy tests.
Original-source paths below are historical references; active tests and 107 baseline images remain in `frontend/`.
On 2026-11-10, the user superseded exact Alpine pixel parity with functional, responsive, and accessible Svelte behavior.
The active screenshots now track Svelte; [current baseline provenance](../frontend/e2e/__screenshots__/PROVENANCE.md) documents the update policy.
The original parity results below describe the completed migration, not the current visual contract.

### Post-parity simplification audit

- Restored `gap-2` and full-width step navigation, ordinary list-item text, compact date years, conditional read-only controls, and filtering of empty date groups.
- Restored the existing Tailwind forms and typography plugins; their removal served the Alpine visual reference rather than booking behavior.
- Retained the simpler page/summaries structure and unconditional notes spacing instead of restoring redundant wrappers or child-count-dependent styling.
- Retained German document language, the page title, Tailwind 4 focus-ring syntax, and document-level background/layout; these support accessibility or avoid extra layout wrappers.
- Retained verification/resend, deferred saves, ZIP input synchronization, child-removal confirmation, slot inventory/identity/capacity/pagination, conflict recovery, navigation/discard, deadline updates, retry handling, summaries, and footer behavior.
- Retained shared completion rules, payload normalization, and removal of unused validation/context plumbing; these fix behavior or simplify its implementation, not pixel matching.
- Existing test cases remain; parity-only spacing expectations now assert the intended Svelte layout.

Post-simplification verification: `pnpm check`, `pnpm lint`, and default `pnpm test` pass.
All 776 unit tests and 104 browser tests pass; the four accepted Firefox skips remain unchanged.
Line coverage is 99.81% and branch coverage is 98.85%, with existing gates unchanged.
All 107 baselines were recaptured from Svelte; 101 PNGs changed and the subsequent no-update run passed.
The 12 additional browser cases check keyboard navigation, accessible field names, and horizontal overflow across four viewport widths and three browser projects.

Earlier legacy-directory cleanup verification: type checking and lint passed; 776 unit tests and 92 browser tests passed with the four accepted Firefox skips unchanged.
At that stage all 107 active PNGs remained byte-identical and coverage gates passed.
Vitest reported a shutdown-timeout warning before the successful browser run; the full test command exited successfully.

## Concept overview / diagram

```text
Original Alpine scenarios and assertions -> Svelte browser regression suite
Strapi config / booking / slots -> existing API client -> booking and UI stores
Stores -> booking steps / summaries / verification / footer
User actions -> existing handlers -> validation / API updates -> reloaded stores
```

## Implementation phases

### Phase 1: Establish the original regression contract

Goal: Run the original booking scenarios against Svelte without relaxing their behavioral assertions.

#### Acceptance criteria (AC)

- [x] Existing Alpine E2E scenarios, fixtures, page objects, scenario coverage, and screenshots are available under the Svelte frontend.
- [x] Compatibility changes are limited to framework-independent harness details and selectors representing equivalent UI.
- [x] An initial failing run identifies missing behavior; original screenshot expectations are retained as comparison evidence, not overwritten to hide differences.
- [x] A source audit maps behavior beyond the browser scenarios, including request payloads, deadlines, recovery, initialization, and deployment.

### Phase 2: Restore complete booking behavior

Goal: Svelte supports every existing family booking operation and recovery flow.

#### Acceptance criteria (AC)

- [x] New booking creation shows verification instructions and supports resend, loading, and failure recovery matching Alpine.
- [x] Existing booking links load saved data, navigate to the correct incomplete step, and preserve/discard unsaved changes exactly as the baseline.
- [x] Contact, address, gift location, slot selection/search/capacity, children, notes, summaries, validation, and deadline restrictions match baseline behavior and API payloads.
- [x] Intro, footer links, legal/privacy notices, loading indicators, modal details/retry/dismissal, and relevant selectors match the original supported states.
- [x] Original regression assertions pass on Chromium, Firefox, and mobile Chromium; baseline visual comparisons are verified with any environment-only differences explicitly documented.
- [x] New and corrected logic has focused behavioral coverage without weakening existing assertions or coverage gates.

### Phase 3: Verify standalone operation and delivery

Goal: The Svelte frontend operates independently of the Alpine folder.

#### Acceptance criteria (AC)

- [x] Frontend build, type checking, lint, full unit tests with coverage, and browser regression tests pass.
- [x] Browser network integration is exercised without the test API hook, verifying configuration, booking requests, and verification resend against the existing contract.
- [x] Existing frontend deployment commands and Docker configuration target a usable Svelte build; no runtime dependency on the Alpine directory remains.
- [x] User-facing setup instructions and the parity results describe actual commands, verified flows, and any remaining external-service verification limitations.
- [x] Independent correctness, test, simplicity, and security review findings in the changed scope are resolved.

### Phase 4: Inline German copy until application-wide localization

Goal: Follow the user's request to remove the partial localization extraction and use the existing text directly, as permitted by the updated repository guidelines.

#### Acceptance criteria (AC)

- [x] Partial German locale modules and their imports are removed, including the isolated test-only message module.
- [x] Existing copy is inlined at its consumers without replacement message catalogs, wording changes, or behavioral changes.
- [x] Test expectations remain independent of production copy; existing assertions and visual baselines remain unchanged.
- [x] Relevant tests, type checking, formatting, lint, and browser visual comparisons pass.

## Out of Scope

- Admin booking management, new product features, backend contract/schema changes, or framework redesign.
- Removing the Alpine folder or its tests before parity is verified.
- Commits, bookmark moves, dependency upgrades, or software installation without separate authorization and applicable security approval.

## Technical details

Use the current Svelte components, stores, handlers, validators, API client, and installed test tooling.
Do not implement a second booking state machine or framework-specific compatibility facade.
Keep the original frontend untouched as the comparison source.
New UI sections are justified only by existing Alpine functionality.

### Sibling map

- Booking creation, verification, resend: Alpine `submitContactDetails`, `sendEmailVerification`, and verification view in `frontend-alpine.js/src/index.html`; Svelte contact handler and existing API utilities.
- Booking reload, step selection, and errors: Alpine `init`, `updateFromDatabase`, `setStep`, and error modal; Svelte initialization/navigation utilities and UI store.
- Forms and summaries: Alpine corresponding contact/address/slots/children/control views; Svelte existing step and summary components.
- Footer: Alpine footer configuration visibility and links; Svelte options store and booking page.
- Regression suite: `frontend-alpine.js/tests/e2e/`; port equivalent assertions to `frontend/e2e/` without production-code dependencies on the old folder.
- Delivery: original frontend Docker/build usage and root compose service; Svelte static adapter build and Vite commands.

No product behavior differences are approved.
Svelte component structure may differ internally while preserving observable behavior.

### Baseline contracts confirmed by source audit

- Fetch all time slots, normalize Strapi document IDs, format labels, sort chronologically, and account for the booking's existing reservations when displaying capacity.
- Distinguish save validation from completion status: the baseline allows deferred gift-location, slot, and child-detail completion, including skipping children without saving.
- All navigation controls share confirmation/discard behavior, clear validation, and refresh slots when appropriate; reloading/discarding restores selected IDs as well as form fields.
- On concurrency-specific slot conflicts, show the original recovery instructions and reload saved state after dismissal because the backend may already have cleaned selections.
- Deadline restrictions update while the page remains open, not only after another reactive change.
- Original config-response API token/base URL fallback is supported when browser/build values are empty; nonempty browser values take precedence over nonempty build values and the response.
- The footer, summary visibility, document language/title, and responsive layout remain part of the baseline presentation.
- Verification handoff uses the existing booking link with its ID query parameter; no new verification-token route is introduced.

## Notes / risks / open questions

- Passing unit tests and a heading smoke test do not prove booking parity.
- Screenshot baselines may encode older fonts/browser environments; distinguish environmental differences from missing content or changed layout without silently replacing expectations.
- Real Strapi/Mailhog verification may require available services and credentials; report blockers rather than claiming simulated tests prove actual email delivery.
- Review any required new software independently and obtain approval before acquisition or execution.
- Original test inventory: 23 TypeScript files, 26 scenarios, and 39 historical PNGs ported; initial three-project collection contains 81 tests including the retained Svelte smoke test.
- A pre-existing footer-test race between two persistent scenario init scripts was corrected in the port using a fresh page for the second scenario, retaining all assertions and captures.
- Docker/container execution and real Strapi/Mailhog delivery are unavailable in this environment; no installation or image acquisition was attempted.
- The installed Alpine Mix build is broken by a removed webpack reporting import; reference-only compilation used existing esbuild plus the original PostCSS/Tailwind pipeline against unchanged original source, with temporary capture evidence generated under ignored `frontend/test-results/alpine-reference/`.
- The migration visual oracle contained 107 original-renderer PNGs across the three browser projects; the 39 historical images were preserved separately until legacy cleanup.
  Capture provenance and source hashes were recorded in `frontend/e2e/__screenshots__/PROVENANCE.md` before the approved Svelte recapture.
- The inherited loading test's fixed delay was replaced with a fixture-controlled pending config response, preserving its visible/hidden assertions.
  Original-renderer self-comparison now passes 74 cases with the four original Firefox gallery/homepage skips.
- Independent data-flow review found a paginated-inventory selection-loss risk and obsolete save-validation plumbing; both were corrected with behavioral regressions and without dropping test cases.
  Browser HTTP contract tests pass all 15 cases across Chromium, Firefox, and mobile Chromium.
- Final standard verification after all review corrections: `pnpm check` reports zero errors/warnings; `pnpm lint` passes; `pnpm test` passes 776 unit tests and 92 browser tests, with the four inherited Firefox-only visual-suite skips unchanged.
  Line coverage is 99.81% and branch coverage is 98.88%, with the original gates retained.
  That browser run built the production frontend and compared all 107 original-renderer reference PNGs.
- Browser tests default to one worker after an observed native-validation popover focus race under parallel workers; assertions, tolerances, masks, and skip conditions were not relaxed.
- The user approved merging four exact duplicate unit-table rows introduced during restoration; distinct empty, partial, and complete save cases and their assertions remain covered.
- Final whole-feature review confirmed no open introduced findings after restoring falsy browser-configuration fallback, removing the unused handler-context dependency, and merging the approved duplicate test rows.
  The direct API client's explicit-empty behavior before initialization remains unchanged; bootstrap now follows the Alpine fallback contract.
- Generated review outputs and unit-failure screenshots were archived under ignored `frontend/test-results/`; `frontend/core` was identified as a pnpm-preview crash dump and left untouched.
  Standard Playwright execution subsequently cleared its temporary output directory; the committed screenshot provenance and PNGs retain the baseline record.

### Pre-existing findings outside this parity change

- Remaining security and completion-rule findings and live-stack verification are tracked in [Svelte parity follow-ups](0002-svelte-parity-follow-ups.md).
