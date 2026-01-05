import { useState, useEffect } from 'react';
import { AppShell } from './components/AppShell';
import { CommandCenter } from './pages/CommandCenter';
import { GoalsPage } from './pages/GoalsPage';
import { VaultPage } from './pages/VaultPage';
import { SettingsPage } from './pages/SettingsPage';

type Route = '/' | '/goals' | '/vault' | '/settings';

function App() {
  const [route, setRoute] = useState<Route>(() => {
    const hash = window.location.hash.slice(1) as Route;
    return ['/', '/goals', '/vault', '/settings'].includes(hash) ? hash : '/';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) as Route;
      if (['/', '/goals', '/vault', '/settings'].includes(hash)) {
        setRoute(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderPage = () => {
    switch (route) {
      case '/goals':
        return <GoalsPage />;
      case '/vault':
        return <VaultPage />;
      case '/settings':
        return <SettingsPage />;
      default:
        return <CommandCenter />;
    }
  };

  return (
    <AppShell currentRoute={route}>
      {renderPage()}
    </AppShell>
  );
}

export default App;
