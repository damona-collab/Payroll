#!/usr/bin/env bash
# Build PayFuta desktop installers using Docker (no Node.js needed on the host).
#
#   ./build-desktop-app.sh            # Linux installers (AppImage + .deb)
#   ./build-desktop-app.sh windows    # Windows installer (.exe, built via Wine)
#   ./build-desktop-app.sh all        # both
#
# Output lands in ./release/
set -e
cd "$(dirname "$0")"

TARGET="${1:-linux}"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker not found. Either install Docker, or install Node.js and run:"
  echo "  npm install && npm run dist:linux"
  exit 1
fi

run_build() {
  local image="$1" cmd="$2"
  docker run --rm \
    -v "$PWD":/project \
    -v payfuta-node-modules:/project/node_modules \
    -w /project \
    "$image" \
    /bin/bash -c "npm install && $cmd"
}

case "$TARGET" in
  linux)
    echo "==> Building Linux installers (AppImage + .deb)..."
    run_build electronuserland/builder "npm run dist:linux"
    ;;
  windows)
    echo "==> Building Windows installer (.exe) via Wine..."
    run_build electronuserland/builder:wine "npm run dist:win"
    ;;
  all)
    echo "==> Building Linux installers..."
    run_build electronuserland/builder "npm run dist:linux"
    echo "==> Building Windows installer..."
    run_build electronuserland/builder:wine "npm run dist:win"
    ;;
  *)
    echo "Usage: $0 [linux|windows|all]"
    exit 1
    ;;
esac

echo
echo "Done! Installers are in ./release/"
ls -lh release/ 2>/dev/null | grep -Ev "^total|/$" || true
echo
echo "To install on this Linux machine:"
echo "  sudo apt install ./release/namibia-payroll_1.0.0_amd64.deb   # adds PayFuta to your app menu"
echo "  # or run the AppImage directly:"
echo "  chmod +x release/PayFuta-1.0.0.AppImage && ./release/PayFuta-1.0.0.AppImage"
