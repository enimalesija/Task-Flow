import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 4000,
  MONGODB_URI: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/taskflow",
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  JWT_SECRET: process.env.JWT_SECRET ?? "dev-secret-change-me"
};
