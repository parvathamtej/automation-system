import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileText, Search, Wrench } from 'lucide-react';
import { Button } from '../ui/Cards';
import Modal from '../ui/Modal';

const whereOptions = [
  'Login / Authentication',
  'Payments',
  'Dashboard',
  'API / Backend',
  'Other',
];

const observedOptions = [
  'Page not loading',
  'Something is slow',
  'Error message shown',
  'App crashed',
  'Action failed',
];

const impactOptions = ['Minor', 'Moderate', 'Severe'];

function Field({ label, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
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
  const [showConfirmation, setShowConfirmation] = useState(false);

  const canRaise = useMemo(() => {
    return Boolean(
      analysis?.summary &&
        analysis?.root_cause &&
        analysis?.suggested_action &&
        whatWentWrong.trim()
    );
  }, [analysis, whatWentWrong]);

  async function analyzeIssue(event) {
    event.preventDefault();
    setError(null);
    setTicketMessage(null);
    setShowConfirmation(false);
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/incident-triage/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatWentWrong,
          where,
          observedIssue,
          impact,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Could not analyze the issue');
      }

      setAnalysis(data);
    } catch (requestError) {
      setAnalysis(null);
      setError(requestError.message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function raiseTicket() {
    if (!canRaise) return;
    setError(null);
    setTicketMessage(null);
    setIsRaising(true);

    const inputs = {
      whatWentWrong,
      where,
      observedIssue,
      impact,
    };

    try {
      const response = await fetch('/api/incident-triage/raise-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs, analysis }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Could not raise the ticket');
      }

      setTicketMessage(data?.message || 'Your ticket has been raised. Our development team is working on it.');
      setShowConfirmation(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsRaising(false);
    }
  }

  return (
    <>
      <section className="workflow-split">
        <form className="workflow-panel" onSubmit={analyzeIssue}>
          <div className="panel-header">
            <div className="pill subtle-pill">
              <FileText size={14} />
              Inputs
            </div>
            <h3>Describe the incident</h3>
            <p>Use plain language — the AI will structure it.</p>
          </div>

          <Field label="What went wrong?">
            <input
              className="input-dark"
              value={whatWentWrong}
              onChange={(e) => setWhatWentWrong(e.target.value)}
              placeholder="App crashed when I clicked login"
              required
            />
          </Field>

          <div className="form-grid">
            <Field label="Where did this happen?">
              <select className="input-dark" value={where} onChange={(e) => setWhere(e.target.value)}>
                {whereOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </Field>

            <Field label="What did you see?">
              <select
                className="input-dark"
                value={observedIssue}
                onChange={(e) => setObservedIssue(e.target.value)}
              >
                {observedOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </Field>

            <Field label="Impact level">
              <select className="input-dark" value={impact} onChange={(e) => setImpact(e.target.value)}>
                {impactOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="form-actions">
            <Button type="submit" variant="primary" disabled={isAnalyzing}>
              {isAnalyzing ? 'Analyzing...' : 'Analyze Issue'}
            </Button>
          </div>

          {error ? (
            <div className="error-panel">
              <h3>
                <AlertTriangle size={16} /> Could not complete request
              </h3>
              <p>{error}</p>
            </div>
          ) : null}
        </form>

        <div className="workflow-panel">
          <div className="panel-header">
            <div className="pill subtle-pill">
              <Search size={14} />
              Analysis
            </div>
            <h3>Structured triage</h3>
            <p>Review the summary and confirm to raise a ticket.</p>
          </div>

          {analysis ? (
            <div className="result-card">
              {analysis?.severity ? <div className="table-chip">{analysis.severity.toUpperCase()} severity</div> : null}

              <div className="result-list">
                <div>
                  <h4>Summary</h4>
                  <p>{analysis.summary}</p>
                </div>
                <div>
                  <h4>Root Cause</h4>
                  <p>{analysis.root_cause}</p>
                </div>
                <div>
                  <h4>Suggested Action</h4>
                  <p>{analysis.suggested_action}</p>
                </div>
              </div>

              <div className="form-actions">
                <Button type="button" variant="secondary" disabled={!canRaise || isRaising} onClick={raiseTicket}>
                  {isRaising ? 'Raising ticket...' : 'Confirm & Raise Ticket'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="empty-runtime">
              <Wrench size={28} />
              <h3>No analysis yet</h3>
              <p>Analyze an incident to generate a structured triage response.</p>
            </div>
          )}
        </div>
      </section>

      {showConfirmation ? (
        <Modal title="Ticket raised" onClose={() => setShowConfirmation(false)}>
          <div className="success-panel">
            <h3>
              <CheckCircle2 size={16} /> Confirmed
            </h3>
            <p>{ticketMessage || 'Your ticket has been raised. Our development team is working on it.'}</p>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
