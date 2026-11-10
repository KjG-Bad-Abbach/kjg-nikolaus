# Svelte–Alpine booking parity review

**Verdict: good to go, with comments — F1/F2 fixed; two minor behavioral differences remain.**
Passing regression tests establish the exercised scenarios, not universal equivalence.

## Review scope and evidence

- Scope: complete current Svelte booking frontend versus retained `frontend-alpine.js/src/` and original `frontend-alpine.js/tests/e2e/`, including unchanged Svelte functionality.
- Intent: [booking parity](0001-svelte-booking-parity.md), all phases; [existing follow-ups](0002-svelte-parity-follow-ups.md).
- Passes: correctness, tests, architecture/simplicity, separate adversarial security read, cross-cutting merge.
- Execution: four sequential comparison parts; delegation and code-intelligence tools unavailable, so no independently delegated security reviewer or graph-assisted dependency analysis.
- Exclusions: generated output and dependency internals; dependency lockfile contents; exhaustive manual inspection of every PNG pixel.
- Workspace: [review evidence](../.reviews/20261109-223843/), including plan, responsibility matrix, finalized parts, comparison diffs, probe scripts and logs.
- Review started November 9; finalized November 10, 2026.

### Verification supplied before review

- Historical reports: clean check/lint; 776 unit and 92 browser passes; four accepted Firefox skips.
- Historical results not reused as fresh verification.

### Verification run during review

| Command/check | Result | Evidence |
| --- | --- | --- |
| `pnpm check` | Exit 0; zero errors/warnings | `check.log` |
| `pnpm lint` | Exit 0 | `lint.log` |
| `pnpm test` | Exit 0; 776 unit passes, 92 browser passes, four accepted Firefox skips | `test.log` |
| Coverage from full test run | Lines 99.81%; branches 98.88%; configured gates retained | `test.log` |
| `pnpm build` | Exit 0; static adapter writes `build/` | `build.log` |
| Initial configuration probe, native browser transport | Exit 0; reproduced F1 in both URL and token variants | `bootstrap-probe.log` |
| Paired retained-Alpine/current-Svelte Chromium probes | Exit 0; reproduced F2–F4 | `transient-state-probe.log`, `validation-messages-probe.log` |
| Input/discard candidate | Exit 0; candidate refuted, confirmation and edited value retained | `binding-probe-final.log` |
| Original test comparison | All 23 TypeScript files compared after formatting normalization | `test-semantic.diff` |
| Visual-oracle integrity | 107 active PNGs; all 39 historical PNGs byte-identical to retained originals; three recorded source hashes match | `part-03.findings.md`, screenshot provenance |

- Commands run from `frontend/`, with core dumps disabled and automatic browser/package acquisitions disabled.
- Probe exit 0 means reproduction completed, not that parity passed.
- Initial probe setup failures retained in logs; wrong working directory and an overbroad source-request interception corrected in review-only scripts.
- Standard browser tests used the production build; targeted paired probes used the Svelte development renderer and original HTML with installed Alpine, without CSS-based visual claims.

### Verification unavailable or not run

- Live Strapi/Mailhog: localhost ports 1337/8025 refused connections; port 3000 also unavailable.
- Docker: executable unavailable; no image builds, pulls or container execution.
- Real email receipt/link delivery, deployed CORS/permissions and production reverse-proxy behavior: unverified; already tracked by follow-up AC3.
- HTTP-fixture tests verify synthetic request/response contracts, not real email delivery or actual Strapi authorization.
- Semgrep, Gitleaks, OSV scanner, Knip and jscpd unavailable; no automated security, vulnerability, dead-code or duplication scan claimed.
- No mutation-testing run or independent security reviewer; no software acquisition, integration enablement or installation attempted.
- Active screenshot provenance matches current original source hashes, but its cleared temporary capture runner/logs were not independently reconstructed; the complete original visual suite was not rerun against Alpine.
- No screenshots, masks, tolerances, assertions or skip conditions changed.

## Architecture conclusions

- **Requirements — substantiated gaps:** F1–F4 contradict exact behavioral parity; remaining booking flows traced against both implementations and exercised by available tests.
- **Ownership — justified difference:** component/handler/store decomposition replaces Alpine's root object; F2/F3 expose state-lifetime mismatches rather than a required redesign.
- **Dependencies — justified difference:** page → handlers/utilities → API/stores; manual tracing found no new layer bypass; formal cycle analysis unavailable.
- **Flows — substantiated gap:** config/bootstrap ordering fails before fallback in F1; create/verification/resend, populated reload, discard, save and concurrency-dismissal recovery otherwise traced end-to-end.
- **Families — substantiated differences:** search and modal state lifetime in F2/F3, validation-message aggregation in F4; contact/address/slot/child save and summary responsibilities compared in the workspace matrix.
- **Proportion — justified difference:** existing Svelte decomposition and complete-inventory pagination fit the migration; no redesign-level stop gate identified.
- **Cleanup — justified retention:** original source, tests and historical captures retained as requested; already tracked rich-text security and completion-rule duplication not duplicated here.

## 1. Blocking

### F1 — Build configuration fallback occurs after the request that needs it

- **Type:** bug
- **Severity:** major
- **Effort:** spreads
- **Confidence:** high
- **Status:** fixed (November 10, 2026)
- **Location:** `frontend/src/lib/utils/bookingInit.ts:51-57`; `frontend/src/lib/api/client.ts:85-91`.
- **Problem:** `loadConfig()` runs before initialization replaces empty browser configuration with nonempty build values.
  The client uses `??`, so an empty `window.API_BASE_URL` sends the first config request to the frontend origin, and an empty `window.API_TOKEN` suppresses the configured bearer token.
  If the frontend has no API proxy or config requires that token, startup fails before fallback; retry repeats the same ordering.
- **Evidence:** native browser probe with synthetic nonempty build settings reproduced frontend-origin `/api/config` with an empty browser URL, and the correct API origin without authorization with an empty browser token.
  Both displayed the startup retry modal.
  Alpine's bundled `src/js/app.js:4-5` assigns build configuration before initialization; the parity task's fallback contract is explicit at `0001-svelte-booking-parity.md:98`.
- **Test gap:** `bookingInit.spec.ts:111-114,142-177` covers the named empty-browser case but mocks `loadConfig()`, checking only a subsequent booking request.
  Browser HTTP tests supply nonempty overrides, avoiding this case.
- **Fix:** establish browser/build fallback before requesting config, retaining response fallback afterward and the direct client's deliberately explicit-empty semantics.
  Add real-initialization/native-transport cases for empty URL and token overrides.
- **Resolution:** browser/build fallback now precedes `loadConfig()`; response fallback and direct-client explicit-empty semantics retained.
- **Regression evidence:** both new real-initialization/native-fetch cases failed before the fix (wrong first URL; missing bearer token); both passed afterward against an authorization-sensitive local HTTP server, with all 52 focused tests green.
- **Fix verification (November 10, 2026):** `pnpm check` (zero errors/warnings), `pnpm lint`, and full `pnpm test` passed: 778 unit passes, 92 browser passes, four existing Firefox skips, production build included; `review-tests` and confirmation reported no findings.
- **Verification limits:** synthetic HTTP fixtures, not live Strapi/Mailhog; Semgrep unavailable.

## 2. Architecture, Simplicity & Maintenance Trade-Offs

None.

## 3. Other Optional Comments

Non-blocking; F3/F4 remain observable differences under the exact-parity requirement.

### F2 — Slot-search text is lost after navigating away and back

- **Type:** bug
- **Severity:** minor
- **Effort:** spreads
- **Confidence:** high
- **Status:** fixed (November 10, 2026)
- **Location:** `frontend/src/lib/components/steps/TimeSlotStep.svelte:22-39`; `frontend/src/routes/+page.svelte:223`.
- **Evidence:** enter a search, visit Address, then return to Slots without changing booking data.
  The paired probe retained `"Thursday"` in Alpine but returned `""` in Svelte.
  Alpine keeps `timeSlotSearchQuery` on the root object (`index.html:2279,1044`); Svelte recreates the component-local state.
- **Fix:** reuse the existing `bookingStore.timeSlotSearchQuery` as the page-lifetime owner and wire it to the component; cover the round trip without resetting the search.
- **Resolution:** required bindable search prop wired to the existing store; standalone test/Storybook callers updated; component-local search state removed; reset behavior unchanged.
- **Regression evidence:** Slots → Address → Slots failed before the fix with an empty search; afterward all three browser projects retained the text and matching/nonmatching slot filtering (`frontend/e2e/address-time-slot.spec.ts:115-139`).
- **Fix verification (November 10, 2026):** check/lint passed with zero Svelte diagnostics; full `pnpm test` passed: 778 unit tests, 107 browser tests, four existing Firefox skips, production build included; lines 99.81%, branches 98.85%; `review-tests` and confirmation found no issues; logs: `/tmp/nix-shell.1ZdSXk/opencode/f2-{red,green,check,lint,test}.log`.
- **Verification limits:** live ports 1337/8025/3000 refused connections; Semgrep unavailable; report-wide Prettier warning predates this fix (unrelated table padding/completion spacing left unchanged); frontend formatting/lint passed; no PNGs or existing assertions changed.

### F3 — Expanded error details collapse on the next error

- **Type:** bug
- **Severity:** minor
- **Effort:** spreads
- **Confidence:** high
- **Status:** open
- **Location:** `frontend/src/routes/+page.svelte:306-313`; `frontend/src/lib/components/ErrorModal.svelte:29`.
- **Evidence:** trigger a slot-fetch error, expand Details, dismiss, then trigger another error.
  Details remained expanded in Alpine and collapsed in Svelte in the paired probe.
  Alpine's `x-show` preserves nested `x-data.open` (`index.html:1716-1780`); the Svelte parent destroys the component when the error clears.
- **Fix:** retain the modal component across cleared errors; it already accepts a null error and conditionally renders its own markup.
  Add a repeated-error regression preserving the expanded state.

### F4 — Repeated validation paths discard earlier messages

- **Type:** bug
- **Severity:** minor
- **Effort:** spreads
- **Confidence:** high
- **Status:** open
- **Location:** `frontend/src/lib/utils/bookingValidation.ts:114-130`; `frontend/src/lib/types/booking.ts:88-90`.
- **Evidence:** a supported validation response with minimum-length and digit-format errors for `location.zip_code` rendered both messages in Alpine, but only the final message in Svelte.
  Alpine appends each error (`index.html:2589-2592`); Svelte assigns `errors[path] = message`.
  Exponent-form ZIP input such as `1e3` passes the numeric input's range while violating both five-character and digits-only backend rules (`backend/src/components/shared/address.json:22-25`).
  The paired probe supplied the response; live Strapi message generation was not verified.
- **Fix:** retain every message through extraction, validation state and component conversion; add a repeated-path response regression.

### Mechanical conventions

None.

## Coverage and handoff

- Reviewed navigation, booking-ID links, API configuration/auth/pagination, reservation credit, capacity/conflict recovery, contact/verification/resend, address/gifts, slots/search, children/notes, deadlines, dirty/discard/retry, summaries, CMS content/footer/loading/modals and deployment/test-oracle contracts.
- Original behavioral assertions and screenshot tolerances preserved after normalized comparison; pending-config gating and fresh-page footer isolation retain the original outcomes.
- Inherited rich-text XSS and duplicated completion rules remain in follow-up AC1/AC2; accepted Firefox skips and the removed preview-crash follow-up not reopened.
- No existing application source, tests or configuration edited; no VCS authoring commands, commits, bookmark moves or cleanup performed.
- Proposed handoff only: commit this report separately if requested; then approve individual fixes against the green baseline.
- Estimated fixes including behavioral regressions: F1 roughly 15–30 changed lines; F2 15–30; F3 12–25; F4 20–50.
  None offered as a ≤10-line cleanup.
  Any approved fix exceeding its estimate must stop for further approval before committing.
<!-- review-complete -->
