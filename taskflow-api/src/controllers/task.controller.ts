import { Response } from "express";
import { Task } from "../models/Task";
import { Project } from "../models/Project";
import { AuthRequest } from "../middleware/auth";

/** GET /api/tasks?projectId=... */
export async function getTasks(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { projectId } = req.query as { projectId?: string };
    if (!projectId) return res.status(400).json({ error: "projectId is required" });

    // ✅ check membership
    const project = await Project.findOne({
      _id: projectId,
      $or: [{ owner: userId }, { members: userId }],
    });
    if (!project) return res.status(403).json({ error: "Not authorized for this project" });

    const tasks = await Task.find({ project: projectId }).sort({ updatedAt: -1 });

    return res.json(tasks.map(normalize));
  } catch (err: any) {
    return res.status(400).json({ error: err?.message || "Failed to fetch tasks" });
  }
}

/** POST /api/tasks */
export async function createTask(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { projectId, title, description, status, priority, dueDate, assignee, tags } =
      req.body || {};

    if (!projectId) return res.status(400).json({ error: "projectId is required" });
    if (!title?.trim()) return res.status(400).json({ error: "title is required" });

    // ✅ check membership
    const project = await Project.findOne({
      _id: projectId,
      $or: [{ owner: userId }, { members: userId }],
    });
    if (!project) return res.status(403).json({ error: "Not authorized for this project" });

    const task = await Task.create({
      project: projectId,
      title: title.trim(),
      description: description?.trim(),
      status: status || "todo",
      priority: priority || "medium",
      dueDate,
      assignee,
      tags: Array.isArray(tags) ? tags : [],
    });

    return res.status(201).json(normalize(task));
  } catch (err: any) {
    return res.status(400).json({ error: err?.message || "Failed to create task" });
  }
}

/** PATCH /api/tasks/:id */
export async function updateTask(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;

    // ✅ check membership through task → project
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const project = await Project.findOne({
      _id: task.project,
      $or: [{ owner: userId }, { members: userId }],
    });
    if (!project) return res.status(403).json({ error: "Not authorized for this project" });

    const updated = await Task.findByIdAndUpdate(id, req.body, { new: true });
    return res.json(updated ? normalize(updated) : { error: "Update failed" });
  } catch (err: any) {
    return res.status(400).json({ error: err?.message || "Failed to update task" });
  }
}

/** DELETE /api/tasks/:id */
export async function deleteTask(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const project = await Project.findOne({
      _id: task.project,
      $or: [{ owner: userId }, { members: userId }],
    });
    if (!project) return res.status(403).json({ error: "Not authorized for this project" });

    await Task.findByIdAndDelete(id);
    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(400).json({ error: err?.message || "Failed to delete task" });
  }
}

// --- helper ---
function normalize(t: any) {
  return {
    id: t._id.toString(),
    projectId: t.project?.toString?.() || t.project,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate,
    assignee: t.assignee,
    tags: t.tags ?? [],
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}
