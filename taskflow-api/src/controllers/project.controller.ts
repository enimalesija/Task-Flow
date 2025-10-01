import { Response } from "express";
import Project from "../models/Project"; // ✅ FIXED import
import { AuthRequest } from "../middleware/auth";

// POST /api/projects
export async function createProject(req: AuthRequest, res: Response) {
  try {
    const { name, description } = req.body || {};
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Project name is required" });
    }

    const project = await Project.create({
      name: name.trim(),
      description: description?.trim(),
      owner: userId,
      members: [userId],
    });

    return res.status(201).json({
      id: project._id.toString(),
      name: project.name,
      description: project.description,
      owner: project.owner,
      members: project.members,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err?.message || "Failed to create project" });
  }
}

// GET /api/projects
export async function getProjects(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const projects = await Project.find({
      $or: [{ owner: userId }, { members: userId }],
    }).sort({ updatedAt: -1 });

    return res.json(
      projects.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        description: p.description,
        owner: p.owner,
        members: p.members,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }))
    );
  } catch (err: any) {
    return res.status(400).json({ error: err?.message || "Failed to fetch projects" });
  }
}

// GET /api/projects/:id
export async function getSingleProject(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const project = await Project.findOne({
      _id: id,
      $or: [{ owner: userId }, { members: userId }],
    });

    if (!project) return res.status(404).json({ error: "Project not found or no access" });

    return res.json({
      id: project._id.toString(),
      name: project.name,
      description: project.description,
      owner: project.owner,
      members: project.members,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err?.message || "Failed to fetch project" });
  }
}

// PATCH /api/projects/:id
export async function updateProject(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { name, description } = req.body || {};

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const updated = await Project.findOneAndUpdate(
      { _id: id, owner: userId },
      { $set: { name, description } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Project not found or no permission" });

    return res.json({
      id: updated._id.toString(),
      name: updated.name,
      description: updated.description,
      owner: updated.owner,
      members: updated.members,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err?.message || "Failed to update project" });
  }
}

// DELETE /api/projects/:id
export async function deleteProject(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const deleted = await Project.findOneAndDelete({ _id: id, owner: userId });
    if (!deleted) {
      return res.status(404).json({ error: "Project not found or you are not the owner" });
    }

    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(400).json({ error: err?.message || "Failed to delete project" });
  }
}

// POST /api/projects/:id/add-member
export async function addMember(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { memberId } = req.body || {};

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!memberId) return res.status(400).json({ error: "memberId required" });

    const updated = await Project.findOneAndUpdate(
      { _id: id, owner: userId },
      { $addToSet: { members: memberId } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Project not found or no permission" });

    return res.json({
      id: updated._id.toString(),
      name: updated.name,
      description: updated.description,
      owner: updated.owner,
      members: updated.members,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err?.message || "Failed to add member" });
  }
}
