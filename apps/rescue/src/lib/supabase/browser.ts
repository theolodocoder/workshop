import { createBrowserClient } from "@supabase/ssr";

// FIX 2: the browser only ever gets the public (anon) key. What protects data is row-level
// security in the database (fix 1), not hiding the key. The session lives in cookies, so
// server code can see who the shopper is too.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price_cents: number;
  description: string;
  image_file: string;
};
