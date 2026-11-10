import { createClient } from "@supabase/supabase-js";

// PLANTED PROBLEM 2: a typical AI-built app reaches for the "service role" key in browser code
// so that every query "just works". In a real app this key bypasses all security.
// (Deployed copies of this demo only ever hold a dummy value here, so it falls back to the anon key.)
const key =
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY?.startsWith("ey")
    ? process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price_cents: number;
  description: string;
  image_file: string;
};
