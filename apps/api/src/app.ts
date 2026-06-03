import cors from "cors";
import express from "express";

import { analyticsRouter } from "./routes/analytics.js";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.js";
import { healthRouter } from "./routes/health.js";
import { problemsRouter } from "./routes/problems.js";
import { recommendationsRouter } from "./routes/recommendations.js";

// This file creates the Express app and connects all route files.
export const app = express();

app.use(
  cors({
    origin: env.clientOrigin
  })
);
// Let Express read incoming JSON request bodies.
app.use(express.json());

app.get("/", (_request, response) => {
  response.json({
    name: "Coding Progress Platform API",
    version: "0.1.0"
  });
});

app.use("/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/problems", problemsRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/recommendations", recommendationsRouter);
