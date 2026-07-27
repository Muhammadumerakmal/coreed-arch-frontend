"use client";
import Link from "next/link";
import { Search, Bell, Menu, ChevronDown } from "lucide-react";
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

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-background/80 sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/60 px-4 backdrop-blur md:px-6">
      <button
        onClick={onMenuClick}
        className="hover:bg-accent -ml-1 rounded-md p-2 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      {/* Search */}
      <div className="relative hidden max-w-md flex-1 sm:block">
        <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
        <input
          placeholder="Search projects, tasks..."
          className="bg-muted/60 focus-visible:ring-ring/40 h-10 w-full rounded-lg border border-transparent pl-9 pr-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px]"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button className="hover:bg-accent relative rounded-lg p-2" aria-label="Notifications">
          <Bell className="size-5" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="hover:bg-accent flex items-center gap-2 rounded-lg p-1.5 outline-none">
            <Avatar>
              {user?.avatar && <AvatarImage src={user.avatar} alt={user.fullName || user.username} />}
              <AvatarFallback>{initials(user?.fullName || user?.username)}</AvatarFallback>
            </Avatar>
            <div className="hidden text-left leading-tight sm:block">
              <div className="text-sm font-semibold">{user?.fullName || user?.username || "User"}</div>
              <div className="text-muted-foreground text-xs">{user?.email}</div>
            </div>
            <ChevronDown className="text-muted-foreground size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>{user?.fullName || user?.username}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => logout()}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
