{ pkgs ? import <nixpkgs> { } }:
with pkgs;
mkShell {
  buildInputs = [
    nixpkgs-fmt
    nodejs_22
    pnpm
  ];

  shellHook = ''
    echo "----------------------------------------"
    echo "backend: Installing pnpm dependencies..."
    cd backend
    pnpm install
    cd ..
    echo "----------------------------------------"

    echo "-----------------------------------------"
    echo "frontend: Installing pnpm dependencies..."
    cd frontend
    pnpm install
    cd ..
    echo "-----------------------------------------"
  '';
}
