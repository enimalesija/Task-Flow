import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import routes from "./routes";
import { errorHandler } from "./middleware/error";

dotenv.config();
const app = express();

// ✅ Dynamic CORS check
const allowedOrigins = (origin: string | undefined, callback: any) => {
  if (!origin) return callback(null, true); // allow non-browser requests

  // Always allow localhost dev
  if (origin.startsWith("http://localhost:5173")) {
    return callback(null, true);
  }

  // Allow all Vercel preview + production domains
  try {
    const hostname = new URL(origin).hostname;
    if (hostname.endsWith(".vercel.app")) {
      return callback(null, true);
    }
  } catch {
    // ignore invalid origins
  }

  // Allow explicit origins from env (comma separated)
  const envOrigins = process.env.CORS_ORIGIN?.split(",").map(o => o.trim()) ?? [];
  if (envOrigins.includes(origin)) {
    return callback(null, true);
  }

  return callback(new Error(`CORS blocked for origin: ${origin}`), false);
};

app.set("trust proxy", 1);
app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/healthz", (_req, res) => res.json({ ok: true }));

app.use("/api", routes);
app.use(errorHandler);

export default app;
