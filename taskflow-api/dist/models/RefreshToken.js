"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshToken = void 0;
const mongoose_1 = require("mongoose");
const RefreshTokenSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', index: true },
    rtHash: { type: String, index: true }, // hashed refresh token
    userAgent: String,
    createdAt: { type: Date, default: Date.now, expires: '8d' } // TTL index
});
exports.RefreshToken = mongoose_1.models.RefreshToken || (0, mongoose_1.model)('RefreshToken', RefreshTokenSchema);
