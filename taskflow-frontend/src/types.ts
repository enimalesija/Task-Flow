// Unified types for TaskFlow

export type Status = "todo" | "inprogress" | "done";
export type Priority = "high" | "medium" | "low";

export interface Project {
  id: string;
  name: string;
  description?: string;
  owner: string;
  members: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  dueDate?: number;
  assignee?: string | { id?: string; name: string };
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export type BoardData = {
  todo: Task[];
  inprogress: Task[];
  done: Task[];
};
