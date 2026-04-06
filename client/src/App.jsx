import { useEffect, useState } from 'react';
import './App.css';
import TopNav from './components/layout/TopNav';
import Background from './components/layout/Background';
import Home from './pages/Home';
import IncidentTriagePage from './pages/IncidentTriagePage';
import LearningPathPage from './pages/LearningPathPage';
import SupportEscalationPage from './pages/SupportEscalationPage';

function App() {
  const [route, setRoute] = useState(() => {
    if (typeof window === 'undefined') return 'home';
    return window.location.hash?.replace('#', '') || 'home';
  });

  useEffect(() => {
    function handleHashChange() {
      const next = window.location.hash?.replace('#', '') || 'home';
      setRoute(next);
    }

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  function navigate(nextRoute) {
    window.location.hash = nextRoute === 'home' ? '' : `#${nextRoute}`;
    setRoute(nextRoute);
  }

  const page =
    route === 'incident' ? (
      <IncidentTriagePage />
    ) : route === 'learning' ? (
      <LearningPathPage />
    ) : route === 'support' ? (
      <SupportEscalationPage />
    ) : (
      <Home onNavigate={navigate} />
    );

  return (
    <div className="app">
      <Background />
      <TopNav route={route} onNavigate={navigate} />
      <main className="app-main">{page}</main>
    </div>
  );
}

export default App;
