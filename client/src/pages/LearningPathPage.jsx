import { useMemo, useState } from 'react';
import { CheckCircle2, BrainCircuit, Activity, Cpu, Lightbulb, Play, BookOpen, Target, Sparkles } from 'lucide-react';
import Modal from '../components/ui/Modal';
import './Workflow.css';

const levelOptions = ['Beginner', 'Intermediate', 'Advanced'];
const timePerDayOptions = ['1 hour', '2 hours', '3+ hours'];

const ProcessStep = ({ icon: Icon, title, desc }) => (
  <div className="process-vertical-item">
    <div className="process-icon-container">
      <Icon size={18} />
    </div>
    <div className="process-text">
      <h4>{title}</h4>
      <p>{desc}</p>
    </div>
  </div>
);

function Field({ label, children }) {
  return (
    <div className="form-field-group">
      <label>{label}</label>
      {children}
    </div>
  );
}

export default function LearningPathPage() {
  const [topic, setTopic] = useState('React Framework');
  const [currentLevel, setCurrentLevel] = useState(levelOptions[1]);
  const [timePerDay, setTimePerDay] = useState(timePerDayOptions[1]);
  const [goalOrDeadline, setGoalOrDeadline] = useState('Production Portfolio Deployment');
  const [background, setBackground] = useState('JavaScript ES6+ proficiency; basic DOM Manipulation exposure.');
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
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/learning-path/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, currentLevel, timePerDay, background, goalOrDeadline }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Path Generation Error');
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
        body: JSON.stringify({ inputs: { topic, currentLevel, timePerDay, goalOrDeadline, background }, plan }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Path Persistance Error');
      setShowConfirmation(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsConfirming(false);
    }
  }

  return (
    <div className="aesthetic-form-wrapper">
       <div className="workflow-overview-section container-tight">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.2fr) 1fr', gap: '64px', marginBottom: '80px', alignItems: 'flex-start' }}>
           <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent)', marginBottom: '16px' }}>Simulation // Learning Node 02</div>
              <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '24px', letterSpacing: '-0.03em' }}>Learning Path Generator</h1>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '32px' }}>
                Acquiring a new skill in a short timeframe requires a highly optimized curriculum. This automation node simulates a personal educational coordinator that synthesizes study roadmaps specifically calibrated to your current knowledge level and available daily time.
              </p>
              
              <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border-soft)' }}>
                 <h4 style={{ fontSize: '0.75rem', fontWeight: 800, marginBottom: '20px', textTransform: 'uppercase' }}>Workflow Logic Path</h4>
                 <div className="process-vertical-list">
                    <ProcessStep 
                      icon={Target} 
                      title="Goal Extraction" 
                      desc="Captures the specific outcome and deadline constraints." 
                    />
                    <ProcessStep 
                      icon={BookOpen} 
                      title="Syllabus Synthesis" 
                      desc="Generates a multi-phase educational roadmap optimized for focus." 
                    />
                    <ProcessStep 
                      icon={Sparkles} 
                      title="Adaptive Milestone Gen" 
                      desc="Allocates complex topics into digestible daily training blocks." 
                    />
                 </div>
              </div>
           </div>

           <div className="aesthetic-card-layout" style={{ margin: 0, width: '100%' }}>
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '8px' }}>Learning Input Node</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Define your educational target to generate protocol.</p>
              </div>

              <form className="workflow-form-container" onSubmit={analyze}>
                <Field label="Expertise Target">
                  <input
                    className="form-input-element"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Distributed Systems, Neural Networks"
                    required
                    style={{ fontFamily: 'var(--font-mono)' }}
                  />
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Field label="Current Level">
                    <select className="form-input-element" value={currentLevel} onChange={(e) => setCurrentLevel(e.target.value)}>
                      {levelOptions.map((option) => (<option key={option}>{option}</option>))}
                    </select>
                  </Field>
                  <Field label="Daily Availability">
                    <select className="form-input-element" value={timePerDay} onChange={(e) => setTimePerDay(e.target.value)}>
                      {timePerDayOptions.map((option) => (<option key={option}>{option}</option>))}
                    </select>
                  </Field>
                </div>

                <Field label="Target Deadline">
                  <input
                    className="form-input-element"
                    value={goalOrDeadline}
                    onChange={(e) => setGoalOrDeadline(e.target.value)}
                    placeholder="e.g. Deployment in 14 days"
                  />
                </Field>

                <Field label="Cognitive Context">
                  <textarea 
                    className="form-input-element"
                    rows={3} 
                    value={background} 
                    onChange={(e) => setBackground(e.target.value)}
                    placeholder="Describe current mastery level..."
                    style={{ fontFamily: 'var(--font-mono)' }}
                  />
                </Field>

                <button type="submit" className="workflow-submit-btn" disabled={isAnalyzing} style={{ background: 'var(--accent)' }}>
                  {isAnalyzing ? <Activity className="animate-spin" size={14} /> : <Lightbulb size={14} />}
                  {isAnalyzing ? 'Mapping Path...' : 'Synthesize Roadmap'}
                </button>
              </form>

              {error && (
                <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: '0.72rem' }}>
                  <strong>Engine Error:</strong> {error}
                </div>
              )}

              {plan && (
                <div className="results-preview-block" style={{ marginTop: '32px' }}>
                  <div className="metric-strip" style={{ gap: '16px', padding: '12px' }}>
                    <div className="metric-box">
                      <span>Status</span>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--accent)' }}>READY</strong>
                    </div>
                  </div>
                  <p style={{ marginTop: '16px', fontSize: 'var(--font-size-s)', lineHeight: 1.7, opacity: 0.8, marginBottom: '24px' }}>{plan.summary}</p>
                  
                  <div className="result-card-inner" style={{ gap: '12px' }}>
                    {plan.days?.map((day, idx) => (
                      <div key={idx} className="result-item" style={{ padding: '16px', borderLeft: '2px solid var(--accent)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span className="result-item-label" style={{ margin: 0 }}>{day.day}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{day.title}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-body)', marginBottom: '8px' }}>
                          <strong>Focus:</strong> {day.topics?.join(', ')}
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {day.tasks?.map((task, tidx) => (
                            <li key={tidx}>{task}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    type="button" 
                    className="workflow-submit-btn" 
                    style={{ background: 'var(--primary)', marginTop: '24px', width: '100%', fontSize: '0.75rem' }}
                    disabled={!canConfirm || isConfirming} 
                    onClick={confirm}
                  >
                    {isConfirming ? <Activity className="animate-spin" size={12} /> : <Play size={12} />}
                    {isConfirming ? 'Persisting...' : 'Acknowledge Study Plan'}
                  </button>
                </div>
              )}
           </div>
        </div>
      </div>

      {showConfirmation && (
        <Modal title="Roadmap Deployment" onClose={() => setShowConfirmation(false)}>
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ width: '60px', height: '60px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto 24px', border: '1px solid var(--accent)' }}>
              <CheckCircle2 size={32} color="var(--accent)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '12px' }}>Protocol Saved</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>The personalized Learning Protocol has been successfully generated and stored.</p>
            <button className="workflow-submit-btn" style={{ padding: '10px 24px', margin: '24px auto 0' }} onClick={() => setShowConfirmation(false)}>Close Session</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
