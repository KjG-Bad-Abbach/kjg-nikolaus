#!/usr/bin/env bash

NIXPKGS_ALLOW_UNFREE=1 nix-shell -p codex claude-code nodejs pnpm
