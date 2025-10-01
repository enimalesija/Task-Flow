"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader) {
            return res.status(401).json({ error: "No authorization header" });
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }
        // ✅ get the secret only when needed
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET not set in environment");
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.user = { id: decoded.id };
        next();
    }
    catch (err) {
        console.error("JWT verification failed:", err);
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}
