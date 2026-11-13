# Software security review: npx Strapi acquisition

## Decision summary

- **Defer live acquisition**; enabling Linux acquisition code requires explicit residual-risk approval, not permission for live execution.
- Independent reviewer: GPT-6.1 Sol / OpenAI, 2026-11-10.
- Not a safety guarantee.

## Reviewed software and proposed operations

- Official [source](https://github.com/strapi/strapi/tree/9cb2f2326113dd3523a6c9ee540922e04cf54ff6/packages/utils/upgrade), [@strapi/upgrade@5.30.0 metadata/signature/integrity](https://registry.npmjs.org/@strapi%2fupgrade/5.30.0), [artifact](https://registry.npmjs.org/@strapi/upgrade/-/upgrade-5.30.0.tgz): bytes/signature/source equivalence unverified.
- Proposed `execFile`, `shell: false`, cwd `/home/user/kjg-nikolaus-ai/backend`; exact executable and argv below, **not executed**:

```text
/nix/store/lr2c5f2y7q62pzfrkclgsy5yj31hsn5l-nodejs-22.23.4/bin/npx
--yes --ignore-scripts --no-audit --no-update-notifier
--workspaces=false --install-strategy=hoisted
--package=@strapi/upgrade@5.30.0 --
/nix/store/k6wnq86zjb42sm845vgv795cwsnwvj07-nodejs-slim-22.23.4/bin/node
/home/user/kjg-nikolaus-ai/scripts/resolve-strapi-upgrade.mjs 5.30.0
```

## Findings and possible concerns

- **High—real writes:** confirmed marker **5.0.0**, core 5.30.0; apply is acquisition-eligible, not a no-op.
  Preserve marker; manifest/marker/downgrade/equality guards before acquisition; retain API/catalog checks, unique complete reports, nonnegative safe-integer per-file counters with zero errors, version revalidation, marker-last behavior ([adapter](../scripts/strapi-codemods.mjs#L90)).
- **Medium—executor/configuration:** caller verified slim-Node `process.execPath`; reviewer did not inspect it.
  Installed npx read denied; wrapper/npm/Nix patches unverified.
  [Upstream](https://github.com/nodejs/node/tree/27f213124280b4db4cd1e3dd42f6f8afd01ceff7/deps/npm) comparison: npm 10.9.9, libnpmexec 9.0.5, tar 7.5.22—not installed identities.
  Internal shell and startup/preload execution remain; effective configuration unknown.
  Inspect wrapper, minimize environment/credentials, verify registry/proxy/TLS/auth/cache/shell configuration without exposing secrets.
- **Medium—host/provenance:** normal local-match/cache acquisition does not update project dependencies/manifests/locks; persistent cache/logs remain.
  Verify cache outside repository and trusted roots; no universal no-write guarantee or sandbox.
  Registry/proxy receives package/network metadata and applicable credentials; imports/transforms retain filesystem/environment/network access.
  `--ignore-scripts` suppresses ordinary registry hooks, not runtime execution or arbitrary Git/file/link graphs.
- **Medium—resolver/graph:** helper unimplemented/unverified; proposed lookup only `join(PATH_entry, '..', '@strapi/upgrade/package.json')`.
  Require exact name/version, absolute single metadata output, successful subprocess, trusted real roots; reject malformed metadata and empty/relative PATH entries.
  Parent revalidates and uses `createRequire(returnedPackageJson)`, never backend-resolution fallback; explicit `--package` avoids package inference/Strapi CLI execution.
  Metadata is not integrity/TOCTOU protection; root imports evaluate dependencies.
  Transitives/peers/native availability remain unresolved; [simple-git](https://github.com/advisories/GHSA-r275-fr43-pm7q)/[Undici](https://github.com/advisories/GHSA-2m5v-pch6-74hx) advisories are risks, not demonstrated adapter exploits.

## Verification and limitations

- Read-only local/source/registry/advisory inspection; no downloads, candidate imports/execution, tests, hashing/signature verification, full graph audit, or baseline-revision confirmation.
- Proposed implementation verification: authored fixtures/fake subprocesses only; cannot establish host npm behavior.
  Review final helper/configuration; later live verification requires separate approval and before/after checks.

## Safer alternatives and recovery

- Prefer reviewed local installation/manual changes; disposable credential-free verification requires separate scope approval.
- No registry/cache overrides, alternate installers, hook-enabled repairs, CLI upgrades, or different versions without refreshed review.
- Restore affected files preserving unrelated edits; remove only identified cache artifacts, never shared-cache wipes.
  Deletion cannot undo writes/disclosures; rotate exposed credentials.

## User decision

- **Implementation approved after report presentation:** user selected option 1, “Simplify the adapter and add pinned acquisition, retaining reliable marker updates; remove redundant guards and their tests.”
- Approval covers enabling explicit, user-invoked acquisition and fixture-only verification with the disclosed environment and dependency-graph gaps; no real acquisition or workspace transformations by the agent.
- Keep exact tool identity/version, interval boundaries, complete zero-error reports, post-transform validation, and atomic marker publication; unused success counters and redundant API-shape checks may be removed under the approved simplification.
- Preserve the user's current `5.0.0` marker; invoking the future apply command is an intentional download/execution action, without another script-level approval prompt.
