

## Add "H Archive" App to the App Store

### What This Does
Adds a new app called "H Archive" with a red heart icon to the HS Apps store. When installed, it creates a desktop icon that opens a browser window loading `https://humper.furbit.social`.

### Steps

1. **Add to App Store catalog** (`src/apps/AppStore.tsx`)
   - Add an entry to `AVAILABLE_APPS` with id `h-archive`, name "H Archive", icon (red heart emoji), and category "Internet"

2. **Create the H Archive component** (`src/apps/HArchive.tsx`)
   - A simple iframe-based viewer (similar to the Browser app) that loads the target URL directly
   - Include the "Open in new tab" fallback in case the site blocks iframes

3. **Register in the app registry** (`src/config/apps.ts`)
   - Add the app config with appropriate default window size, the heart icon, and `desktopIcon: false` / `startMenu: false` initially (since it comes from the store)

4. **Make App Store installs create real desktop icons**
   - Currently the App Store "Get" button only updates local state and doesn't actually register new apps in the system
   - Update `WindowContext` or add a new context to track dynamically installed apps
   - Update `DesktopIcons` to also show dynamically installed apps
   - When "Get" is clicked in the store, the app becomes launchable and appears on the desktop

### Technical Details

- The H Archive app component will be an iframe wrapper similar to `Browser.tsx` but simplified (no address bar, just the content and an "open externally" button)
- The app registry already supports lazy-loaded components, so this fits the existing pattern
- For dynamic installs: store installed app IDs in React state (context-level) so `DesktopIcons` can render them. This keeps it session-based like the current store behavior.

