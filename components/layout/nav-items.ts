import {
  LayoutDashboard,
  FolderKanban,
  ListChecks,
  ListTree,
  StickyNote,
  Users,
  Sparkles,
  Calendar,
  BarChart3,
  User,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Tasks", href: "/tasks", icon: ListChecks },
  { label: "Subtasks", href: "/subtasks", icon: ListTree },
  { label: "Notes", href: "/notes", icon: StickyNote },
  { label: "Members", href: "/members", icon: Users },
  { label: "AI Assistant", href: "/ai-assistant", icon: Sparkles, badge: "New" },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Profile", href: "/profile", icon: User },
  { label: "Settings", href: "/settings", icon: Settings },
];
