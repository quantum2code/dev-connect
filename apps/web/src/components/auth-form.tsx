"use client";

import { Button } from "@dev-connect/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@dev-connect/ui/components/card";
import { Input } from "@dev-connect/ui/components/input";
import { Label } from "@dev-connect/ui/components/label";
import { Github, Loader2, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthMode = "signIn" | "signUp";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const isSignIn = mode === "signIn";

  async function handlePasswordAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const redirectTo = `${window.location.origin}/auth/callback`;

    const result = isSignIn
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } });

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    if (isSignIn || result.data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setMessage("Check your email to finish creating your account.");
    setLoading(false);
  }

  async function handleGoogleAuth() {
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    }
  }

  async function handleGithubAuth() {
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>{isSignIn ? "Sign in" : "Create an account"}</CardTitle>
        <CardDescription>
          {isSignIn ? "Use your email and password, or continue with Google." : "Start with email and password, or continue with Google."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handlePasswordAuth}>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
            />
          </div>
          {error ? <p className="text-destructive">{error}</p> : null}
          {message ? <p className="text-muted-foreground">{message}</p> : null}
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : isSignIn ? <LogIn /> : <UserPlus />}
            {isSignIn ? "Sign in" : "Sign up"}
          </Button>
        </form>
        <div className="mt-4 grid gap-3">
          <Button type="button" variant="outline" onClick={handleGoogleAuth} disabled={loading}>
            Continue with Google
          </Button>
          <Button type="button" variant="outline" onClick={handleGithubAuth} disabled={loading}>
            <Github />
            Continue with GitHub
          </Button>
          <p className="text-muted-foreground text-xs">
            {isSignIn ? (
              <>
                No account yet? <Link className="underline" href="/sign-up">Create one</Link>
              </>
            ) : (
              <>
                Already have an account? <Link className="underline" href="/sign-in">Sign in</Link>
              </>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
