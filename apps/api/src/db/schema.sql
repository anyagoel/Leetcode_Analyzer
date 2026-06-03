CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS problems (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  external_id TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  topic_tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS problem_attempts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  solved_at DATE NOT NULL,
  time_spent_minutes INTEGER NOT NULL CHECK (time_spent_minutes >= 0),
  attempts INTEGER NOT NULL DEFAULT 1 CHECK (attempts >= 1),
  needed_hints BOOLEAN NOT NULL DEFAULT FALSE,
  confidence_score INTEGER NOT NULL CHECK (confidence_score BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_problem_attempts_user_id ON problem_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_problem_attempts_solved_at ON problem_attempts(solved_at);
CREATE INDEX IF NOT EXISTS idx_problems_topic_tags ON problems USING GIN (topic_tags);

