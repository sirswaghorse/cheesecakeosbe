# Building the Cheesecake OS ISO

Produces a bootable USB/DVD image that starts straight into Cheesecake OS and can install itself to disk.

## Needs
- A Debian 12 (bookworm) or newer machine (a VM is fine), about 10 GB free.
- `sudo apt install live-build` plus the Tauri prerequisites (`npm run tauri:doctor`).

## Steps
1. `npm run tauri:deb` — builds the Cheesecake OS app package.
2. `npm run iso:build` — builds the image into `build/iso/*.iso` (20–60 minutes).
3. Flash it with BalenaEtcher/Rufus, or boot it in a VM first.

## What the image does
- Boots a live session that logs in automatically as `user` into Cheesecake OS (Openbox, full screen). Auto-login applies only to this image, never to the user-level test session files.
- Cheesecake OS is the only desktop session installed.
- Includes Thunar (Documents), NetworkManager, PipeWire audio and the Calamares installer for install-to-disk.

## Not done yet
- Untested on real hardware; no boot splash or Calamares branding yet.
- There is no Start-menu shortcut to launch the installer yet.
