"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingBag, Users, Megaphone, FolderTree,
  LogOut, Store, Ticket, MoreVertical, Zap,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Products", href: "/admin/products", icon: Package },
  { title: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { title: "Flash Sales", href: "/admin/flash-sales", icon: Zap },
  { title: "Agents", href: "/admin/agents", icon: Users },
  { title: "Coupons", href: "/admin/coupons", icon: Ticket },
  { title: "CMS", href: "/admin/cms", icon: Megaphone },
  { title: "Taxonomies", href: "/admin/categories", icon: FolderTree },
];

interface AdminSidebarProps {
  profile?: {
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function AdminSidebar({ profile }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const displayName = profile?.full_name || profile?.email?.split("@")[0] || "Admin";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <Link href="/admin" className="flex items-center px-4 py-4">
          <img src="/logo-dark.png" alt="CLOTHING X" className="h-6 w-auto dark:block hidden" />
          <img src="/logo-light.png" alt="CLOTHING X" className="h-6 w-auto block dark:hidden" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link href={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Storefront</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/">
                    <Store className="h-4 w-4" />
                    <span>View Store</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-2">
        {/* Account info + 3-dot dropdown */}
        <div className="flex items-center gap-2 rounded-lg px-2 py-2">
          <Avatar className="h-8 w-8 shrink-0">
            {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={displayName} />}
            <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-sm font-medium">{displayName}</p>
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {profile?.email ?? "admin@clothingx.com"}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={signOut} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export { SidebarTrigger };
