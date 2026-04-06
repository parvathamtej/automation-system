import { useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, Compass, GraduationCap } from 'lucide-react';
import { Button } from '../components/ui/Cards';
import Modal from '../components/ui/Modal';

const levelOptions = ['Beginner', 'Intermediate', 'Advanced'];
const timePerDayOptions = ['1 hour', '2 hours', '3+ hours'];

function Field({ label, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

export default function LearningPathPage() {
  const [topic, setTopic] = useState('React');
  const [currentLevel, setCurrentLevel] = useState(levelOptions[1]);
  const [timePerDay, setTimePerDay] = useState(timePerDayOptions[1]);
  const [goalOrDeadline, setGoalOrDeadline] = useState('Build a portfolio project');
  const [background, setBackground] = useState('I know basic JS but I’m new to React.');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const canConfirm = useMemo(() => Boolean(plan?.summary && plan?.days?.length), [plan]);

  async function analyze(event) {
    event.preventDefault();
    setError(null);
    setPlan(null);
    setShowConfirmation(false);
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/learning-path/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          currentLevel,
          timePerDay,
          background,
          goalOrDeadline,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Could not generate learning path');
      setPlan(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function confirm() {
    if (!canConfirm) return;
    setError(null);
    setIsConfirming(true);

    try {
      const response = await fetch('/api/learning-path/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: { topic, currentLevel, timePerDay, goalOrDeadline, background },
          plan,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Could not confirm learning path');
      setShowConfirmation(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsConfirming(false);
    }
  }

  return (
    <div className="page">
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Workflow</p>
            <h2>AI Personalized Learning Path Generator</h2>
            <p>
              Students often follow generic study plans that don’t match their skill level or goals.
              This workflow analyzes the user’s background and generates a personalized learning roadmap with structured tasks.
            </p>
          </div>
        </div>

        <div className="steps-card">
          <h3>What to expect</h3>
          <ol>
            <li>Tell us what you want to learn and your current level.</li>
            <li>AI generates a day-wise plan (3–7 days) with topics and tasks.</li>
            <li>Confirm to save/share the roadmap (demo: console or SMTP).</li>
          </ol>
        </div>
      </section>

      <section className="workflow-split">
        <form className="workflow-panel" onSubmit={analyze}>
          <div className="panel-header">
            <div className="pill subtle-pill">
              <Compass size={14} />
              Inputs
            </div>
            <h3>Tell the AI what you want to learn</h3>
            <p>Keep it simple — a short roadmap is easier to follow.</p>
          </div>

          <Field label="What do you want to learn? (Goal / Topic)">
            <input
              className="input-dark"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="React, DSA, Machine Learning"
              required
            />
          </Field>

          <div className="form-grid">
            <Field label="Current level">
              <select className="input-dark" value={currentLevel} onChange={(e) => setCurrentLevel(e.target.value)}>
                {levelOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </Field>
            <Field label="How much time can you spend per day?">
              <select className="input-dark" value={timePerDay} onChange={(e) => setTimePerDay(e.target.value)}>
                {timePerDayOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Your goal or deadline (optional but nice)">
            <input
              className="input-dark"
              value={goalOrDeadline}
              onChange={(e) => setGoalOrDeadline(e.target.value)}
              placeholder="Build a project, prepare for placements, learn basics in 1 week"
            />
          </Field>

          <Field label="Background (optional)">
            <textarea className="input-dark" rows={4} value={background} onChange={(e) => setBackground(e.target.value)} />
          </Field>

          <div className="form-actions">
            <Button variant="primary" type="submit" disabled={isAnalyzing}>
              {isAnalyzing ? 'Generating...' : 'Generate Roadmap'}
            </Button>
          </div>

          {error ? (
            <div className="error-panel">
              <h3>Could not complete request</h3>
              <p>{error}</p>
            </div>
          ) : null}
        </form>

        <div className="workflow-panel">
          <div className="panel-header">
            <div className="pill subtle-pill">
              <BookOpen size={14} />
              Output
            </div>
            <h3>Generated learning roadmap</h3>
            <p>Review the day-wise plan and confirm to save it.</p>
          </div>

          {plan ? (
            <div className="result-card">
              <div className="result-head">
                <div className="result-icon">
                  <GraduationCap size={18} />
                </div>
                <div>
                  <h4>Summary</h4>
                  <p>{plan.summary}</p>
                </div>
              </div>

              <div className="result-grid">
                <div>
                  <span>Topic</span>
                  <strong>{plan.topic}</strong>
                </div>
                <div>
                  <span>Duration</span>
                  <strong>{plan.duration}</strong>
                </div>
                <div>
                  <span>Time per day</span>
                  <strong>{plan.timePerDay}</strong>
                </div>
              </div>

              <div className="result-list">
                <h4>Day-wise plan</h4>
                <ol>
                  {plan.days.map((day) => (
                    <li key={day.day}>
                      <strong>{day.day}: {day.title}</strong>
                      <span>{day.topics?.join?.(', ')}</span>
                      <span>{day.tasks?.join?.(' • ')}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="form-actions">
                <Button variant="secondary" type="button" disabled={!canConfirm || isConfirming} onClick={confirm}>
                  {isConfirming ? 'Confirming...' : 'Confirm & Save Plan'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="empty-runtime">
              <GraduationCap size={28} />
              <h3>No plan yet</h3>
              <p>Generate a learning roadmap to see a day-wise plan.</p>
            </div>
          )}
        </div>
      </section>

      {showConfirmation ? (
        <Modal title="Learning path saved" onClose={() => setShowConfirmation(false)}>
          <div className="success-panel">
            <h3>
              <CheckCircle2 size={16} /> Confirmed
            </h3>
            <p>Your learning path has been saved. You can now share it with your team.</p>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
