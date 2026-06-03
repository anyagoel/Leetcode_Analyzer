import { FormEvent, useEffect, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";

import { createProblem, fetchProblems, login, register } from "./lib/api";
import { AuthPayload, Difficulty, ProblemInput, ProblemRecord, User } from "./types";

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

export function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("cp_token"));
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("cp_user");
    return storedUser ? (JSON.parse(storedUser) as User) : null;
  });
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [authError, setAuthError] = useState<string | null>(null);
  const [problems, setProblems] = useState<ProblemRecord[]>([]);

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
            element={
              <PlaceholderPage
                title="Analytics Dashboard"
                body="Visualize streaks, topic performance, weekly solve volume, and difficulty trends."
              />
            }
          />
          <Route
            path="/recommendations"
            element={
              <PlaceholderPage
                title="Recommendations"
                body="Get a ranked list of practice targets based on weakness, recency gaps, and difficulty progression."
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}
