import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MetricCard, ListingCard } from '../components/ui/Cards';
import { Button } from '../components/ui/Cards'; // Actually Button is exported from Cards currently, wait let me check the file, yes I exported Button from Cards.jsx
import { DataTable } from '../components/ui/Table';
import { FocusView } from '../components/layout/Views';
import { Play, Sparkles, Server } from 'lucide-react';

const Dashboard = () => {
  const [workflows, setWorkflows] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [activeSimulation, setActiveSimulation] = useState(null); // When not null, opens FocusView
  const [simulationResult, setSimulationResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/workflows').then(r => r.json()),
      fetch('/api/scenarios').then(r => r.json())
    ]).then(([wf, sc]) => {
      setWorkflows(wf.workflows || []);
      setScenarios(sc.scenarios || []);
    }).catch(err => console.error("Could not load data", err));
  }, []);

  const columns = useMemo(() => [
    { accessorKey: 'name', header: 'Workflow Name', size: 250 },
    { accessorKey: 'category', header: 'Category', size: 150 },
    { accessorKey: 'summary', header: 'Description', size: 350 },
    {
      id: 'actions',
      header: 'Actions',
      size: 150,
      cell: ({ row }) => (
        <button 
          onClick={() => setActiveSimulation(row.original)}
          style={{ padding: '6px 12px', background: 'var(--color-accent-primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}
        >
          Simulate
        </button>
      )
    }
  ], []);

  const runSimulation = async (e) => {
    e.preventDefault();
    setIsSimulating(true);
    setSimulationResult(null);

    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());
    payload.urgency = Number(payload.urgency);
    payload.workflowId = activeSimulation.id;

    try {
      // Fake a delay for effect
      await new Promise(r => setTimeout(r, 800));
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setSimulationResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: 'var(--font-size-xxl)', marginBottom: 'var(--spacing-xs)' }}>Workflow Intelligence</h1>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px' }}>
          Real-time metrics and dynamic orchestration catalog. Manage automated paths and trace payload simulations across the architecture.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-l)' }}>
        <MetricCard title="Active Templates" value={workflows.length} trend="up" trendValue="12% from last wk" />
        <MetricCard title="Success Rate" value="99.2%" trend="up" trendValue="0.1%" />
        <MetricCard title="API Requests / min" value="4,204" trend="down" trendValue="5%" />
      </div>

      {/* Table Section */}
      <div>
        <h3 style={{ marginBottom: 'var(--spacing-m)' }}>Deployed Workflows</h3>
        {workflows.length > 0 ? (
          <DataTable data={workflows} columns={columns} />
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', background: 'var(--color-ui-bg-panel)', borderRadius: 'var(--border-radius-l)', border: '1px solid var(--color-ui-border)' }}>
            Loading workflows...
          </div>
        )}
      </div>

      {/* Simulation Focus View */}
      <AnimatePresence>
        {activeSimulation && (
          <FocusView onClose={() => setActiveSimulation(null)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-l)', borderBottom: '1px solid var(--color-ui-border)', paddingBottom: 'var(--spacing-m)' }}>
              <h2>Simulate Payload: {activeSimulation.name}</h2>
              <button onClick={() => { setActiveSimulation(null); setSimulationResult(null); }} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '24px' }}>&times;</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-xl)' }}>
              {/* Form */}
              <form onSubmit={runSimulation} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-m)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--font-size-s)', fontWeight: 600 }}>Customer Name</label>
                  <input name="customerName" required placeholder="Acme Corp" style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--color-ui-border)', background: 'var(--color-ui-bg-base)', color: 'var(--color-text-main)' }} />
                </div>
                
                <div style={{ display: 'flex', gap: 'var(--spacing-m)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <label style={{ fontSize: 'var(--font-size-s)', fontWeight: 600 }}>Trigger Source</label>
                    <input name="source" required placeholder="Support Ticket" style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--color-ui-border)', background: 'var(--color-ui-bg-base)', color: 'var(--color-text-main)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <label style={{ fontSize: 'var(--font-size-s)', fontWeight: 600 }}>Market Segment</label>
                    <select name="customerSegment" style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--color-ui-border)', background: 'var(--color-ui-bg-base)', color: 'var(--color-text-main)' }}>
                      <option>Enterprise</option>
                      <option>SMB</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-m)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <label style={{ fontSize: 'var(--font-size-s)', fontWeight: 600 }}>Initial Sentiment</label>
                    <select name="sentiment" style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--color-ui-border)', background: 'var(--color-ui-bg-base)', color: 'var(--color-text-main)' }}>
                      <option>neutral</option>
                      <option>positive</option>
                      <option>negative</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <label style={{ fontSize: 'var(--font-size-s)', fontWeight: 600 }}>Urgency (1-100)</label>
                    <input type="number" name="urgency" min="1" max="100" defaultValue="50" style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--color-ui-border)', background: 'var(--color-ui-bg-base)', color: 'var(--color-text-main)' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--font-size-s)', fontWeight: 600 }}>Payload Message</label>
                  <textarea name="message" required rows="3" placeholder="Enter payload..." style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--color-ui-border)', background: 'var(--color-ui-bg-base)', color: 'var(--color-text-main)', resize: 'vertical' }}></textarea>
                </div>
                
                <button type="submit" disabled={isSimulating} style={{ padding: '12px', background: 'var(--color-accent-primary)', color: '#fff', border: 'none', borderRadius: 'var(--border-radius-m)', fontWeight: 600, cursor: isSimulating ? 'wait' : 'pointer', marginTop: 'var(--spacing-m)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {isSimulating ? <Sparkles size={18} className="animate-spin" /> : <Play size={18} />}
                  {isSimulating ? 'Processing AI Layer...' : 'Simulate'}
                </button>
              </form>

              {/* Results Container */}
              <div style={{ background: 'var(--color-ui-bg-base)', borderRadius: 'var(--border-radius-m)', border: '1px solid var(--color-ui-border)', padding: 'var(--spacing-l)', display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: 0, marginBottom: 'var(--spacing-m)' }}>Execution Output</h4>
                {simulationResult ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-m)' }}>
                    <div style={{ padding: 'var(--spacing-s)', background: 'var(--color-bg-panel)', borderLeft: '3px solid var(--color-accent-primary)', fontSize: 'var(--font-size-s)' }}>
                      <strong>{simulationResult.analysis.route.label}</strong>
                      <p style={{ marginTop: '4px', color: 'var(--color-text-muted)' }}>{simulationResult.analysis.aiSummary}</p>
                    </div>
                    <div>
                      <strong style={{ fontSize: 'var(--font-size-s)' }}>Orchestration Steps:</strong>
                      <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {simulationResult.orchestration.executions.map((ex, i) => (
                          <li key={i} style={{ padding: '8px', border: '1px solid var(--color-ui-border)', borderRadius: '4px', fontSize: '13px' }}>
                            <strong style={{ display: 'block', color: 'var(--color-text-main)' }}>{ex.system}</strong>
                            <span style={{ color: 'var(--color-text-muted)' }}>{ex.detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ) : (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', textAlign: 'center', gap: 'var(--spacing-s)' }}>
                    <Server size={32} opacity={0.5} />
                    <span style={{ fontSize: 'var(--font-size-s)' }}>Awaiting simulation payload...</span>
                  </div>
                )}
              </div>
            </div>
          </FocusView>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
