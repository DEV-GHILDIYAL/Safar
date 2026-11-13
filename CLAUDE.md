# Safar — agent guide (single source of truth)

Safar is a personal, fully offline Android travel planner. A **trip** is a story made of **chapters**
(train, flight, bus, cab, stay, activity, food, note) shown on a vertical timeline; chapters hold photo **memories**.
No backend, no login. Package `com.devghildiyal.safar`.

## Stack (do not deviate)
Expo SDK 58 + TypeScript, expo-router (routes in `src/app/`), react-native-reanimated 4 + worklets,
react-native-gesture-handler, expo-sqlite, expo-image-picker, expo-file-system (`File`/`Directory`/`Paths` API),
expo-haptics, zustand. No UI kit: custom components only. Android only.
Install packages with `npx expo install <pkg>`. `.npmrc` sets `legacy-peer-deps=true` (react-dom peer conflict).

## Folder structure
```
src/app/          routes only (screens). _layout.tsx boots DB + stack; (tabs)/ = Home/Trips/Memories/Profile
                  Tab screens pad bottom + offset FABs with useTabBarSpace()
src/components/   shared UI (see docs/ARCHITECTURE.md for the list)
src/db/           client.ts (open + migrations), trips.ts, chapters.ts, memories.ts (SQL only)
src/store/        zustand stores; the only callers of src/db
src/lib/          pure helpers: dates, photos (file IO), haptics, transition
src/theme/        tokens.ts (colors/space/radius/type/motion), chapterTypes.ts
src/types.ts      domain types (camelCase)
docs/             ARCHITECTURE.md
scripts/          gen-icons.mjs (regenerates assets/*.png icon + splash; node, no deps)
```

## Conventions
- Function components, named exports (route files use default export). PascalCase components, camelCase rest.
- Import via `@/` alias (`@/components/Text`). No relative `../..` across top-level folders.
- DB rows are snake_case; repos map them to camelCase types in `src/types.ts`.
- All times are epoch ms integers. Trip dates = local midnight. Format with `src/lib/dates.ts` only.
- Photos: store only the **filename** in DB; resolve with `photoUri(file)` from `src/lib/photos.ts`.
- Keep files < ~250 lines; split components when larger.

## Theme tokens
- Never hardcode colours/spacing in screens: use `colors`, `space`, `radius`, `type`, `motion` from `@/theme/tokens`.
- Text always via `<Text variant=...>` (display/title/heading/body/small/label).
- Chapter colour/icon/label only from `CHAPTER_TYPES` in `@/theme/chapterTypes`; tints via `tint(hex, alpha)`.
- One accent (`colors.accent`). Press feedback via `PressableScale`. Motion = timing + ease-out only, no springs/bounce.

## Data flow
screen -> zustand store action -> `src/db/*` repo -> SQLite. Store updates its state from repo results;
screens read state via selectors and never import `src/db` directly. File IO for photos lives in
`src/lib/photos.ts`, called by stores (delete files when rows are deleted).

## Token-saving rules
- Never run the emulator or native/Gradle builds (low-end laptop); the owner tests on a phone.
- DO run `npx tsc --noEmit` before every commit (it caught a crash code review missed).
  For bigger changes also `npx expo export --platform android` to verify bundling.
- No test files. Never read `node_modules` or lock files.
- Replies after a phase: max 3 lines. No long summaries.
- Docs: short and factual; update only changed sections, never rewrite whole files.
- New session: read CLAUDE.md + PROGRESS.md, resume from next unfinished phase.
- Don't ask questions; choose sensibly and log the decision in PROGRESS.md.

## Commit / release process
- After each phase: update PROGRESS.md, CHANGELOG.md, changed parts of docs/ARCHITECTURE.md, then
  `git add -A && git commit -m "phase N: <summary>" && git push`.
- Release: bump `expo.version` + `android.versionCode` in app.json, add CHANGELOG entry, commit, then
  `git tag vX.Y.Z && git push origin vX.Y.Z`. GitHub Actions (`.github/workflows/release.yml`) builds the
  APK and attaches it to a GitHub Release. Release builds are signed with the template's standard
  `debug.keystore` (prebuild default), so every APK has the same signature and installs over the old one.
