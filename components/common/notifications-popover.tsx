"use client";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function NotificationsPopover() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="hover:bg-accent relative rounded-lg p-2 outline-none transition-colors"
        aria-label="Notifications"
      >
        <Bell className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
          <div className="bg-muted flex size-12 items-center justify-center rounded-full">
            <Bell className="text-muted-foreground size-5" />
          </div>
          <p className="text-sm font-medium">You&apos;re all caught up</p>
          <p className="text-muted-foreground max-w-[220px] text-xs">
            Task assignments and project activity will show up here.
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
