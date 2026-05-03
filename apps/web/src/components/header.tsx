import Link from "next/link";

import { buttonVariants } from "@dev-connect/ui/components/button";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import { ModeToggle } from "./mode-toggle";
import { SignOutButton } from "./sign-out-button";

export default async function Header() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex items-center gap-2 text-lg">
          <Link className={buttonVariants({ variant: "ghost" })} href="/">
            Home
          </Link>
          {user ? (
            <Link className={buttonVariants({ variant: "ghost" })} href="/dashboard">
              Dashboard
            </Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-xs text-muted-foreground md:inline">{user.email}</span>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link className={buttonVariants({ variant: "outline" })} href="/sign-in">
                Sign in
              </Link>
              <Link className={buttonVariants({ variant: "default" })} href="/sign-up">
                Sign up
              </Link>
            </>
          )}
          <ModeToggle />
        </div>
      </div>
      <hr />
    </div>
  );
}
