import { useMemo, useState } from 'react';
import { CheckCircle2, ShieldAlert, Cpu, Activity, Play, ChevronRight, FileText, CheckSquare } from 'lucide-react';
import Modal from '../ui/Modal';
import '../../pages/Workflow.css';

const whereOptions = ['Login / Auth', 'Payments', 'Dashboard', 'API / Backend', 'Other'];
const observedOptions = ['Page not loading', 'Latency spikes', 'Error messages', 'App crash', 'Action failed'];
const impactOptions = ['Minor', 'Moderate', 'Severe'];

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

export default function IncidentTriage() {
  const [whatWentWrong, setWhatWentWrong] = useState('');
  const [where, setWhere] = useState(whereOptions[0]);
  const [observedIssue, setObservedIssue] = useState(observedOptions[2]);
  const [impact, setImpact] = useState(impactOptions[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [isRaising, setIsRaising] = useState(false);
  const [ticketMessage, setTicketMessage] = useState(null);
  const [modalStep, setModalStep] = useState('analysis');
  const [showModal, setShowModal] = useState(false);

  const canRaise = useMemo(() => Boolean(analysis?.summary && whatWentWrong.trim()), [analysis, whatWentWrong]);

  async function analyzeIssue(event) {
    event.preventDefault();
    setError(null);
    setAnalysis(null);
    setTicketMessage(null);
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/incident-triage/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatWentWrong, where, observedIssue, impact }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Analysis engine failure');
      setAnalysis(data);
      setModalStep('analysis');
      setShowModal(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function raiseTicket() {
    if (!canRaise) return;
    setError(null);
    setIsRaising(true);
    try {
      const response = await fetch('/api/incident-triage/raise-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: { whatWentWrong, where, observedIssue, impact }, analysis }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Ticket dispatch failure');
      setTicketMessage(
        data?.message ||
          "Your ticket has been raised and sent to the dev team. It will be resolved ASAP—thanks for your patience.",
      );
      setModalStep('success');
      setShowModal(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsRaising(false);
    }
  }

  return (
    <div className="aesthetic-form-wrapper">
      <div className="workflow-overview-section container-tight">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.2fr) 1fr', gap: '64px', marginBottom: '80px', alignItems: 'flex-start' }}>
           <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--primary)', marginBottom: '16px' }}>Simulation // Triage Node 01</div>
              <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '24px', letterSpacing: '-0.03em' }}>AI Incident Triage & Response</h1>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '32px' }}>
                When users face system crashes or failures, manual debugging consumes valuable developer time. This automation simulates a real-time response system that analyzes problem reports and generates structured summaries, hypothesize root causes, and proposes immediate mitigation vectors.
              </p>
              
              <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border-soft)' }}>
                 <h4 style={{ fontSize: '0.75rem', fontWeight: 800, marginBottom: '20px', textTransform: 'uppercase' }}>Workflow Logic Path</h4>
                 <div className="process-vertical-list">
                    <ProcessStep 
                      icon={FileText} 
                      title="Input Analysis" 
                      desc="Collects raw incident telemetry and user-reported symptoms." 
                    />
                    <ProcessStep 
                      icon={Cpu} 
                      title="Pattern Evaluation" 
                      desc="Cross-references symptoms with known error classes and system domains." 
                    />
                    <ProcessStep 
                      icon={CheckSquare} 
                      title="Structured Dispatch" 
                      desc="Routes formulated solutions to the correct response queue." 
                    />
                 </div>
              </div>
           </div>

           <div className="aesthetic-card-layout" style={{ margin: 0, width: '100%' }}>
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '8px' }}>Active Input Terminal</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Supply incident context to begin logic loop.</p>
              </div>

              <form className="workflow-form-container" onSubmit={analyzeIssue}>
                <Field label="Entropy Observation">
                  <textarea
                    className="form-input-element"
                    rows={4}
                    value={whatWentWrong}
                    onChange={(e) => setWhatWentWrong(e.target.value)}
                    placeholder="Describe deviation from expected behavior..."
                    required
                    style={{ fontFamily: 'var(--font-mono)' }}
                  />
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <Field label="System Domain">
                    <select className="form-input-element" value={where} onChange={(e) => setWhere(e.target.value)}>
                      {whereOptions.map((option) => (<option key={option}>{option}</option>))}
                    </select>
                  </Field>
                  <Field label="Failure Class">
                    <select className="form-input-element" value={observedIssue} onChange={(e) => setObservedIssue(e.target.value)}>
                      {observedOptions.map((option) => (<option key={option}>{option}</option>))}
                    </select>
                  </Field>
                </div>

                <Field label="Priority Class">
                  <select className="form-input-element" value={impact} onChange={(e) => setImpact(e.target.value)}>
                    {impactOptions.map((option) => (<option key={option}>{option}</option>))}
                  </select>
                </Field>

                <button type="submit" className="workflow-submit-btn" disabled={isAnalyzing}>
                  {isAnalyzing ? <Activity className="animate-spin" size={14} /> : <Play size={14} />}
                  {isAnalyzing ? 'Analyzing Patterns...' : 'Trigger Workflow'}
                </button>
              </form>

              {error && (
                <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: '0.72rem' }}>
                  <strong>Engine Error:</strong> {error}
                </div>
              )}

           </div>
        </div>
      </div>

      {showModal && (
        <Modal
          title={modalStep === 'success' ? 'Ticket Raised' : 'Triage Report'}
          onClose={() => {
            setShowModal(false);
            setModalStep('analysis');
          }}
        >
          {modalStep === 'success' ? (
            <div style={{ textAlign: 'center', padding: '24px' }}>
              <div style={{ width: '60px', height: '60px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto 20px', border: '1px solid var(--success)' }}>
                <CheckCircle2 size={32} color="var(--success)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '12px' }}>Success</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {ticketMessage || 'Your ticket has been raised and sent to the dev team. It will be resolved ASAP—thanks for your patience.'}
              </p>
              <button className="workflow-submit-btn" style={{ padding: '10px 24px', margin: '24px auto 0' }} onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          ) : (
            <div className="results-preview-block" style={{ marginTop: 0 }}>
              {!!error && (
                <div style={{ marginBottom: '16px', padding: '16px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: '0.72rem' }}>
                  <strong>Engine Error:</strong> {error}
                </div>
              )}

              <div className="metric-strip" style={{ gap: '16px', padding: '12px' }}>
                <div className="metric-box">
                  <span>Status</span>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>DONE</strong>
                </div>
                <div className="metric-box">
                  <span>Conf</span>
                  <strong style={{ fontSize: '0.9rem' }}>94%</strong>
                </div>
              </div>

              {analysis ? (
                <div className="result-card-inner" style={{ gap: '12px' }}>
                  <div className="result-item" style={{ padding: '12px' }}>
                    <span className="result-item-label">Summary</span>
                    <p className="result-item-content" style={{ fontSize: '0.75rem' }}>{analysis.summary}</p>
                  </div>
                  <div className="result-item" style={{ padding: '12px' }}>
                    <span className="result-item-label">Likely Root Cause</span>
                    <p className="result-item-content" style={{ fontSize: '0.75rem' }}>{analysis.root_cause}</p>
                  </div>
                  <div className="result-item" style={{ padding: '12px', borderLeft: '2px solid var(--primary)' }}>
                    <span className="result-item-label">Suggested Mitigation</span>
                    <p className="result-item-content" style={{ fontSize: '0.75rem' }}>{analysis.suggested_action}</p>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '18px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No analysis available yet.</div>
              )}

              <button
                type="button"
                className="workflow-submit-btn"
                style={{ background: 'var(--primary)', marginTop: '24px', width: '100%', fontSize: '0.75rem' }}
                disabled={!canRaise || isRaising}
                onClick={raiseTicket}
              >
                {isRaising ? <Activity className="animate-spin" size={12} /> : <Play size={12} />}
                {isRaising ? 'Raising Ticket...' : 'Yes, raise a ticket'}
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
