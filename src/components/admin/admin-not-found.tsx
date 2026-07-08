import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LockKeyhole } from "lucide-react";

/**
 * Rendered when a non-admin user tries to access /admin.
 * (Not logged-in users also see this — we don't redirect to /login
 * to avoid leaking the existence of the admin route.)
 */
export function AdminNotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
        <LockKeyhole className="h-8 w-8 text-primary" />
      </div>
      <p className="font-heading text-5xl font-bold text-primary md:text-7xl">404</p>
      <h1 className="mt-4 font-heading text-2xl font-semibold tracking-tight md:text-3xl">
        Page Not Found
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or you don&apos;t have
        permission to view it.
      </p>
      <div className="mt-8 flex flex-col gap-2 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/">Back to Store</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/account">My Account</Link>
        </Button>
      </div>
    </div>
  );
}
