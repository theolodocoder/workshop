# 0002: Northfold design (M1)

Date: 2026-11-10. Approved by Promise.

Mockups: branch `mockups/m1` (throwaway, never merged). Screenshots and the inspiration list are in Promise's career folder at `career/applications/upwork/workshop/mockups-m1/`.

**Rulings (Promise):**
- **Accent: forest green.** `--color-accent` is `#2F6B4F` in light mode and `#6FBF95` in dark. Turned down: ember orange (it blurs with the yellow "Before" badges) and lake teal.
- **Layout approved as shown**, for all 7 screens: home with two doors, shop grid with category tabs, product, cart with a server-priced summary, my orders with "Try to break it", rescue report (score cards, then fix cards), and check your site. Small polish happens during the build (for example, score cards in rows of 3).
- **Product photos stay as they are**, even where a small real brand logo shows. Every photographer is credited and the banner says it's a demo. The home hero uses a photo with no logo (`hollow-pine-3-tent.jpg`).

**Calls made during mockups (Claude):**
- **Keep Astryx's plain neutral surfaces**, and set only the accent plus the text color on it (`--color-on-accent`: `#FFFFFF` light, `#0B2418` dark). Astryx's `color.accent` setting tints every background with the accent, which loses the clean Meta look. Overriding only `--color-accent` left white text on light green in dark mode, which was hard to read.
- **Icons: `@heroicons/react`**, the icon set Astryx's own templates use.
- **Don't call `stylex.create` in app code.** We run Astryx pre-built, without the StyleX compiler, so layout uses Astryx props plus plain inline styles.
- **Two banners:** before shows "Deliberately insecure demo. Fake data, resets every hour." Rescued shows "Demo store, not a real shop."
- **Footer credit:** "Built by Promise Okafor · Built on Astryx (MIT, by Meta) · Photos from Unsplash".
