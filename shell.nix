{ pkgs ? import <nixpkgs> { } }:
with pkgs;
mkShell {
  buildInputs = [
    nixpkgs-fmt
    nodejs_22
    pnpm
  ];

  shellHook = ''
    set -euo pipefail

    echo "----------------------------------------"
    echo "backend: Installing pnpm dependencies..."
    cd backend
    pnpm install || true # Ignore errors
    cd ..
    echo "----------------------------------------"

    echo "-----------------------------------------"
    echo "frontend: Installing pnpm dependencies..."
    cd frontend
    pnpm install || true # Ignore errors
    cd ..
    echo "-----------------------------------------"
  '';
}
