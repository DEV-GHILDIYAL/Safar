# Architecture

## DB schema (expo-sqlite, file `safar.db`)
Migrations in `src/db/client.ts` (append-only, tracked by `PRAGMA user_version`). `foreign_keys = ON`, WAL.
All times are epoch ms INTEGER.

| Table | Columns |
|---|---|
| `trips` | id PK, title, destination, start_date, end_date (local midnights), cover (filename, nullable), notes, created_at |
| `chapters` | id PK, trip_id → trips (CASCADE), type, title, start_at, end_at (nullable), from_place, to_place, booking_ref, notes, done (0/1), sort_order REAL, created_at |
| `memories` | id PK, chapter_id → chapters (CASCADE), trip_id → trips (CASCADE), file, caption, taken_at, created_at |

- trip 1—n chapters 1—n memories (`memories.trip_id` denormalised for the per-trip grid).
- `sort_order` starts as `start_at`; manual reorder swaps values within a day; editing the time resets it.
- Trip status (upcoming/current/past) is derived from dates in `lib/dates.ts`, never stored.

## Navigation map (expo-router, `src/app/`)
| Route | Screen |
|---|---|
| `/` | Home: hero (current, else next upcoming), Upcoming, Past, FAB |
| `/trip/new` | Trip form (create) |
| `/trip/[id]` | Trip detail (timeline) |
| `/trip/[id]/edit` | Trip form (edit/delete) |
| `/trip/[id]/memories` | Per-trip memories grid (3 cols) |
| `/viewer?tripId&chapterId?&index` | Full-screen swipeable photo viewer + caption (chapter or whole trip) |

## Photo storage
- Files live in `Paths.document/photos/<base36-time>-<rand>.<ext>` (expo-file-system `File`/`Directory`).
- DB stores only the filename; `photoUri(file)` resolves it. `savePhoto(uri)` copies picker output in.
- Stores delete files when trips/chapters/memories/covers are removed or replaced.

## Shared components (`src/components/`)
- `Text` — themed text with `variant` (display/title/heading/body/small/label).
- `Icon` — MaterialCommunityIcons wrapper; exports `IconName`.
- `PressableScale` — Pressable with spring scale + optional haptic.
- `Button` — primary/secondary/ghost/danger, icon, loading, compact.
- `IconButton` — round icon button.
- `FAB` — floating accent action button (optionally extended with label).
- `Card` — rounded surface container.
- `Screen` — full-screen dark container with optional safe top inset.
- `TextField` — labelled input with focus accent, optional icon, multiline.
- `DateField` — opens native Android date/time picker; optional clear.
- `CoverImage` — trip cover photo or seeded gradient fallback, optional bottom scrim.
- `TypeIcon` — round chapter-type icon (tinted or solid, check when done).
- `Pill` / `LiveDot` — small status pill; pulsing live dot.
- `TripCard` — trip list card (+ `useOpenTrip` for shared-element style navigation).
- `HeroTripCard` — large home card with next chapter + countdown.
- `TripForm` — create/edit trip with cover picker, dates, notes.
- `BottomSheet` — custom modal sheet (spring in, PanResponder drag-to-dismiss on handle).
- `TypePicker` — horizontal chapter-type chips.
- `ChapterSheet` / `useChapterSheet` — add/edit chapter form in a bottom sheet.
- `ChapterCard` — timeline row: type node + card that expands in place (done, reorder, edit, delete).
- `Timeline` — day groups, animated drawing rail, live "now" marker.
- `MemoryStrip` — chapter photo strip with Capture (camera) / Upload (gallery, multi) tiles.
- `TripHeader` / `TripTopBar` — collapsing parallax cover header (grows from tapped card) + floating top bar.

## Stores (`src/store/`)
`useTrips`, `useChapters` (byTrip), `useMemories` (byTrip). Helpers: `lib/timeline.ts` (groupByDay, findNext),
`lib/transition.ts` (card rect → detail header animation), `lib/useNow.ts`.
