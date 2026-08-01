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

export type NavSection = "Workspace" | "Team" | "Intelligence" | "Account";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  section: NavSection;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, section: "Workspace" },
  { label: "Projects", href: "/projects", icon: FolderKanban, section: "Workspace" },
  { label: "Tasks", href: "/tasks", icon: ListChecks, section: "Workspace" },
  { label: "Subtasks", href: "/subtasks", icon: ListTree, section: "Workspace" },
  { label: "Notes", href: "/notes", icon: StickyNote, section: "Workspace" },
  { label: "Members", href: "/members", icon: Users, section: "Team" },
  { label: "AI Assistant", href: "/ai-assistant", icon: Sparkles, badge: "New", section: "Intelligence" },
  { label: "Calendar", href: "/calendar", icon: Calendar, section: "Intelligence" },
  { label: "Reports", href: "/reports", icon: BarChart3, section: "Intelligence" },
  { label: "Profile", href: "/profile", icon: User, section: "Account" },
  { label: "Settings", href: "/settings", icon: Settings, section: "Account" },
];
