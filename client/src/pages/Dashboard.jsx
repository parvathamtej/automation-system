import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  Clock3,
  Play,
  RefreshCcw,
  Server,
  Sparkles,
  TerminalSquare,
  X,
  Zap,
} from 'lucide-react';
import { Button, MetricCard } from '../components/ui/Cards';
import { DataTable } from '../components/ui/Table';
import { FocusView } from '../components/layout/Views';
import PipelineVisualizer from '../components/simulator/PipelineVisualizer';
import AIReasoningCard from '../components/simulator/AIReasoningCard';
import EmailResultCard from '../components/simulator/EmailResultCard';

const stepRevealDelay = 420;

function Field({ label, badge, children }) {
  return (
    <label className="field">
      <span className="field-label">
        {label}
        {badge ? <span className="field-badge">{badge}</span> : null}
      </span>
      {children}
    </label>
  );
}

function MetricStrip({ result }) {
  if (!result) return null;

  return (
    <div className="runtime-metrics">
      <div>
        <span>Total execution</span>
        <strong>{result.metrics.totalExecutionMs}ms</strong>
      </div>
      <div>
        <span>AI processing</span>
        <strong>{result.metrics.aiProcessingMs}ms</strong>
      </div>
      <div>
        <span>Execution latency</span>
        <strong>{result.metrics.executionMs}ms</strong>
      </div>
    </div>
  );
}

function TechnicalLogs({ result, payloadDraft }) {
  if (!result) {
    return (
      <div className="logs-grid">
        <div className="log-card">
          <h3>Request payload</h3>
          <pre>{JSON.stringify(payloadDraft, null, 2)}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="logs-grid">
      <div className="log-card">
        <h3>API request payload</h3>
        <pre>{JSON.stringify(result.technicalLogs.requestPayload, null, 2)}</pre>
      </div>
      <div className="log-card">
        <h3>AI analysis JSON</h3>
        <pre>{JSON.stringify(result.technicalLogs.analysis, null, 2)}</pre>
      </div>
      <div className="log-card">
        <h3>Execution logs</h3>
        <pre>{JSON.stringify(result.technicalLogs.executionLogs, null, 2)}</pre>
      </div>
      <div className="log-card">
        <h3>Email / action response</h3>
        <pre>{JSON.stringify(result.technicalLogs.executions, null, 2)}</pre>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [workflows, setWorkflows] = useState([]);
  const [activeSimulation, setActiveSimulation] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('visual');
  const [revealedSteps, setRevealedSteps] = useState(0);
  const replayTimer = useRef(null);
  const [payloadDraft, setPayloadDraft] = useState({
    customerName: 'Aster Retail',
    email: '',
    source: 'Support portal',
    customerSegment: 'Enterprise',
    sentiment: 'neutral',
    urgency: 50,
    message: 'Describe the incoming event and what the customer needs.',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/workflows');
        const data = await response.json();
        setWorkflows(data.workflows || []);
      } catch (loadError) {
        console.error('Could not load workflows', loadError);
      }
    }

    loadData();
    return () => window.clearTimeout(replayTimer.current);
  }, []);

  function runRevealAnimation(stepCount) {
    window.clearTimeout(replayTimer.current);
    setRevealedSteps(0);

    function tick(index) {
      if (index > stepCount) return;
      replayTimer.current = window.setTimeout(() => {
        setRevealedSteps(index);
        tick(index + 1);
      }, stepRevealDelay);
    }

    tick(1);
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Workflow',
        cell: ({ row, getValue }) => (
          <div className="workflow-cell">
            <strong>{getValue()}</strong>
            <span>{row.original.summary}</span>
          </div>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ getValue }) => <span className="table-chip">{getValue()}</span>,
      },
      {
        accessorKey: 'triggers',
        header: 'Primary Trigger',
        cell: ({ getValue }) => <span className="table-secondary-text">{getValue()?.[0]}</span>,
      },
      {
        id: 'action',
        header: 'Run',
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            variant="primary"
            size="s"
            onClick={() => {
              setActiveSimulation(row.original);
              setSimulationResult(null);
              setError(null);
              setActiveTab('visual');
              setPayloadDraft((current) => ({
                ...current,
                customerName: current.customerName || row.original.name,
              }));
            }}
          >
            <Play size={14} />
            Run workflow
          </Button>
        ),
      },
    ],
    []
  );

  async function runSimulation(event) {
    event.preventDefault();
    setIsSimulating(true);
    setSimulationResult(null);
    setError(null);
    setRevealedSteps(0);
    setActiveTab('visual');

    const formData = new FormData(event.target);
    const payload = Object.fromEntries(formData.entries());
    payload.urgency = Number(payload.urgency);
    payload.workflowId = activeSimulation.id;
    setPayloadDraft(payload);

    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Execution failed');
      }

      setSimulationResult(data);
      runRevealAnimation(data.timeline.length);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSimulating(false);
    }
  }

  const emailExecution = simulationResult?.orchestration.executions.find((item) => item.type === 'EMAIL');

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div className="hero-main-copy">
          <div className="hero-badge dark-badge">
            <Activity size={14} />
            Real backend orchestration
          </div>
          <h2>Demonstrate how AI reasoning turns business events into backend execution.</h2>
          <p>
            This dashboard is for showcasing an AI workflow automation system. Each run
            analyzes an incoming event, picks a decision route, executes backend actions, and
            exposes the evidence in a visual runtime view and technical logs.
          </p>
        </div>

        <div className="dashboard-hero-side">
          <div className="glass-panel">
            <p className="eyebrow">System behavior</p>
            <h3>Trigger to AI to decision to execution to output</h3>
            <p>
              Operators can inspect the pipeline from high-level business flow all the way down
              to SMTP provider responses and action logs.
            </p>
          </div>
        </div>
      </section>

      <section className="metrics-grid">
        <MetricCard accentIndex={0} title="Active Templates" value={workflows.length || 3} trend="up" trendValue="Live catalog" />
        <MetricCard accentIndex={1} title="Backend Visibility" value="100%" trend="up" trendValue="Proof surfaced" />
        <MetricCard accentIndex={2} title="Interaction Model" value="AI + Ops" trend="up" trendValue="Realtime view" />
      </section>

      <section className="registry-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Workflow registry</p>
            <h3>Deployed workflows</h3>
            <p>
              Select a workflow to open the simulator and watch the full execution path unfold
              with backend evidence.
            </p>
          </div>
          <div className="table-chip">{workflows.length} active</div>
        </div>

        {workflows.length > 0 ? (
          <DataTable data={workflows} columns={columns} />
        ) : (
          <div className="skeleton-grid">
            <div className="skeleton-card" />
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
        )}
      </section>

      <AnimatePresence>
        {activeSimulation && (
          <FocusView
            onClose={() => {
              setActiveSimulation(null);
              setSimulationResult(null);
              setError(null);
              setRevealedSteps(0);
            }}
          >
            <div className="simulator-header">
              <div>
                <div className="hero-badge dark-badge">
                  <Zap size={14} />
                  Workflow simulator
                </div>
                <h2>{activeSimulation.name}</h2>
                <p>{activeSimulation.summary}</p>
              </div>

              <button
                className="icon-button"
                type="button"
                onClick={() => {
                  setActiveSimulation(null);
                  setSimulationResult(null);
                  setError(null);
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="simulator-layout">
              <form className="simulator-form glass-panel" onSubmit={runSimulation}>
                <div className="form-intro">
                  <h3>Input event</h3>
                  <p>Describe the trigger so the backend can analyze and execute the workflow.</p>
                </div>

                <Field label="Customer Name">
                  <input className="input-dark" name="customerName" defaultValue={payloadDraft.customerName} required />
                </Field>

                <Field label="Recipient Email" badge="Real SMTP if configured">
                  <input className="input-dark" name="email" type="email" defaultValue={payloadDraft.email} placeholder="user@example.com" />
                </Field>

                <div className="form-grid">
                  <Field label="Trigger Source">
                    <input className="input-dark" name="source" defaultValue={payloadDraft.source} required />
                  </Field>
                  <Field label="Segment">
                    <select className="input-dark" name="customerSegment" defaultValue={payloadDraft.customerSegment}>
                      <option>Enterprise</option>
                      <option>SMB</option>
                      <option>VIP</option>
                      <option>Mid-market</option>
                    </select>
                  </Field>
                </div>

                <div className="form-grid">
                  <Field label="Sentiment">
                    <select className="input-dark" name="sentiment" defaultValue={payloadDraft.sentiment}>
                      <option>neutral</option>
                      <option>positive</option>
                      <option>negative</option>
                    </select>
                  </Field>
                  <Field label="Urgency (1-100)">
                    <input className="input-dark" name="urgency" type="number" min="1" max="100" defaultValue={payloadDraft.urgency} />
                  </Field>
                </div>

                <Field label="Payload Message">
                  <textarea className="input-dark" name="message" rows={6} defaultValue={payloadDraft.message} required />
                </Field>

                <div className="form-actions">
                  <Button type="submit" variant="primary" disabled={isSimulating}>
                    {isSimulating ? <Sparkles size={16} className="animate-spin" /> : <Play size={16} />}
                    {isSimulating ? 'Executing backend workflow...' : 'Run Workflow'}
                  </Button>
                </div>
              </form>

              <div className="simulator-runtime">
                <div className="runtime-toolbar glass-panel">
                  <div>
                    <p className="eyebrow">Execution experience</p>
                    <h3>Live pipeline visualizer</h3>
                  </div>
                  <div className="tab-switch">
                    <button className={activeTab === 'visual' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('visual')}>
                      Visual View
                    </button>
                    <button className={activeTab === 'logs' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('logs')}>
                      <TerminalSquare size={14} />
                      Technical Logs
                    </button>
                  </div>
                </div>

                {error ? (
                  <div className="error-panel">
                    <h3>Execution failed</h3>
                    <p>{error}</p>
                  </div>
                ) : null}

                {activeTab === 'visual' ? (
                  <>
                    <MetricStrip result={simulationResult} />

                    {simulationResult ? (
                      <div className="visual-stack">
                        <PipelineVisualizer steps={simulationResult.timeline} revealCount={revealedSteps} />
                        <AIReasoningCard analysis={simulationResult.analysis} isVisible={revealedSteps >= 2} />
                        <EmailResultCard execution={emailExecution} />

                        <div className="glass-panel replay-card">
                          <div>
                            <p className="eyebrow">Replay</p>
                            <h3>Replay execution timeline</h3>
                            <p>
                              Re-run the interface animation against the last backend result without
                              making another API call.
                            </p>
                          </div>
                          <Button
                            variant="secondary"
                            type="button"
                            disabled={!simulationResult}
                            onClick={() => {
                              if (simulationResult) {
                                runRevealAnimation(simulationResult.timeline.length);
                              }
                            }}
                          >
                            <RefreshCcw size={14} />
                            Replay Workflow
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="glass-panel empty-runtime">
                        <Server size={28} />
                        <h3>Ready to demonstrate the system</h3>
                        <p>
                          Submit a workflow event to show how the backend analyzes the payload,
                          selects a route, and executes downstream actions.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <TechnicalLogs result={simulationResult} payloadDraft={payloadDraft} />
                )}

                {simulationResult && (
                  <div className="glass-panel technical-summary">
                    <div className="summary-item">
                      <Clock3 size={16} />
                      <span>Run completed in {simulationResult.metrics.totalExecutionMs}ms</span>
                    </div>
                    <div className="summary-item">
                      <Sparkles size={16} />
                      <span>{simulationResult.analysis.route.label}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </FocusView>
        )}
      </AnimatePresence>
    </div>
  );
}
