"use client";
import * as React from "react";
import Link from "next/link";
import { Search, Menu, ChevronDown } from "lucide-react";
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
import { CommandPalette } from "@/components/command-palette";
import { NotificationsPopover } from "@/components/common/notifications-popover";
import { initials } from "@/lib/format";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const [paletteOpen, setPaletteOpen] = React.useState(false);

  return (
    <header className="bg-background/80 sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/60 px-4 backdrop-blur md:px-6">
      <button
        onClick={onMenuClick}
        className="hover:bg-accent -ml-1 rounded-md p-2 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      {/* Search trigger */}
      <button
        onClick={() => setPaletteOpen(true)}
        className="group flex w-full max-w-md items-center gap-3 rounded-lg border border-border/60 bg-muted/60 py-2 pl-3 pr-2 text-left transition-colors hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:max-w-xs md:max-w-sm"
      >
        <Search className="text-muted-foreground size-4" />
        <span className="text-muted-foreground flex-1 text-sm">Search projects, tasks…</span>
        <kbd className="text-muted-foreground hidden items-center gap-0.5 rounded border border-border/60 bg-background px-1.5 py-0.5 text-[10px] font-medium sm:flex">
          Ctrl&nbsp;K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <NotificationsPopover />

        <DropdownMenu>
          <DropdownMenuTrigger className="hover:bg-accent flex items-center gap-2 rounded-lg p-1.5 outline-none transition-colors">
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

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </header>
  );
}
