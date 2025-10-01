import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User"; // ✅ FIXED
import { RefreshToken } from "../models/RefreshToken";

// ------------------ Config ------------------
const ACCESS_TTL = "15m";           // access token lifetime
const REFRESH_TTL_DAYS = 7;         // refresh token lifetime in days

function getSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("❌ JWT_SECRET not set in environment");
  }
  return process.env.JWT_SECRET;
}

// ------------------ Helpers ------------------
function signAccess(id: string) {
  return jwt.sign({ id }, getSecret(), { expiresIn: ACCESS_TTL });
}

function newRefresh() {
  return crypto.randomBytes(48).toString("hex");
}

function sha256(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function setRtCookie(res: Response, token: string) {
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
export async function signup(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash: hash });

    const accessToken = signAccess(user._id.toString());
    const refreshToken = newRefresh();

    await RefreshToken.create({
      userId: user._id,
      rtHash: sha256(refreshToken),
      userAgent: req.headers["user-agent"],
    });

    setRtCookie(res, refreshToken);

    return res.json({
      accessToken,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Signup failed" });
  }
}

// POST /api/auth/login
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    // ❌ don’t use .lean() — keep Mongoose doc to access passwordHash
    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    const accessToken = signAccess(user._id.toString());
    const refreshToken = newRefresh();

    await RefreshToken.create({
      userId: user._id,
      rtHash: sha256(refreshToken),
      userAgent: req.headers["user-agent"],
    });

    setRtCookie(res, refreshToken);

    return res.json({
      accessToken,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Login failed" });
  }
}

// GET /api/auth/me
export async function profile(req: any, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load profile" });
  }
}

// POST /api/auth/refresh
export async function refresh(req: Request, res: Response) {
  try {
    const rt = req.cookies?.rt as string | undefined;
    if (!rt) return res.status(401).json({ error: "No refresh cookie" });

    const record = await RefreshToken.findOne({ rtHash: sha256(rt) });
    if (!record) return res.status(401).json({ error: "Invalid refresh token" });

    const accessToken = signAccess(record.userId.toString());
    return res.json({ accessToken });
  } catch (err) {
    return res.status(500).json({ error: "Refresh failed" });
  }
}

// POST /api/auth/logout
export async function logout(req: any, res: Response) {
  try {
    const rt = req.cookies?.rt as string | undefined;
    if (rt) {
      await RefreshToken.deleteOne({ rtHash: sha256(rt) });
      res.clearCookie("rt", { path: "/api/auth" });
    }
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "Logout failed" });
  }
}
