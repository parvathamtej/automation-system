import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles } from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
};

const stats = [
  { label: 'Active templates', value: '3' },
  { label: 'Success rate', value: '99.2%' },
];

export default function LandingPage({ onLaunch }) {
  return (
    <div className="landing-shell">
      <div className="landing-grid" />
      <div className="landing-glow landing-glow-left" />
      <div className="landing-glow landing-glow-right" />

      <motion.header className="landing-topbar" {...fadeIn}>
        <div className="brand-lockup">
          <div className="brand-mark">A</div>
          <div>
            <p className="eyebrow">Project Framework</p>
            <h1 className="brand-title">Hybrid Workflow Engine</h1>
          </div>
        </div>

        <button className="button button-secondary landing-launch" onClick={onLaunch}>
          Launch simulator
        </button>
      </motion.header>

      <main className="landing-main">
        <motion.section className="landing-copy" {...fadeIn}>
          <div className="pill">
            <Sparkles size={14} />
            Reconfigurable Intelligent Automation
          </div>

          <h2 className="landing-headline">Workflows built to adapt seamlessly.</h2>
          <p className="landing-description">
            This live visualization turns your workflow abstract into a working system:
            events enter through dynamic sources, an AI reasoning layer chooses the
            optimal path, and an orchestration engine executes the pipeline.
          </p>

          <div className="landing-actions">
            <button className="button button-primary" onClick={onLaunch}>
              <Play size={16} />
              Simulate workflow
            </button>
            <a className="button button-secondary" href="#how-it-works">
              How it works
              <ArrowRight size={16} />
            </a>
          </div>
        </motion.section>

        <motion.aside
          className="hero-metrics-card"
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="hero-metrics-label">Live system metrics</div>
          <div className="hero-metrics-grid">
            {stats.map((stat) => (
              <div key={stat.label} className="hero-metric">
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>
        </motion.aside>
      </main>

      <section className="landing-details" id="how-it-works">
        <motion.div className="feature-card" {...fadeIn}>
          <p className="feature-kicker">Signal intake</p>
          <h3>Events enter from forms, CRM updates, tickets, and campaign triggers.</h3>
          <p>
            Each workflow template carries its own triggers, routing rules, and orchestration
            actions so the simulator behaves like a product, not a placeholder page.
          </p>
        </motion.div>

        <motion.div className="feature-card" {...fadeIn}>
          <p className="feature-kicker">AI decisioning</p>
          <h3>The reasoning layer chooses tone, urgency, and the correct execution path.</h3>
          <p>
            Scores and route summaries are surfaced in the dashboard so you can inspect how
            the engine responds before it pushes work downstream.
          </p>
        </motion.div>

        <motion.div className="feature-card" {...fadeIn}>
          <p className="feature-kicker">Orchestration</p>
          <h3>Simulation opens the current dashboard and lets you execute the real flow.</h3>
          <p>
            One click takes you into the operational workspace where the same theme, spacing,
            and interaction patterns now continue consistently.
          </p>
        </motion.div>
      </section>
    </div>
  );
}
