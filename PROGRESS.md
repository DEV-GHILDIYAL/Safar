# Progress

## Phases
- [x] 0. Scaffold, theme tokens, navigation, base components, docs
- [ ] 1. SQLite schema + data layer, trip CRUD, Home screen
- [ ] 2. Trip detail timeline + chapter CRUD
- [ ] 3. GitHub Actions release workflow
- [ ] 4. Memories: capture, upload, viewer, per-trip grid
- [ ] 5. Animation/polish pass, empty states, icon + splash

## Current / next
Next: phase 1.

## Decisions
- Expo SDK 58 (latest at scaffold), RN 0.88, Reanimated 4.7 + worklets (babel plugin auto via babel-preset-expo).
- `.npmrc` `legacy-peer-deps=true`: expo-router's web deps pull react-dom with a stricter react peer.
- Routes in `src/app/`; `@/*` path alias to `src/*`.
- Accent colour saffron `#FF7A3D` on near-black `#0A0C10`; icons from MaterialCommunityIcons.
- No RNGH gesture APIs used (v3 API churn); swipe/drag via RN PanResponder or FlatList paging.

## Known issues
- None yet (nothing has been run; owner tests).
