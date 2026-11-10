"use client";

import { Button } from "@astryxdesign/core/Button";
import { Text } from "@astryxdesign/core/Text";
import { supabase } from "@/lib/supabase/browser";
import { useShopper } from "@/lib/useShopper";

export function DemoSignIn() {
  const shopper = useShopper();

  async function signIn() {
    const existing = await supabase.auth.getSession();
    if (existing.data.session) return;
    await supabase.auth.signInAnonymously();
  }

  if (shopper === undefined) return null;
  // FIX 8: a real button, reachable by keyboard and announced by screen readers.
  return shopper ? (
    <Text type="supporting">Signed in as demo shopper</Text>
  ) : (
    <Button label="Sign in as a demo shopper" variant="secondary" clickAction={signIn} />
  );
}
