"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const mongoose_1 = require("mongoose");
const taskSchema = new mongoose_1.Schema({
    project: { type: mongoose_1.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ["todo", "inprogress", "done"], default: "todo", index: true },
    priority: { type: String, enum: ["high", "medium", "low"], default: "medium", index: true },
    dueDate: { type: Number, default: null },
    assignee: { type: mongoose_1.Schema.Types.Mixed, default: null }, // 👈 allows string or {id,name}
    tags: [{ type: String }],
}, { timestamps: true });
exports.Task = mongoose_1.models.Task || (0, mongoose_1.model)("Task", taskSchema);
