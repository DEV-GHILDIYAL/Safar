# Safar

A personal, offline travel planner for Android. Every trip is a story told in chapters —
trains, flights, stays, food and more — laid out on a vertical timeline, with photo memories attached.

## Features
- Trips with cover photo, dates and notes; status (upcoming / current / past) derived from dates.
- Home with a hero card for the current trip, next chapter and countdown.
- Day-by-day timeline of chapters with a live "now" marker; expand, mark done, reorder, edit, delete.
- Memories: capture or upload photos per chapter, full-screen viewer with captions, per-trip grid.
- Fully offline (SQLite + local files). No account, no backend.

## Install
Download the latest `safar-vX.Y.Z.apk` from the GitHub **Releases** page and open it on your phone
(allow "install unknown apps"). New releases install over the old one and keep your data.

## Run locally
```bash
npm install
npx expo run:android      # dev build on a device/emulator (Expo Go lacks some native modules)
```

## Cut a release
1. Bump `expo.version` and `expo.android.versionCode` in `app.json`; add a CHANGELOG entry.
2. Commit and push, then `git tag vX.Y.Z && git push origin vX.Y.Z`.
3. GitHub Actions builds the release APK and attaches it to a GitHub Release for that tag.
