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

