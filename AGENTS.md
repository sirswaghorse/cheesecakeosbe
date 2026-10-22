# Project rules
- Keep store catalog metadata in a dedicated module and derive launchability from the app registry, so unavailable placeholders cannot be installed.
- Keep built-in app protection in the catalog helper and use it for store actions, so system apps remain protected as the catalog changes.
- Keep browser system preferences separate from account preferences and mark Linux-only controls as inactive until a native integration exists, so saved choices never imply operating-system changes.
- Reuse shared projection controls for Control Panel and the taskbar; only use supported browser APIs for monitor discovery and full screen, because websites cannot directly configure monitors or initiate generic casting.- Store user files on-device (IndexedDB via src/lib/localFs.ts) and the user profile locally; cloud accounts are optional sync only, so the OS works without sign-in like a real Linux desktop.
