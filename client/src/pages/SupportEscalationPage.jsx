import { useMemo, useState } from 'react';
import { CheckCircle2, LifeBuoy, Siren, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Cards';
import Modal from '../components/ui/Modal';

const whereOptions = ['Support portal', 'Email', 'In-app chat', 'Phone', 'Other'];
const segmentOptions = ['General', 'SMB', 'Enterprise', 'VIP'];
const sentimentOptions = ['neutral', 'positive', 'negative'];

function Field({ label, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

export default function SupportEscalationPage() {
  const [customerName, setCustomerName] = useState('Aster Retail');
  const [source, setSource] = useState(whereOptions[0]);
  const [customerSegment, setCustomerSegment] = useState(segmentOptions[2]);
  const [sentiment, setSentiment] = useState(sentimentOptions[0]);
  const [urgency, setUrgency] = useState(70);
  const [message, setMessage] = useState('Our notification workflow is failing and this is impacting customers right now.');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const canConfirm = useMemo(() => Boolean(analysis?.summary && message.trim()), [analysis, message]);

  async function analyze(event) {
    event.preventDefault();
    setError(null);
    setAnalysis(null);
    setShowConfirmation(false);
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/support-escalation/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          source,
          customerSegment,
          sentiment,
          urgency,
          message,
          channel: 'portal',
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Could not analyze support issue');
      setAnalysis(data);
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

    const inputs = {
      customerName,
      source,
      customerSegment,
      sentiment,
      urgency,
      message,
      channel: 'portal',
    };

    try {
      const response = await fetch('/api/support-escalation/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs, analysis }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Could not raise escalation');
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
            <h2>AI-Powered Support Escalation System</h2>
            <p>
              Analyze a support request, estimate urgency, recommend a response route, and confirm to raise an escalation
              notification (demo: SMTP or console log).
            </p>
          </div>
        </div>

        <div className="steps-card">
          <h3>What to expect</h3>
          <ol>
            <li>Describe the issue and customer context.</li>
            <li>AI classifies intent, scores urgency, and recommends a route.</li>
            <li>You confirm to raise an escalation notification.</li>
          </ol>
        </div>
      </section>

      <section className="workflow-split">
        <form className="workflow-panel" onSubmit={analyze}>
          <div className="panel-header">
            <div className="pill subtle-pill">
              <LifeBuoy size={14} />
              Inputs
            </div>
            <h3>Support request</h3>
            <p>Enter a realistic issue to see the escalation logic.</p>
          </div>

          <Field label="Customer name">
            <input className="input-dark" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
          </Field>

          <div className="form-grid">
            <Field label="Where did this happen?">
              <select className="input-dark" value={source} onChange={(e) => setSource(e.target.value)}>
                {whereOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </Field>
            <Field label="Customer segment">
              <select className="input-dark" value={customerSegment} onChange={(e) => setCustomerSegment(e.target.value)}>
                {segmentOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </Field>
            <Field label="Sentiment">
              <select className="input-dark" value={sentiment} onChange={(e) => setSentiment(e.target.value)}>
                {sentimentOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </Field>
            <Field label="Urgency (1-100)">
              <input
                className="input-dark"
                type="number"
                min="1"
                max="100"
                value={urgency}
                onChange={(e) => setUrgency(Number(e.target.value))}
              />
            </Field>
          </div>

          <Field label="Issue details">
            <textarea className="input-dark" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required />
          </Field>

          <div className="form-actions">
            <Button variant="primary" type="submit" disabled={isAnalyzing}>
              {isAnalyzing ? 'Analyzing...' : 'Analyze Support Issue'}
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
              <Sparkles size={14} />
              Analysis
            </div>
            <h3>Escalation recommendation</h3>
            <p>Review the route and suggested next action.</p>
          </div>

          {analysis ? (
            <div className="result-card">
              <div className="result-head">
                <div className="result-icon">
                  <Siren size={18} />
                </div>
                <div>
                  <h4>Summary</h4>
                  <p>{analysis.summary}</p>
                </div>
              </div>

              <div className="result-grid">
                <div>
                  <span>Severity</span>
                  <strong>{analysis.severity?.toUpperCase?.() || 'UNKNOWN'}</strong>
                </div>
                <div>
                  <span>Urgency score</span>
                  <strong>{analysis.urgency_score}/100</strong>
                </div>
                <div>
                  <span>Recommended route</span>
                  <strong>{analysis.recommended_route}</strong>
                </div>
              </div>

              <div className="result-list">
                <h4>Reason</h4>
                <p>{analysis.route_reason}</p>
                <h4>Suggested action</h4>
                <p>{analysis.suggested_action}</p>
              </div>

              <div className="form-actions">
                <Button variant="secondary" type="button" disabled={!canConfirm || isConfirming} onClick={confirm}>
                  {isConfirming ? 'Raising...' : 'Confirm & Raise Escalation'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="empty-runtime">
              <Siren size={28} />
              <h3>No analysis yet</h3>
              <p>Analyze a support issue to see the recommended route.</p>
            </div>
          )}
        </div>
      </section>

      {showConfirmation ? (
        <Modal title="Escalation raised" onClose={() => setShowConfirmation(false)}>
          <div className="success-panel">
            <h3>
              <CheckCircle2 size={16} /> Confirmed
            </h3>
            <p>Escalation raised. Our support team is working on it.</p>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

