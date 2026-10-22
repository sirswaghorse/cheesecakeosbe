# Cheesecake OS Linux session

Files in `linux/session/` let the compiled Tauri app run as a full-screen desktop on X11.

| File | Installs to | Purpose |
| --- | --- | --- |
| `cheesecake-session` | `/usr/bin/cheesecake-session` | Starts D-Bus (if missing), Openbox, then Cheesecake OS. Session ends when the app exits. |
| `openbox-rc.xml` | `/usr/share/cheesecake-os/session/` | Borderless fullscreen window, no Openbox menus or shortcuts. |
| `cheesecake-os.desktop` | `/usr/share/xsessions/` | Adds "Cheesecake OS (Blueberry Edition)" to the login screen. |
| `xinitrc.cheesecake` | (not installed) | Developer test launcher. |

Requirements: `openbox`, `dbus` (`dbus-run-session`), the installed `.deb` (`/usr/bin/cheesecake-os`).

## Test safely (nested window)

```sh
bun run tauri:deb && sudo apt install ./src-tauri/target/release/bundle/deb/*.deb
Xephyr :2 -screen 1280x800 &
DISPLAY=:2 CHEESECAKE_BIN=/usr/bin/cheesecake-os sh linux/session/xinitrc.cheesecake
```

## Install as a login-screen session (test machine)

```sh
sudo install -m 755 linux/session/cheesecake-session /usr/bin/
sudo install -Dm 644 linux/session/openbox-rc.xml /usr/share/cheesecake-os/session/openbox-rc.xml
sudo install -m 644 linux/session/cheesecake-os.desktop /usr/share/xsessions/
```

Choose the session from the login screen's session menu. Rollback: pick your normal desktop at login, or delete the three files above. Auto-login and default-session changes are intentionally not made; the future ISO will set those.

## Not yet verified
Session start/exit, Openbox window matching (`WM_CLASS` should be `cheesecake-os`) and logout behaviour need a real Linux X11 machine. Wayland sessions are not covered. In the browser, Start menu "Shut Down" stays a simulation.

## Shut Down
In the Linux app, Start menu "Shut Down" plays the shutdown screen, then calls the `exit_session` command, which exits the app; the session script then ends and the login screen returns. It does not power off the computer. If the exit fails, the simulated off screen is shown.
