# Workshop + Northfold Outfitters Rescue: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `workshop` monorepo and project 1, a live before/after "app rescue" of a fake AI-built outdoor shop (Northfold Outfitters), ready for Promise to test locally and approve for deploy.

**Architecture:** A pnpm + Turborepo monorepo. Two Next.js apps (`rescue-before`, frozen after M2, and `rescue`, which starts as a copy and gets one commit per fix) each talk to their own Supabase stack. Shared seed data and AI helpers live in `packages/`. CI runs lint, types, Vitest, Playwright + axe and Lighthouse CI, and a release script turns measured results into `results.json` for the report page.

**Tech Stack:** Node 22 LTS, pnpm 9, Turborepo, Next.js (latest stable, App Router), React 19, TypeScript (strict), Astryx (`@astryxdesign/core` + `@stylexjs/stylex` + `@astryxdesign/theme-neutral` + `@astryxdesign/cli`, exact versions pinned), Supabase (CLI local stacks, Postgres, Auth anonymous sign-in, RLS), Zod, Vitest, Playwright + `@axe-core/playwright`, Lighthouse CI, Cloudflare Workers AI REST, Google PageSpeed Insights API v5, GitHub Actions.

**Spec:** `career/applications/upwork/workshop/2026-11-10-workshop-design.md` (approved by Promise 2026-11-10). Read both.

**Repo location:** `/Users/promiseokafor/Desktop/Workspaces/prodev/workshop` (new `git init`, **no remote** until Promise's go in Task 27).

## Global Constraints

- **Commits:** small, one change each, conventional prefix (`feat:`, `fix:`, `test:`, `chore:`, `docs:`), plain English. **No `Co-Authored-By` or any AI attribution line** (Promise's OSS rule). Commit only the files the task names (`git commit -- <paths>`).
- **Nothing leaves the machine** (no `git push`, no deploy, no account creation) until Promise has tested locally and said go. Accounts and keys are Promise's setup tasks.
- **Every milestone ends with an explainer pack** in `docs/explainers/<milestone>.md`: (1) a Mermaid diagram of the parts and data flow, (2) a walk-through he can say on a call, (3) each decision with the alternatives turned down, (4) "questions a client might ask, and your answers". Then Promise tests locally before the next milestone starts.
- **UI rule:** no screen is built before Promise approves its mockup (Task 6).
- **Astryx:** pin exact versions. Credit "Built on Astryx (MIT, by Meta)" in the footer and README. Never use Meta's name, logo or the Astryx wordmark as our branding. If setup fights back, copy Meta's `apps/example-nextjs` setup exactly (up to 1 extra day). No lookalike fallback.
- **Data:** seeded fake data only. Banner on both shops: "Demo store, not a real shop." Extra banner on before: "Deliberately insecure demo. Fake data, resets hourly."
- **No secret ever ships in a client bundle**, including in `rescue-before`: its deployed service-key variable holds a dummy value.
- **Numbers:** only measured values from CI, with method and date. If missing, show "Not measured yet." Never type a number in by hand.
- **Free tiers only.** URL check: **3 per visitor per day**, plus a global daily cap of **200**.
- **Copy:** plain, warm, no buzzwords, no em dashes. Any public text (README, portfolio, video script) is shown to Promise before use.

## Review Focus

1. **The URL check gets a hostile address** (IP literal, `localhost`, a domain that resolves to a private IP, a redirect to one, `file:`/`ftp:`, a non-80/443 port). Expected: refused with a plain message and nothing fetched. Tests in Task 22.
2. **The Supabase project is paused or down.** Expected: the rescued shop shows a friendly "Store is waking up, try again in a minute" state, not a blank page or a stack trace. Test in Task 15.
3. **The same visitor opens several tabs or comes back tomorrow.** Expected: one anonymous session is reused (no new user per tab), and their own orders stay visible to them. Test in Task 12.
4. **A tampered cart** (qty 0, negative, 1000, unknown product id, edited price). Expected: the server rejects it or recomputes it, never trusts it. Tests in Tasks 12–13.
5. **The AI allowance runs out or Workers AI errors.** Expected: `/check` still shows the ranked PageSpeed and header results, with "AI summary unavailable today". Test in Task 24.

---

## M0: Repo skeleton

### Task 1: Monorepo, tooling and CI

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.gitignore`, `.nvmrc` (`22`), `.editorconfig`
- Create: `packages/config/{package.json,tsconfig.base.json,eslint.config.mjs,prettier.config.mjs}`
- Create: `.github/workflows/ci.yml` (on push/PR: `pnpm install --frozen-lockfile`, `pnpm turbo run lint typecheck test`)

**Interfaces:**
- Produces: root scripts `lint`, `typecheck`, `test`, `e2e`, `build`, `dev`. Every app/package extends `@workshop/config/tsconfig.base.json` (strict) and `@workshop/config/eslint`.

- [ ] **Step 1:** `git init`, add the files, and create an empty `packages/config`. Workspace globs: `apps/*`, `packages/*`.
- [ ] **Step 2:** Run `pnpm install && pnpm turbo run lint typecheck`. Expected: exits 0 (no packages with code yet).
- [ ] **Step 3:** Run `npx actionlint .github/workflows/ci.yml`. Expected: no errors.
- [ ] **Step 4:** Commit: `chore: set up pnpm + turborepo workspace and CI`

### Task 2: Astryx spike in `apps/rescue`

**Files:**
- Create: `apps/rescue/` from Meta's `apps/example-nextjs` layout (`next.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, generated theme module from `npx @astryxdesign/cli theme add neutral`)
- Create: `packages/ui/{package.json,src/theme.ts,src/index.ts}`
- Create: `apps/rescue/e2e/smoke.spec.ts`, `apps/rescue/playwright.config.ts`

**Interfaces:**
- Produces: `packages/ui` exports `northfoldTheme` (`defineTheme({ extends: neutral, ... })` with one outdoor accent color, the token values to be set in Task 6) and re-exports `Theme` from `@astryxdesign/core/theme`.

- [ ] **Step 1: Failing test** `smoke.spec.ts`: `test('home renders an Astryx button with the Northfold theme')` visits `/`, expects `getByRole('button', { name: 'Shop gear' })` to be visible, and expects `document.documentElement` to carry the theme class or attribute the Astryx `<Theme>` sets.
- [ ] **Step 2:** Run `pnpm --filter rescue e2e`. Expected: FAIL (no app).
- [ ] **Step 3:** Install the pinned Astryx packages and run `npx @astryxdesign/cli init`. Render `<Theme theme={northfoldTheme}>` with one `Button`. If the build breaks, copy the example's `next.config` and StyleX setup exactly.
- [ ] **Step 4:** Run `pnpm --filter rescue build && pnpm --filter rescue e2e`. Expected: PASS. Note any Next.js feature that had to be switched off in `docs/decisions/0001-astryx-on-nextjs.md`.
- [ ] **Step 5:** Commit: `chore: run Astryx on Next.js with the Northfold theme`

### Task 3: Catalog package and product photos

**Files:**
- Create: `packages/catalog/{package.json,src/types.ts,src/products.ts,src/index.ts}`
- Create: `assets/northfold/manifest.json`, `scripts/fetch-images.mjs`
- Test: `packages/catalog/src/products.test.ts`

**Interfaces:**
- Produces:
  - `type Category = 'tents' | 'packs' | 'footwear' | 'sleep' | 'cooking' | 'clothing'`
  - `type Product = { id: string; slug: string; name: string; category: Category; priceCents: number; description: string; image: { file: string; width: number; height: number; credit: { name: string; url: string } } }`
  - `products: readonly Product[]` (40 items), `getProduct(slug: string): Product | undefined`

- [ ] **Step 1: Failing test** `products.test.ts`:
  - `expect(products).toHaveLength(40)`
  - slugs and ids are unique
  - every `priceCents` is an integer between `500` and `90000`
  - every `image.file` exists under `assets/northfold/`
  - every credit has a non-empty `name` and an `https://unsplash.com/` `url`
- [ ] **Step 2:** Run `pnpm --filter @workshop/catalog test`. Expected: FAIL.
- [ ] **Step 3:** Write 40 fictional products (names must not match real brands' products). Build `manifest.json` (Unsplash photo id, photographer, url), and write `fetch-images.mjs` to download each photo at 2000px wide, JPEG quality 85, into `assets/northfold/`. **Show Promise the 40-photo list and get his OK before running the download.**
- [ ] **Step 4:** Run the fetch script, then the test. Expected: PASS. Total `assets/northfold` size is under 30 MB.
- [ ] **Step 5:** Commit: `feat: add Northfold catalog with 40 credited photos`

### Task 4: Two local Supabase stacks, schema and seed

**Files:**
- Create: `supabase/before/{config.toml,migrations/0001_shop.sql,seed.sql}` (ports `5442x`)
- Create: `supabase/rescue/{config.toml,migrations/0001_shop.sql,seed.sql}` (default ports `5432x`)
- Create: `scripts/gen-seed.mjs` (writes both `seed.sql` files from `@workshop/catalog`)
- Test: `supabase/tests/seed.test.ts` (Vitest, uses `pg` against each local DB)

**Interfaces:**
- Produces (same in both stacks):
  - `products(id text pk, slug text unique, name text, category text, price_cents int, description text, image_file text)`
  - `profiles(id uuid pk references auth.users, display_name text)`
  - `orders(id uuid pk default gen_random_uuid(), user_id uuid references auth.users, status text default 'placed', total_cents int, created_at timestamptz default now())`
  - `order_items(order_id uuid references orders on delete cascade, product_id text references products, qty int, unit_price_cents int)`
  - Seeded shoppers with fixed UUIDs, exported from `packages/catalog/src/shoppers.ts` as `SHOPPERS = { ada: { id: '00000000-0000-4000-a000-00000000ada1', name: 'Ada' }, ben: { id: '00000000-0000-4000-a000-00000000be01', name: 'Ben' } }`. Each has 2 orders. Ben's order `00000000-0000-4000-b000-0000000000b1` is the "Try to break it" target.
- At this point both migrations are identical with **RLS off**. Task 10 changes only `supabase/rescue`.

- [ ] **Step 1: Failing test** `seed.test.ts`: for each stack, `select count(*) from products` = `40`, Ben's target order exists with ≥1 item, and the anonymous sign-in setting is on (`config.toml` `[auth] enable_anonymous_sign_ins = true`, asserted by reading the file).
- [ ] **Step 2:** Run it. Expected: FAIL. (Prerequisite: Docker Desktop running. If Promise doesn't have Docker, stop and ask him.)
- [ ] **Step 3:** Write the migrations, `gen-seed.mjs` and configs. Run `supabase start --workdir supabase/before` and `--workdir supabase/rescue`.
- [ ] **Step 4:** Run `pnpm gen:seed && supabase db reset --workdir supabase/before && supabase db reset --workdir supabase/rescue && pnpm vitest run supabase/tests`. Expected: PASS.
- [ ] **Step 5:** Commit: `feat: add local Supabase stacks with shop schema and seed`

### Task 5: M0 explainer
- [ ] **Step 1:** Write `docs/explainers/m0-monorepo.md`: diagram (apps → packages → Supabase stacks → CI), why pnpm + Turborepo over Nx, why two stacks, how to run it.
- [ ] **Step 2:** Promise runs `pnpm install && pnpm dev` and opens the spike page. Wait for his OK.
- [ ] **Step 3:** Commit: `docs: explain the monorepo setup`

## M1: Design

### Task 6: Inspiration, mockups and approval (no product code)
- [ ] **Step 1:** Collect 6–10 references (Dribbble or Behance outdoor stores and audit/report pages), plus Astryx's own templates, and show them to Promise.
- [ ] **Step 2:** Mock up, in the Astryx look: shop home, category, product, cart, my orders, the "Try to break it" panel, `/report`, `/check`, and the home with two doors. Also set the `northfoldTheme` accent values.
- [ ] **Step 3:** Promise approves (or asks for changes). Record his rulings in `docs/decisions/0002-northfold-design.md`.
- [ ] **Step 4:** Set the approved token values in `packages/ui/src/theme.ts`. Commit: `feat: set the approved Northfold theme`

## M2: The "before" shop

### Task 7: `rescue-before` shop with the planted problems

**Files:**
- Create: `apps/rescue-before/` (self-contained: copies catalog JSON and styles in, **no `@workshop/*` imports** except `@workshop/config` dev tooling). Pages: `/`, `/c/[category]`, `/p/[slug]`, `/cart`, `/orders`. Plus `lib/supabase.ts` and `components/DemoSignIn.tsx`.
- Test: `apps/rescue-before/e2e/shop.spec.ts`

**Interfaces:**
- Produces the 9 planted problems from the spec table, written the way an AI builder would:
  1. RLS off
  2. `lib/supabase.ts` does `createClient(url, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)` (the deployed value is a dummy)
  3. checkout inserts `orders.total_cents` computed in the browser
  4. no error states
  5. no validation
  6. no tests beyond this smoke flow
  7. raw `<img>` of the 2000px files, all data fetched client-side in `useEffect`, a chart library imported on every page
  8. clickable `div`s, missing labels, low-contrast text
  9. no security headers
- `DemoSignIn` calls `supabase.auth.signInAnonymously()` once and reuses an existing session if there is one.

- [ ] **Step 1: Failing test** `shop.spec.ts`: `test('a demo shopper can browse, add a tent, check out and see the order')`, asserting that the order appears on `/orders` with the right item name.
- [ ] **Step 2:** Run `pnpm --filter rescue-before e2e`. Expected: FAIL.
- [ ] **Step 3:** Build the pages from the approved mockups, with the planted problems above.
- [ ] **Step 4:** Run e2e. Expected: PASS.
- [ ] **Step 5:** Commit: `feat: build the before shop as a typical AI-built app`

### Task 8: "Try to break it" on before, then freeze

**Files:**
- Create: `apps/rescue-before/components/TryToBreakIt.tsx`
- Test: `apps/rescue-before/e2e/break.spec.ts`

**Interfaces:**
- Consumes: `BEN_TARGET_ORDER_ID = '00000000-0000-4000-b000-0000000000b1'` and the shopper ids, **copied** into `apps/rescue-before/lib/constants.ts` (before never imports `@workshop/catalog`). `apps/rescue` imports them from `@workshop/catalog` after Task 9.
- Produces: `TryToBreakIt` runs the client query `supabase.from('orders').select('id,total_cents,order_items(product_id,qty)').eq('id', BEN_TARGET_ORDER_ID)` as the visitor and shows the result or "Blocked". Task 14 copies the same component unchanged into `rescue`, so the difference comes only from the database.

- [ ] **Step 1: Failing test:** `test('before: a demo shopper can read Ben\'s order')` signs in, clicks "Try to break it", and expects text `Ben's order` with a total.
- [ ] **Step 2:** Run it. Expected: FAIL. **Step 3:** Implement. **Step 4:** Run it. Expected: PASS.
- [ ] **Step 5:** Write `docs/explainers/m2-before-shop.md` (each planted problem: what an AI builder does, why it's dangerous). Promise tests locally.
- [ ] **Step 6:** Commit `feat: add Try to break it to the before shop`, then `git tag before-frozen`. From here on, any change under `apps/rescue-before/` or `supabase/before/` needs Promise's OK.

## M3: Rescue, security

### Task 9: Start the rescue from the before code
- [ ] **Step 1:** Copy `apps/rescue-before/*` over `apps/rescue/` (keep `rescue`'s package name, Astryx setup and `e2e/smoke.spec.ts`), and point it at the `supabase/rescue` stack.
- [ ] **Step 2:** Run `pnpm --filter rescue e2e`. Expected: `shop.spec.ts` and `break.spec.ts` PASS (same bugs, same behavior).
- [ ] **Step 3:** Commit: `chore: start the rescue from the before shop`

### Task 10: Fix 1, row-level security

**Files:**
- Create: `supabase/rescue/migrations/0002_rls.sql`
- Test: `supabase/tests/rls.test.ts`

- [ ] **Step 1: Failing test** `rls.test.ts`, using supabase-js as two signed-in anonymous users A and B against the rescue stack:
  - A selecting B's order returns `[]`
  - A cannot `update` or `delete` B's order (0 rows)
  - A can select their own orders
  - anyone can select products
  - nobody can insert into `products`
- [ ] **Step 2:** Run it. Expected: FAIL.
- [ ] **Step 3:** Enable RLS on all four tables, with policies: products `select` to `anon, authenticated`; orders, order_items and profiles readable only where `auth.uid() = user_id` (through the order for items); no direct `insert` on orders (Task 12 adds the RPC).
- [ ] **Step 4:** Run it. Expected: PASS. Change `break.spec.ts` in `rescue` to expect "Blocked" and run it. Expected: PASS.
- [ ] **Step 5:** Commit: `fix: lock orders to their owner with row-level security`

### Task 11: Fix 2, no secrets in the browser

**Files:**
- Modify: `apps/rescue/lib/supabase.ts` → split into `lib/supabase/browser.ts` (anon key only) and `lib/supabase/server.ts` (`import 'server-only'`, cookie session via `@supabase/ssr`)
- Create: `scripts/check-client-secrets.mjs`
- Test: `scripts/check-client-secrets.test.ts` (with fixtures in `scripts/fixtures/{clean,leaky}/`)

**Interfaces:**
- Produces: `checkClientSecrets(dir: string): { file: string; match: string }[]`, which flags `SERVICE_ROLE`, JWTs whose payload has `"role":"service_role"`, and `sk_live_`/`sk_test_` keys. CLI exits 1 on any finding. CI runs it on `apps/rescue/.next/static` after the build.

- [ ] **Step 1: Failing tests:** `leaky` fixture → 1 finding with the file name. `clean` fixture → `[]`.
- [ ] **Step 2:** Run them. Expected: FAIL. **Step 3:** Implement the scanner and the client split. **Step 4:** Run `pnpm --filter rescue build && node scripts/check-client-secrets.mjs apps/rescue/.next/static` (expected exit 0), and run the tests (expected PASS). Add the step to `ci.yml`.
- [ ] **Step 5:** Commit: `fix: keep Supabase secrets on the server and scan bundles in CI`

### Task 12: Fix 3, server-priced checkout

**Files:**
- Create: `supabase/rescue/migrations/0003_place_order.sql`, `apps/rescue/app/cart/actions.ts`
- Test: `supabase/tests/place-order.test.ts`, `apps/rescue/e2e/session.spec.ts`

**Interfaces:**
- Produces:
  - SQL `place_order(items jsonb) returns uuid`, `security definer`, `search_path = public`. Items are `[{product_id text, qty int}]`. It prices each line from `products.price_cents`, rejects `qty` outside `1..10`, unknown products and empty carts, and allows at most **5 orders per user per hour** (otherwise it raises `rate_limited`).
  - Server action `placeOrder(lines: CartLine[]): Promise<{ orderId: string } | { error: 'invalid_cart' | 'rate_limited' | 'unavailable' }>`.
- [ ] **Step 1: Failing tests** `place-order.test.ts`:
  - the total equals the sum of DB prices × qty, even if the caller sends `price_cents: 1` in an item
  - `qty 0`, `-1`, `1000` and an unknown id are rejected
  - the 6th order within an hour is `rate_limited`

  `session.spec.ts`: opening two tabs gives the same `auth.uid()`, and the visitor's order is visible on `/orders` after a reload.
- [ ] **Step 2:** Run them. Expected: FAIL. **Step 3:** Implement. Checkout calls `placeOrder` and never sends a total. **Step 4:** Run them. Expected: PASS.
- [ ] **Step 5:** Commit: `fix: price orders on the server and rate-limit checkout`

### Task 13: Fix 5, validate every input

**Files:**
- Create: `apps/rescue/lib/schemas.ts`
- Modify: every server action and route handler in `apps/rescue`
- Test: `apps/rescue/lib/schemas.test.ts`

**Interfaces:**
- Produces: `CartLine = z.object({ productId: z.string().min(1).max(64), qty: z.number().int().min(1).max(10) })`, `Cart = z.array(CartLine).min(1).max(20)`, `CheckUrl = z.string().trim().max(2048).url()`.
- [ ] **Step 1: Failing tests:** `Cart.safeParse` rejects `[]`, qty `0`/`11`/`1.5`, a 65-char id and 21 lines, and accepts a valid 2-line cart.
- [ ] **Step 2:** Run them. Expected: FAIL. **Step 3:** Implement, and parse at every server boundary (invalid → `{ error: 'invalid_cart' }`). **Step 4:** Run them. Expected: PASS.
- [ ] **Step 5:** Commit: `fix: validate every server input with Zod`

### Task 14: M3 explainer
- [ ] **Step 1:** Write `docs/explainers/m3-security.md`: an RLS diagram (browser → PostgREST → policy → row), the service-key story, why prices live on the server, and client Q&A (e.g. "Is RLS enough on its own?").
- [ ] **Step 2:** Promise runs both shops locally and clicks "Try to break it" on each. Wait for his OK.
- [ ] **Step 3:** Commit: `docs: explain the security fixes`

## M4: Rescue, quality

### Task 15: Fix 4, errors, loading and empty states

**Files:**
- Create: `apps/rescue/app/{error.tsx,loading.tsx,not-found.tsx}`, `apps/rescue/app/orders/{loading.tsx,empty-state.tsx}`, `apps/rescue/components/StoreWaking.tsx`
- Test: `apps/rescue/e2e/errors.spec.ts`

- [ ] **Step 1: Failing tests** (with Playwright route interception or `SUPABASE_URL` pointed at a closed port, under a test-only flag):
  - `test('store down shows the waking-up message and a retry button')` expects text `Store is waking up` and a `Retry` button, and no Next.js error overlay text
  - `test('no orders shows the empty state')`
  - `test('unknown product slug shows not-found')`
- [ ] **Step 2:** Run them. Expected: FAIL. **Step 3:** Implement. **Step 4:** Run them. Expected: PASS.
- [ ] **Step 5:** Commit: `fix: add error, loading and empty states`

### Task 16: Fix 8, accessibility

**Files:**
- Modify: components flagged by axe in `apps/rescue`
- Create: `apps/rescue/e2e/a11y.spec.ts`

- [ ] **Step 1: Failing test:** for each of `/`, `/c/tents`, `/p/<first slug>`, `/cart`, `/orders`, `/report`, `/check`, `AxeBuilder` with tags `wcag2a, wcag2aa, wcag22aa` reports **0 violations with impact `serious` or `critical`**. Plus a keyboard-only test: Tab from the top reaches "Skip to content", the main nav, and "Add to cart" on a product page, and Enter adds the item.
- [ ] **Step 2:** Run it. Expected: FAIL. **Step 3:** Fix with real buttons, labels, focus rings, contrast via theme tokens, and a skip link. **Step 4:** Run it. Expected: PASS.
- [ ] **Step 5:** Commit: `fix: make the shop work with keyboard and screen readers`

### Task 17: Fix 9, security headers

**Files:**
- Modify: `apps/rescue/next.config.ts` (`headers()`) and `apps/rescue/middleware.ts` (per-request nonce CSP)
- Test: `apps/rescue/e2e/headers.spec.ts`

- [ ] **Step 1: Failing test:** the response for `/` has `content-security-policy` containing `nonce-` and `frame-ancestors 'none'`, `strict-transport-security` with `max-age=63072000`, `x-content-type-options: nosniff`, and `referrer-policy: strict-origin-when-cross-origin`. The page has no CSP console errors.
- [ ] **Step 2:** Run it. Expected: FAIL. **Step 3:** Implement (allow Supabase and Astryx/StyleX needs in `connect-src`/`style-src`). **Step 4:** Run it. Expected: PASS.
- [ ] **Step 5:** Commit: `fix: send security headers with a nonce-based CSP`

### Task 18: Fix 6, the full test suite + M4 explainer
- [ ] **Step 1:** Add the missing flow tests to `apps/rescue/e2e/flows.spec.ts`: browse category → product → add 2 → change qty → remove → checkout → order shows the server total. Run them. Expected: PASS.
- [ ] **Step 2:** Make sure `ci.yml` runs `pnpm turbo run test e2e` with both Supabase stacks started in CI (`supabase start --workdir ...`). Run `npx actionlint`. Expected: clean.
- [ ] **Step 3:** Write `docs/explainers/m4-quality.md` and get Promise's local test OK.
- [ ] **Step 4:** Commit: `test: cover the main shopping flows end to end`

## M5: Rescue, speed + report

### Task 19: Fix 7, speed
- **Files:** Modify `apps/rescue` pages to server components with data from `lib/supabase/server.ts`, `next/image` with `sizes` for every product image, `next/font` for the theme font, the chart library removed or dynamically imported only where used, and `@next/bundle-analyzer` behind `ANALYZE=1`.
- [ ] **Step 1: Failing test** `apps/rescue/e2e/speed.spec.ts`:
  - the product page HTML contains the product name before any client JS runs (`page.route('**/*.js', r => r.abort())`, then the name is still visible)
  - every `<img>` on `/c/tents` has `srcset` and explicit `width`/`height`
- [ ] **Step 2:** Run it. Expected: FAIL. **Step 3:** Implement. **Step 4:** Run it. Expected: PASS.
- [ ] **Step 5:** Commit: `perf: render on the server, size images and split heavy code`

### Task 20: Lighthouse CI and `results.json`

**Files:**
- Create: `.github/workflows/lighthouse.yml` (on `deployment_status` success for both Vercel projects; `treosh/lighthouse-ci-action`, mobile, `numberOfRuns: 5`, uploads an artifact). Also `lighthouserc.json` (budgets as **warnings**), `scripts/collect-results.mjs`.
- Test: `scripts/collect-results.test.ts` (fixtures: two LHCI result folders)

**Interfaces:**
- Produces: `collectResults(beforeDir: string, afterDir: string, meta: { measuredAt: string; method: string; testCount: number; axe: { before: number; after: number } }): Results`, which writes `apps/rescue/content/results.json`.
- `type Metrics = { lcpMs: number; tbtMs: number; cls: number; jsKb: number; axeIssues: number }`
- `type Results = { measuredAt: string; method: string; before: Metrics; after: Metrics; testCount: number }`. It takes the **median** of the runs. `tbtMs` is labelled "lab stand-in for INP" in the UI.
- [ ] **Step 1: Failing test:** with a 5-run fixture where LCPs are `[4100, 3900, 4300, 4000, 4200]`, `before.lcpMs` is `4100`. The output validates against a Zod `Results` schema. A missing folder throws `no lighthouse results in <dir>`.
- [ ] **Step 2:** Run it. Expected: FAIL. **Step 3:** Implement. **Step 4:** Run it. Expected: PASS. Run `actionlint`. Expected: clean.
- [ ] **Step 5:** Commit: `feat: turn Lighthouse CI runs into measured results`

### Task 21: Rescue report and home with two doors

**Files:**
- Create: `apps/rescue/app/page.tsx` (two doors), `apps/rescue/app/report/page.tsx`, `apps/rescue/content/fixes.ts`, `apps/rescue/components/{FixCard,ResultsTable}.tsx`
- Test: `apps/rescue/e2e/report.spec.ts`

**Interfaces:**
- Produces: `type Fix = { id: 1|2|3|4|5|6|7|8|9; title: string; risk: string; fix: string; commit: string | null; test: string }` and `fixes: Fix[]` (9 items). `commit` stays `null` until Task 27.
- [ ] **Step 1: Failing tests:**
  - `/report` shows 9 fix cards
  - with `results.json` absent, it shows "Not measured yet"
  - with a fixture present, it shows the before and after LCP and the method text
  - a `null` commit shows "Link after release", not a broken link
  - home has links "Open the before shop" (to `NEXT_PUBLIC_BEFORE_URL`) and "Open the rescued shop"
  - if the before app's `/api/health` (added to `rescue-before` with Promise's OK, since it's frozen) doesn't answer within 3 s, the before door shows "Watch the clip instead", linking to the recorded video (spec: paused-project fallback)
- [ ] **Step 2:** Run them. Expected: FAIL. **Step 3:** Implement from the approved mockup. **Step 4:** Run them. Expected: PASS.
- [ ] **Step 5:** Write `docs/explainers/m5-speed-and-report.md` and get Promise's local test OK. Commit: `feat: add the rescue report and the two-door home`

## M6: Paste-your-URL check

### Task 22: Safe URL guard

**Files:**
- Create: `packages/ai/src/safe-url.ts`
- Test: `packages/ai/src/safe-url.test.ts`

**Interfaces:**
- Produces: `assertPublicUrl(input: string, lookup?: (host: string) => Promise<string[]>): Promise<URL>`. It throws `UnsafeUrlError` with `reason: 'scheme' | 'port' | 'private_ip' | 'unresolvable' | 'too_long'`. Only `http:`/`https:` and ports `80`/`443`/default are allowed. It rejects if **any** resolved address is in `127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16, 100.64.0.0/10, 0.0.0.0/8, ::1, fc00::/7, fe80::/10, ::ffff:<private v4>`.
- Also `fetchHeadersSafely(url: URL): Promise<Headers>`: a `HEAD` request (falling back to `GET` with the body cancelled), `redirect: 'manual'`, at most 3 hops, each hop re-checked with `assertPublicUrl`, a 10 s timeout.
- [ ] **Step 1: Failing tests:**
  - `http://127.0.0.1`, `http://localhost` (lookup → `['127.0.0.1']`), `http://[::1]`, `file:///etc/passwd`, `http://example.com:8080`, and a host resolving to `['93.184.216.34','10.0.0.5']` are each rejected with the right reason
  - `https://example.com` (lookup → public IP) resolves
  - a redirect from public to `http://169.254.169.254/` is rejected (mocked `fetch`)
- [ ] **Step 2:** Run them. Expected: FAIL. **Step 3:** Implement. **Step 4:** Run them. Expected: PASS.
- [ ] **Step 5:** Commit: `feat: add a guard that only fetches public URLs`

### Task 23: Daily caps

**Files:**
- Create: `supabase/rescue/migrations/0004_check_quota.sql`, `packages/ai/src/quota.ts`
- Test: `supabase/tests/quota.test.ts`

**Interfaces:**
- Produces:
  - SQL `take_check_quota(visitor_hash text) returns text` (`'ok' | 'visitor_limit' | 'global_limit'`), `security definer`, using tables `check_usage(day date, visitor_hash text, count int, primary key(day, visitor_hash))` and `check_global(day date primary key, count int)`. Limits are **3** per visitor and **200** global per UTC day.
  - `visitorHash(sessionId: string, ip: string, salt: string): string` (SHA-256 hex) in `quota.ts`.
- [ ] **Step 1: Failing tests:**
  - 3 calls → `ok`, and the 4th → `visitor_limit`
  - after 200 total calls from different hashes, the next → `global_limit`
  - the next UTC day resets (simulate with an injected `day`)
- [ ] **Step 2:** Run them. Expected: FAIL. **Step 3:** Implement. **Step 4:** Run them. Expected: PASS.
- [ ] **Step 5:** Commit: `feat: cap URL checks per visitor and per day`

### Task 24: `/check` with PageSpeed, headers and AI summary

**Files:**
- Create: `packages/ai/src/{pagespeed.ts,workers-ai.ts,summarize.ts}`, `apps/rescue/app/check/{page.tsx,actions.ts}`
- Test: `packages/ai/src/summarize.test.ts`, `apps/rescue/e2e/check.spec.ts`

**Interfaces:**
- Produces:
  - `runPageSpeed(url: URL, key: string): Promise<PsiFindings>` calls `https://www.googleapis.com/pagespeedonline/v5/runPagespeed` with `strategy=mobile`, `category=performance`, `category=accessibility`
  - `type PsiFindings = { performance: number; accessibility: number; failedAudits: { id: string; weight: number }[] }` (audit **ids only**, never page text)
  - `headerFindings(h: Headers): { name: 'csp'|'hsts'|'nosniff'|'referrer-policy'|'frame-protection'; present: boolean }[]`
  - `summarize(input: { psi: PsiFindings; headers: ReturnType<typeof headerFindings> }, run: (prompt: string) => Promise<string>): Promise<{ items: { title: string; why: string }[]; ai: boolean }>`, with the model `@cf/meta/llama-3.1-8b-instruct` via `workers-ai.ts`. On any model error it returns the ranked list built from a fixed `AUDIT_COPY` map with `ai: false`.
  - Server action `checkUrl(raw: string): Promise<CheckResult | { error: 'invalid' | 'unsafe' | 'visitor_limit' | 'global_limit' | 'unavailable' }>`
- [ ] **Step 1: Failing tests:**
  - `summarize` with a `run` that throws returns `ai: false` and the items sorted by `weight` desc
  - the prompt passed to `run` contains only audit ids, scores and header names (assert it contains no `<` or `http`)
  - e2e with mocked PSI/AI: valid URL → result cards plus an "Want the full audit?" link (placeholder href `#audit-offer`)
  - a 4th try → "You've used today's 3 checks"
  - when AI fails → "AI summary unavailable today" and the cards still show
- [ ] **Step 2:** Run them. Expected: FAIL. **Step 3:** Implement. Keys are read on the server only (`PAGESPEED_API_KEY`, `CF_ACCOUNT_ID`, `CF_AI_TOKEN`). **Step 4:** Run them. Expected: PASS.
- [ ] **Step 5:** Write `docs/explainers/m6-url-check.md` (SSRF in plain words, caps, why only structured data reaches the AI) and get Promise's local test OK, with his own Google key and Cloudflare token in `.env.local`. Commit: `feat: add the paste-your-URL check`

## M7: Ship prep

### Task 25: Scheduled jobs
- **Files:** `.github/workflows/reset-before.yml` (cron `0 * * * *`: `supabase db reset --linked --workdir supabase/before` with a `delete from auth.users where is_anonymous` step), `reset-rescue.yml` (cron `30 3 * * *`, keeps the seeded shoppers), `keep-alive.yml` (cron `0 9 * * 1`: `select 1` on both projects). Secrets: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_BEFORE_REF`, `SUPABASE_RESCUE_REF`, DB passwords.
- [ ] **Step 1:** Write the workflows. Run `npx actionlint`. Expected: clean. Check the exact `supabase db reset --linked` flags against the CLI docs at build time.
- [ ] **Step 2:** Commit: `chore: add hourly reset, nightly reset and keep-alive jobs`

### Task 26: README, credits, video script, portfolio text
- [ ] **Step 1:** Write `README.md` (1-line pitch, live links, "what this proves", architecture diagram, results table read from `results.json`, how to run, "Built on Astryx (MIT, by Meta)"), plus `apps/rescue/app/about/page.tsx` with all 40 photo credits, plus `docs/video-script.md` (30 s, opens on "Try to break it") and `docs/portfolio-item.md` (Upwork and Fiverr text, Supabase described only as "built and secured on Supabase").
- [ ] **Step 2:** **Show all of it to Promise.** Change it until he approves.
- [ ] **Step 3:** Commit: `docs: add README, credits and launch copy`

### Task 27: Release (only after Promise says go)
- [ ] **Step 1:** Promise's local test checklist, all passing on his machine: `pnpm install`, `pnpm turbo run lint typecheck test e2e`, both shops working, and "Try to break it" opening Ben's order on before and showing Blocked on rescued.
- [ ] **Step 2: Promise's account tasks** (Claude gives the checklist):
  - create `theolodocoder/workshop` (public)
  - create Supabase projects `northfold-before` and `northfold-rescue`
  - create Vercel projects `okafor-workshop-rescue` and `okafor-workshop-rescue-before` (root dirs `apps/rescue`, `apps/rescue-before`, ignored-build-step on folder changes)
  - set the env vars (before gets a **dummy** `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`)
  - set the GitHub Action secrets
- [ ] **Step 3:** On Promise's go: `git remote add origin`, `git push -u origin main --tags`, apply migrations to both projects (`supabase db push --workdir ...`), and deploy.
- [ ] **Step 4:** Fill `fixes.ts` `commit` values with the pushed SHAs, then let Lighthouse CI run on the previews and run `collect-results` to write `results.json`. Commit `docs: link fixes to commits and add measured results`, show the numbers to Promise, then push on his OK.
- [ ] **Step 5:** Smoke-check both live URLs (shops load, "Try to break it" works as expected on each, `/check` works with real keys, headers present). Promise records the 30 s video and adds the portfolio item.
