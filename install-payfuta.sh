#!/usr/bin/env bash
# One-command PayFuta install for Linux desktops.
# Builds the app with Docker, installs it, and puts a PayFuta shortcut on your Desktop.
#
#   ./install-payfuta.sh
set -e
cd "$(dirname "$0")"

# 1. Build the installers (skipped if already built)
DEB=$(ls release/*.deb 2>/dev/null | head -1)
if [ -z "$DEB" ]; then
  ./build-desktop-app.sh linux
  DEB=$(ls release/*.deb 2>/dev/null | head -1)
fi
if [ -z "$DEB" ]; then
  echo "Build did not produce a .deb installer — see output above."
  exit 1
fi

# 2. Install (adds PayFuta to the application menu with its icon)
echo
echo "==> Installing PayFuta (you may be asked for your password)..."
if command -v apt >/dev/null 2>&1; then
  sudo apt install -y "./$DEB"
else
  sudo dpkg -i "$DEB" || sudo rpm -i release/*.rpm 2>/dev/null
fi

# 3. Desktop shortcut
DESKTOP_DIR="$(xdg-user-dir DESKTOP 2>/dev/null || echo "$HOME/Desktop")"
ENTRY=/usr/share/applications/payfuta.desktop
# electron-builder names the entry after the executable if different — find it
if [ ! -f "$ENTRY" ]; then
  ENTRY=$(grep -l "PayFuta" /usr/share/applications/*.desktop 2>/dev/null | head -1)
fi

if [ -n "$ENTRY" ] && [ -d "$DESKTOP_DIR" ]; then
  cp "$ENTRY" "$DESKTOP_DIR/"
  BASENAME="$(basename "$ENTRY")"
  chmod +x "$DESKTOP_DIR/$BASENAME"
  # GNOME requires marking desktop launchers as trusted
  gio set "$DESKTOP_DIR/$BASENAME" metadata::trusted true 2>/dev/null || true
  echo
  echo "==> Desktop shortcut created: $DESKTOP_DIR/$BASENAME"
else
  echo
  echo "==> PayFuta installed. Find it in your application menu (shortcut copy skipped)."
fi

echo
echo "All done! Launch PayFuta from the desktop shortcut or your application menu."
