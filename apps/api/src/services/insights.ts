type ProblemAttemptRecord = {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic_tags: string[];
  solved_at: string;
  time_spent_minutes: number;
  attempts: number;
  needed_hints: boolean;
  confidence_score: number;
  notes: string | null;
};

export function buildAnalytics(records: ProblemAttemptRecord[]) {
  const weeklySolves = buildWeeklySolves(records);
  const topicPerformance = buildTopicPerformance(records);
  const averageTimeByDifficulty = buildAverageTimeByDifficulty(records);
  const difficultyBreakdown = buildDifficultyBreakdown(records);
  const streak = buildStreak(records);
  const reviewSoon = buildReviewSoon(records);
  const weakestTopics = [...topicPerformance]
    .sort((a, b) => a.masteryScore - b.masteryScore)
    .slice(0, 5);

  return {
    totals: {
      solved: records.length,
      currentStreak: streak.current,
      longestStreak: streak.longest
    },
    weeklySolves,
    topicPerformance,
    averageTimeByDifficulty,
    weakestTopics,
    streak,
    difficultyBreakdown,
    reviewSoon
  };
}

export function buildRecommendationContext(records: ProblemAttemptRecord[]) {
  const topicPerformance = buildTopicPerformance(records);
  const topicPerformanceMap = new Map(
    topicPerformance.map((entry) => [entry.topic, entry])
  );
  const lastPracticedByTopic = new Map<string, number>();

  records.forEach((record) => {
    const solvedAt = Date.parse(record.solved_at);

    record.topic_tags.forEach((topic) => {
      const currentValue = lastPracticedByTopic.get(topic) ?? 0;
      if (solvedAt > currentValue) {
        lastPracticedByTopic.set(topic, solvedAt);
      }
    });
  });

  const solvedTitles = new Set(records.map((record) => record.title.toLowerCase()));
  const reviewTopics = new Set(
    records
      .filter((record) => record.needed_hints || record.attempts >= 3 || record.confidence_score <= 2)
      .flatMap((record) => record.topic_tags)
  );
  const averageConfidence =
    records.reduce((sum, record) => sum + record.confidence_score, 0) / Math.max(records.length, 1);

  return {
    topicPerformanceMap,
    lastPracticedByTopic,
    solvedTitles,
    reviewTopics,
    averageConfidence
  };
}

function buildWeeklySolves(records: ProblemAttemptRecord[]) {
  const weeklyMap = new Map<string, number>();

  records.forEach((record) => {
    const weekLabel = getWeekLabel(record.solved_at);
    weeklyMap.set(weekLabel, (weeklyMap.get(weekLabel) ?? 0) + 1);
  });

  return [...weeklyMap.entries()]
    .sort(([weekA], [weekB]) => weekA.localeCompare(weekB))
    .map(([week, solved]) => ({ week, solved }));
}

function buildTopicPerformance(records: ProblemAttemptRecord[]) {
  const topicMap = new Map<
    string,
    {
      topic: string;
      totalSolved: number;
      cleanSolved: number;
      totalConfidence: number;
      totalTime: number;
      totalAttempts: number;
    }
  >();

  records.forEach((record) => {
    record.topic_tags.forEach((topic) => {
      const current = topicMap.get(topic) ?? {
        topic,
        totalSolved: 0,
        cleanSolved: 0,
        totalConfidence: 0,
        totalTime: 0,
        totalAttempts: 0
      };

      current.totalSolved += 1;
      current.totalConfidence += record.confidence_score;
      current.totalTime += record.time_spent_minutes;
      current.totalAttempts += record.attempts;

      if (!record.needed_hints && record.attempts <= 2) {
        current.cleanSolved += 1;
      }

      topicMap.set(topic, current);
    });
  });

  return [...topicMap.values()]
    .map((topic) => {
      const completionRate = Math.round((topic.cleanSolved / topic.totalSolved) * 100);
      const averageConfidence = Number((topic.totalConfidence / topic.totalSolved).toFixed(1));
      const averageTime = Number((topic.totalTime / topic.totalSolved).toFixed(1));
      const averageAttempts = Number((topic.totalAttempts / topic.totalSolved).toFixed(1));
      const masteryScore = Number(
        (
          completionRate * 0.5 +
          (averageConfidence / 5) * 100 * 0.3 +
          Math.max(0, 100 - averageAttempts * 18) * 0.2
        ).toFixed(1)
      );

      return {
        topic: topic.topic,
        totalSolved: topic.totalSolved,
        completionRate,
        averageConfidence,
        averageTime,
        averageAttempts,
        masteryScore
      };
    })
    .sort((a, b) => b.totalSolved - a.totalSolved || a.topic.localeCompare(b.topic));
}

function buildAverageTimeByDifficulty(records: ProblemAttemptRecord[]) {
  const difficultyMap = new Map<
    string,
    {
      difficulty: string;
      totalTime: number;
      totalSolved: number;
    }
  >();

  records.forEach((record) => {
    const current = difficultyMap.get(record.difficulty) ?? {
      difficulty: record.difficulty,
      totalTime: 0,
      totalSolved: 0
    };
    current.totalTime += record.time_spent_minutes;
    current.totalSolved += 1;
    difficultyMap.set(record.difficulty, current);
  });

  return ["Easy", "Medium", "Hard"].map((difficulty) => {
    const entry = difficultyMap.get(difficulty) ?? {
      difficulty,
      totalTime: 0,
      totalSolved: 0
    };

    return {
      difficulty,
      averageTime: entry.totalSolved
        ? Number((entry.totalTime / entry.totalSolved).toFixed(1))
        : 0
    };
  });
}

function buildDifficultyBreakdown(records: ProblemAttemptRecord[]) {
  const counts = {
    Easy: 0,
    Medium: 0,
    Hard: 0
  };

  records.forEach((record) => {
    counts[record.difficulty] += 1;
  });

  return Object.entries(counts).map(([difficulty, solved]) => ({
    difficulty,
    solved
  }));
}

function buildStreak(records: ProblemAttemptRecord[]) {
  const uniqueDays = [...new Set(records.map((record) => record.solved_at))].sort();
  const activeDates = uniqueDays;
  let current = 0;
  let longest = 0;
  let running = 0;

  for (let index = 0; index < uniqueDays.length; index += 1) {
    if (index === 0 || diffInDays(uniqueDays[index - 1], uniqueDays[index]) === 1) {
      running += 1;
    } else {
      running = 1;
    }

    longest = Math.max(longest, running);
  }

  for (let index = uniqueDays.length - 1; index >= 0; index -= 1) {
    const compareDate =
      index === uniqueDays.length - 1 ? todayLabel() : uniqueDays[index + 1];

    if (diffInDays(uniqueDays[index], compareDate) <= 1) {
      current += 1;
    } else {
      break;
    }
  }

  return {
    current,
    longest,
    activeDates
  };
}

function buildReviewSoon(records: ProblemAttemptRecord[]) {
  return records
    .filter((record) => record.needed_hints || record.attempts >= 3 || record.confidence_score <= 2)
    .map((record) => ({
      id: record.id,
      title: record.title,
      difficulty: record.difficulty,
      topicTags: record.topic_tags,
      solvedAt: record.solved_at,
      priorityScore: Number(
        (
          record.attempts * 0.4 +
          (record.needed_hints ? 1.2 : 0) +
          (5 - record.confidence_score) * 0.7
        ).toFixed(2)
      )
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 6);
}

function getWeekLabel(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00Z`);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() - day + 1);
  return date.toISOString().slice(0, 10);
}

function diffInDays(earlier: string, later: string) {
  const earlierMs = Date.parse(`${earlier}T00:00:00Z`);
  const laterMs = Date.parse(`${later}T00:00:00Z`);
  return Math.round((laterMs - earlierMs) / (1000 * 60 * 60 * 24));
}

function todayLabel() {
  return new Date().toISOString().slice(0, 10);
}
