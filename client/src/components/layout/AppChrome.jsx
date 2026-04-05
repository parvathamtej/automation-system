import { useState } from 'react';
import {
  Bell,
  ChevronLeft,
  Home,
  LayoutDashboard,
  Menu,
  Moon,
  PlayCircle,
  Settings2,
  Sparkles,
  SunMedium,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Simulator', icon: PlayCircle, active: false },
  { label: 'Settings', icon: Settings2, active: false },
];

function SidebarItem({ icon: Icon, label, active, open }) {
  return (
    <button className={`sidebar-item ${active ? 'is-active' : ''}`} type="button">
      <Icon size={17} />
      {open && <span>{label}</span>}
    </button>
  );
}

export default function AppChrome({ children, onBackHome, theme, onToggleTheme }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'is-open' : 'is-collapsed'}`}>
        <div className="sidebar-panel">
          <div className="sidebar-brand">
            <div className="brand-mark">A</div>
            {sidebarOpen && (
              <div>
                <p className="eyebrow">Workflow Ops</p>
                <h2>Hybrid Engine</h2>
              </div>
            )}
            <button className="icon-button ghost" type="button" onClick={() => setSidebarOpen((value) => !value)}>
              <ChevronLeft size={16} />
            </button>
          </div>

          <button className="back-home-button" type="button" onClick={onBackHome}>
            <Home size={16} />
            {sidebarOpen && <span>Back to landing page</span>}
          </button>

          <div className="sidebar-nav">
            {navItems.map((item) => (
              <SidebarItem key={item.label} {...item} open={sidebarOpen} />
            ))}
          </div>

          <div className="sidebar-insight">
            {sidebarOpen && (
              <>
                <div className="sidebar-insight-title">
                  <Sparkles size={14} />
                  What this product does
                </div>
                <p>
                  It ingests business events, runs AI reasoning on the backend, chooses the
                  right automation route, and proves which downstream actions actually ran.
                </p>
              </>
            )}
          </div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="topbar-left">
            {!sidebarOpen && (
              <button className="icon-button ghost" type="button" onClick={() => setSidebarOpen(true)}>
                <Menu size={16} />
              </button>
            )}
            <div>
              <p className="eyebrow">Operations Console</p>
              <h1>AI Workflow Automation</h1>
            </div>
          </div>

          <div className="topbar-actions">
            <button
              className="theme-toggle"
              type="button"
              onClick={onToggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              <span className={`theme-toggle-option ${theme === 'light' ? 'is-active' : ''}`}>
                <SunMedium size={14} />
                <span>Light</span>
              </span>
              <span className={`theme-toggle-option ${theme === 'dark' ? 'is-active' : ''}`}>
                <Moon size={14} />
                <span>Dark</span>
              </span>
            </button>
            <div className="live-pill">Backend integrated</div>
            <button className="icon-button" type="button" aria-label="Notifications">
              <Bell size={16} />
            </button>
          </div>
        </header>

        <main className="workspace-main">{children}</main>
      </section>
    </div>
  );
}
