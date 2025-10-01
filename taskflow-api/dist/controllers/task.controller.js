"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTasks = getTasks;
exports.createTask = createTask;
exports.updateTask = updateTask;
exports.deleteTask = deleteTask;
const Task_1 = require("../models/Task");
const Project_1 = require("../models/Project");
/** GET /api/tasks?projectId=... */
async function getTasks(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized" });
        const { projectId } = req.query;
        if (!projectId)
            return res.status(400).json({ error: "projectId is required" });
        // ✅ check membership
        const project = await Project_1.Project.findOne({
            _id: projectId,
            $or: [{ owner: userId }, { members: userId }],
        }).lean();
        if (!project)
            return res.status(403).json({ error: "Not authorized for this project" });
        const tasks = await Task_1.Task.find({ project: projectId }).sort({ updatedAt: -1 }).lean();
        res.json(tasks.map(normalize));
    }
    catch (err) {
        res.status(400).json({ error: err?.message || "Failed to fetch tasks" });
    }
}
/** POST /api/tasks */
async function createTask(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized" });
        const { projectId, title, description, status, priority, dueDate, assignee, tags } = req.body || {};
        if (!projectId)
            return res.status(400).json({ error: "projectId is required" });
        if (!title?.trim())
            return res.status(400).json({ error: "title is required" });
        // ✅ check membership
        const project = await Project_1.Project.findOne({
            _id: projectId,
            $or: [{ owner: userId }, { members: userId }],
        }).lean();
        if (!project)
            return res.status(403).json({ error: "Not authorized for this project" });
        const task = await Task_1.Task.create({
            project: projectId,
            title: title.trim(),
            description: description?.trim(),
            status: status || "todo",
            priority: priority || "medium",
            dueDate,
            assignee,
            tags: Array.isArray(tags) ? tags : [],
        });
        res.status(201).json(normalize(task));
    }
    catch (err) {
        res.status(400).json({ error: err?.message || "Failed to create task" });
    }
}
/** PATCH /api/tasks/:id */
async function updateTask(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized" });
        const { id } = req.params;
        // ✅ check membership through task → project
        const task = await Task_1.Task.findById(id).lean();
        if (!task)
            return res.status(404).json({ error: "Task not found" });
        const project = await Project_1.Project.findOne({
            _id: task.project,
            $or: [{ owner: userId }, { members: userId }],
        }).lean();
        if (!project)
            return res.status(403).json({ error: "Not authorized for this project" });
        const updated = await Task_1.Task.findByIdAndUpdate(id, req.body, { new: true }).lean();
        res.json(normalize(updated));
    }
    catch (err) {
        res.status(400).json({ error: err?.message || "Failed to update task" });
    }
}
/** DELETE /api/tasks/:id */
async function deleteTask(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized" });
        const { id } = req.params;
        // ✅ check membership through task → project
        const task = await Task_1.Task.findById(id).lean();
        if (!task)
            return res.status(404).json({ error: "Task not found" });
        const project = await Project_1.Project.findOne({
            _id: task.project,
            $or: [{ owner: userId }, { members: userId }],
        }).lean();
        if (!project)
            return res.status(403).json({ error: "Not authorized for this project" });
        await Task_1.Task.findByIdAndDelete(id).lean();
        res.json({ ok: true });
    }
    catch (err) {
        res.status(400).json({ error: err?.message || "Failed to delete task" });
    }
}
// --- helper ---
function normalize(t) {
    return {
        id: t._id,
        projectId: t.project,
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
