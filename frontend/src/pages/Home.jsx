import { BrainCircuit, ShieldAlert, ArrowRight, Play, Terminal, Database, Activity, Code, Cpu, Server, Globe, ClipboardList } from 'lucide-react';
import './Home.css';
import automationConcept from '../assets/automation_concept.png';

const workflows = [
  {
    id: 'incident',
    title: 'AI Incident Triage',
    icon: ShieldAlert,
    description: 'A structural simulation of real-time incident analysis and automated prioritization.',
    color: '#8b5cf6'
  },
  {
    id: 'learning',
    title: 'Learning Path Gen',
    icon: BrainCircuit,
    description: 'An AI node designed to synthesize personalized educational curriculum from user goals.',
    color: '#06b6d4'
  },
  {
    id: 'assignment',
    title: 'Task Breakdown & Assignment',
    icon: ClipboardList,
    description: 'AI breaks down a goal, assigns tasks by role, and auto-emails the team with an Excel-ready report.',
    color: '#10b981'
  },
];

const NodeHighlight = ({ icon: Icon, label, value, detail }) => (
  <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-soft)', display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '160px' }}>
     <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>
        <Icon size={14} /> {label}
     </div>
     <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-strong)' }}>{value}</div>
     {!!detail && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{detail}</div>}
  </div>
);

const WorkflowStepCompact = ({ title, text, isLast }) => (
  <div className="flow-step-compact">
    {!isLast && <div className="flow-line" />}
    <div className="flow-dot" />
    <div className="flow-content-compact">
      <h4>{title}</h4>
      <p>{text}</p>
    </div>
  </div>
);

const TechCard = ({ workflow, onNavigate }) => {
  const Icon = workflow.icon;
  return (
    <div className="tech-card" onClick={() => onNavigate(workflow.id)} style={{ cursor: 'pointer' }}>
      <div className="tech-card-icon">
        <Icon size={18} />
      </div>
      <h3>{workflow.title}</h3>
      <p>{workflow.description}</p>
      <div className="tech-card-btn" style={{ fontSize: '0.7rem' }}>
        Run Automation <ArrowRight size={14} />
      </div>
    </div>
  );
};

export default function Home({ onNavigate }) {
  return (
    <div className="landing-page">
      {/* High-Tech Technical Hero Section */}
      <section className="hero-technical" style={{ paddingBottom: '100px', minHeight: '80vh' }}>
        <div style={{ padding: '4px 12px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '24px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
          AUTOMATION SHOWCASE // PROJECT ALPHA
        </div>
        <h1>Execute <span>programmable intelligence</span></h1>
        <p style={{ margin: '0 auto 48px', maxWidth: '640px' }}>
          A structural portfolio of real-world AI logic implementations. Experience autonomous triage, curriculum synthesis, and intelligent request routing across distributed operational nodes.
        </p>
        
        <div className="hero-actions-row" style={{ marginBottom: '64px' }}>
          <button className="btn-primary-tech" onClick={() => onNavigate('incident')}>
             Launch Project Showcase <Play size={14} fill="white" />
          </button>
        </div>

        {/* Hero Content Addition per User Request (Filling the void) */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', animation: 'slideScaleUp 0.8s ease-out' }}>
           <NodeHighlight icon={Cpu} label="Automations" value="3 Workflows" detail="Triage • Learning • Assignment" />
           <NodeHighlight icon={Server} label="Actions" value="Email + Reports" detail="Tickets, assignments, confirmations" />
           <NodeHighlight icon={Globe} label="Runtime" value="Local + Web" detail="Browser UI + Node /api server" />
           <NodeHighlight icon={Code} label="Outputs" value="JSON + CSV" detail="Excel-ready task report export" />
        </div>
      </section>

      {/* Logic Architecture Section */}
      <section className="container-tight" style={{ padding: '120px 0' }} id="about">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '80px', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>What is <span style={{ color: 'var(--primary)' }}>Automation?</span></h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '32px', fontSize: '0.88rem' }}>
              Automation is the technology that enables processes and procedures to be executed with minimal human intervention. It transforms irregular inputs into predictable outcomes using predefined logic.
            </p>
            <div className="flow-viz">
              <WorkflowStepCompact 
                title="Trigger (The Data-In)" 
                text="The specific event or piece of information that initiates the automated process." 
              />
              <WorkflowStepCompact 
                title="Workflow Logic (The Processing)" 
                text="A series of conditional rules and AI evaluations that determine the outcome." 
              />
              <WorkflowStepCompact 
                title="Action (The Outcome)" 
                text="The final result or operation performed automatically after processing." 
                isLast
              />
            </div>
          </div>

          <div style={{ position: 'relative' }}>
             <div style={{ 
               background: 'rgba(17, 24, 39, 0.6)', 
               borderRadius: '24px', 
               border: '1px solid var(--border-soft)', 
               overflow: 'hidden',
               boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
             }}>
                <img 
                  src={automationConcept} 
                  alt="Automation Concept" 
                  style={{ width: '100%', height: 'auto', display: 'block', opacity: 0.8 }} 
                />
             </div>
             {/* Decorative glow behind image */}
             <div style={{ 
               position: 'absolute', 
               inset: '-20px', 
               background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)', 
               opacity: 0.1, 
               zIndex: -1 
             }} />
          </div>
        </div>
      </section>

      {/* Project Workflow Showcase */}
      <section style={{ background: 'rgba(139, 92, 246, 0.02)', padding: '120px 0', borderTop: '1px solid var(--border-soft)' }}>
        <div className="container-tight">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Functional Case Studies</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '0.85rem' }}>
              This project demonstrates three distinct domains where AI-driven logic can autonomously manage decision-making streams.
            </p>
          </div>
          
          <div className="technical-grid">
            {workflows.map((workflow) => (
              <TechCard key={workflow.id} workflow={workflow} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
