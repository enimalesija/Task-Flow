"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProject = createProject;
exports.getProjects = getProjects;
exports.getSingleProject = getSingleProject;
exports.updateProject = updateProject;
exports.deleteProject = deleteProject;
exports.addMember = addMember;
const Project_1 = require("../models/Project");
// POST /api/projects
async function createProject(req, res) {
    try {
        const { name, description } = req.body || {};
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized" });
        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({ error: "Project name is required" });
        }
        const project = await Project_1.Project.create({
            name: name.trim(),
            description: description?.trim(),
            owner: userId,
            members: [userId], // owner is always also a member
        });
        res.status(201).json({
            id: project._id,
            name: project.name,
            description: project.description,
            owner: project.owner,
            members: project.members,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
        });
    }
    catch (err) {
        res.status(400).json({ error: err?.message || "Failed to create project" });
    }
}
// GET /api/projects
async function getProjects(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized" });
        // Show projects the user owns OR is a member of
        const projects = await Project_1.Project.find({
            $or: [{ owner: userId }, { members: userId }],
        })
            .sort({ updatedAt: -1 })
            .lean();
        const normalized = projects.map((p) => ({
            id: p._id,
            name: p.name,
            description: p.description,
            owner: p.owner,
            members: p.members,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        }));
        res.json(normalized);
    }
    catch (err) {
        res.status(400).json({ error: err?.message || "Failed to fetch projects" });
    }
}
// GET /api/projects/:id
async function getSingleProject(req, res) {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized" });
        const project = await Project_1.Project.findOne({
            _id: id,
            $or: [{ owner: userId }, { members: userId }],
        }).lean();
        if (!project)
            return res.status(404).json({ error: "Project not found or no access" });
        res.json({
            id: project._id,
            name: project.name,
            description: project.description,
            owner: project.owner,
            members: project.members,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
        });
    }
    catch (err) {
        res.status(400).json({ error: err?.message || "Failed to fetch project" });
    }
}
// PATCH /api/projects/:id
async function updateProject(req, res) {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const { name, description } = req.body || {};
        if (!userId)
            return res.status(401).json({ error: "Unauthorized" });
        // only owner can update project details
        const updated = await Project_1.Project.findOneAndUpdate({ _id: id, owner: userId }, { $set: { name, description } }, { new: true }).lean();
        if (!updated)
            return res.status(404).json({ error: "Project not found or no permission" });
        res.json({
            id: updated._id,
            name: updated.name,
            description: updated.description,
            owner: updated.owner,
            members: updated.members,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
        });
    }
    catch (err) {
        res.status(400).json({ error: err?.message || "Failed to update project" });
    }
}
// DELETE /api/projects/:id
async function deleteProject(req, res) {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized" });
        // only project owner can delete
        const deleted = await Project_1.Project.findOneAndDelete({ _id: id, owner: userId }).lean();
        if (!deleted) {
            return res.status(404).json({ error: "Project not found or you are not the owner" });
        }
        res.json({ ok: true });
    }
    catch (err) {
        res.status(400).json({ error: err?.message || "Failed to delete project" });
    }
}
// POST /api/projects/:id/add-member
async function addMember(req, res) {
    try {
        const userId = req.user?.id;
        const { id } = req.params; // project id from URL
        const { memberId } = req.body || {};
        if (!userId)
            return res.status(401).json({ error: "Unauthorized" });
        if (!memberId)
            return res.status(400).json({ error: "memberId required" });
        const updated = await Project_1.Project.findOneAndUpdate({ _id: id, owner: userId }, // only owner can add members
        { $addToSet: { members: memberId } }, { new: true }).lean();
        if (!updated)
            return res.status(404).json({ error: "Project not found or no permission" });
        res.json({
            id: updated._id,
            name: updated.name,
            description: updated.description,
            owner: updated.owner,
            members: updated.members,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
        });
    }
    catch (err) {
        res.status(400).json({ error: err?.message || "Failed to add member" });
    }
}
