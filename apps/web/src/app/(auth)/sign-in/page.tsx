import { AuthForm } from "@/components/auth-form";

export default function SignInPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100svh-3rem)] items-center px-4 py-8">
      <AuthForm mode="signIn" />
    </div>
  );
}
