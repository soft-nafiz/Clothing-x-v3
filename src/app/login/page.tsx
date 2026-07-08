import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  // If already logged in, redirect to account
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    redirect("/account");
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <LoginForm />
    </div>
  );
}
