"use client";

import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

function DynamicToaster() {
  const { resolvedTheme } = useTheme();
  return <Toaster position="bottom-right" theme={(resolvedTheme as "light" | "dark") || "dark"} />;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false },
        },
      })
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <QueryClientProvider client={client}>
        {children}
        <DynamicToaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
