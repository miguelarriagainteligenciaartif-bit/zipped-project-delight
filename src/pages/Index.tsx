import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import AuthScreen from '@/components/edgecore/AuthScreen';
import Sidebar from '@/components/edgecore/Sidebar';
import ChecklistWizard from '@/components/edgecore/ChecklistWizard';
import HistoryView from '@/components/edgecore/HistoryView';
import StatisticsView from '@/components/edgecore/StatisticsView';
import type { ViewType } from '@/lib/types';

const Index = () => {
  const { user, username, loading, isAuthenticated, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('checklist');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen onLogin={() => {}} />;
  }

  const displayName = username || user?.email || 'Trader';

  const handleLogout = async () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      await signOut();
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        username={displayName}
        onLogout={handleLogout}
      />
      <main className="flex-1 pt-16 pb-20 px-4 md:pt-0 md:pb-0 md:ml-60 md:p-8 min-h-screen">
        {currentView === 'checklist' && <ChecklistWizard key={currentView} />}
        {currentView === 'history' && <HistoryView key={currentView} />}
        {currentView === 'statistics' && <StatisticsView key={currentView} />}
      </main>
    </div>
  );
};

export default Index;
