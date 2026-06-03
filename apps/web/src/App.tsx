import { FormEvent, useEffect, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import {
  createProblem,
  fetchAnalytics,
  fetchProblems,
  fetchRecommendations,
  login,
  register
} from "./lib/api";
import {
  AnalyticsPayload,
  AuthPayload,
  Difficulty,
  ProblemInput,
  ProblemRecord,
  Recommendation,
  User
} from "./types";

const links = [
  { to: "/", label: "Overview" },
  { to: "/tracker", label: "Tracker" },
  { to: "/analytics", label: "Analytics" },
  { to: "/recommendations", label: "Recommendations" }
];

const difficultyOptions: Difficulty[] = ["Easy", "Medium", "Hard"];

const initialProblemForm: ProblemInput = {
  title: "",
  difficulty: "Medium",
  topicTags: [],
  solvedAt: new Date().toISOString().slice(0, 10),
  timeSpentMinutes: 45,
  attempts: 1,
  neededHints: false,
  confidenceScore: 3,
  notes: ""
};

function HomePage() {
  return (
    <section className="panel hero">
      <p className="eyebrow">Personal coding-progress platform</p>
      <h1>See your weak spots, measure momentum, and decide what to solve next.</h1>
      <p className="hero-copy">
        Track solved problems, turn raw history into analytics, and get targeted
        recommendations that push your interview prep forward.
      </p>
      <div className="hero-grid">
        <article className="mini-card">
          <span>Track</span>
          <strong>Attempts, hints, confidence, and time spent</strong>
        </article>
        <article className="mini-card">
          <span>Analyze</span>
          <strong>Topic weakness, streaks, and pace by difficulty</strong>
        </article>
        <article className="mini-card">
          <span>Recommend</span>
          <strong>Prioritized practice based on your actual gaps</strong>
        </article>
      </div>
    </section>
  );
}

function PlaceholderPage(props: { title: string; body: string }) {
  return (
    <section className="panel">
      <h2>{props.title}</h2>
      <p>{props.body}</p>
    </section>
  );
}

function LockedPage(props: { title: string; body: string }) {
  return (
    <section className="panel">
      <p className="eyebrow">{props.title}</p>
      <h2>Sign in to unlock your personalized insights.</h2>
      <p>{props.body}</p>
    </section>
  );
}

function TrackerPage(props: {
  token: string | null;
  user: User | null;
  problems: ProblemRecord[];
  onCreateProblem: (input: ProblemInput) => Promise<void>;
  authError: string | null;
  authMode: "login" | "register";
  onAuthModeChange: (mode: "login" | "register") => void;
  onAuthenticate: (payload: { name?: string; email: string; password: string }) => Promise<void>;
  onLogout: () => void;
}) {
  const [problemForm, setProblemForm] = useState<ProblemInput>(initialProblemForm);
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  async function handleProblemSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmissionError(null);

    try {
      await props.onCreateProblem(problemForm);
      setProblemForm(initialProblemForm);
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : "Unable to save problem.");
    }
  }

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await props.onAuthenticate(authForm);
  }

  if (!props.token || !props.user) {
    return (
      <section className="stack">
        <article className="panel auth-panel">
          <div>
            <p className="eyebrow">Sign in to track progress</p>
            <h2>{props.authMode === "login" ? "Welcome back" : "Create your account"}</h2>
            <p>
              Use a simple email/password flow now, then swap in Google auth later if
              you want the resume-polished version.
            </p>
          </div>
          <form className="form-grid" onSubmit={handleAuthSubmit}>
            {props.authMode === "register" ? (
              <label>
                Name
                <input
                  value={authForm.name}
                  onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })}
                  placeholder="Avery Patel"
                />
              </label>
            ) : null}
            <label>
              Email
              <input
                type="email"
                value={authForm.email}
                onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
                placeholder="avery@example.com"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={authForm.password}
                onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                placeholder="At least a few characters"
              />
            </label>
            {props.authError ? <p className="error-text">{props.authError}</p> : null}
            <div className="button-row">
              <button className="primary-button" type="submit">
                {props.authMode === "login" ? "Sign in" : "Create account"}
              </button>
              <button
                className="ghost-button"
                type="button"
                onClick={() =>
                  props.onAuthModeChange(props.authMode === "login" ? "register" : "login")
                }
              >
                {props.authMode === "login" ? "Need an account?" : "Already have an account?"}
              </button>
            </div>
          </form>
        </article>
      </section>
    );
  }

  return (
    <section className="stack">
      <article className="panel section-header">
        <div>
          <p className="eyebrow">Problem tracker</p>
          <h2>Log what you solved while the details are still fresh.</h2>
        </div>
        <div className="button-row">
          <p className="signed-in-copy">Signed in as {props.user.name}</p>
          <button className="ghost-button" type="button" onClick={props.onLogout}>
            Sign out
          </button>
        </div>
      </article>

      <div className="two-column">
        <article className="panel">
          <h3>Add a solved problem</h3>
          <form className="form-grid" onSubmit={handleProblemSubmit}>
            <label>
              Problem title
              <input
                value={problemForm.title}
                onChange={(event) =>
                  setProblemForm({ ...problemForm, title: event.target.value })
                }
                placeholder="Longest Increasing Subsequence"
              />
            </label>
            <label>
              Difficulty
              <select
                value={problemForm.difficulty}
                onChange={(event) =>
                  setProblemForm({
                    ...problemForm,
                    difficulty: event.target.value as Difficulty
                  })
                }
              >
                {difficultyOptions.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Topic tags
              <input
                value={problemForm.topicTags.join(", ")}
                onChange={(event) =>
                  setProblemForm({
                    ...problemForm,
                    topicTags: event.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean)
                  })
                }
                placeholder="dp, arrays, binary search"
              />
            </label>
            <label>
              Date solved
              <input
                type="date"
                value={problemForm.solvedAt}
                onChange={(event) =>
                  setProblemForm({ ...problemForm, solvedAt: event.target.value })
                }
              />
            </label>
            <label>
              Time spent (minutes)
              <input
                type="number"
                min={1}
                value={problemForm.timeSpentMinutes}
                onChange={(event) =>
                  setProblemForm({
                    ...problemForm,
                    timeSpentMinutes: Number(event.target.value)
                  })
                }
              />
            </label>
            <label>
              Attempts
              <input
                type="number"
                min={1}
                value={problemForm.attempts}
                onChange={(event) =>
                  setProblemForm({ ...problemForm, attempts: Number(event.target.value) })
                }
              />
            </label>
            <label>
              Confidence score (1-5)
              <input
                type="number"
                min={1}
                max={5}
                value={problemForm.confidenceScore}
                onChange={(event) =>
                  setProblemForm({
                    ...problemForm,
                    confidenceScore: Number(event.target.value)
                  })
                }
              />
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={problemForm.neededHints}
                onChange={(event) =>
                  setProblemForm({
                    ...problemForm,
                    neededHints: event.target.checked
                  })
                }
              />
              Needed hints
            </label>
            <label className="full-width">
              Notes
              <textarea
                rows={4}
                value={problemForm.notes}
                onChange={(event) =>
                  setProblemForm({ ...problemForm, notes: event.target.value })
                }
                placeholder="What tripped you up? What pattern clicked?"
              />
            </label>
            {submissionError ? <p className="error-text">{submissionError}</p> : null}
            <button className="primary-button" type="submit">
              Save problem
            </button>
          </form>
        </article>

        <article className="panel">
          <h3>Recent solves</h3>
          <div className="problem-list">
            {props.problems.length === 0 ? (
              <p className="empty-state">
                No solves logged yet. Add your first one and the analytics will build from there.
              </p>
            ) : (
              props.problems.map((problem) => (
                <article className="problem-card" key={problem.id}>
                  <div className="problem-card-top">
                    <div>
                      <h4>{problem.title}</h4>
                      <p>
                        {problem.difficulty} | {problem.solved_at}
                      </p>
                    </div>
                    <span className="confidence-pill">
                      Confidence {problem.confidence_score}/5
                    </span>
                  </div>
                  <p>
                    {problem.time_spent_minutes} min | {problem.attempts} attempts |{" "}
                    {problem.needed_hints ? "Used hints" : "No hints"}
                  </p>
                  <div className="tag-row">
                    {problem.topic_tags.map((tag) => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

function AnalyticsPage(props: { analytics: AnalyticsPayload | null; token: string | null }) {
  if (!props.token) {
    return (
      <LockedPage body="Analytics depend on your solve history, so the dashboard appears after you log in and add problems." title="Analytics dashboard" />
    );
  }

  if (!props.analytics) {
    return (
      <section className="panel">
        <h2>Analytics are loading...</h2>
      </section>
    );
  }

  return (
    <section className="stack">
      <div className="stats-grid">
        <article className="panel stat-card">
          <p className="eyebrow">Solved</p>
          <h2>{props.analytics.totals.solved}</h2>
          <p>Total logged problems</p>
        </article>
        <article className="panel stat-card">
          <p className="eyebrow">Current streak</p>
          <h2>{props.analytics.totals.currentStreak}</h2>
          <p>Consecutive active days</p>
        </article>
        <article className="panel stat-card">
          <p className="eyebrow">Longest streak</p>
          <h2>{props.analytics.totals.longestStreak}</h2>
          <p>Best run so far</p>
        </article>
      </div>

      <div className="two-column">
        <article className="panel chart-panel">
          <div className="panel-title-row">
            <div>
              <p className="eyebrow">Solve volume</p>
              <h3>Problems solved per week</h3>
            </div>
          </div>
          <div className="chart-shell">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={props.analytics.weeklySolves}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="week" stroke="#c9c5bb" />
                <YAxis stroke="#c9c5bb" allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="solved" stroke="#f5ab77" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel chart-panel">
          <p className="eyebrow">Time profile</p>
          <h3>Average time by difficulty</h3>
          <div className="chart-shell">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={props.analytics.averageTimeByDifficulty}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="difficulty" stroke="#c9c5bb" />
                <YAxis stroke="#c9c5bb" />
                <Tooltip />
                <Bar dataKey="averageTime" radius={[10, 10, 0, 0]}>
                  {props.analytics.averageTimeByDifficulty.map((entry) => (
                    <Cell
                      key={entry.difficulty}
                      fill={
                        entry.difficulty === "Easy"
                          ? "#9dd8d1"
                          : entry.difficulty === "Medium"
                            ? "#f5ab77"
                            : "#ff8f8a"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <div className="two-column">
        <article className="panel chart-panel">
          <p className="eyebrow">Topic mastery</p>
          <h3>Completion rate by topic</h3>
          <div className="chart-shell">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={props.analytics.topicPerformance.slice(0, 8)} layout="vertical">
                <CartesianGrid stroke="rgba(255,255,255,0.08)" horizontal={false} />
                <XAxis type="number" stroke="#c9c5bb" />
                <YAxis dataKey="topic" type="category" stroke="#c9c5bb" width={100} />
                <Tooltip />
                <Bar dataKey="completionRate" fill="#9dd8d1" radius={[0, 10, 10, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel chart-panel">
          <p className="eyebrow">Difficulty mix</p>
          <h3>Easy / Medium / Hard breakdown</h3>
          <div className="chart-shell">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={props.analytics.difficultyBreakdown}
                  dataKey="solved"
                  nameKey="difficulty"
                  outerRadius={110}
                >
                  {props.analytics.difficultyBreakdown.map((entry) => (
                    <Cell
                      key={entry.difficulty}
                      fill={
                        entry.difficulty === "Easy"
                          ? "#9dd8d1"
                          : entry.difficulty === "Medium"
                            ? "#f5ab77"
                            : "#ff8f8a"
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <div className="two-column">
        <article className="panel">
          <p className="eyebrow">Weak spots</p>
          <h3>Weakest topics</h3>
          <div className="problem-list">
            {props.analytics.weakestTopics.map((topic) => (
              <article className="problem-card" key={topic.topic}>
                <div className="problem-card-top">
                  <h4>{topic.topic}</h4>
                  <span className="confidence-pill">Mastery {topic.masteryScore}</span>
                </div>
                <p>
                  {topic.completionRate}% clean solves | {topic.averageConfidence}/5 confidence
                </p>
              </article>
            ))}
          </div>
        </article>

        <article className="panel">
          <p className="eyebrow">Review queue</p>
          <h3>Review soon</h3>
          <div className="problem-list">
            {props.analytics.reviewSoon.length === 0 ? (
              <p className="empty-state">Nothing urgent to review right now.</p>
            ) : (
              props.analytics.reviewSoon.map((problem) => (
                <article className="problem-card" key={problem.id}>
                  <div className="problem-card-top">
                    <h4>{problem.title}</h4>
                    <span className="confidence-pill">Priority {problem.priorityScore}</span>
                  </div>
                  <p>
                    {problem.difficulty} | {problem.solvedAt}
                  </p>
                  <div className="tag-row">
                    {problem.topicTags.map((tag) => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

function RecommendationsPage(props: {
  token: string | null;
  recommendations: Recommendation[];
}) {
  if (!props.token) {
    return (
      <LockedPage
        title="Recommendation system"
        body="Recommendations use weakness, recency, review priority, and difficulty fit once you have solve history."
      />
    );
  }

  return (
    <section className="stack">
      <article className="panel">
        <p className="eyebrow">What should I solve next?</p>
        <h2>Top 5 practice recommendations</h2>
        <p className="hero-copy">
          Weighted by weakness score, days since the topic was practiced, difficulty
          progression, and review priority.
        </p>
      </article>
      <div className="problem-list">
        {props.recommendations.length === 0 ? (
          <article className="panel">
            <h3>Add a bit more history to unlock recommendations.</h3>
            <p>
              Once you log a few problems, this page will rank what to tackle next using
              weakness, recency, difficulty fit, and review signals.
            </p>
          </article>
        ) : (
          props.recommendations.map((problem, index) => (
            <article className="panel recommendation-card" key={problem.title}>
              <div className="problem-card-top">
                <div>
                  <p className="eyebrow">Recommendation {index + 1}</p>
                  <h3>{problem.title}</h3>
                  <p>
                    {problem.difficulty} | score {problem.score}
                  </p>
                </div>
                <div className="tag-row">
                  {problem.topicTags.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <p>{problem.reason}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("cp_token"));
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("cp_user");
    return storedUser ? (JSON.parse(storedUser) as User) : null;
  });
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [authError, setAuthError] = useState<string | null>(null);
  const [problems, setProblems] = useState<ProblemRecord[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsPayload | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    if (!token) {
      setProblems([]);
      return;
    }

    fetchProblems(token)
      .then(setProblems)
      .catch(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("cp_token");
        localStorage.removeItem("cp_user");
      });
  }, [token]);

  useEffect(() => {
    if (!token) {
      setAnalytics(null);
      setRecommendations([]);
      return;
    }

    fetchAnalytics(token).then(setAnalytics).catch(() => setAnalytics(null));
    fetchRecommendations(token).then(setRecommendations).catch(() => setRecommendations([]));
  }, [token, problems.length]);

  async function handleAuthenticate(payload: { name?: string; email: string; password: string }) {
    setAuthError(null);

    try {
      const response: AuthPayload =
        authMode === "login"
          ? await login({ email: payload.email, password: payload.password })
          : await register({
              name: payload.name ?? "",
              email: payload.email,
              password: payload.password
            });

      setToken(response.token);
      setUser(response.user);
      localStorage.setItem("cp_token", response.token);
      localStorage.setItem("cp_user", JSON.stringify(response.user));
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Unable to authenticate.");
    }
  }

  async function handleCreateProblem(input: ProblemInput) {
    if (!token) {
      throw new Error("You need to sign in first.");
    }

    const createdProblem = await createProblem(token, input);
    setProblems((currentProblems) => [createdProblem, ...currentProblems]);
  }

  function handleLogout() {
    setToken(null);
    setUser(null);
    setProblems([]);
    localStorage.removeItem("cp_token");
    localStorage.removeItem("cp_user");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="brand-kicker">CP</p>
          <h2>Coding Progress</h2>
          <p className="brand-copy">
            A focused home base for interview prep and measurable growth.
          </p>
        </div>
        <nav className="nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/tracker"
            element={
              <TrackerPage
                token={token}
                user={user}
                problems={problems}
                onCreateProblem={handleCreateProblem}
                authError={authError}
                authMode={authMode}
                onAuthModeChange={setAuthMode}
                onAuthenticate={handleAuthenticate}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            path="/analytics"
            element={<AnalyticsPage analytics={analytics} token={token} />}
          />
          <Route
            path="/recommendations"
            element={<RecommendationsPage recommendations={recommendations} token={token} />}
          />
        </Routes>
      </main>
    </div>
  );
}
