## Offline desktop: local music first

### What you get
- Winamp loads music saved in browser Documents without signing in.
- No internet-hosted sample track; an empty library opens an empty playlist.
- Music remains available after reloading, and playback works without a connection once the desktop is loaded.
- Linux startup work remains deferred.

### Technical details
- Replace cloud audio queries with the existing on-device file store and Blob URLs.
- Clean up URLs on close, failure and desktop unmount; prevent duplicate launches.
- Add focused tests and verify uploading music, reloading and playing it with external networking blocked.

### Not included
Linux Music-folder access, installing the whole website for offline startup, or making internet browsing and Cheesecake AI work offline.

