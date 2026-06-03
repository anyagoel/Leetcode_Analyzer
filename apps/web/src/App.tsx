import { NavLink, Route, Routes } from "react-router-dom";

const links = [
  { to: "/", label: "Overview" },
  { to: "/tracker", label: "Tracker" },
  { to: "/analytics", label: "Analytics" },
  { to: "/recommendations", label: "Recommendations" }
];

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

export function App() {
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
              <PlaceholderPage
                title="Problem Tracker"
                body="Add solved problems with metadata like topic tags, time spent, attempts, and post-solve confidence."
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

