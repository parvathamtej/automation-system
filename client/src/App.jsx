import React, { useState } from 'react';
import AppChrome from './components/layout/AppChrome';
import { ContextView } from './components/layout/Views';
import Dashboard from './pages/Dashboard';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  return (
    <AppChrome>
      <ContextView>
        {currentView === 'dashboard' && <Dashboard />}
        {/* Additional views would be routed here */}
      </ContextView>
    </AppChrome>
  );
}

export default App;
