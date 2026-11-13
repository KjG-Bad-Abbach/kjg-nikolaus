{ pkgs ? import <nixpkgs> { } }:
with pkgs;
mkShell {
  buildInputs = [
    nixpkgs-fmt
    nodejs_22
    pnpm
  ] ++ lib.optionals stdenv.isLinux [
    (writeShellScriptBin "ldd" ''
      # Prebuilt Playwright browsers use the container's loader and system libraries.
      if [ -x /usr/bin/ldd ]; then
        exec /usr/bin/ldd "$@"
      fi
      exec ${glibc.bin}/bin/ldd "$@"
    '')
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
