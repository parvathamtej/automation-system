import { useMemo, useState } from 'react';
import { CheckCircle2, LifeBuoy, Siren, Activity, Play, Send, Inbox, Filter, Zap } from 'lucide-react';
import Modal from '../components/ui/Modal';
import './Workflow.css';

const whereOptions = ['Support portal', 'Email Relay', 'In-app chat', 'Phone Interface', 'Internal Routing'];
const segmentOptions = ['General Account', 'SMB Entity', 'Enterprise Node', 'VIP Priority'];
const sentimentOptions = ['neutral', 'positive', 'negative'];

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

export default function SupportEscalationPage() {
  const [customerName, setCustomerName] = useState('Global Retail Node');
  const [source, setSource] = useState(whereOptions[0]);
  const [customerSegment, setCustomerSegment] = useState(segmentOptions[2]);
  const [sentiment, setSentiment] = useState(sentimentOptions[0]);
  const [urgency, setUrgency] = useState(70);
  const [message, setMessage] = useState('Critical failure in notification workflow engine; impacting 2k concurrent sessions.');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [modalStep, setModalStep] = useState('report');
  const [showModal, setShowModal] = useState(false);

  const canConfirm = useMemo(() => Boolean(analysis?.summary && message.trim()), [analysis, message]);

  async function analyze(event) {
    event.preventDefault();
    setError(null);
    setAnalysis(null);
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/support-escalation/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName, source, customerSegment, sentiment, urgency, message, channel: 'portal' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Analysis Engine Fault');
      setAnalysis(data);
      setModalStep('report');
      setShowModal(true);
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
      const response = await fetch('/api/support-escalation/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: { customerName, source, customerSegment, sentiment, urgency, message }, analysis }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Escalation Failure');
      setModalStep('success');
      setShowModal(true);
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
              <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--success)', marginBottom: '16px' }}>Simulation // Support Node 03</div>
              <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '24px', letterSpacing: '-0.03em' }}>Support Escalation Engine</h1>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '32px' }}>
                Managing high-volume support queues in multi-tenant environments is complex. This simulation node uses heuristic sentiment analysis and urgency quantification to intelligently categorize and route support requests, ensuring high-priority accounts are prioritized.
              </p>
              
              <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border-soft)' }}>
                 <h4 style={{ fontSize: '0.75rem', fontWeight: 800, marginBottom: '20px', textTransform: 'uppercase' }}>Workflow Logic Path</h4>
                 <div className="process-vertical-list">
                    <ProcessStep 
                      icon={Inbox} 
                      title="Ticket Ingestion" 
                      desc="Pulls customer account data and message context from source channels." 
                    />
                    <ProcessStep 
                      icon={Filter} 
                      title="Urgency Heuristics" 
                      desc="Calculates a score based on account segment, sentiment, and reported latency." 
                    />
                    <ProcessStep 
                      icon={Zap} 
                      title="Direct Route Mapping" 
                      desc="Assigns the prioritized request to specialized engineering or success clusters." 
                    />
                 </div>
              </div>
           </div>

           <div className="aesthetic-card-layout" style={{ margin: 0, width: '100%' }}>
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '8px' }}>Active Signal Terminal</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Input support request context for prioritized routing.</p>
              </div>

              <form className="workflow-form-container" onSubmit={analyze}>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    <Field label="Account Identity">
                      <input className="form-input-element" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required style={{ fontFamily: 'var(--font-mono)' }} />
                    </Field>
                    <Field label="Channel">
                       <select className="form-input-element" value={source} onChange={(e) => setSource(e.target.value)}>
                        {whereOptions.map((option) => (<option key={option}>{option}</option>))}
                      </select>
                    </Field>
                 </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <Field label="Tier">
                    <select className="form-input-element" value={customerSegment} onChange={(e) => setCustomerSegment(e.target.value)}>
                      {segmentOptions.map((option) => (<option key={option}>{option}</option>))}
                    </select>
                  </Field>
                  <Field label="Sentiment">
                    <select className="form-input-element" value={sentiment} onChange={(e) => setSentiment(e.target.value)}>
                      {sentimentOptions.map((option) => (<option key={option}>{option}</option>))}
                    </select>
                  </Field>
                  <Field label="Urgency">
                    <input type="number" className="form-input-element" min="1" max="100" value={urgency} onChange={(e) => setUrgency(Number(e.target.value))} />
                  </Field>
                </div>

                <Field label="Signal Context">
                  <textarea className="form-input-element" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} required style={{ fontFamily: 'var(--font-mono)' }} />
                </Field>

                <button type="submit" className="workflow-submit-btn" disabled={isAnalyzing} style={{ background: 'var(--success)' }}>
                  {isAnalyzing ? <Activity className="animate-spin" size={14} /> : <Send size={14} />}
                  {isAnalyzing ? 'Evaluating Signal...' : 'Trigger Workflow'}
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
          title={modalStep === 'success' ? 'Escalation Raised' : 'Priority Report'}
          onClose={() => {
            setShowModal(false);
            setModalStep('report');
          }}
        >
          {modalStep === 'success' ? (
            <div style={{ textAlign: 'center', padding: '24px' }}>
              <div style={{ width: '60px', height: '60px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto 24px', border: '1px solid var(--success)' }}>
                <Siren size={32} color="var(--success)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '12px' }}>Success</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Your escalation has been raised and routed to the high-priority response team.
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

              {analysis ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="metric-box">
                      <span>Status</span>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--success)' }}>ROUTED</strong>
                    </div>
                  </div>
                  <p style={{ marginTop: '16px', fontSize: 'var(--font-size-s)', lineHeight: 1.7, opacity: 0.8, marginBottom: '24px' }}>{analysis.summary}</p>

                  <div className="result-card-inner" style={{ gap: '12px' }}>
                    <div className="result-item" style={{ padding: '12px' }}>
                      <span className="result-item-label">Recommended Route</span>
                      <p className="result-item-content" style={{ fontWeight: 800, color: 'var(--success)', fontSize: '0.9rem' }}>{analysis.recommended_route}</p>
                    </div>
                    <div className="result-item" style={{ padding: '12px' }}>
                      <span className="result-item-label">Suggested Action</span>
                      <p className="result-item-content" style={{ fontSize: '0.75rem' }}>{analysis.suggested_action}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="workflow-submit-btn"
                    style={{ background: 'var(--primary)', marginTop: '24px', width: '100%', fontSize: '0.75rem' }}
                    disabled={!canConfirm || isConfirming}
                    onClick={confirm}
                  >
                    {isConfirming ? <Activity className="animate-spin" size={12} /> : <Play size={12} />}
                    {isConfirming ? 'Dispatching...' : 'Yes, raise escalation'}
                  </button>
                </>
              ) : (
                <div style={{ padding: '18px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No analysis available yet.</div>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
