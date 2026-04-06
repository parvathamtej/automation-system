import { BrainCircuit, LifeBuoy, ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Cards';

const workflows = [
  {
    id: 'incident',
    title: 'AI Incident Triage & Response',
    icon: ShieldAlert,
    description:
      'Turn messy bug reports into a clear summary, likely root cause, and suggested next action — ready to raise as a ticket.',
    bullets: ['Capture the signal', 'Generate structured triage', 'Raise a dev ticket'],
  },
  {
    id: 'learning',
    title: 'AI Personalized Learning Path Generator',
    icon: BrainCircuit,
    description:
      'Generate a personalized learning plan based on your goal, current level, and available time — with milestones and next steps.',
    bullets: ['Understand goal + level', 'Create weekly plan', 'Confirm & share plan'],
  },
  {
    id: 'support',
    title: 'AI-Powered Support Escalation System',
    icon: LifeBuoy,
    description:
      'Analyze support issues, estimate urgency, choose a response route, and simulate escalation actions with backend proof.',
    bullets: ['Classify intent', 'Score urgency', 'Execute escalation steps'],
  },
];

export default function Home({ onNavigate }) {
  return (
    <div className="page">
      <section className="hero">
        <div className="hero-copy">
          <h1>Build automation your team can actually trust.</h1>
          <p className="hero-subtitle">
            This demo shows how AI can turn real-world inputs into structured decisions and
            repeatable workflows — with clear outputs, actionable steps, and confirmation.
          </p>

          <div className="hero-actions">
            <Button variant="primary" onClick={() => onNavigate('incident')}>
              Run Incident Triage
            </Button>
            <Button variant="secondary" onClick={() => onNavigate('learning')}>
              Generate Learning Path
            </Button>
          </div>
        </div>

        <div className="hero-surface" aria-hidden="true">
          <div className="hero-surface-inner" />
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Automated workflows</p>
            <h2>Three workflows, one goal</h2>
            <p>Reduce manual triage time and make outcomes consistent.</p>
          </div>
        </div>

        <div className="workflow-grid">
          {workflows.map((workflow) => {
            const Icon = workflow.icon;
            return (
              <article className="workflow-card" key={workflow.id}>
                <div className="workflow-card-top">
                  <div className="workflow-icon">
                    <Icon size={18} />
                  </div>
                  <div className="table-chip">Automated</div>
                </div>

                <h3>{workflow.title}</h3>
                <p>{workflow.description}</p>

                <ol className="workflow-steps">
                  {workflow.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ol>

                <Button className="workflow-cta" variant="secondary" onClick={() => onNavigate(workflow.id)}>
                  Execute workflow
                </Button>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

