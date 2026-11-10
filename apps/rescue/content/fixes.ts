// The nine fixes on the rescue report. `commit` is filled in with the public commit SHA at release.
export type Fix = {
  id: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  group: "security" | "frontend";
  title: string;
  risk: string;
  fix: string;
  commit: string | null;
  test: string;
};

export const REPO_URL = "https://github.com/theolodocoder/workshop";

export const fixes: Fix[] = [
  { id: 1, group: "security", title: "Shoppers could read each other's orders", risk: "Anyone signed in could read, change or delete any order.", fix: "Row-level security on every table: each order is visible only to its owner, and nobody can change products.", commit: null, test: "rls.test.ts › A can't read B's order" },
  { id: 2, group: "security", title: "A secret key sat in the browser code", risk: "A full-access key in the page lets anyone run any query.", fix: "The browser only gets the public key. CI scans every build and fails if a secret reaches the browser.", commit: null, test: "check-client-secrets.test.ts" },
  { id: 3, group: "security", title: "Prices came from the browser", risk: "A shopper could edit the price before checkout and pay one cent.", fix: "A server-side function prices every order from the product table and limits orders to 5 an hour.", commit: null, test: "place-order.test.ts › ignores prices sent by the browser" },
  { id: 4, group: "frontend", title: "One failed request meant a blank page", risk: "Any network blip left shoppers staring at nothing, with no way forward.", fix: "Loading, empty and error states on every page, with Retry, plus real not-found and error pages.", commit: null, test: "errors.spec.ts, store-down.spec.ts" },
  { id: 5, group: "frontend", title: "Any number went into the cart", risk: "Quantities like 0, -3 or 9999 produced broken orders.", fix: "Every input is checked: in the browser for a friendly message, and with Zod on the server for real.", commit: null, test: "schemas.test.ts, validation.spec.ts" },
  { id: 6, group: "frontend", title: "There were no tests", risk: "Every change risked breaking checkout without anyone noticing.", fix: "Unit, database and end-to-end tests, run in CI on every push, including the full shopping flow.", commit: null, test: "flows.spec.ts" },
  { id: 7, group: "frontend", title: "Pages were slow, especially on phones", risk: "Full-size photos, data fetched after load and a chart library on every page cost shoppers seconds.", fix: "Server rendering, photos sized for each screen, a self-hosted font, and heavy code only where it's used.", commit: null, test: "speed.spec.ts" },
  { id: 8, group: "frontend", title: "Keyboard and screen-reader users were shut out", risk: "Clickable divs, missing labels and faint text made the shop unusable for many people.", fix: "Real buttons and links, a skip link, labelled fields, described photos and readable contrast, checked by axe.", commit: null, test: "a11y.spec.ts" },
  { id: 9, group: "frontend", title: "No security headers", risk: "The site could be framed by others and had no protection against injected scripts.", fix: "A Content-Security-Policy with a fresh nonce per page, plus HSTS, nosniff and a strict referrer policy.", commit: null, test: "headers.spec.ts" },
];

export type Focus = "rescue" | "frontend";

const FRONTEND_ORDER = [7, 8, 4, 5, 6, 9, 1, 2, 3];

/** Rescue order is 1 to 9. Frontend order shows speed, accessibility and UX states first (Promise, 2026-11-10). */
export function orderFixes(list: Fix[], focus: Focus): Fix[] {
  if (focus === "rescue") return [...list].sort((a, b) => a.id - b.id);
  return FRONTEND_ORDER.map((id) => list.find((f) => f.id === id)!).filter(Boolean);
}
