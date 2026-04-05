import { useState } from 'react';
import AppChrome from './components/layout/AppChrome';
import { ContextView } from './components/layout/Views';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';

function App() {
  const [currentView, setCurrentView] = useState('landing');

  if (currentView === 'landing') {
    return <LandingPage onLaunch={() => setCurrentView('dashboard')} />;
  }

  return (
    <AppChrome onBackHome={() => setCurrentView('landing')}>
      <ContextView>
        <Dashboard />
      </ContextView>
    </AppChrome>
  );
}

export default App;
