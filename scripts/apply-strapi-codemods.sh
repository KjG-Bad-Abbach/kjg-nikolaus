#!/usr/bin/env bash
set -euo pipefail

repositoryRoot="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repositoryRoot/backend"
temporaryDirectory=''
temporaryMarker=''

cleanup() {
  local status=$?
  if [[ -n "$temporaryDirectory" ]]; then rm -rf "$temporaryDirectory"; fi
  if [[ -n "$temporaryMarker" ]]; then rm -f "$temporaryMarker"; fi
  if [[ "$status" -ne 0 ]]; then
    printf '%s\n' 'Marker not advanced by this workflow. Partial transformations may remain; review changes, fix failures, and retry.' >&2
  fi
}
trap cleanup EXIT
trap 'exit 1' INT TERM HUP

stop() {
  printf '%s\n' "$1" >&2
  exit 1
}

confirm() {
  local answer
  printf '%s [y/N] ' "$1"
  IFS= read -r answer || stop 'Input ended; stopping.'
  [[ "$answer" == y || "$answer" == Y || "$answer" == yes || "$answer" == YES ]]
}

readVersions() {
  node --input-type=module - "$repositoryRoot" <<'NODE'
import {
  MARKER_PATH,
  readAppliedCodemodsVersion,
  validateStrapiVersions,
} from '../scripts/strapi-versions.mjs';

try {
  const root = process.argv[2];
  const core = validateStrapiVersions(root);
  const marker = readAppliedCodemodsVersion(root, core);
  const coreParts = core.split('.').map(BigInt);
  const markerParts = marker.split('.').map(BigInt);
  const difference = markerParts.findIndex((part, index) => part !== coreParts[index]);
  if (difference !== -1 && markerParts[difference] > coreParts[difference]) {
    throw new Error(
      `${MARKER_PATH}: ${marker} is newer than ${core}; downgrades are not supported. Recover the intended versions or baseline without discarding local edits.`,
    );
  }
  console.log(`${core} ${marker} ${MARKER_PATH}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
NODE
}

versions="$(readVersions)"
read -r coreVersion appliedVersion markerPath <<< "$versions"
if [[ "$coreVersion" == "$appliedVersion" ]]; then
  printf 'Strapi codemods are up to date at %s.\n' "$coreVersion"
  exit 0
fi

temporaryDirectory="$(mktemp -d "${TMPDIR:-/tmp}/strapi-codemods.XXXXXX")"
range=">$appliedVersion <=$coreVersion"
printf '%s\n' 'Use a backup and a credential-free environment: npx acquisition can execute installation hooks.'
# Keep stdin and stderr inherited, including the normal npx acquisition prompt.
if ! npx "@strapi/upgrade@$coreVersion" codemods ls --range "$range" | tee "$temporaryDirectory/list"; then
  stop 'Codemod listing failed. Check the tool, npm cache, network, and compatibility before retrying.'
fi

# Strapi 5.30.0 formats a compact five-column table, or one explicit empty-result log.
# Reject unrecognized/truncated output instead of mistaking it for an empty selection.
if ! awk -F '│' -v range="$range" -v upgradePackage="@strapi/upgrade@$coreVersion" '
  function trim(value) { gsub(/^[[:space:]]+|[[:space:]]+$/, "", value); return value }
  function invalid() { failed = 1; exit 1 }
  {
    gsub(/\033\[[0-9;]*m/, "")
    if ($0 ~ /^[[:space:]]*$/) next
    # npm can print its acquisition prompt on stdout without a trailing newline.
    if (state == 0 && !acquisition && $0 == "Need to install the following packages:") {
      acquisition = 1; next
    }
    if (acquisition == 1) {
      if ($0 != upgradePackage) invalid()
      acquisition = 2; next
    }
    if (acquisition == 2) {
      if (!sub(/^Ok to proceed\? \(y\) /, "")) invalid()
      acquisition = 3
      if ($0 ~ /^[[:space:]]*$/) next
    }
    if (state == 0 && $0 ~ /^\[INFO\][[:space:]]+\[[^]]+\] Found no codemods matching /) {
      sub(/^\[INFO\][[:space:]]+\[[^]]+\] Found no codemods matching /, "")
      if ($0 != range) invalid()
      state = 5; next
    }
    if (state == 0 && $0 ~ /^┌[─┬]+┐$/) { state = 1; next }
    if (state == 1 && NF == 7 && trim($1) == "" && trim($7) == "" &&
        trim($2) == "N°" && trim($3) == "Version" && trim($4) == "Kind" &&
        trim($5) == "Name" && trim($6) == "UID") { state = 2; next }
    if (state == 2 && $0 ~ /^├[─┼]+┤$/) { state = 3; next }
    if (state == 3 && $0 ~ /^└[─┴]+┘$/ && count > 0) { state = 5; next }
    if (state != 3 || NF != 7 || trim($1) != "" || trim($7) != "") invalid()
    row = trim($2); version = trim($3); kind = trim($4); uid = trim($6)
    if (row !~ /^[0-9]+$/ || row + 0 != count || (kind != "code" && kind != "json") ||
        uid !~ /^[[:alnum:]][[:alnum:]_.-]*$/ || index(uid, version "-") != 1 ||
        substr(uid, length(uid) - length(kind)) != "-" kind || seen[uid]++) invalid()
    selected[++count] = uid
  }
  END {
    if (failed || state != 5) exit 1
    for (i = 1; i <= count; i++) print selected[i]
  }
' "$temporaryDirectory/list" > "$temporaryDirectory/selection"; then
  stop 'Ambiguous codemod listing; inspect the complete output and tool format before retrying.'
fi

if [[ -s "$temporaryDirectory/selection" ]]; then
  printf 'Complete selected codemods (%s):\n' "$range"
  while IFS= read -r uid; do printf '  %s\n' "$uid"; done < "$temporaryDirectory/selection"
  confirm 'Run every selected codemod?' || stop 'Selection declined.'
else
  printf '%s\n' 'No applicable codemods.'
fi

unresolved=false
# A separate descriptor keeps listing reads away from interactive command/prompt stdin.
while IFS= read -r uid <&3; do
  status=0
  npx "@strapi/upgrade@$coreVersion" codemods run "$uid" || status=$?
  if [[ "$status" -ne 0 ]]; then
    printf '\033[31mWARNING: %s exited %s; continuation does not establish success.\033[0m\n' "$uid" "$status" >&2
  fi
  verified=false
  if confirm "Verify $uid: report and changes successful, with zero per-file errors?"; then verified=true; fi
  if [[ "$status" -ne 0 || "$verified" != true ]]; then
    unresolved=true
    confirm 'Continue to the remaining codemods despite this failed or unconfirmed result?' || stop 'Stopped for codemod recovery.'
  fi
done 3< "$temporaryDirectory/selection"

if [[ "$unresolved" == true ]]; then
  confirm 'Have ALL failures and unconfirmed results been resolved?' || stop 'Unresolved results; marker unchanged.'
fi
confirm "Record completion at $coreVersion?" || stop 'Final confirmation declined.'

temporaryMarker="$(mktemp "$repositoryRoot/$markerPath.XXXXXX")"
printf '%s\n' "$coreVersion" > "$temporaryMarker"
finalVersions="$(readVersions)"
[[ "$finalVersions" == "$versions" ]] || stop 'Core or marker changed during codemods; review concurrent changes before retrying.'
mv "$temporaryMarker" "$repositoryRoot/$markerPath"
temporaryMarker=''
printf 'Recorded Strapi codemod completion at %s.\n' "$coreVersion"
