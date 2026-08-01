"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Moon, Sun, LogOut, ChevronsUpDown } from "lucide-react";
import { NAV_ITEMS, type NavSection } from "./nav-items";
import { useTheme } from "@/components/providers/theme-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

const SECTION_ORDER: NavSection[] = ["Workspace", "Team", "Intelligence", "Account"];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="bg-sidebar text-sidebar-foreground flex h-full w-64 flex-col border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex size-9 items-center justify-center rounded-xl shadow-md shadow-indigo-500/20">
          <LayoutGrid className="size-5 text-white" />
        </div>
        <div className="leading-tight">
          <div className="text-sidebar-accent-foreground text-base font-bold">Project Camp</div>
          <div className="text-[11px] text-sidebar-foreground/70">Project Management</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-2">
        {SECTION_ORDER.map((section) => {
          const items = NAV_ITEMS.filter((i) => i.section === section);
          if (items.length === 0) return null;
          return (
            <div key={section}>
              <div className="text-sidebar-foreground/50 mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider">
                {section}
              </div>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                      )}
                    >
                      {/* Active accent bar */}
                      <span
                        className={cn(
                          "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-gradient-to-b from-indigo-400 to-fuchsia-400 transition-opacity",
                          active ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <Icon className={cn("size-[18px] shrink-0", active && "text-primary")} />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer: user card */}
      <div className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="hover:bg-sidebar-accent flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left outline-none transition-colors">
            <Avatar className="size-9">
              {user?.avatar && <AvatarImage src={user.avatar} alt={user.fullName || user.username} />}
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                {initials(user?.fullName || user?.username)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-sidebar-accent-foreground truncate text-sm font-semibold">
                {user?.fullName || user?.username || "User"}
              </div>
              <div className="text-sidebar-foreground/60 truncate text-xs">{user?.email}</div>
            </div>
            <ChevronsUpDown className="text-sidebar-foreground/50 size-4 shrink-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" sideOffset={6} className="w-56">
            <DropdownMenuLabel>{user?.fullName || user?.username || "My account"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => toggle()}>
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              Switch to {theme === "dark" ? "light" : "dark"} mode
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => logout()}>
              <LogOut className="size-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
