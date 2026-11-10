"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function DemoSignIn() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user.id ?? null));
  }, []);

  async function signIn() {
    const existing = await supabase.auth.getSession();
    if (existing.data.session) return setUserId(existing.data.session.user.id);
    const { data } = await supabase.auth.signInAnonymously();
    setUserId(data.user!.id);
  }

  // PLANTED PROBLEM 8: a clickable <div>, so keyboards and screen readers can't use it.
  return userId ? (
    <span style={{ color: "#9aa59f", fontSize: 13 }}>Signed in as demo shopper</span>
  ) : (
    <div onClick={signIn} style={{ cursor: "pointer", background: "#2F6B4F", color: "white", padding: "6px 12px", borderRadius: 8 }}>
      Sign in as a demo shopper
    </div>
  );
}
