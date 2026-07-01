# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Expo (React Native) app: "HSE Safety CPIN" — safety/HSE management mobile app (incidents, inspections, permits, HSE document modules, reporting, chat). No backend integration yet — all data is local mock data (`src/data/mockData.ts`).

## Commands

```bash
npm start          # expo start (Metro bundler, scan QR or press a/i/w)
npm run android     # expo start --android
npm run ios         # expo start --ios
npm run web         # expo start --web
```

No test runner, lint, or typecheck script is configured in package.json. To typecheck manually: `npx tsc --noEmit`.

If the running app shows stale UI after an edit (e.g. identical data across list items, old styles), it's usually a stale Metro bundle — restart `npm start` rather than assuming the code is wrong.

## Architecture

**Navigation** is two-layer (`src/navigation/`):
- `RootNavigator.tsx` — native-stack, holds `MainTabs` (the bottom tab group) plus full-screen pushed routes (detail screens, full dashboard, settings, HSE module create/detail).
- `BottomTabs.tsx` — bottom-tab group: Home, Laporan, HSE, Chat, More.
- `types.ts` — `RootStackParamList` / `BottomTabParamList` define all route params. When a screen needs new navigation params (e.g. callbacks like `onSave`/`onDelete` passed through route params), update this file first — it's the source of truth for what every screen receives.

**Path alias**: `@/*` → `src/*` (configured in both `tsconfig.json` and `babel.config.js` via `module-resolver`). Always import with `@/...`, not relative paths.

**Theming** (`src/theme/`):
- `colors.ts` exports `C` (and alias `Colors`) — a flat palette object, plus `GradientHeaders` (per-screen header gradient colors), `StatusMap`, `SeverityMap`, `RoleColors`.
- `typography.ts` exports `F` — font family keys mapping to the loaded Plus Jakarta Sans weights (loaded once in `App.tsx` via `useFonts`).
- Screens style with inline `StyleSheet.create({...})` at the bottom of the file referencing `C` and `F` — there is no separate design-system/component-style layer.

**Module metadata pattern**: `src/constants/hseJenis.ts` centralizes per-module-type config (`MODULE_META`: label/color/tint/icon per `SoP | WI | Form | Edukasi`) and `JENIS_OPTIONS` (category lists per module type). Both `HseScreen.tsx`, `HseModuleBuatScreen.tsx`, and `HseModulDetailScreen.tsx` key off this shared constant for consistent per-type coloring — extend it here rather than duplicating per-screen color maps.

**Screens vs components**: `src/screens/` are route-level screens (some are large — `HseScreen.tsx`, `HseModulDetailScreen.tsx`, `HomeScreen.tsx` each run 700-1000 lines, combining list/detail UI, inline edit modals, and full stylesheets in one file). `src/components/` holds the smaller reusable pieces (cards, badges, headers, sheets) shared across screens — prefer reusing/extending these over adding new ad-hoc UI inline in a screen.

**Mock data**: `src/data/mockData.ts` is the single source of fixture data consumed across screens; there is no API layer or state management library (no Redux/Zustand/Context store) — screen-local `useState` is the norm, and parent→child data flow for things like edit/delete goes through navigation route params/callbacks (see `HseModulDetail` params in `navigation/types.ts`).
