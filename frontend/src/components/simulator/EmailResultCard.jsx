import { MailCheck } from 'lucide-react';

export default function EmailResultCard({ execution }) {
  if (!execution || execution.type !== 'EMAIL') {
    return null;
  }

  const proof = execution.proof || {};

  return (
    <div className="email-result-card">
      <div className="email-result-header">
        <div className="pill subtle-pill">
          <MailCheck size={14} />
          Email Dispatched
        </div>
        <span className={`status-badge is-${execution.status === 'FAILED' ? 'failed' : execution.status === 'SKIPPED' ? 'warning' : 'success'}`}>
          {execution.status}
        </span>
      </div>

      <div className="email-result-grid">
        <div>
          <span>To</span>
          <strong>{proof.recipient || 'Not provided'}</strong>
        </div>
        <div>
          <span>Provider</span>
          <strong>{proof.provider || 'Unknown'}</strong>
        </div>
        <div>
          <span>Handshake</span>
          <strong>{proof.handshake || 'No SMTP handshake completed'}</strong>
        </div>
        <div>
          <span>Server response</span>
          <strong>{proof.response || 'No provider response'}</strong>
        </div>
        <div>
          <span>Timestamp</span>
          <strong>{execution.completedAt ? new Date(execution.completedAt).toLocaleString() : 'Pending'}</strong>
        </div>
        <div>
          <span>Message ID</span>
          <strong>{proof.messageId || 'Not available'}</strong>
        </div>
      </div>
    </div>
  );
}
