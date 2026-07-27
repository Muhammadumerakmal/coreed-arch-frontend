"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Moon, Sun, LogOut } from "lucide-react";
import { NAV_ITEMS } from "./nav-items";
import { useTheme } from "@/components/providers/theme-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const { logout } = useAuth();

  return (
    <aside className="bg-sidebar text-sidebar-foreground flex h-full w-64 flex-col border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="bg-sidebar-primary flex size-9 items-center justify-center rounded-lg">
          <LayoutGrid className="size-5 text-sidebar-primary-foreground" />
        </div>
        <div className="leading-tight">
          <div className="text-sidebar-accent-foreground text-base font-bold">Project Camp</div>
          <div className="text-[11px] text-sidebar-foreground/70">Project Management</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-[18px] shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer: theme toggle + logout */}
      <div className="space-y-1 border-t border-sidebar-border px-3 py-3">
        <button
          onClick={toggle}
          className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <span className="flex items-center gap-3">
            {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
            Dark Mode
          </span>
          <span
            className={cn(
              "relative h-5 w-9 rounded-full transition-colors",
              theme === "dark" ? "bg-sidebar-primary" : "bg-sidebar-foreground/25",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-4 rounded-full bg-white transition-transform",
                theme === "dark" ? "translate-x-4" : "translate-x-0.5",
              )}
            />
          </span>
        </button>

        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="size-[18px]" />
          Logout
        </button>
      </div>
    </aside>
  );
}
