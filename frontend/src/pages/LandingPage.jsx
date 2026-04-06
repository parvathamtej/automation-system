import { motion } from 'framer-motion';
import { ArrowRight, BrainCircuit, Play, ServerCog, Workflow } from 'lucide-react';

const features = [
  {
    icon: Workflow,
    title: 'Event-driven automation',
    description:
      'Business events trigger a real backend workflow that evaluates intent, urgency, and routing rules before any downstream action executes.',
  },
  {
    icon: BrainCircuit,
    title: 'AI reasoning layer',
    description:
      'The platform explains how intent was classified, why a route was chosen, and which tone the system selected for outreach.',
  },
  {
    icon: ServerCog,
    title: 'Backend execution proof',
    description:
      'Runs expose timestamps, latency, SMTP responses, and technical logs so viewers can see actual execution rather than mocked frontend state.',
  },
];

export default function LandingPage({ onLaunch }) {
  return (
    <div className="landing-page">
      <div className="landing-content">
        <motion.header
          className="landing-header"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="landing-brand">
            <div className="brand-mark">A</div>
            <div>
              <p className="eyebrow">AI Workflow Automation</p>
              <h1>Hybrid Workflow Engine</h1>
            </div>
          </div>

          <button className="button button-secondary" onClick={onLaunch}>
            Launch simulator
          </button>
        </motion.header>

        <section className="hero-section">
          <motion.div
            className="hero-copy"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            <div className="hero-badge">Production-style orchestration demo</div>
            <h2>See how AI classifies events and triggers real backend workflow actions.</h2>
            <p>
              This product demonstrates an automation platform where incoming events are
              analyzed by an AI layer, routed through orchestration logic, and executed by a
              backend service with visible proof of what actually ran.
            </p>

            <div className="hero-actions">
              <button className="button button-primary" onClick={onLaunch}>
                <Play size={16} />
                Simulate workflow
              </button>
              <a className="button button-tertiary" href="#what-it-does">
                Explore system
                <ArrowRight size={16} />
              </a>
            </div>
          </motion.div>

          <motion.div
            className="hero-preview"
            initial={{ opacity: 0, scale: 0.98, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <div className="hero-preview-top">
              <span className="terminal-dot red" />
              <span className="terminal-dot amber" />
              <span className="terminal-dot green" />
              <p>workflow-runtime.tsx</p>
            </div>

            <div className="preview-grid">
              <div className="preview-card">
                <span>Trigger</span>
                <strong>Support portal event</strong>
              </div>
              <div className="preview-card">
                <span>AI Decision</span>
                <strong>Priority incident response</strong>
              </div>
              <div className="preview-card">
                <span>Execution proof</span>
                <strong>SMTP 250 OK received</strong>
              </div>
              <div className="preview-card">
                <span>Latency</span>
                <strong>1.2s total runtime</strong>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="feature-grid" id="what-it-does">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.article
                className="feature-panel"
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.12 + index * 0.05 }}
              >
                <div className="feature-icon">
                  <Icon size={18} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.article>
            );
          })}
        </section>
      </div>
    </div>
  );
}
