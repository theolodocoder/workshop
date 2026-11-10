"use client";

import { Button } from "@astryxdesign/core/Button";
import { Text } from "@astryxdesign/core/Text";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// FIX 7: the header doesn't load the Supabase client on every page. The server tells us whether
// a session cookie exists; the client library is only downloaded when someone clicks sign in,
// or (for a signed-in visitor) to check the session is still real.
export function DemoSignIn({ signedIn, onSignedIn }: { signedIn: boolean; onSignedIn?: () => void }) {
  const router = useRouter();

  // The nightly reset deletes demo shoppers. If this visitor's cookie points at a shopper who no
  // longer exists, drop the stale session so the sign-in button comes back.
  useEffect(() => {
    if (!signedIn) return;
    let live = true;
    import("@/lib/supabase/browser").then(async ({ supabase }) => {
      const { data, error } = await supabase.auth.getUser();
      if (live && (error || !data.user)) {
        await supabase.auth.signOut({ scope: "local" });
        router.refresh();
      }
    });
    return () => {
      live = false;
    };
  }, [signedIn, router]);

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
