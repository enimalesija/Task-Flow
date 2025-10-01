"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, index: true, unique: true },
    avatar: String,
    passwordHash: { type: String, required: true }, // ✅ ensure always saved
    role: { type: String, enum: ["member", "admin"], default: "member" },
    teams: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Team" }],
}, { timestamps: true });
// Optional: remove passwordHash when converting to JSON
userSchema.set("toJSON", {
    transform: (_doc, ret) => {
        delete ret.passwordHash;
        return ret;
    },
});
exports.User = mongoose_1.models.User || (0, mongoose_1.model)("User", userSchema);
