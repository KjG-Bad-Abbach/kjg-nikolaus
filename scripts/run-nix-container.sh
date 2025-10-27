#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMAGE_NAME="${IMAGE_NAME:-kjg-ubuntu-nix}"
CONTAINER_NAME="${CONTAINER_NAME:-kjg-ubuntu-nix-dev}"
DOCKERFILE_REL="${DOCKERFILE_REL:-docker/ubuntu-nix.Dockerfile}" # allow overrides if needed
DOCKERFILE_PATH="${PROJECT_ROOT}/${DOCKERFILE_REL}"

if [[ ! -f "${DOCKERFILE_PATH}" ]]; then
  echo "Dockerfile not found at ${DOCKERFILE_PATH}" >&2
  exit 1
fi

echo "Building ${IMAGE_NAME} from ${DOCKERFILE_REL}..."
docker build -f "${DOCKERFILE_PATH}" -t "${IMAGE_NAME}" "${PROJECT_ROOT}"

echo "Launching container ${CONTAINER_NAME} (terminal-only)..."
exec docker run --rm -it \
  --name "${CONTAINER_NAME}" \
  -v "${PROJECT_ROOT}:/workspace" \
  -w /workspace \
  "${IMAGE_NAME}" \
  "${@:-/bin/bash}"
