// Typed API client for the Project Camp backend.
// Every request sends `credentials: "include"` because the backend's verifyJWT reads the
// JWT from the httpOnly `accessToken` cookie (not an Authorization header).

import type {
  ApiResponse,
  User,
  Project,
  MyProject,
  ProjectMember,
  Task,
  Subtask,
  Note,
  Paginated,
  TaskStatus,
  TaskPriority,
  MemberRole,
  AppNotification,
  NotificationsResponse,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://coreed-arch-backend.vercel.app/api/v1";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

type FetchOptions = Omit<RequestInit, "body"> & { body?: unknown };

async function apiFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const { body, headers, ...rest } = opts;
  const isForm = body instanceof FormData;

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      headers: {
        ...(isForm ? {} : { "Content-Type": "application/json" }),
        ...(headers || {}),
      },
      body: isForm ? (body as FormData) : body ? JSON.stringify(body) : undefined,
      ...rest,
    });
  } catch {
    throw new ApiError(0, "Cannot reach the server. Please try again in a moment.");
  }

  let json: ApiResponse<T> | { message?: string; error?: unknown };
  try {
    json = await res.json();
  } catch {
    if (!res.ok) throw new ApiError(res.status, `Request failed (${res.status})`);
    return undefined as T;
  }

  if (!res.ok || (json as ApiResponse<T>).success === false) {
    throw new ApiError(res.status, (json as { message?: string }).message || "Request failed");
  }
  return (json as ApiResponse<T>).data;
}

const qs = (params: Record<string, string | number | undefined>) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") p.set(k, String(v));
  const s = p.toString();
  return s ? `?${s}` : "";
};

// ---------------------------------------------------------------- auth
export const auth = {
  register: (data: { email: string; username: string; password: string }) =>
    apiFetch<{ user: User }>("/auth/register", { method: "POST", body: data }),
  login: (data: { email: string; password: string }) =>
    apiFetch<{ user: { _id: string; email: string }; accessToken: string; refreshToken: string }>(
      "/auth/login",
      { method: "POST", body: data },
    ),
  logout: () => apiFetch<null>("/auth/logout", { method: "POST" }),
  currentUser: () => apiFetch<{ user: User }>("/auth/current-user", { method: "POST" }),
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    apiFetch<null>("/auth/change-password", { method: "POST", body: data }),
  updateAvatar: (file: File) => {
    const fd = new FormData();
    fd.append("avatar", file);
    return apiFetch<User>("/auth/avatar", { method: "PATCH", body: fd });
  },
};

// ------------------------------------------------------------- projects
export const projects = {
  list: () => apiFetch<{ projects: MyProject[] }>("/project", { method: "GET" }),
  get: (projectId: string) => apiFetch<Project>(`/project/${projectId}`, { method: "GET" }),
  create: (data: { name: string; description?: string }) =>
    apiFetch<Project>("/project", { method: "POST", body: data }),
  update: (
    projectId: string,
    data: { name?: string; description?: string; isArchived?: boolean },
  ) => apiFetch<Project>(`/project/${projectId}`, { method: "PUT", body: data }),
  remove: (projectId: string) => apiFetch<null>(`/project/${projectId}`, { method: "DELETE" }),
};

// -------------------------------------------------------------- members
export const members = {
  list: (projectId: string) =>
    apiFetch<ProjectMember[]>(`/projects/${projectId}/members`, { method: "GET" }),
  add: (projectId: string, data: { email: string; role?: MemberRole }) =>
    apiFetch<ProjectMember>(`/projects/${projectId}/members`, { method: "POST", body: data }),
  update: (projectId: string, userId: string, data: { role?: MemberRole }) =>
    apiFetch<ProjectMember>(`/projects/${projectId}/members/${userId}`, { method: "PUT", body: data }),
  remove: (projectId: string, userId: string) =>
    apiFetch<null>(`/projects/${projectId}/members/${userId}`, { method: "DELETE" }),
};

// ---------------------------------------------------------------- tasks
export const tasks = {
  list: (
    projectId: string,
    filters: { status?: TaskStatus; priority?: TaskPriority; search?: string; limit?: number } = {},
  ) => apiFetch<Paginated<Task>>(`/tasks/${projectId}${qs(filters)}`, { method: "GET" }),
  get: (projectId: string, taskId: string) =>
    apiFetch<Task>(`/tasks/${projectId}/${taskId}`, { method: "GET" }),
  create: (
    projectId: string,
    data: {
      title: string;
      description?: string;
      assignedTo?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      dueDate?: string;
      estimatedHours?: number;
      tags?: string[];
    },
  ) => apiFetch<Task>(`/tasks/${projectId}`, { method: "POST", body: data }),
  update: (
    projectId: string,
    taskId: string,
    data: Partial<{
      title: string;
      description: string;
      assignedTo: string;
      status: TaskStatus;
      priority: TaskPriority;
      dueDate: string;
      actualHours: number;
      tags: string[];
    }>,
  ) => apiFetch<Task>(`/tasks/${projectId}/${taskId}`, { method: "PUT", body: data }),
  remove: (projectId: string, taskId: string) =>
    apiFetch<Record<string, never>>(`/tasks/${projectId}/${taskId}`, { method: "DELETE" }),
  uploadAttachment: (projectId: string, taskId: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return apiFetch<Task>(`/tasks/${projectId}/${taskId}/attachments`, { method: "POST", body: fd });
  },
};

// ------------------------------------------------------------- subtasks
export const subtasks = {
  list: (projectId: string, taskId: string) =>
    apiFetch<Subtask[]>(`/tasks/${projectId}/t/${taskId}/subtasks`, { method: "GET" }),
  create: (projectId: string, taskId: string, data: { title: string }) =>
    apiFetch<Subtask>(`/tasks/${projectId}/t/${taskId}/subtasks`, { method: "POST", body: data }),
  update: (
    projectId: string,
    taskId: string,
    subtaskId: string,
    data: { title?: string; isCompleted?: boolean },
  ) =>
    apiFetch<Subtask>(`/tasks/${projectId}/t/${taskId}/subtasks/${subtaskId}`, {
      method: "PATCH",
      body: data,
    }),
  remove: (projectId: string, taskId: string, subtaskId: string) =>
    apiFetch<null>(`/tasks/${projectId}/t/${taskId}/subtasks/${subtaskId}`, { method: "DELETE" }),
};

// ---------------------------------------------------------------- notes
export const notes = {
  list: (projectId: string, filters: { search?: string; pinned?: string } = {}) =>
    apiFetch<Note[]>(`/notes/${projectId}${qs(filters)}`, { method: "GET" }),
  get: (projectId: string, noteId: string) =>
    apiFetch<Note>(`/notes/${projectId}/${noteId}`, { method: "GET" }),
  create: (projectId: string, data: { title: string; content: string; tags?: string[] }) =>
    apiFetch<Note>(`/notes/${projectId}`, { method: "POST", body: data }),
  update: (
    projectId: string,
    noteId: string,
    data: Partial<{ title: string; content: string; tags: string[]; isPinned: boolean }>,
  ) => apiFetch<Note>(`/notes/${projectId}/${noteId}`, { method: "PUT", body: data }),
  remove: (projectId: string, noteId: string) =>
    apiFetch<null>(`/notes/${projectId}/${noteId}`, { method: "DELETE" }),
};

// ---------------------------------------------------------- notifications
export const notifications = {
  list: (params: { page?: number; limit?: number } = {}) =>
    apiFetch<NotificationsResponse>(`/notifications${qs(params)}`, { method: "GET" }),
  markRead: (notificationId: string) =>
    apiFetch<AppNotification>(`/notifications/${notificationId}/read`, { method: "PATCH" }),
  markAllRead: () => apiFetch<{ modified: number }>("/notifications/read-all", { method: "PATCH" }),
};

// ------------------------------------------------------------------- ai
export const ai = {
  chat: (data: { message: string; history?: { role: string; content: string }[]; projectId?: string }) =>
    apiFetch<{ reply: string; metaData: unknown }>("/ai/chat", { method: "POST", body: data }),
  suggestTasks: (projectId: string, data: { context: string; count?: number; includeSubtasks?: boolean }) =>
    apiFetch<Record<string, unknown>>(`/ai/suggest-tasks/${projectId}`, { method: "POST", body: data }),
  analyzeRisks: (projectId: string) =>
    apiFetch<Record<string, unknown>>(`/ai/analyze-risks/${projectId}`, { method: "GET" }),
  predictTimeline: (projectId: string) =>
    apiFetch<Record<string, unknown>>(`/ai/predict-timeline/${projectId}`, { method: "GET" }),
  balanceWorkload: (projectId: string) =>
    apiFetch<Record<string, unknown>>(`/ai/balance-workload/${projectId}`, { method: "GET" }),
  agent: (projectId: string, data: { goal: string }) =>
    apiFetch<{ summary: string; actions: unknown[]; iterations: number }>(`/ai/agent/${projectId}`, {
      method: "POST",
      body: data,
    }),
};

export { API_BASE_URL };
