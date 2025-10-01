// src/types.ts

export type Status = "todo" | "inprogress" | "done";
export type Priority = "high" | "medium" | "low";

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  dueDate?: number;
  assignee?: { id?: string; name: string } | string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

// ✅ BoardData type
export interface BoardData {
  todo: Task[];
  inprogress: Task[];
  done: Task[];
}
