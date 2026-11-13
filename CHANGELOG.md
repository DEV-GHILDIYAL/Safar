# Changelog

## v0.1.3
- Release: bottom tabs (Home/Trips/Memories/Profile), offline profile, compact home cards, tab-switch crash fix.

## Phase 6.2
- Fix: app closing on tab switch (tab bar now uses expo-router 58's `navigateToTab`). Ref typing fixes.

## Phase 6.1
- Fix: app closing when switching tabs (removed tab scene fade). Error screens with retry instead of crashes.

## Phase 6
- Bottom navigation with 4 tabs: Home, Trips (search + filters), Memories (all photos), Profile (offline).
- Compact home hero and trip row cards for faster scanning.

## Phase 5
- Animated empty states, collapsing FAB on Home, generated app icon (adaptive + monochrome) and splash.

## Phase 4
- Memories: capture/upload per chapter, full-screen swipe viewer with captions + delete, per-trip grid.

## Phase 3
- GitHub Actions: on `v*` tag, prebuild + `assembleRelease`, attach `safar-<tag>.apk` to a GitHub Release.

## Phase 2
- Trip detail: collapsing cover header, stats, day-grouped timeline with drawing rail + now marker.
- Chapter add/edit bottom sheet, expand in place, mark done, reorder, delete.

## Phase 1
- SQLite schema + migrations, trip/chapter/memory repos, zustand stores, photo file helpers.
- Home (hero with next chapter + countdown, upcoming, past), trip create/edit/delete with cover photo.

## Phase 0
- Expo SDK 58 + expo-router scaffold, dark theme tokens, chapter type palette, base components, docs.
