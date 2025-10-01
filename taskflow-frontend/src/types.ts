export type Status = "todo" | "inprogress" | "done";
export type Priority = "high" | "medium" | "low";

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  dueDate?: number;
  assignee?: { id?: string; name?: string } | string | null;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
};

export type Project = {
  id: string;
  name: string;
  description?: string;
  owner?: string;
  members?: string[];
  createdAt: Date;
  updatedAt: Date;
};
