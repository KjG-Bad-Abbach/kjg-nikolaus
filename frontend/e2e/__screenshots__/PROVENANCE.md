# Svelte visual regression baselines

The 107 root PNGs cover 39 Chromium, 29 Firefox, and 39 mobile Chromium views.
They are captured from the production Svelte build using the regression suite's fixed clocks and fixture responses.
The mobile project uses Playwright's Pixel 5 profile with Chromium.
The four inherited Firefox homepage/gallery skips remain unchanged.

## Update screenshots only for intentional visual changes

The user approved replacing Alpine pixel parity with functional, responsive, and accessible Svelte behavior on 2026-11-10.
The baselines were recaptured after removing parity-only spacing workarounds and restoring the pre-parity Tailwind form and typography plugins.
Existing behavioral assertions remain in place.
Keyboard navigation and horizontal-overflow checks cover every booking step at 320, 375, 768, and 1440 pixels in all three browser projects.

From `frontend/`, use:

```sh
pnpm exec playwright test --update-snapshots=all
pnpm test:e2e
```

Review changed images before accepting them; the second command verifies without updating baselines.
Default configuration disables snapshot updates and serializes native-validation screenshots to avoid browser-focus races.
Browser/OS/font differences can affect rendering; use the same provisioned environment when updating images.
The recapture used Playwright 1.59.1, Chromium 147.0.7727.15, and Firefox 148.0.2.

## Historical Alpine parity is complete

The previous baselines were captured from Alpine on 2026-11-09 and passed original-renderer self-comparison before Svelte matched them.
They are no longer the active visual contract.
The legacy frontend and unused 39-image historical set were retired after migration verification.
See [the parity record](../../../tasks/0001-svelte-booking-parity.md) for the original migration results and external-service verification limits.
