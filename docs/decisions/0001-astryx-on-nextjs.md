# 0001: Running Astryx on Next.js

Date: 2026-11-10

**Decision:** use Astryx in "dist" mode, the way Meta's `apps/example-nextjs` does. No StyleX build plugin, no Next.js features switched off.

**How it works:**
- `globals.css` imports `reset.css`, then `astryx.css`, then the neutral `theme.css`. The order matters, because each file sits in its own CSS layer.
- `Providers` is a client component, since `Theme` uses React context. It wraps the app in `<Theme>` and passes `next/link` to Astryx's `LinkProvider`, so Astryx links navigate client-side.
- `northfoldTheme` (in `packages/ui`) is `defineTheme({ extends: neutralTheme, tokens: { '--color-accent': [light, dark] } })`. Astryx stores a light/dark pair as `light-dark(light, dark)`.

**Gotcha found:** `packages/ui` must not install its own `react`. When it did, Next.js loaded two copies of React and the build failed with `Cannot read properties of null (reading 'useContext')`. React is a peer dependency of `packages/ui`, so the app provides it.

**Versions (pinned):** `@astryxdesign/core` 0.7.11, `@astryxdesign/theme-neutral` 0.7.11, `@astryxdesign/cli` 0.7.11, `next` 16.4.5, `react` 19.3.1. Core and theme must stay on the same release (`astryx upgrade` moves them together).

**Install scripts:** Astryx's postinstall only prints a "run astryx init" hint, so `pnpm-workspace.yaml` keeps it off (`allowBuilds: false`).
