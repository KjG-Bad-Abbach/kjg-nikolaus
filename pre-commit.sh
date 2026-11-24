#!/usr/bin/env bash
set -Eeuo pipefail

repositoryRoot="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

finish() {
  local status=$?
  if [[ "$status" -eq 0 ]]; then
    printf '\n\033[32m%s\033[0m\n' 'GREEN: repository pre-commit checks passed'
  else
    printf '\n\033[31mRED: repository pre-commit checks failed (exit %s)\033[0m\n' "$status" >&2
  fi
}

trap finish EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM

cd "$repositoryRoot"
node --test scripts/strapi-versions.test.mjs
node scripts/check-strapi-versions.mjs

"$repositoryRoot/backend/pre-commit.sh"
"$repositoryRoot/frontend/pre-commit.sh"
