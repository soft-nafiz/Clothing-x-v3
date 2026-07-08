"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar, SidebarTrigger } from "@/components/admin/admin-sidebar";

interface AdminShellProps {
  profile: {
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
  children: React.ReactNode;
}

export function AdminShell({ profile, children }: AdminShellProps) {
  return (
    <SidebarProvider>
      <AdminSidebar profile={profile} />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur">
          <SidebarTrigger />
          <span className="text-sm font-semibold tracking-wide text-muted-foreground">
            Admin Control Room
          </span>
        </header>
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
