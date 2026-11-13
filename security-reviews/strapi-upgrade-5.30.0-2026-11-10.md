# Software security review: Strapi 5.30.0

## Decision summary

- **Defer pending verification:** combined production downgrade/tooling scope; Linux backend, local devDependency, configuration-only Docker hardening.
- Independent reviewer: GPT-6.1 Sol / OpenAI, 2026-11-10.
- Not a safety guarantee; acquisition remains unapproved.

## Reviewed software and proposed operations

- Pin [GraphQL](https://registry.npmjs.org/@strapi%2fplugin-graphql/5.30.0), [email provider](https://registry.npmjs.org/@strapi%2fprovider-email-nodemailer/5.30.0) from locked 5.61.0 to **5.30.0**; retain core **5.30.0**; add [upgrade@5.30.0](https://registry.npmjs.org/@strapi%2fupgrade/5.30.0) dev-only.
- These manifests supply exact tarballs/integrities/signatures; [Strapi revision](https://github.com/strapi/strapi/tree/9cb2f2326113dd3523a6c9ee540922e04cf54ff6) matches registry gitHead, not authenticated build provenance.
- From `backend`, after pin edits:

```sh
pnpm install --lockfile-only --ignore-scripts
pnpm add -D --save-exact @strapi/upgrade@5.30.0 --ignore-scripts
pnpm exec upgrade codemods ls --project-path . --range ">MARKER <=5.30.0"
pnpm exec upgrade codemods run UID --project-path . --range ">MARKER <=5.30.0"
```

- First resolves/writes lock/possibly manifest; second installs. No direct install hooks; scripts suppressed, pnpmfile hooks not suppressed.
- Supply exact marker/UIDs; verify local executable identity. No dlx/npx, latest, interactive/upgrade commands, shell-fragment interpolation, rebuild/download fallback.
- `backend/Dockerfile.prod:9`: `pnpm install --only=production --frozen-lockfile`; consistency only, not hook/image/toolchain hardening or build authorization. No fresh Nix shell: bootstrap installs outside scope.

## Findings and possible concerns

- **High:** Nodemailer 10.0.9→6.10.1 reintroduces [DoS](https://github.com/advisories/GHSA-rcmh-qjqh-p98v), [recipient disclosure](https://github.com/advisories/GHSA-mm7p-fcc7-pg87), [OAuth exposure](https://github.com/advisories/GHSA-r7g4-qg5f-qqm2); reachability unproven, 10.0.9 has other advisories. Resolve regression/bounded risk decision; no untested major override.
- **Medium:** Apollo 4.13.0→4.11.0: [standalone vulnerability](https://github.com/advisories/GHSA-mp6q-xf9x-fwf7) unestablished through Koa; [XS-Search](https://github.com/advisories/GHSA-9q82-xgwf-vj6h), EOL remain. Review endpoint/auth/CORS/patched alternatives.
- **High:** [runner](https://unpkg.com/@strapi/upgrade@5.30.0/dist/src/modules/codemod-runner/codemod-runner.js) ignores range for explicit UIDs; swallowed per-file errors permit false success, summary omits errors/skips. Independently enforce `marker < codemodVersion <= core`; reject malformed/incomplete catalogs. Inspect per-file results/postconditions fail-closed, never advance markers from exit status. Adapter requires review; no reliable CLI-only solution established.
- **Medium:** [catalog](https://unpkg.com/@strapi/upgrade@5.30.0/?meta): twelve 5.0.0 transforms, one 5.1.0; marker ≥5.1.0 yields none. Transitive ranges/native esbuild and [simple-git](https://github.com/advisories/GHSA-r275-fr43-pm7q)/[undici](https://github.com/advisories/GHSA-2m5v-pch6-74hx) advisories require dependency-delta inspection; allowed-path exploitability unproven.
- **Medium:** executable transforms can overwrite source/manifest and access inherited secrets; paths/dry-run provide no confinement; symlinks unverified. No direct exfiltration/persistence/listener established; no MCP integration.

## Verification and limitations

- Read local configuration/locks, registry/CDN modules, matching source, advisory API; no private-source submission. CDN equivalence unverified.
- No acquisition/execution/tests/builds, resolution/audit/final graph, tarball/signature verification, runtime tracing. User/global pnpm configuration and `.envrc` inaccessible; executable/version/native support, marker/UIDs/wrapper unverified. Full transitive/core/application/image audit excluded.

## Safer alternatives and recovery

- Split configuration hardening; prefer manual/supervised changes. Inspect hooks/configuration first; refresh scope for `--ignore-pnpmfile` if needed.
- Disposable non-root source copy; no secrets/data/sockets/home/VCS configuration; sanitized environment, registry-only acquisition, offline execution. Review diff; preserve baseline/marker. Discard private caches/logs; restore affected files without unrelated changes. Removal needs approved dependency scope; rotate exposed credentials, investigate egress.

## User decision

- **Execution approved; application alignment excluded.** Reference: “Detection and codemod apply script now. I apply to the execution of `@strapi/upgrade`”.
- Exported-module result inspection planned; implementation review required before live execution. No acquisition/broader dependency approval inferred.
