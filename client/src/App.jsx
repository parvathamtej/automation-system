import { useEffect, useState } from 'react';
import AppChrome from './components/layout/AppChrome';
import { ContextView } from './components/layout/Views';
import BackgroundCanvas from './components/ui/BackgroundCanvas';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }

    return window.localStorage.getItem('ui-theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('ui-theme', theme);
  }, [theme]);

  return (
    <>
      <BackgroundCanvas />
      {currentView === 'landing' ? (
        <LandingPage onLaunch={() => setCurrentView('dashboard')} />
      ) : (
        <AppChrome
          onBackHome={() => setCurrentView('landing')}
          theme={theme}
          onToggleTheme={() => setTheme((value) => (value === 'light' ? 'dark' : 'light'))}
        >
          <ContextView>
            <Dashboard />
          </ContextView>
        </AppChrome>
      )}
    </>
  );
}

export default App;
