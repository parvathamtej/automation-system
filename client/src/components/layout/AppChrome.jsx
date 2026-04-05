import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Search } from 'lucide-react';

const AppChrome = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: 'var(--color-ui-bg-panel)' }}>
      {/* Sidebar: Left Navigation */}
      <Sidebar isOpen={isSidebarOpen} toggle={() => setSidebarOpen(!isSidebarOpen)} />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Top Navbar */}
        <header style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--spacing-l)',
          borderBottom: '1px solid var(--color-ui-border)',
          backgroundColor: 'var(--color-ui-bg-base)',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-s)' }}>
            <span style={{ fontSize: 'var(--font-size-s)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Organization / Workspace / Dashboard
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-m)' }}>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
              background: 'var(--color-ui-bg-panel)',
              border: '1px solid var(--color-ui-border)',
              padding: '6px 12px',
              borderRadius: 'var(--border-radius-m)',
              color: 'var(--color-text-muted)',
              fontSize: 'var(--font-size-s)'
            }}>
              <Search size={14} />
              <span style={{ marginRight: '24px' }}>Search...</span>
              <kbd style={{ fontSize: '0.7rem', fontFamily: 'var(--font-family-data)', backgroundColor: 'var(--color-ui-border)', padding: '2px 4px', borderRadius: '4px' }}>⌘K</kbd>
            </button>
          </div>
        </header>

        {/* Content Viewport */}
        <main style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppChrome;
