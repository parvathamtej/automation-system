import { motion } from 'framer-motion';
import { BrainCircuit, Sparkles } from 'lucide-react';

export default function AIReasoningCard({ analysis, isVisible }) {
  if (!analysis) return null;

  return (
    <motion.div
      className="reasoning-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0.55, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="reasoning-header">
        <div className="pill subtle-pill">
          <BrainCircuit size={14} />
          AI Thinking Panel
        </div>
        <span className="terminal-dot-row">
          <span />
          <span />
          <span />
        </span>
      </div>

      <div className="reasoning-grid">
        <div>
          <span className="reasoning-label">Intent detected</span>
          <strong>{analysis.intent}</strong>
        </div>
        <div>
          <span className="reasoning-label">Urgency score</span>
          <strong>{analysis.urgencyScore}/100</strong>
        </div>
        <div>
          <span className="reasoning-label">Tone selected</span>
          <strong>{analysis.personalization.preferredTone}</strong>
        </div>
        <div>
          <span className="reasoning-label">Audience</span>
          <strong>{analysis.personalization.audience}</strong>
        </div>
      </div>

      <div className="reasoning-body">
        <div className="reasoning-title">
          <Sparkles size={14} />
          Reasoning
        </div>
        <p>{analysis.route.reason}</p>
        <p className="typed-summary">{analysis.aiSummary}</p>
      </div>
    </motion.div>
  );
}
