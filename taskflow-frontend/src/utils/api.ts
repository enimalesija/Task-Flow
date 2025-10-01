// src/utils/api.ts
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// --- Helper: build headers with JWT ---
function headers() {
  const token = localStorage.getItem("tf_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// --- Generic fetch wrapper ---
async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = "";
    try {
      const data = await res.json();
      msg = data.error || data.message || "";
    } catch {
      msg = await res.text();
    }
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return res.json();
}

async function get<T = any>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { headers: headers() });
  return handle<T>(res);
}

async function post<T = any>(path: string, body?: any): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body ?? {}),
  });
  return handle<T>(res);
}

async function patch<T = any>(path: string, body?: any): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify(body ?? {}),
  });
  return handle<T>(res);
}

async function del<T = any>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: headers(),
  });
  return handle<T>(res);
}

// ----------------------
// AUTH
// ----------------------
export async function loginUser(email: string, password: string) {
  const res = await post<{ accessToken: string; user: any }>("/auth/login", {
    email,
    password,
  });
  localStorage.setItem("tf_token", res.accessToken);
  return res;
}

export async function signupUser(name: string, email: string, password: string) {
  const res = await post<{ accessToken: string; user: any }>("/auth/signup", {
    name,
    email,
    password,
  });
  localStorage.setItem("tf_token", res.accessToken);
  return res;
}

export async function getProfile() {
  return get<{ user: any }>("/auth/me");
}

export function logoutUser() {
  localStorage.removeItem("tf_token");
}

// ----------------------
// PROJECTS
// ----------------------
export async function listProjects() {
  return get<any[]>("/projects");
}

export async function createProject(data: { name: string; description?: string }) {
  return post<any>("/projects", data);
}

export async function deleteProject(id: string) {
  return del<any>(`/projects/${id}`);
}

export async function addProjectMember(projectId: string, memberId: string) {
  return post<any>("/projects/add-member", { projectId, memberId });
}

// ----------------------
// TASKS
// ----------------------
export async function listTasks(projectId: string) {
  return get<any[]>(`/tasks?projectId=${projectId}`);
}

export async function createTask(data: {
  projectId: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  assignee?: string;
  tags?: string[];
}) {
  return post<any>("/tasks", data);
}

export async function updateTask(id: string, patchData: any) {
  return patch<any>(`/tasks/${id}`, patchData);
}

export async function deleteTask(id: string) {
  return del<any>(`/tasks/${id}`);
}
