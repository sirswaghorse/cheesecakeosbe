# Building the Cheesecake OS ISO

Produces a bootable USB/DVD image that starts straight into Cheesecake OS and can install itself to disk.

## Option A: GitHub Actions (no local Linux machine needed)

The repository includes `.github/workflows/build-iso.yml`, which builds the ISO on GitHub's cloud runners.

1. Push the project to a GitHub repository (Lovable's GitHub sync works).
2. In GitHub, open the **Actions** tab and select **Build Cheesecake OS ISO**.
3. Click **Run workflow** (it also runs automatically when `linux/` or `src-tauri/` changes on `main`).
4. Wait for the run to finish (roughly 30–90 minutes: Rust compile plus live-build).
5. Open the finished run and download the **cheesecake-os-blueberry-iso** artifact (a zip containing the `.iso`). Artifacts are kept for 14 days.

The workflow compiles the Tauri `.deb` on an Ubuntu runner, then runs `linux/iso/build-iso.sh` inside a privileged Debian bookworm container, so no local setup is required.

## Option B: Local Debian build

### Needs
- A Debian 12 (bookworm) or newer machine (a VM is fine), about 10 GB free.
- `sudo apt install live-build` plus the Tauri prerequisites (`npm run tauri:doctor`).

### Steps
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
