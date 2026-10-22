## Linux session and startup files

### What you get
- A **Cheesecake OS: Blueberry Edition** option at the Linux login screen, alongside the existing desktop.
- A full-screen Cheesecake session with a lightweight Linux window manager underneath, allowing native file-manager windows to work.
- An optional start-on-login entry for people who prefer to keep using their current Linux desktop.
- Installation, removal, recovery and testing instructions. Automatic login stays off; no login-manager settings are changed.

### Technical details
- Use an X11 session with Openbox, an existing display manager and a D-Bus session. Tauri is an application, not a window manager or Wayland compositor.
- Add session launch scripts and desktop entries, plus an explicit fullscreen launch argument for the Tauri host without expanding native permissions.
- Keep session installation a deliberate Linux administrator action; browser preview and ordinary native launches remain unchanged.
- Test startup prerequisite failures, argument handling, child-process cleanup and configuration boundaries with isolated tools. Actual login-screen, fullscreen and native-window behavior still require a real Linux desktop.

### Not included
Bootable ISO creation, automatic login, a new compositor, privileged services, or simulated Shutdown turning off the Linux computer.

