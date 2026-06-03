import { Router } from "express";

import { pool } from "../db/pool.js";
import { AuthenticatedRequest, requireAuth } from "../middleware/auth.js";
import { buildRecommendationContext } from "../services/insights.js";
import { problemCatalog } from "../services/problemCatalog.js";

export const recommendationsRouter = Router();

recommendationsRouter.use(requireAuth);

// Build a ranked list of next problems based on weak topics,
// recency, and difficulty fit.
recommendationsRouter.get("/", async (request: AuthenticatedRequest, response) => {
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

  const context = buildRecommendationContext(result.rows);
  const recommendations = problemCatalog
    .filter((problem) => !context.solvedTitles.has(problem.title.toLowerCase()))
    .map((problem) => {
      // For each candidate problem, estimate how useful it would be next.
      const topicSignals = problem.topicTags.map((topic) => {
        const performance = context.topicPerformanceMap.get(topic);
        const masteryScore = performance?.masteryScore ?? 55;
        const weaknessScore = Number((100 - masteryScore).toFixed(1));
        const lastPracticedAt = context.lastPracticedByTopic.get(topic);
        const daysSinceTopicPracticed = lastPracticedAt
          ? Math.min(100, daysBetween(lastPracticedAt, Date.now()))
          : 100;

        return {
          topic,
          weaknessScore,
          daysSinceTopicPracticed
        };
      });

      const weaknessScore = averageSignal(topicSignals, "weaknessScore");
      const daysSinceTopicPracticed = averageSignal(topicSignals, "daysSinceTopicPracticed");
      const difficultyMatch = getDifficultyMatch(problem.difficulty, context.averageConfidence);
      const reviewPriority = problem.topicTags.some((topic) => context.reviewTopics.has(topic))
        ? 100
        : 25;
      const score = Number(
        (
          weaknessScore * 0.45 +
          daysSinceTopicPracticed * 0.25 +
          difficultyMatch * 0.2 +
          reviewPriority * 0.1
        ).toFixed(2)
      );

      return {
        ...problem,
        score,
        reason: buildReason(topicSignals, problem.difficulty, difficultyMatch)
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  response.json({
    items: recommendations
  });
});

function getDifficultyMatch(
  difficulty: "Easy" | "Medium" | "Hard",
  averageConfidence: number
) {
  if (averageConfidence >= 4 && difficulty === "Medium") {
    return 95;
  }

  if (averageConfidence >= 4.5 && difficulty === "Hard") {
    return 90;
  }

  if (averageConfidence < 3 && difficulty === "Easy") {
    return 92;
  }

  if (averageConfidence >= 3 && averageConfidence < 4 && difficulty === "Medium") {
    return 88;
  }

  return difficulty === "Easy" ? 70 : difficulty === "Medium" ? 78 : 62;
}

function buildReason(
  topicSignals: Array<{ topic: string; weaknessScore: number; daysSinceTopicPracticed: number }>,
  difficulty: string,
  difficultyMatch: number
) {
  const weakestTopic = [...topicSignals].sort((a, b) => b.weaknessScore - a.weaknessScore)[0];
  const stalestTopic = [...topicSignals].sort(
    (a, b) => b.daysSinceTopicPracticed - a.daysSinceTopicPracticed
  )[0];

  return `${difficulty} match ${Math.round(difficultyMatch)}. Reinforce ${
    weakestTopic?.topic ?? "core patterns"
  } and revisit ${stalestTopic?.topic ?? "under-practiced topics"}.`;
}

function daysBetween(earlierMs: number, laterMs: number) {
  return Math.round((laterMs - earlierMs) / (1000 * 60 * 60 * 24));
}

function averageSignal(
  topicSignals: Array<{ topic: string; weaknessScore: number; daysSinceTopicPracticed: number }>,
  key: "weaknessScore" | "daysSinceTopicPracticed"
) {
  if (topicSignals.length === 0) {
    return 0;
  }

  const total = topicSignals.reduce((sum, signal) => sum + signal[key], 0);
  return total / topicSignals.length;
}
