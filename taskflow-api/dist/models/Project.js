"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
const mongoose_1 = require("mongoose");
const projectSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });
exports.Project = mongoose_1.models.Project || (0, mongoose_1.model)("Project", projectSchema);
