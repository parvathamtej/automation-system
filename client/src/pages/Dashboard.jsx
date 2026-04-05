import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  Database,
  Mail,
  Play,
  Server,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { Button, MetricCard } from '../components/ui/Cards';
import { DataTable } from '../components/ui/Table';
import { FocusView } from '../components/layout/Views';

const INPUT_CLASS = 'dashboard-input';

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

function getStatusTone(status = '') {
  if (status.includes('FAILED')) return 'is-danger';
  if (status.includes('SIMULATED') || status.includes('SKIPPED')) return 'is-warning';
  return 'is-success';
}

function getExecutionIcon(type = '') {
  if (type === 'EMAIL') return <Mail size={14} />;
  if (type === 'CRM') return <Database size={14} />;
  return <Zap size={14} />;
}

export default function Dashboard() {
  const [workflows, setWorkflows] = useState([]);
  const [activeSimulation, setActiveSimulation] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/workflows');
        const data = await response.json();
        setWorkflows(data.workflows || []);
      } catch (loadError) {
        console.error('Could not load data', loadError);
      }
    }

    loadData();
  }, []);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Workflow Name',
        size: 240,
        cell: ({ row, getValue }) => (
          <div className="workflow-name-cell">
            <strong>{getValue()}</strong>
            <span>{row.original.triggers?.[0]}</span>
          </div>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        size: 150,
        cell: ({ getValue }) => <span className="category-pill">{getValue()}</span>,
      },
      {
        accessorKey: 'summary',
        header: 'Description',
        size: 420,
        cell: ({ getValue }) => <p className="summary-cell">{getValue()}</p>,
      },
      {
        id: 'actions',
        header: 'Action',
        size: 160,
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            variant="secondary"
            size="s"
            className="table-action-button"
            onClick={() => {
              setActiveSimulation(row.original);
              setSimulationResult(null);
              setError(null);
            }}
          >
            <Zap size={14} />
            Simulate
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

    const formData = new FormData(event.target);
    const payload = Object.fromEntries(formData.entries());
    payload.urgency = Number(payload.urgency);
    payload.workflowId = activeSimulation.id;

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
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSimulating(false);
    }
  }

  return (
    <div className="dashboard-shell">
      <section className="dashboard-hero">
        <div className="dashboard-copy">
          <div className="pill">
            <Activity size={14} />
            Real-time intelligence
          </div>
          <h1>Operational visibility for adaptive AI workflows.</h1>
          <p>
            Review deployed automations, inspect route decisions, and run end-to-end
            simulations from the same environment that introduces the product.
          </p>
        </div>

        <div className="dashboard-hero-panel">
          <div className="dashboard-hero-label">Launch path</div>
          <h3>Landing page to simulator in one flow</h3>
          <p>
            The dashboard now continues the same visual language as the homepage, so the
            transition into execution feels seamless.
          </p>
        </div>
      </section>

      <section className="metric-grid">
        <MetricCard
          accentIndex={0}
          title="Active Templates"
          value={workflows.length || 3}
          trend="up"
          trendValue="12% this week"
        />
        <MetricCard
          accentIndex={1}
          title="Success Rate"
          value="99.2%"
          trend="up"
          trendValue="Stable"
        />
        <MetricCard
          accentIndex={2}
          title="Avg Response"
          value="1.8s"
          trend="down"
          trendValue="Faster"
        />
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Deployment registry</p>
            <h2>Deployed workflows</h2>
            <p className="section-description">
              Simulate any workflow to trigger the AI execution pipeline and inspect its
              generated route summary.
            </p>
          </div>
          <div className="header-chip">{workflows.length} active</div>
        </div>

        {workflows.length > 0 ? (
          <DataTable data={workflows} columns={columns} />
        ) : (
          <div className="empty-state-card">
            <Sparkles size={24} />
            <p>Loading workflows...</p>
          </div>
        )}
      </section>

      <AnimatePresence>
        {activeSimulation && (
          <FocusView
            onClose={() => {
              setActiveSimulation(null);
              setSimulationResult(null);
            }}
          >
            <div className="modal-header">
              <div>
                <div className="pill">
                  <Sparkles size={14} />
                  AI Pipeline Execution
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
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="modal-grid">
              <form className="simulation-form" onSubmit={runSimulation}>
                <Field label="Customer Name">
                  <input
                    className={INPUT_CLASS}
                    name="customerName"
                    placeholder="Acme Corp"
                    required
                  />
                </Field>

                <Field label="Recipient Email" badge="Real email sent">
                  <input
                    className={INPUT_CLASS}
                    name="email"
                    type="email"
                    placeholder="customer@example.com"
                    required
                  />
                </Field>

                <div className="form-split">
                  <Field label="Trigger Source">
                    <input
                      className={INPUT_CLASS}
                      name="source"
                      placeholder="Support ticket"
                      required
                    />
                  </Field>

                  <Field label="Segment">
                    <select className={INPUT_CLASS} name="customerSegment" defaultValue="Enterprise">
                      <option>Enterprise</option>
                      <option>SMB</option>
                      <option>VIP</option>
                      <option>Mid-market</option>
                    </select>
                  </Field>
                </div>

                <div className="form-split">
                  <Field label="Sentiment">
                    <select className={INPUT_CLASS} name="sentiment" defaultValue="neutral">
                      <option>neutral</option>
                      <option>positive</option>
                      <option>negative</option>
                    </select>
                  </Field>

                  <Field label="Urgency (1-100)">
                    <input
                      className={INPUT_CLASS}
                      defaultValue="50"
                      max="100"
                      min="1"
                      name="urgency"
                      type="number"
                    />
                  </Field>
                </div>

                <Field label="Payload Message">
                  <textarea
                    className={INPUT_CLASS}
                    name="message"
                    placeholder="Describe the incoming event..."
                    required
                    rows={5}
                  />
                </Field>

                <Button type="submit" disabled={isSimulating}>
                  {isSimulating ? <Sparkles size={16} className="animate-spin" /> : <Play size={16} />}
                  {isSimulating ? 'Running AI pipeline...' : 'Simulate Workflow'}
                </Button>
              </form>

              <div className="output-panel">
                <div className="output-heading">
                  <Server size={14} />
                  Execution output
                </div>

                {error ? (
                  <div className="error-alert">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                ) : null}

                {simulationResult ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="result-stack"
                  >
                    <div className="route-banner">
                      <div className="route-title">
                        <Zap size={14} />
                        {simulationResult.analysis.route.label}
                      </div>
                      <p>{simulationResult.analysis.aiSummary}</p>
                      <div className="route-tags">
                        <span>Intent: {simulationResult.analysis.intent}</span>
                        <span>Urgency: {simulationResult.analysis.urgencyScore}/100</span>
                        <span>
                          Tone: {simulationResult.analysis.personalization.preferredTone}
                        </span>
                      </div>
                    </div>

                    {simulationResult.timeline?.length > 0 && (
                      <div className="result-section">
                        <h3>Pipeline timeline</h3>
                        <div className="timeline">
                          {simulationResult.timeline.map((step) => (
                            <div className="timeline-step" key={`${step.stage}-${step.detail}`}>
                              <span className="timeline-dot" />
                              <div>
                                <strong>{step.stage}</strong>
                                <p>{step.detail}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="result-section">
                      <h3>Executed actions</h3>
                      <div className="execution-list">
                        {simulationResult.orchestration.executions.map((execution, index) => (
                          <div className="execution-card" key={`${execution.system}-${index}`}>
                            <div className="execution-card-top">
                              <div className="execution-system">
                                {getExecutionIcon(execution.type)}
                                <strong>{execution.system}</strong>
                              </div>
                              <span className={`status-pill ${getStatusTone(execution.status)}`}>
                                {execution.status}
                              </span>
                            </div>
                            <p>{execution.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : !error ? (
                  <div className="empty-output">
                    <Server size={28} />
                    <div>
                      <strong>Awaiting execution</strong>
                      <p>Fill the form and click simulate to inspect the generated route.</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </FocusView>
        )}
      </AnimatePresence>
    </div>
  );
}
