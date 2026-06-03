import crypto from "crypto";
import { Router } from "express";

import { AuthenticatedRequest, requireAuth } from "../middleware/auth.js";
import { pool } from "../db/pool.js";

export const problemsRouter = Router();

// All problem routes require the user to be signed in.
problemsRouter.use(requireAuth);

// Return all problems logged by the current user, newest first.
problemsRouter.get("/", async (request: AuthenticatedRequest, response) => {
  const result = await pool.query(
    `
      SELECT
        pa.id,
        p.title,
        p.difficulty,
        p.topic_tags,
        pa.solved_at,
        pa.time_spent_minutes,
        pa.attempts,
        pa.needed_hints,
        pa.confidence_score,
        pa.notes
      FROM problem_attempts pa
      INNER JOIN problems p ON p.id = pa.problem_id
      WHERE pa.user_id = $1
      ORDER BY pa.solved_at DESC, pa.created_at DESC
    `,
    [request.userId]
  );

  response.json({
    items: result.rows
  });
});

// Save a solved problem and the user's attempt details.
problemsRouter.post("/", async (request: AuthenticatedRequest, response) => {
  const {
    title,
    difficulty,
    topicTags,
    solvedAt,
    timeSpentMinutes,
    attempts,
    neededHints,
    confidenceScore,
    notes
  } = request.body as {
    title?: string;
    difficulty?: "Easy" | "Medium" | "Hard";
    topicTags?: string[];
    solvedAt?: string;
    timeSpentMinutes?: number;
    attempts?: number;
    neededHints?: boolean;
    confidenceScore?: number;
    notes?: string;
  };

  if (!title || !difficulty || !solvedAt || !timeSpentMinutes || !attempts || !confidenceScore) {
    response.status(400).json({ message: "Missing required problem fields." });
    return;
  }

  const problemId = crypto.randomUUID();
  const attemptId = crypto.randomUUID();
  // Clean up topic tags so they are stored consistently in lowercase.
  const normalizedTags = (topicTags ?? [])
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);

  await pool.query(
    `
      INSERT INTO problems (id, title, difficulty, topic_tags)
      VALUES ($1, $2, $3, $4)
    `,
    [problemId, title.trim(), difficulty, normalizedTags]
  );

  await pool.query(
    `
      INSERT INTO problem_attempts (
        id,
        user_id,
        problem_id,
        solved_at,
        time_spent_minutes,
        attempts,
        needed_hints,
        confidence_score,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
    [
      attemptId,
      request.userId,
      problemId,
      solvedAt,
      timeSpentMinutes,
      attempts,
      neededHints ?? false,
      confidenceScore,
      notes?.trim() || null
    ]
  );

  response.status(201).json({
    id: attemptId,
    title: title.trim(),
    difficulty,
    topic_tags: normalizedTags,
    solved_at: solvedAt,
    time_spent_minutes: timeSpentMinutes,
    attempts,
    needed_hints: neededHints ?? false,
    confidence_score: confidenceScore,
    notes: notes?.trim() ?? ""
  });
});
