"use client";

import { Button } from "@astryxdesign/core/Button";
import { Text } from "@astryxdesign/core/Text";
import { useRouter } from "next/navigation";

// FIX 7: the header doesn't load the Supabase client on every page. The server tells us whether
// a session cookie exists; the client library is only downloaded when someone clicks sign in.
export function DemoSignIn({ signedIn, onSignedIn }: { signedIn: boolean; onSignedIn?: () => void }) {
  const router = useRouter();

  async function signIn() {
    const { supabase } = await import("@/lib/supabase/browser");
    const existing = await supabase.auth.getSession();
    if (!existing.data.session) await supabase.auth.signInAnonymously();
    router.refresh();
    onSignedIn?.();
  }

  // FIX 8: a real button, reachable by keyboard and announced by screen readers.
  return signedIn ? (
    <Text type="supporting">Signed in as demo shopper</Text>
  ) : (
    <Button label="Sign in as a demo shopper" variant="secondary" clickAction={signIn} />
  );
}
