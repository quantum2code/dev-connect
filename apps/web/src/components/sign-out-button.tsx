"use client";

import { Button } from "@dev-connect/ui/components/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function SignOutButton() {
  const router = useRouter();
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);
  const [loading, setLoading] = React.useState(false);

  async function handleSignOut() {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Button type="button" variant="outline" onClick={handleSignOut} disabled={loading}>
      <LogOut />
      Sign out
    </Button>
  );
}
