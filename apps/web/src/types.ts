export type Difficulty = "Easy" | "Medium" | "Hard";

export type User = {
  id: string;
  name: string;
  email: string;
};

export type AuthPayload = {
  token: string;
  user: User;
};

export type ProblemRecord = {
  id: string;
  title: string;
  difficulty: Difficulty;
  topic_tags: string[];
  solved_at: string;
  time_spent_minutes: number;
  attempts: number;
  needed_hints: boolean;
  confidence_score: number;
  notes: string;
};

export type ProblemInput = {
  title: string;
  difficulty: Difficulty;
  topicTags: string[];
  solvedAt: string;
  timeSpentMinutes: number;
  attempts: number;
  neededHints: boolean;
  confidenceScore: number;
  notes: string;
};

export type TopicPerformance = {
  topic: string;
  totalSolved: number;
  completionRate: number;
  averageConfidence: number;
  averageTime: number;
  averageAttempts: number;
  masteryScore: number;
};

export type AnalyticsPayload = {
  totals: {
    solved: number;
    currentStreak: number;
    longestStreak: number;
  };
  weeklySolves: Array<{ week: string; solved: number }>;
  topicPerformance: TopicPerformance[];
  averageTimeByDifficulty: Array<{ difficulty: Difficulty; averageTime: number }>;
  weakestTopics: TopicPerformance[];
  streak: {
    current: number;
    longest: number;
    activeDates: string[];
  };
  difficultyBreakdown: Array<{ difficulty: Difficulty; solved: number }>;
  reviewSoon: Array<{
    id: string;
    title: string;
    difficulty: Difficulty;
    topicTags: string[];
    solvedAt: string;
    priorityScore: number;
  }>;
};

export type Recommendation = {
  title: string;
  difficulty: Difficulty;
  topicTags: string[];
  score: number;
  reason: string;
};
