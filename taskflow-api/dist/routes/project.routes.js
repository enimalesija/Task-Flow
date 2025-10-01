"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const project_controller_1 = require("../controllers/project.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Create a new project
router.post("/", auth_1.authMiddleware, project_controller_1.createProject);
// Get all projects owned by or shared with the user
router.get("/", auth_1.authMiddleware, project_controller_1.getProjects);
// Get a single project by ID (only if user is owner/member)
router.get("/:id", auth_1.authMiddleware, project_controller_1.getSingleProject);
// Update a project (e.g., name/description)
router.patch("/:id", auth_1.authMiddleware, project_controller_1.updateProject);
// Add a member to a project
router.post("/:id/add-member", auth_1.authMiddleware, project_controller_1.addMember);
// Delete a project
router.delete("/:id", auth_1.authMiddleware, project_controller_1.deleteProject);
exports.default = router;
