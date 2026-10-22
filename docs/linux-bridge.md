# Cheesecake OS Linux bridge — first milestone

This is a Tauri v2 desktop **application running on an existing Linux installation**, not a bootable distribution or replacement window manager yet. The web preview remains fully usable without Tauri.

## Connected features

- Control Panel → System reads the Linux OS version, kernel, hostname and actual memory usage through Rust.
- Documents opens the current Linux user's configured Documents directory in the installed default file manager (Nemo, Thunar, Dolphin, etc.) through `xdg-open`.
- The command accepts only Documents, Pictures, Music, Videos or Downloads enum values. Rust resolves XDG user directories; callers cannot submit arbitrary paths or shell commands.
- Only the bundled local `main` webview has those two command permissions. Remote websites in browser/Uni AI/archive frames are not granted native IPC.

There is no privileged service, root access, shell plugin or listening HTTP bridge. Keep these boundaries when adding native features.

## Run on Linux

Use a regular desktop user, not root. Install Rust (stable, version 1.88 or newer), Bun, a default file manager, `xdg-utils`, and the [Tauri Linux prerequisites](https://v2.tauri.app/start/prerequisites/).

For Debian/Ubuntu, the usual native dependencies are:

```sh
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev librsvg2-dev libayatana-appindicator3-dev libdbus-1-dev pkg-config xdg-utils
```

Use your distribution's equivalent packages where appropriate. Ensure the Documents directory is configured and exists (normally managed by `xdg-user-dirs`). Do not start a separate Vite server on port 8080; Tauri starts it automatically.

From the repository root:

```sh
bun install
bun run tauri:info
bun run tauri:dev
```

The ordinary browser preview is still `bun run dev`.

## Validate and package

```sh
bun run test
bun run test:native
bun run tauri:build
```

The last command runs the frontend build and packages `.deb` and AppImage outputs under `src-tauri/target/release/bundle/`. The generated Cargo lockfile is included to pin resolved dependencies. These are application installers, not OS installer images.

### Native acceptance check

1. Launch the Tauri app on a real Linux desktop. Open Control Panel → System and compare the kernel and memory with the computer's own tools.
2. Open Documents from Start. Verify the default native file manager opens the actual configured Documents folder. Confirm files created there are visible to other Linux apps.
3. Verify a missing Documents folder or missing file manager produces an error rather than a success message.
4. Test Internet, Webamp, AI text/audio and cloud linking inside WebKitGTK before treating them as native-ready. WebKit embedding, media, microphone and OAuth behavior can differ from Chromium; cloud OAuth/deep-link handling is not implemented in this milestone.
5. Inspect generated Tauri permissions and confirm a remote or unpermitted webview cannot invoke either native command. No remote capability may be added.

## Not connected yet

Terminal, Task Manager and Computer remain browser-mode tools with their existing simulated values; installing Flatpak/native software, power controls, OS updates, display configuration, casting, login/session management and a bootable Linux image are not implemented.

The local display profile is not the Linux user account and does not rename it. Pictures, Video Player and browser file uploads still use browser storage. Existing browser files are **not** migrated into Linux folders. The native application has separate storage from the published website; it does not automatically inherit that website's files or login session.

## Validation in Lovable

The Tauri configuration was parsed by the CLI; JavaScript bridge tests and the browser Documents upload/reload flow passed. Native Rust tests were attempted but stopped at missing D-Bus development libraries; WebKitGTK 4.1 and a native desktop session are also absent. Native compilation, native Rust tests, file-manager launching and installer execution must be verified on a Linux machine before this milestone is called native-tested.