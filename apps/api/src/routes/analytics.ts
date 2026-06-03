import { Router } from "express";

import { pool } from "../db/pool.js";
import { AuthenticatedRequest, requireAuth } from "../middleware/auth.js";
import { buildAnalytics } from "../services/insights.js";

export const analyticsRouter = Router();

analyticsRouter.use(requireAuth);

analyticsRouter.get("/", async (request: AuthenticatedRequest, response) => {
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

  response.json(buildAnalytics(result.rows));
});

