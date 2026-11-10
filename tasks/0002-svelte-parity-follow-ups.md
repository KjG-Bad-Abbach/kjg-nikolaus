# Task Description

As a maintainer, I want the unresolved parity-review findings addressed so that the Svelte frontend is safer, easier to maintain, and verified against the live stack.

Completed migration fixes and accepted Firefox screenshot skips remain recorded in [the parity task](0001-svelte-booking-parity.md); they are not reopened here.

## Acceptance criteria

- [ ] AC 1 — High priority: inherited CMS rich-text XSS
  - **Given:** `frontend/src/lib/utils/richTextRenderer.ts` interpolates text and link attributes into HTML rendered by `IntroSection.svelte`; review demonstrated unescaped markup, not a browser exploit.
  - **When:** Text escaping, attribute handling, and permitted link protocols are secured at the rendering boundary.
  - **Then:** Malicious text and links cannot execute script; supported formatting remains intact; behavioral security regressions and existing rendering tests pass.

- [x] AC 2 — Maintenance: duplicated completion rules
  - **Given:** `derivedStores.isEverythingFilled` repeats the rule in `stepNavigation.getFirstIncompleteStep`.
  - **When:** The getter reuses the existing completion predicate instead of maintaining another copy.
  - **Then:** Routing, step metadata, and the final summary agree; existing completion tests pass without changed outcomes.
  - **Resolution:** `derivedStores.isEverythingFilled` delegates to `getFirstIncompleteStep` with the configured slot count; existing behavioral tests remain unchanged.

- [ ] AC 3 — Verification gap: live backend and containers
  - **Given:** HTTP-fixture tests passed, but Strapi, Mailhog, and Docker were unavailable during parity verification.
  - **When:** The development stack and production static image are exercised with the intended public API configuration.
  - **Then:** Booking creation, actual verification-email receipt/link navigation, edits/reload, resend, permissions/CORS, and production assets work; environment and results are documented.
  - Any required software acquisition remains subject to the repository's independent security review and approval gate.
