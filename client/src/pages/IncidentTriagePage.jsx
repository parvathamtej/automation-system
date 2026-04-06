import IncidentTriage from '../components/incident/IncidentTriage';

export default function IncidentTriagePage() {
  return (
    <div className="page">
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Workflow</p>
            <h2>AI Incident Triage &amp; Response</h2>
            <p>
              When users face issues like crashes or failures, debugging can be time-consuming.
              This workflow analyzes the problem and generates a structured summary with a proposed solution.
            </p>
          </div>
        </div>

        <div className="steps-card">
          <h3>What to expect</h3>
          <ol>
            <li>You describe what went wrong and where it happened.</li>
            <li>The AI generates a summary, likely root cause, and suggested action.</li>
            <li>You confirm and raise a ticket to the dev team (demo: SMTP or console log).</li>
          </ol>
        </div>
      </section>

      <IncidentTriage />
    </div>
  );
}

