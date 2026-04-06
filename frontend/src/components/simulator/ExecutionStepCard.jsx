import { CheckCircle2, Clock3, LoaderCircle, XCircle } from 'lucide-react';

function statusMeta(status) {
  if (status === 'processing') {
    return {
      label: 'Processing',
      icon: <LoaderCircle size={15} className="animate-spin" />,
    };
  }

  if (status === 'failed') {
    return {
      label: 'Failed',
      icon: <XCircle size={15} />,
    };
  }

  if (status === 'warning') {
    return {
      label: 'Completed with note',
      icon: <Clock3 size={15} />,
    };
  }

  if (status === 'success') {
    return {
      label: 'Success',
      icon: <CheckCircle2 size={15} />,
    };
  }

  return {
    label: 'Queued',
    icon: <Clock3 size={15} />,
  };
}

export default function ExecutionStepCard({ step, status }) {
  const meta = statusMeta(status);

  return (
    <div className={`execution-step-card is-${status}`}>
      <div className="execution-step-top">
        <div className="execution-step-icon">{meta.icon}</div>
        <div className="execution-step-copy">
          <strong>{step.stage}</strong>
          <p>{step.detail}</p>
        </div>
        <span className={`status-badge is-${status}`}>{meta.label}</span>
      </div>

      {(step.startedAt || step.durationMs != null) && (
        <div className="execution-step-meta">
          {step.startedAt ? <span>Started: {new Date(step.startedAt).toLocaleTimeString()}</span> : null}
          {step.durationMs != null ? <span>Latency: {step.durationMs}ms</span> : null}
        </div>
      )}
    </div>
  );
}
