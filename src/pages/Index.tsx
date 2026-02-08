import { useState, useEffect } from 'react';
import AuthScreen from '@/components/edgecore/AuthScreen';
import Sidebar from '@/components/edgecore/Sidebar';
import ChecklistWizard from '@/components/edgecore/ChecklistWizard';
import HistoryView from '@/components/edgecore/HistoryView';
import StatisticsView from '@/components/edgecore/StatisticsView';
import { getCurrentUser, logoutUser } from '@/lib/storage';
import type { ViewType } from '@/lib/types';

const Index = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('checklist');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) setUsername(user);
    setIsReady(true);
  }, []);

  const handleLogin = (user: string) => {
    setUsername(user);
    setCurrentView('checklist');
  };

  const handleLogout = () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      logoutUser();
      setUsername(null);
      setCurrentView('checklist');
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!username) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        username={username}
        onLogout={handleLogout}
      />
      <main className="ml-16 md:ml-60 flex-1 p-4 md:p-8 min-h-screen">
        {currentView === 'checklist' && <ChecklistWizard key={currentView} />}
        {currentView === 'history' && <HistoryView key={currentView} />}
        {currentView === 'statistics' && <StatisticsView key={currentView} />}
      </main>
    </div>
  );
};

export default Index;
