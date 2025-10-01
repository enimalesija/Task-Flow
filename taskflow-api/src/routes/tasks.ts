// src/routes/tasks.ts
import { Router } from "express";

const router = Router();

// GET /api/tasks
router.get("/", (req, res) => {
  res.json([{ id: 1, title: "First Task", status: "todo" }]);
});

// POST /api/tasks
router.post("/", (req, res) => {
  const { title, status } = req.body;
  res.status(201).json({ id: Date.now(), title, status });
});

export default router;
