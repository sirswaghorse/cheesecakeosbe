
# Fix: Internet App Search Bar Text Visibility

## Problem
The address bar input in the Browser app has a white background (`bg-white`) but inherits the global theme's white text color (`--foreground: 0 0% 100%`), making typed text invisible.

## Solution
Add an explicit dark text color to the input element so text is visible against the white background.

## Technical Details
- File: `src/apps/Browser.tsx` (line 42)
- Change: Add `text-black` (or inline `color: #000`) to the input's className
- This ensures the text contrasts properly with the white background regardless of the global theme
