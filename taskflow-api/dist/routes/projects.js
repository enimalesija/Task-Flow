"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/projects.ts
const express_1 = require("express");
const router = (0, express_1.Router)();
// GET /api/projects
router.get("/", (req, res) => {
    res.json([{ id: 1, name: "Demo Project" }]);
});
// POST /api/projects
router.post("/", (req, res) => {
    const { name } = req.body;
    res.status(201).json({ id: Date.now(), name });
});
exports.default = router;
