import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6 text-center">
      <p className="font-heading text-7xl font-bold text-primary md:text-9xl">404</p>
      <h1 className="mt-4 font-heading text-2xl font-semibold tracking-tight md:text-3xl">
        Page Not Found
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex flex-col gap-2 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/">Back to Store</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/shop">Browse Products</Link>
        </Button>
      </div>
    </div>
  );
}
