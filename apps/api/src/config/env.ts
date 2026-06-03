import dotenv from "dotenv";

dotenv.config();

// Load environment variables, but also provide local defaults
// so the project is easier to run during development.
export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl:
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/coding_progress",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173"
};
