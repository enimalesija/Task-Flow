import { Router } from "express";
import projectRoutes from "./project.routes";
import taskRoutes from "./task.routes";
import authRoutes from "./auth.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);   // ✅ this must exist
router.use("/tasks", taskRoutes);

export default router;
