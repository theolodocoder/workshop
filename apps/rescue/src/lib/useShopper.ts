"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/browser";

// The signed-in demo shopper's id, kept in sync when they sign in from the header.
// `undefined` while we're still checking, `null` when nobody is signed in.
export function useShopper(): string | null | undefined {
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user.id ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUserId(session?.user.id ?? null));
    return () => data.subscription.unsubscribe();
  }, []);
  return userId;
}
