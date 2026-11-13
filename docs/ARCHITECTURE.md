# Architecture

## DB schema (expo-sqlite, file `safar.db`)
_Added in phase 1._

## Navigation map (expo-router, `src/app/`)
| Route | Screen |
|---|---|
| `/` | Home |

## Photo storage
_Added in phase 1._

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
