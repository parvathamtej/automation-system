import { BrainCircuit, LifeBuoy, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Cards';

const navItems = [
  { id: 'incident', label: 'Incident Triage', icon: ShieldAlert },
  { id: 'learning', label: 'Learning Path', icon: BrainCircuit },
  { id: 'support', label: 'Support Escalation', icon: LifeBuoy },
];

export default function TopNav({ route, onNavigate }) {
  return (
    <header className="topnav">
      <div className="topnav-inner">
        <button className="brand" type="button" onClick={() => onNavigate('home')}>
          <span className="brand-mark">A</span>
          <span className="brand-text">
            <span className="brand-kicker">Automation Studio</span>
            <strong className="brand-title">AI Workflow Engine</strong>
          </span>
        </button>

        <nav className="topnav-actions" aria-label="Primary navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = route === item.id;
            return (
              <Button
                key={item.id}
                type="button"
                variant={active ? 'primary' : 'secondary'}
                size="s"
                className="topnav-button"
                onClick={() => onNavigate(item.id)}
              >
                <Icon size={14} />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

