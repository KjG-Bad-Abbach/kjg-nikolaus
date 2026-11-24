#!/usr/bin/env bash
set -Eeuo pipefail

scriptDirectory="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

finish() {
  local status=$?
  if [[ "$status" -eq 0 ]]; then
    printf '\n\033[32m%s\033[0m\n' 'GREEN: backend pre-commit checks passed'
  else
    printf '\n\033[31mRED: backend pre-commit checks failed (exit %s)\033[0m\n' "$status" >&2
  fi
}

trap finish EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM

cd "$scriptDirectory"
pnpm i
pnpm run ci
