import { useState } from 'react';
import {
  Bell,
  ChevronLeft,
  FolderGit2,
  Home,
  LayoutDashboard,
  Menu,
  Settings,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Workflows', icon: FolderGit2 },
  { label: 'Settings', icon: Settings },
];

function NavButton({ icon: Icon, label, active }) {
  return (
    <button className={`sidebar-link ${active ? 'is-active' : ''}`} type="button">
      <Icon size={17} />
      <span>{label}</span>
    </button>
  );
}

function Sidebar({ open, onToggle, onBackHome }) {
  return (
    <aside className={`app-sidebar ${open ? 'is-open' : 'is-collapsed'}`}>
      <div className="app-sidebar-inner">
        <div className="sidebar-brand">
          <div className="brand-lockup">
            <div className="brand-mark">A</div>
            {open && (
              <div>
                <p className="eyebrow">Workflow Ops</p>
                <h2 className="brand-title">Hybrid Engine</h2>
              </div>
            )}
          </div>

          <button className="icon-button subtle" type="button" onClick={onToggle}>
            <ChevronLeft size={16} />
          </button>
        </div>

        <button className="sidebar-home" type="button" onClick={onBackHome}>
          <Home size={16} />
          {open && <span>Back to landing page</span>}
        </button>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavButton key={item.label} {...item} />
          ))}
        </nav>

        <div className="sidebar-card">
          {open && (
            <>
              <div className="sidebar-card-header">
                <Sparkles size={14} />
                Live routing
              </div>
              <p>
                Track deployed templates, run simulations, and inspect AI decisions from one
                consistent workspace.
              </p>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

export default function AppChrome({ children, onBackHome }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-frame">
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((value) => !value)}
        onBackHome={onBackHome}
      />

      <div className="app-main">
        <header className="app-header">
          <div className="app-header-left">
            {!sidebarOpen && (
              <button
                className="icon-button subtle"
                type="button"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={16} />
              </button>
            )}

            <div>
              <p className="eyebrow">Operations Console</p>
              <h2 className="header-title">Workflow simulation dashboard</h2>
            </div>
          </div>

          <div className="header-actions">
            <div className="header-chip">API live</div>
            <button className="icon-button" type="button" aria-label="Notifications">
              <Bell size={16} />
            </button>
          </div>
        </header>

        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
