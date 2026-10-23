#!/bin/sh
# Build a bootable Cheesecake OS: Blueberry Edition live/installer ISO.
# Requires a Debian (bookworm or newer) build machine with live-build, run as root.
# Usage: sudo linux/iso/build-iso.sh [path/to/cheesecake-os.deb]
set -eu

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ISO_DIR="$ROOT/linux/iso"
WORK="${CHEESECAKE_ISO_WORK:-$ROOT/build/iso}"
DIST="${CHEESECAKE_ISO_DIST:-bookworm}"

[ "$(id -u)" -eq 0 ] || { echo "build-iso: run as root (live-build needs it)" >&2; exit 1; }
command -v lb >/dev/null 2>&1 || { echo "build-iso: install live-build first: apt install live-build" >&2; exit 1; }

DEB="${1:-$(ls "$ROOT"/src-tauri/target/release/bundle/deb/*.deb 2>/dev/null | head -n 1 || true)}"
[ -n "$DEB" ] && [ -f "$DEB" ] || { echo "build-iso: no .deb found; run 'npm run tauri:deb' first" >&2; exit 1; }

rm -rf "$WORK"
mkdir -p "$WORK"
cp -a "$ISO_DIR/config" "$WORK/config"

# App package and the session files from linux/session.
mkdir -p "$WORK/config/packages.chroot"
cp "$DEB" "$WORK/config/packages.chroot/"
INC="$WORK/config/includes.chroot"
mkdir -p "$INC/usr/bin" "$INC/usr/share/xsessions" "$INC/usr/share/cheesecake-os/session"
install -m 0755 "$ROOT/linux/session/cheesecake-session" "$INC/usr/bin/cheesecake-session"
install -m 0644 "$ROOT/linux/session/cheesecake-os.desktop" "$INC/usr/share/xsessions/cheesecake-os.desktop"
install -m 0644 "$ROOT/linux/session/openbox-rc.xml" "$INC/usr/share/cheesecake-os/session/openbox-rc.xml"

cd "$WORK"
lb config \
  --distribution "$DIST" \
  --archive-areas "main contrib non-free-firmware" \
  --binary-images iso-hybrid \
  --debian-installer none \
  --iso-application "Cheesecake OS Blueberry Edition" \
  --iso-volume "CHEESECAKE_OS" \
  --bootappend-live "boot=live components quiet splash username=user hostname=cheesecake"
lb build

ISO="$(ls "$WORK"/*.iso | head -n 1)"
echo "build-iso: done -> $ISO"
