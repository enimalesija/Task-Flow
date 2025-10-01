// src/routes/projects.ts
import { Router } from "express";

const router = Router();

// GET /api/projects
router.get("/", (req, res) => {
  res.json([{ id: 1, name: "Demo Project" }]);
});

// POST /api/projects
router.post("/", (req, res) => {
  const { name } = req.body;
  res.status(201).json({ id: Date.now(), name });
});

export default router;
