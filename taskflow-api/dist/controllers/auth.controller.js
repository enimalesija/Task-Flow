"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = signup;
exports.login = login;
exports.profile = profile;
exports.refresh = refresh;
exports.logout = logout;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const User_1 = require("../models/User");
const RefreshToken_1 = require("../models/RefreshToken");
// ------------------ Config ------------------
const ACCESS_TTL = "15m"; // access token lifetime
const REFRESH_TTL_DAYS = 7; // refresh token lifetime in days
function getSecret() {
    if (!process.env.JWT_SECRET) {
        throw new Error("❌ JWT_SECRET not set in environment");
    }
    return process.env.JWT_SECRET;
}
// ------------------ Helpers ------------------
function signAccess(id) {
    return jsonwebtoken_1.default.sign({ id }, getSecret(), { expiresIn: ACCESS_TTL });
}
function newRefresh() {
    return crypto_1.default.randomBytes(48).toString("hex");
}
function sha256(token) {
    return crypto_1.default.createHash("sha256").update(token).digest("hex");
}
function setRtCookie(res, token) {
    const ms = REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000;
    res.cookie("rt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: ms,
        path: "/api/auth",
    });
}
// ------------------ Controllers ------------------
// POST /api/auth/signup
async function signup(req, res) {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields required" });
        }
        const exists = await User_1.User.findOne({ email });
        if (exists)
            return res.status(400).json({ error: "Email already registered" });
        const hash = await bcryptjs_1.default.hash(password, 10);
        const user = await User_1.User.create({ name, email, passwordHash: hash });
        const accessToken = signAccess(user._id.toString());
        const refreshToken = newRefresh();
        await RefreshToken_1.RefreshToken.create({
            userId: user._id,
            rtHash: sha256(refreshToken),
            userAgent: req.headers["user-agent"],
        });
        setRtCookie(res, refreshToken);
        return res.json({
            accessToken,
            user: { id: user._id, name: user.name, email: user.email },
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Signup failed" });
    }
}
// POST /api/auth/login
async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: "Email and password required" });
        const user = await User_1.User.findOne({ email }).lean();
        if (!user || !user.passwordHash) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        const match = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!match)
            return res.status(400).json({ error: "Invalid credentials" });
        const accessToken = signAccess(user._id.toString());
        const refreshToken = newRefresh();
        await RefreshToken_1.RefreshToken.create({
            userId: user._id,
            rtHash: sha256(refreshToken),
            userAgent: req.headers["user-agent"],
        });
        setRtCookie(res, refreshToken);
        return res.json({
            accessToken,
            user: { id: user._id, name: user.name, email: user.email },
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Login failed" });
    }
}
// GET /api/auth/me
async function profile(req, res) {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Not authenticated" });
        const user = await User_1.User.findById(req.user.id).select("-passwordHash");
        if (!user)
            return res.status(404).json({ error: "User not found" });
        return res.json({ user });
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to load profile" });
    }
}
// POST /api/auth/refresh
async function refresh(req, res) {
    try {
        const rt = req.cookies?.rt;
        if (!rt)
            return res.status(401).json({ error: "No refresh cookie" });
        const record = await RefreshToken_1.RefreshToken.findOne({ rtHash: sha256(rt) });
        if (!record)
            return res.status(401).json({ error: "Invalid refresh token" });
        const accessToken = signAccess(record.userId.toString());
        return res.json({ accessToken });
    }
    catch (err) {
        return res.status(500).json({ error: "Refresh failed" });
    }
}
// POST /api/auth/logout
async function logout(req, res) {
    try {
        const rt = req.cookies?.rt;
        if (rt) {
            await RefreshToken_1.RefreshToken.deleteOne({ rtHash: sha256(rt) });
            res.clearCookie("rt", { path: "/api/auth" });
        }
        return res.json({ ok: true });
    }
    catch (err) {
        return res.status(500).json({ error: "Logout failed" });
    }
}
