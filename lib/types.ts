// Shared types mirroring the backend Mongoose models + response envelope.

export type TaskStatus = "to-do" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "critical";
export type MemberRole = "admin" | "project_admin" | "member";

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface User {
  _id: string;
  avatar?: string | null;
  username: string;
  email: string;
  fullName?: string;
  isEmailVerified?: boolean;
  googleId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectSettings {
  visibility: "public" | "team" | "private";
  defaultTaskStatus: TaskStatus;
  allowGuestAccess: boolean;
}

export interface ProjectMetadata {
  totalTasks: number;
  completedTasks: number;
  totalMembers: number;
  lastActivity: string;
  isArchived: boolean;
  archivedAt?: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  createdBy: string;
  settings: ProjectSettings;
  metadata: ProjectMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface MemberPermissions {
  canCreateTasks: boolean;
  canEditTasks: boolean;
  canDeleteTasks: boolean;
  canManageMembers: boolean;
  canViewReports: boolean;
}

export interface ProjectMember {
  _id: string;
  user: User;
  project: string;
  role: MemberRole;
  joinedAt: string;
  invitedBy?: string;
  permissions: MemberPermissions;
  createdAt: string;
  updatedAt: string;
}

/** Shape returned by GET /project (list of the user's memberships). */
export interface MyProject {
  project: Project;
  role: MemberRole;
}

export interface TaskAttachment {
  filename: string;
  path: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  project: string;
  assignedTo?: User | string | null;
  assignedBy?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  attachments: TaskAttachment[];
  /** Enriched by the task-list endpoint (single aggregation). */
  subtaskCount?: number;
  completedSubtaskCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  _id: string;
  title: string;
  task: string;
  project: string;
  createdBy: string;
  isCompleted: boolean;
  completeAt?: string | null;
  completedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  projectId: string;
  createdBy: string;
  lastEditedBy: string;
  tags: string[];
  isPinned: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  tasks: T[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}
