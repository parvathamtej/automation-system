import { BrainCircuit, ShieldAlert, ChevronDown, ClipboardList } from 'lucide-react';
import './TopNav.css';

const navItems = [
  { id: 'incident', label: 'Incident Triage', icon: ShieldAlert },
  { id: 'learning', label: 'Learning Path', icon: BrainCircuit },
  { id: 'assignment', label: 'Task Assignment', icon: ClipboardList },
];

export default function TopNav({ route, onNavigate }) {
  return (
    <header className="topnav">
      <div className="topnav-inner">
        <button className="brand-new" type="button" onClick={() => onNavigate('home')}>
          <div className="brand-logo">A</div>
          <span className="brand-txt">Automation.io</span>
        </button>

        <nav className="nav-links" aria-label="Primary navigation">
          <button className="nav-link" onClick={() => onNavigate('home')}>Home</button>
          <a href="#about" className="nav-link">About</a>
          
          <div className="nav-dropdown">
            <button className="btn-execute">
              Execute Workflow <ChevronDown size={18} />
            </button>
            <div className="nav-dropdown-content">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className="dropdown-item"
                    onClick={() => onNavigate(item.id)}
                  >
                    <div className="dropdown-item-icon">
                      <Icon size={16} />
                    </div>
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
