# Software security review: pinned npm tools and frontend CI

## Decision summary

- **Proceed with stated mitigations; approved by the user.** Not a safety guarantee.
- Independent reviewer: GPT-6.1 Sol (`openai/gpt-6.1-sol`), 2026-11-10.

## Reviewed software and proposed operations

- Four Dockerfiles: [pnpm 12.9.0](https://github.com/pnpm/pnpm/tree/247bfc45e5f011185e9a7088d9c39ac6bc084e44); two backend builders: [node-gyp 11.2.0](https://github.com/nodejs/node-gyp/tree/fc557e4b2bc1115a5fce6bb5b74739bfeac4aba6).
- New `frontend-checks`: GitHub-hosted `ubuntu-24.04`, Node 22.23.4, [setup-node v4.4.0](https://github.com/actions/setup-node/tree/49933ea5288caeca8642d1e84afbd3f7d6820020), [upload-artifact v4.6.2](https://github.com/actions/upload-artifact/tree/ea165f8d65b6e75b540449e92b4886f43607fa02); full-SHA action references.
- Image: `mcr.microsoft.com/playwright:v1.59.1-noble` pinned to [index digest](https://mcr.microsoft.com/v2/playwright/manifests/sha256:b0ab6f3cb99aa7803adbc14d9027ec1785fc6e433b97e134e0f8fe61683b6b53), [amd64 child](https://mcr.microsoft.com/v2/playwright/manifests/sha256:eac9b0a5312cdab40ee8c2429df5bf19bffdccf8f3bf3c42268e173f97541645).

```sh
PNPM_VERSION=12.9.0
NODE_GYP_VERSION=11.2.0
npm install --global pnpm@"${PNPM_VERSION}"
# CI, working-directory: frontend
pnpm install --frozen-lockfile
pnpm check
pnpm lint
pnpm test
```

- Docker: declare version ARGs per stage; retain [Renovate comments](../renovate.json#L20-L35).
  Backend builders additionally install global `node-gyp@"${NODE_GYP_VERSION}"`, then `pnpm config set fetch-retry-maxtimeout 600000 -g` and `pnpm install` (production builder: `--only=production`); frontend installs remain frozen.
  Global modules/configuration/caches stay inside containers; backend runtime also installs pnpm.
  No host-global installation, Corepack, dependency/lockfile updates or new integration.
- CI environment: `CI=true`, `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`, `PLAYWRIGHT_BROWSERS_PATH=/ms-playwright`.
  `pnpm test` includes coverage, Chromium/Firefox E2E, automatic build/preview.
- Require `contents: read`, checkout `persist-credentials: false`, `pull_request`, publishing `needs: frontend-checks`; no secrets, registry authentication, added cache/mounts/socket/privileges.
- Upload `frontend/{coverage,playwright-report,test-results}` as `frontend-test-results`, `if: !cancelled()`, seven-day retention, `include-hidden-files: false`.

## Findings and possible concerns

- **High runtime concern:** [22.23.4 fixes October findings](https://nodejs.org/en/blog/release/v22.23.4), superseding deferred CI 22.22.2; [November 11 high-severity fixes](https://nodejs.org/en/blog/vulnerability/november-2026-security-releases) remain unknown.
  Recheck before execution on/after November 11; changed runtime requires renewed review/approval.
  Unchanged Docker 22.22.1/22.22.2 retain October concerns; image Node 24/action Node 20 remain separate.
- **High execution/data exposure:** PR hooks/tests execute arbitrary code, generally as container root; preview is not necessarily loopback-only.
  Ephemeral runners, synthetic fixtures, no production endpoints/data; frozen locks are not isolation.
  Artifacts export source/traces to GitHub; job credentials still exist, hidden-file exclusion is not DLP.
- **Medium supply-chain uncertainty:** native pnpm payload/fallback downloads, hook downloads/builds and node-gyp ranged transitives escape complete lockfile control; pnpm bundles node-gyp 12.3.0 despite global 11.2.0.
  Preserve official sources, optional dependencies/allowlists; stop unexpected downloads, never auto-approve hooks.
  [Native wrapper evidence](https://github.com/pnpm/pnpm/blob/247bfc45e5f011185e9a7088d9c39ac6bc084e44/pnpm/npm/pnpm/install.js); existing privileged publishing and mutable dependencies remain outside scope; future Renovate updates require renewed approval.

## Verification and limitations

- Read-only metadata/source/hook/lockfile/action/MCR checks; targeted OSV queries empty, not comprehensive.
  [npm integrity/provenance metadata](https://registry.npmjs.org/pnpm/12.9.0), [node-gyp metadata](https://registry.npmjs.org/node-gyp/11.2.0), [Node checksums](https://nodejs.org/dist/v22.23.4/SHASUMS256.txt) observed, not cryptographically verified.
  [GitHub Node archive/digest](https://api.github.com/repos/actions/node-versions/releases/tags/22.23.4-39619033003) differs from upstream archive; availability checked by HEAD only.
- No candidate acquisition/execution, tests, image scan, complete dependency/bundle audit or reproducibility verification; setup-node trusts cache/mutable manifest without explicit download checksum comparison.
  Final diff still requires exact-scope confirmation; no local Docker authorization.

## Safer alternatives and recovery

- Defer CI/browser tests; pinning can proceed separately after approval.
- Stop failures; no automatic lockfile/baseline changes, downloaders or weakened isolation.
- Revert proposed edits; cancel jobs, delete artifacts/logs, dispose containers and affected images/caches; rotate exposed credentials.
  Recovery untested; deletion cannot recall copies/published layers.

## User decision

- **Approved on 2026-11-10:** user explicitly approved the presented report and scope, requesting autonomous completion unless a harmful security risk arises.
  Approval covers the exact reviewed versions, CI commands, permissions and artifact retention above; changed artifacts still require renewed review and approval.
  No host-global installation or local image acquisition included.
