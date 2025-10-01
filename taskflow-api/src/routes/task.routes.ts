import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { getTasks, createTask, updateTask, deleteTask } from "../controllers/task.controller";

const router = Router();
router.get("/", authMiddleware, getTasks);          // /api/tasks?projectId=...
router.post("/", authMiddleware, createTask);       // body.projectId required
router.patch("/:id", authMiddleware, updateTask);
router.delete("/:id", authMiddleware, deleteTask);

export default router;
