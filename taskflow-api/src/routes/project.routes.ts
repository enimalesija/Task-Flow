import { Router } from "express";
import {
  createProject,
  getProjects,
  addMember,
  updateProject,
  deleteProject,
  getSingleProject,
} from "../controllers/project.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Create a new project
router.post("/", authMiddleware, createProject);

// Get all projects owned by or shared with the user
router.get("/", authMiddleware, getProjects);

// Get a single project by ID (only if user is owner/member)
router.get("/:id", authMiddleware, getSingleProject);

// Update a project (e.g., name/description)
router.patch("/:id", authMiddleware, updateProject);

// Add a member to a project
router.post("/:id/add-member", authMiddleware, addMember);

// Delete a project
router.delete("/:id", authMiddleware, deleteProject);

export default router;
