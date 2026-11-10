import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Server code may use SUPABASE_URL (read at runtime) so tests can point one server at a dead store.
const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// FIX 7: on the server we don't retry, and we give up after 3 s, so a sleeping database
// can't hold a page hostage. The page shows "Store is waking up" instead.
const fetchWithTimeout: typeof fetch = (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(3000) });

/** Public catalog reads on the server (no shopper needed). Row-level security still applies. */
export const supabaseStore = createClient(url, anonKey, {
  auth: { persistSession: false },
  db: { retry: false },
  global: { fetch: fetchWithTimeout },
});

// Server-side client acting as the signed-in shopper (from their session cookie).
// It still uses the anon key, so row-level security applies on the server too.
// `server-only` makes the build fail if a browser component ever imports this file.
export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(url, anonKey, {
    db: { retry: false },
    global: { fetch: fetchWithTimeout },
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // Called from a server component, where cookies are read-only. Proxy refreshes them.
        }
      },
    },
  });
}
