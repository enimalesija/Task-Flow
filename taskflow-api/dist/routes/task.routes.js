"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const task_controller_1 = require("../controllers/task.controller");
const router = (0, express_1.Router)();
router.get("/", auth_1.authMiddleware, task_controller_1.getTasks); // /api/tasks?projectId=...
router.post("/", auth_1.authMiddleware, task_controller_1.createTask); // body.projectId required
router.patch("/:id", auth_1.authMiddleware, task_controller_1.updateTask);
router.delete("/:id", auth_1.authMiddleware, task_controller_1.deleteTask);
exports.default = router;
