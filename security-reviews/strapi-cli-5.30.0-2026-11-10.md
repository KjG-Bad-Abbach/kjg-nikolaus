# Software security review: Strapi upgrade CLI 5.30.0

## Decision summary

- **Proceed with mitigations: user-invoked wrapper enablement and authored fake-npx fixtures only; no agent live acquisition or real codemod execution.**
- Independent reviewer: GPT-6.1 Sol / OpenAI, 2026-11-10; conditional design review, not a safety guarantee.
- Scope: Linux, existing Bash/Node/npx, npm cache installation/reuse, inherited terminal, backend transformations and marker publication; earlier adapter approval does not cover this changed path.

## Reviewed software and proposed operations

- Artifact: `@strapi/upgrade@5.30.0`, official [source][source] / registry `gitHead` `9cb2f2326113dd3523a6c9ee540922e04cf54ff6`; [registry metadata, tarball URL and signature][registry], [shipped text][dist].
- Published integrity: `sha512-T8OCIlamZZSbweXmSSVfoOszUEx8Bn9+GvOBfuowB6gh3Lk97yOEiReWLD9mC4pXFdD4c0pbhH4HsoeXoO0dHA==`; archive hash/signature and source equivalence unverified.
- Exact commands, cwd `/home/user/kjg-nikolaus-ai/backend`:

```sh
npx @strapi/upgrade@5.30.0 codemods ls --range '>5.0.0 <=5.30.0'
npx @strapi/upgrade@5.30.0 codemods run <UID>
```

- Run once per confirmed UID; `<UID>` is a placeholder, not shell syntax; no `--yes`, `--ignore-scripts`, or prior npm overrides.
- Reuse [shared validation](../scripts/strapi-versions.mjs#L13); preserve observed [core `5.30.0`](../backend/package.json#L22) and [marker `5.0.0`](../backend/.last-applied-codemods-version#L1) during implementation/fixtures.

## Findings and possible concerns

- **High—hooks/native execution:** dropping `--ignore-scripts` permits ordinary dependency hooks, including during initial `ls` acquisition; top-level upgrade has no install hooks.
  Its esbuild-register peer allows `esbuild >=0.12 <1`; inspected compatible example [esbuild 0.28.2 installer][esbuild] executes binaries and can fall back to nested npm/direct registry downloads—not a verified resolved version.
- **High—false success:** [runner][runner] returns success without checking per-file errors; JSON failures can increment counters without throwing.
  Exit zero is insufficient; human verification replaces the old adapter's automatic report check and can incorrectly advance the marker.
- **Medium—supply chain:** top-level pin does not freeze transitive/peer ranges; no shrinkwrap, and project pnpm lock does not lock npx acquisition.
  `simple-git@3.21.0` matches [RCE advisories](https://github.com/advisories/GHSA-r275-fr43-pm7q); `undici@6.21.2` matches [DoS advisories](https://github.com/advisories/GHSA-g9mf-h72j-4rw9); no exploit established for these commands, which do not call the upgrade workflow's Git/fetch operations, although CLI startup imports upgrade modules.
- **Medium—permissions/data:** intended scans cover backend `src`, `config`, `public`, root package JSON, excluding `node_modules`/`dist`; hooks/runtime retain broader user filesystem, environment, subprocess and network access, including readable secrets/agent sockets.
  Registry/proxy receives package/connection metadata and applicable authentication; cache/log retention and extra metadata/advisory/update traffic depend on configuration; no listener, persistence, application/database startup, direct telemetry/source upload or MCP integration established.
- **Medium—prompt limits:** [npm comparison source][npm] permits local/cache reuse, inherited yes configuration and non-TTY/CI installation without an interactive question; metadata/cache writes can precede consent.
  `PATH`, `NODE_OPTIONS`, npm registry/auth/proxy/TLS/cache settings and `ESBUILD_BINARY_PATH` affect execution; ordinary prompts are not a sandbox or guaranteed per-invocation gate.
- Static catalog: only `5.1.0-dependency-better-sqlite3-json` matches this interval; [transform][selected] raises an existing older exact dependency to `11.3.0`, absent from current manifest—not proof of a no-op or error-free scan.

## Verification and limitations

- Read-only inspection: local adapter/resolver/validation/docs/fixtures; upstream CLI, tasks, runners/catalog, manifests and shipped text; targeted advisory checks dated 2026-11-10.
- No candidate installation/import/execution, archive extraction, tests, live npx, workspace application, VCS mutation or private-data submission; source/distribution observations are not artifact authentication.
- Unknowns: full dependency/native graph and advisory audit, actual npm/Node/Nix wrappers/config/cache/architecture; prior-context npx read denied; declared Node 18–22 compatibility unverified on host.
- Replacement wrapper/new fixtures were unavailable at review time: inspect final diff and verify authored fake-npx fixtures only, with no real-npx fallback; fixtures cannot establish live npm/CLI behavior.

## Safer alternatives and recovery

- Required: shared exact-version/marker validation, reject downgrade, no acquisition when current; quote arguments, never evaluate output, reject failed/ambiguous listings; UID execution ignores range, so use only the complete confirmed range-limited list.
- Preserve inherited terminal and normal download confirmation; never inject yes answers; require success verification after every codemod, red nonzero warning plus continue/stop, and final marker confirmation.
- Track failures/unconfirmed success; additionally require explicit confirmation **all failures/unconfirmed results are resolved** before advancing; EOF/cancellation/negative answers must not publish; revalidate core/baseline and write marker last, atomically.
- Use trusted executors/configuration, an interactive non-CI session without automatic-yes configuration, no elevated privileges; prefer credential-free disposable source copy, isolated home/cache, restricted acquisition egress, no sensitive mounts/sockets—ordinary wrapper execution does not enforce isolation.
- Alternatives: manual migration, separately reviewed locked installation, or separately agreed hook suppression (not a runtime sandbox); no silent version/source/flag changes or repairs.
- Back up local edits; stopping leaves partial transformations; restore only identified changes, regenerate changed lockfiles with approved tooling, remove only identified cache/log artifacts, revoke potentially exposed credentials; deletion cannot undo disclosure.

[source]: https://github.com/strapi/strapi/tree/9cb2f2326113dd3523a6c9ee540922e04cf54ff6/packages/utils/upgrade
[registry]: https://registry.npmjs.org/@strapi%2fupgrade/5.30.0
[dist]: https://unpkg.com/@strapi/upgrade@5.30.0/?meta
[runner]: https://unpkg.com/@strapi/upgrade@5.30.0/dist/src/modules/codemod-runner/codemod-runner.js
[npm]: https://github.com/npm/cli/blob/v10.9.9/workspaces/libnpmexec/lib/index.js#L222-L298
[esbuild]: https://unpkg.com/esbuild@0.28.2/install.js
[selected]: https://unpkg.com/@strapi/upgrade@5.30.0/resources/codemods/5.1.0/dependency-better-sqlite3.json.ts

## User decision

- Status: approved for implementation and authored fake-command verification only.
- User decision after report presentation: “yes and cleanup the unused scripts that we recently created”.
- Approved scope: user-invoked shell wrapper using the reviewed commands and confirmation controls; removal of obsolete adapter/resolver scripts. No agent live acquisition or real codemod execution.
- Separate user approval: replace obsolete adapter/resolver tests with shell-workflow tests while retaining version-check coverage.
