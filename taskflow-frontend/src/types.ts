// src/types.ts

// --- Task / Kanban types ---
export type Status = "todo" | "inprogress" | "done";
export type Priority = "high" | "medium" | "low";

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  dueDate?: number; // timestamp (ms)
  assignee?: { id?: string; name: string } | string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

// Board data structure for Kanban columns
export interface BoardData {
  todo: Task[];
  inprogress: Task[];
  done: Task[];
}

// --- Project types ---
export interface Project {
  id: string;
  name: string;
  description?: string;
  owner: string;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
}
