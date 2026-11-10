# Screenshots use the original Alpine renderer

The 107 root PNGs are the current comparison oracle: 39 Chromium, 29 Firefox, and 39 mobile Chromium images.
All were captured from the original Alpine application, never from Svelte.
The unused set of 39 historical Chromium PNGs and the legacy `frontend-alpine.js/` implementation were retired after parity verification.
That historical set produced 25 visual failures against the original renderer itself and was never used as the current oracle.
Snapshot updates remain disabled by default in `frontend/playwright.config.ts`.

## Reference compilation preserves the original application

The workspace reference was generated on 2026-11-09 from `frontend-alpine.js/`, independently of earlier external captures.
The original Mix/Babel pipeline failed in its reporting path, so the reference build used an esbuild browser IIFE instead.
The original inline application, PostCSS/Tailwind plugin, CSS source, and source-scan base and paths were retained.
The only HTML rewrite replaced `mix()` asset helpers with their asset paths.
No original application source or PNG was modified during reference capture.

Tool versions: esbuild 0.28.2, PostCSS 8.5.32, Tailwind PostCSS 4.3.5, Playwright 1.59.1, Chromium 147.0.7727.15, Firefox 148.0.2.
The mobile project uses Playwright's Pixel 5 device profile with Chromium.

Verified SHA-256 source hashes:

- `src/js/app.js`: `b8181f86633e0926f6ddebd0a3166b72e9d5a6ae285b16c40e8c91fc89c26b3a`
- `src/css/app.css`: `5675f1dee15d0293e0b12dc0c20ae311a0b0bc9fe7a9bdd44f10c1d3fd1bc0ab`
- `src/index.html`: `ab1ed2dd8217c25cc1ed1059fd48d71b65cedf09bfcde8b8373e8756888865f7`

## Loading captures control the pending response

The main reference capture supplied 104 PNGs from the original-only workspace server on port 4281.
The three `ui-loading-skip-intro-*` PNGs were captured separately from the original server on port 4280 using the ported loading test.
That test pauses the existing fixture's config response, observes the loading indicator, releases the response, and retains every original behavioral and screenshot assertion.
This replaces the inherited 250 ms delay and removes the race between initialization and navigation completion.
Other fixture calls remain immediate.

The original-only capture inputs and provenance were generated under ignored `frontend/test-results/alpine-reference/`.
The separate loading captures and temporary runner were generated under ignored `frontend/test-results/loading-reference/`.
All adopted PNGs were byte-compared with these capture inputs.
Standard Playwright runs clear `test-results/`; this document and the adopted PNGs are the retained provenance record.

## The adopted oracle passes original-renderer self-comparison

The 26 original scenarios across three projects produced **74 passes, 4 existing Firefox skips, and no failures** with snapshot updates disabled.
The comparison used the ported fixtures and selectors against the original server on port 4280, not Svelte.
Loading-only self-comparison also passed on all three projects.

Command used from `frontend/`, with an ignored temporary configuration that selected only the original spec files, pointed at this snapshot directory, and disabled web-server startup:

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4280 PATH=/usr/bin:$PATH pnpm exec playwright test \
  --config=test-results/reference-selfcomparison.config.ts \
  --update-snapshots=none --workers=1 --global-timeout=240000
```

The serial run is the verified result.
An earlier two-worker run showed a 1,203-pixel Chromium native-validation screenshot difference and accidentally included newer HTTP-contract tests; those results do not establish Svelte parity.
No screenshot tolerance, assertion, or baseline was changed in response.
The completed self-comparison report was generated as `frontend/test-results/reference-selfcomparison.json` before the final standard test run cleared temporary evidence.
The final Svelte comparison passed all 92 browser tests, with the four inherited Firefox skips, against these unchanged PNGs.
