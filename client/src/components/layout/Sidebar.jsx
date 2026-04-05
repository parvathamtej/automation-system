import React from 'react';
import { LayoutDashboard, Settings, Activity, FolderGit2, Menu, ChevronLeft } from 'lucide-react';
import classnames from 'classnames';

const NavItem = ({ icon: Icon, label, active }) => (
  <button style={{
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '8px 12px',
    borderRadius: 'var(--border-radius-m)',
    gap: '12px',
    background: active ? 'var(--color-ui-bg-panel)' : 'transparent',
    color: active ? 'var(--color-accent-primary)' : 'var(--color-text-muted)',
    border: 'none',
    fontWeight: 500,
    fontSize: 'var(--font-size-s)',
    transition: 'all 0.2s',
    cursor: 'pointer'
  }}
  onMouseOver={(e) => {
    if(!active) {
      e.currentTarget.style.color = 'var(--color-text-main)';
      e.currentTarget.style.background = 'var(--color-ui-bg-panel)';
    }
  }}
  onMouseOut={(e) => {
    if(!active) {
      e.currentTarget.style.color = 'var(--color-text-muted)';
      e.currentTarget.style.background = 'transparent';
    }
  }}>
    <Icon size={18} />
    <span>{label}</span>
  </button>
);

const Sidebar = ({ isOpen, toggle }) => {
  return (
    <aside style={{
      width: isOpen ? '260px' : '0px',
      height: '100%',
      backgroundColor: 'var(--color-ui-bg-sidebar)',
      borderRight: '1px solid var(--color-ui-border)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: isOpen ? 1 : 0, transition: 'opacity 0.2s', whiteSpace: 'nowrap' }}>
          <div style={{ width: 32, height: 32, background: 'var(--color-accent-primary)', borderRadius: 'var(--border-radius-m)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 'bold' }}>
            A
          </div>
          <span style={{ fontWeight: 700, fontSize: 'var(--font-size-m)' }}>Antigravity</span>
        </div>
        <button onClick={toggle} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
          {isOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '4px', opacity: isOpen ? 1 : 0, transition: 'opacity 0.2s', whiteSpace: 'nowrap' }}>
        <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 800, padding: '16px 12px 8px', letterSpacing: '0.05em' }}>
          Primary Product
        </div>
        <NavItem icon={LayoutDashboard} label="Dashboard" active />
        <NavItem icon={Activity} label="Monitoring" />
        <NavItem icon={FolderGit2} label="Workflows" />
        
        <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 800, padding: '24px 12px 8px', letterSpacing: '0.05em' }}>
          Administration
        </div>
        <NavItem icon={Settings} label="Settings" />
      </nav>

      {/* User Info & Workspace Switched */}
      <div style={{ padding: '24px 16px', borderTop: '1px solid var(--color-ui-border)', display: 'flex', gap: '12px', alignItems: 'center', opacity: isOpen ? 1 : 0, whiteSpace: 'nowrap' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-ui-border)', backgroundImage: 'url(https://i.pravatar.cc/150?u=a042581f4e29026704d)', backgroundSize: 'cover' }}></div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 'var(--font-size-s)', fontWeight: 600 }}>Parvatham</span>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>parvatham@example.com</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
