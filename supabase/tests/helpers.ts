import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import pg from "pg";

// Local Supabase CLI demo values (public, local only).
export const RESCUE = {
  url: "http://127.0.0.1:54321",
  db: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
};

/** A fresh anonymous visitor, like a demo shopper in the browser. */
export async function anonymousVisitor(): Promise<{ client: SupabaseClient; userId: string }> {
  const client = createClient(RESCUE.url, RESCUE.anonKey, { auth: { persistSession: false } });
  const { data, error } = await client.auth.signInAnonymously();
  if (error || !data.user) throw error ?? new Error("anonymous sign-in failed");
  return { client, userId: data.user.id };
}

/** Superuser access, only for test setup and checks. */
export async function adminDb() {
  const db = new pg.Client({ connectionString: RESCUE.db });
  await db.connect();
  return db;
}
