import { useMemo, useState } from 'react';
import { CheckCircle2, Users, Activity, Play, ClipboardList, Download, Plus, Trash2 } from 'lucide-react';
import Modal from '../components/ui/Modal';
import './Workflow.css';

function Field({ label, children }) {
  return (
    <div className="form-field-group">
      <label>{label}</label>
      {children}
    </div>
  );
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function buildAssignmentsCsv(assignments) {
  const rows = Array.isArray(assignments) ? assignments : [];
  const header = ['Task', 'Assigned To', 'Role', 'Deadline', 'Status'];
  const lines = [header.map(csvEscape).join(',')];
  rows.forEach((row) => {
    lines.push(
      [row.task, row.assignedTo, row.role, row.deadline, row.status || 'Assigned'].map(csvEscape).join(','),
    );
  });
  return lines.join('\n');
}

function downloadCsv({ filename, csv }) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function TaskAssignmentPage() {
  const [taskDescription, setTaskDescription] = useState(
    'Ship the AI Incident Triage feature: analyze issue, show modal confirmation, raise ticket via email, and add basic telemetry.',
  );
  const [deadline, setDeadline] = useState(() => new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const [teamMembers, setTeamMembers] = useState([
    { name: 'Asha', role: 'Frontend (React)', email: 'asha@example.com' },
    { name: 'Vikram', role: 'Backend (Node/API)', email: 'vikram@example.com' },
    { name: 'Neha', role: 'QA / Testing', email: 'neha@example.com' },
  ]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState('report'); // report | success
  const [actionMessage, setActionMessage] = useState(null);

  const inputs = useMemo(() => ({ taskDescription, deadline, teamMembers }), [taskDescription, deadline, teamMembers]);
  const canTrigger = useMemo(() => Boolean(taskDescription.trim() && teamMembers.some((m) => m.name && m.role && m.email)), [taskDescription, teamMembers]);
  const assignments = analysis?.assignments || [];
  const canConfirm = useMemo(() => Boolean(analysis?.summary && Array.isArray(assignments) && assignments.length), [analysis, assignments]);

  async function triggerWorkflow(event) {
    event.preventDefault();
    if (!canTrigger) return;
    setError(null);
    setActionMessage(null);
    setAnalysis(null);
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/task-assignment/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Task breakdown failed');
      setAnalysis(data);
      setModalStep('report');
      setShowModal(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function confirmAssignments() {
    if (!canConfirm) return;
    setError(null);
    setActionMessage(null);
    setIsConfirming(true);
    try {
      const response = await fetch('/api/task-assignment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs, analysis }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Assignment dispatch failed');
      setActionMessage(data?.message || null);
      setModalStep('success');
      setShowModal(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsConfirming(false);
    }
  }

  function downloadExcel() {
    const csv = buildAssignmentsCsv(assignments);
    const safeName = String(taskDescription || 'task-assignments')
      .toLowerCase()
      .slice(0, 48)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    downloadCsv({ filename: `${safeName || 'task-assignments'}.csv`, csv });
    setActionMessage('Excel report downloaded (.csv).');
  }

  function updateMember(index, patch) {
    setTeamMembers((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  }

  function addMember() {
    setTeamMembers((prev) => [...prev, { name: '', role: '', email: '' }]);
  }

  function removeMember(index) {
    setTeamMembers((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="aesthetic-form-wrapper">
      <div className="workflow-overview-section container-tight">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.2fr) 1fr', gap: '64px', marginBottom: '80px', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--success)', marginBottom: '16px' }}>
              Simulation // Assignment Node 03
            </div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '24px', letterSpacing: '-0.03em' }}>AI Task Breakdown & Smart Assignment</h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '32px' }}>
              Provide a goal, your team members, and a deadline. The workflow breaks the goal into actionable steps, assigns ownership by role, emails assignees automatically, and generates an Excel-ready report.
            </p>
            <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border-soft)' }}>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 800, marginBottom: '20px', textTransform: 'uppercase' }}>Workflow Logic Path</h4>
              <div className="process-vertical-list">
                <div className="process-vertical-item">
                  <div className="process-icon-container"><ClipboardList size={18} /></div>
                  <div className="process-text"><h4>Task Decomposition</h4><p>AI breaks the goal into clear steps.</p></div>
                </div>
                <div className="process-vertical-item">
                  <div className="process-icon-container"><Users size={18} /></div>
                  <div className="process-text"><h4>Role-based Assignment</h4><p>Each step is assigned to the best-fit member.</p></div>
                </div>
                <div className="process-vertical-item">
                  <div className="process-icon-container"><Mail size={18} /></div>
                  <div className="process-text"><h4>Automation</h4><p>Emails + report generation happen automatically.</p></div>
                </div>
              </div>
            </div>
          </div>

          <div className="aesthetic-card-layout" style={{ margin: 0, width: '100%' }}>
            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '8px' }}>Active Input Terminal</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Supply goal + team roster to begin assignment loop.</p>
            </div>

            <form className="workflow-form-container" onSubmit={triggerWorkflow}>
              <Field label="Task / Goal Description">
                <textarea
                  className="form-input-element"
                  rows={4}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Describe what needs to be done..."
                  required
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
              </Field>

              <Field label="Deadline">
                <input className="form-input-element" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
              </Field>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Team Members</div>
                <button type="button" className="workflow-submit-btn" style={{ padding: '8px 12px', marginTop: 0, background: 'rgba(255,255,255,0.08)' }} onClick={addMember}>
                  <Plus size={14} /> Add
                </button>
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                {teamMembers.map((member, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr auto', gap: '10px', alignItems: 'center' }}>
                    <input className="form-input-element" value={member.name} onChange={(e) => updateMember(idx, { name: e.target.value })} placeholder="Name" />
                    <input className="form-input-element" value={member.role} onChange={(e) => updateMember(idx, { role: e.target.value })} placeholder="Role" />
                    <input className="form-input-element" value={member.email} onChange={(e) => updateMember(idx, { email: e.target.value })} placeholder="Email" type="email" />
                    <button type="button" className="icon-button" onClick={() => removeMember(idx)} aria-label="Remove member">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <button type="submit" className="workflow-submit-btn" disabled={isAnalyzing}>
                {isAnalyzing ? <Activity className="animate-spin" size={14} /> : <Play size={14} />}
                {isAnalyzing ? 'Analyzing...' : 'Trigger Workflow'}
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
          title={modalStep === 'success' ? 'Assignment Complete' : 'Task Breakdown'}
          onClose={() => {
            setShowModal(false);
            setModalStep('report');
            setActionMessage(null);
          }}
        >
          {modalStep === 'success' ? (
            <div style={{ textAlign: 'center', padding: '24px' }}>
              <div style={{ width: '60px', height: '60px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto 20px', border: '1px solid var(--success)' }}>
                <CheckCircle2 size={32} color="var(--success)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '12px' }}>Success</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                The tasks have been assigned to their respective developers and a mail has been sent.
              </p>

              {!!actionMessage && (
                <div style={{ margin: '0 auto 16px', maxWidth: '560px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-soft)', fontSize: '0.78rem' }}>
                  {actionMessage}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', maxWidth: '560px', margin: '0 auto' }}>
                <button className="workflow-submit-btn" style={{ padding: '10px 24px', margin: 0, background: 'var(--success)' }} onClick={downloadExcel}>
                  <Download size={14} /> Download as Excel
                </button>
                <button className="workflow-submit-btn" style={{ padding: '10px 24px', margin: 0, background: 'rgba(255,255,255,0.08)' }} onClick={() => setShowModal(false)}>
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="results-preview-block" style={{ marginTop: 0 }}>
              {!!analysis?.summary && (
                <div style={{ marginBottom: '16px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-soft)', fontSize: '0.8rem', color: 'var(--text-body)' }}>
                  <strong style={{ color: 'var(--success)' }}>Summary:</strong> {analysis.summary}
                </div>
              )}

              <div className="result-card-inner" style={{ gap: '12px' }}>
                {assignments?.map((row, idx) => (
                  <div key={idx} className="result-item" style={{ padding: '14px', borderLeft: '2px solid var(--success)' }}>
                    <span className="result-item-label" style={{ marginBottom: '8px' }}>Task {idx + 1}</span>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-strong)', fontWeight: 700, marginBottom: '8px' }}>{row.task}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Assigned to <strong style={{ color: 'var(--text-strong)' }}>{row.assignedTo}</strong> ({row.role}) • Deadline: {row.deadline || deadline} • Status: {row.status || 'Assigned'}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="workflow-submit-btn"
                style={{ background: 'var(--primary)', marginTop: '18px', width: '100%', fontSize: '0.75rem' }}
                disabled={!canConfirm || isConfirming}
                onClick={confirmAssignments}
              >
                {isConfirming ? <Activity className="animate-spin" size={12} /> : <Play size={12} />}
                {isConfirming ? 'Assigning + emailing...' : 'Yes, confirm assignment'}
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
