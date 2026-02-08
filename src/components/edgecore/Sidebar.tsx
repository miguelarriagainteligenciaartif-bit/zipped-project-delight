import { TrendingUp, ClipboardCheck, History, BarChart3, LogOut, Clock, CircleDot, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useNYClock } from '@/hooks/use-ny-clock';
import { useIsMobile } from '@/hooks/use-mobile';
import type { ViewType } from '@/lib/types';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  username: string;
  onLogout: () => void;
}

const menuItems: { view: ViewType; icon: typeof ClipboardCheck; label: string }[] = [
  { view: 'checklist', icon: ClipboardCheck, label: 'Checklist' },
  { view: 'history', icon: History, label: 'Historial' },
  { view: 'statistics', icon: BarChart3, label: 'Estadísticas' },
];

export default function Sidebar({ currentView, onViewChange, username, onLogout }: SidebarProps) {
  const { nyTime, isWindowOpen } = useNYClock();
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ─── Mobile: Bottom Nav + Drawer ───
  if (isMobile) {
    return (
      <>
        {/* Top Bar */}
        <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            <span className="text-base font-titles font-bold tracking-widest text-foreground">EDGECORE</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md font-semibold ${
              isWindowOpen
                ? 'bg-success/20 text-success border border-success/40'
                : 'bg-destructive/20 text-destructive border border-destructive/40'
            }`}>
              <CircleDot className="w-2.5 h-2.5" />
              {isWindowOpen ? 'Abierta' : 'Cerrado'}
            </div>
            <button onClick={() => setDrawerOpen(true)} className="p-1.5 rounded-lg text-foreground hover:bg-secondary transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-sidebar border-t border-sidebar-border flex items-center justify-around px-2 safe-area-bottom">
          {menuItems.map(({ view, icon: Icon, label }) => (
            <button
              key={view}
              onClick={() => onViewChange(view)}
              className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-lg transition-all ${
                currentView === view
                  ? 'text-primary'
                  : 'text-sidebar-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 ${currentView === view ? 'text-primary' : 'text-sidebar-foreground'}`} />
              <span className={`text-[10px] font-medium ${currentView === view ? 'text-primary font-semibold' : ''}`}>{label}</span>
              {currentView === view && (
                <div className="w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </nav>

        {/* Drawer Overlay */}
        {drawerOpen && (
          <div className="fixed inset-0 z-[60] fade-in" onClick={() => setDrawerOpen(false)}>
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <div
              className="absolute right-0 top-0 h-full w-72 bg-sidebar border-l border-sidebar-border p-5 slide-in-right flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-base font-titles font-bold text-foreground">Menú</span>
                <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-lg text-foreground hover:bg-secondary transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Session info */}
              <div className="space-y-3 mb-6 p-4 bg-sidebar-accent rounded-lg">
                <div className="flex items-center gap-2 text-sm text-sidebar-foreground">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span>NASDAQ</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-sidebar-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-mono">{nyTime.timeString}</span>
                </div>
                <div className={`flex items-center gap-2 text-xs p-2 rounded-md font-semibold ${
                  isWindowOpen
                    ? 'bg-success/20 text-success border border-success/40'
                    : 'bg-destructive/20 text-destructive border border-destructive/40'
                }`}>
                  <CircleDot className="w-3 h-3" />
                  <span>{isWindowOpen ? 'Ventana Abierta' : 'Mercado Cerrado'}</span>
                </div>
              </div>

              {/* User */}
              <div className="flex items-center gap-2 p-3 bg-sidebar-accent rounded-lg mb-4">
                <User className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-sidebar-foreground truncate">{username}</span>
              </div>

              <div className="flex-1" />

              {/* Logout */}
              <button
                onClick={() => { onLogout(); setDrawerOpen(false); }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-destructive/50 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // ─── Desktop: Fixed Sidebar ───
  return (
    <nav className="w-60 bg-sidebar fixed h-screen left-0 top-0 z-50 flex flex-col border-r border-sidebar-border">
      {/* Header */}
      <div className="p-5 flex items-center gap-3 border-b border-sidebar-border">
        <TrendingUp className="w-7 h-7 text-primary flex-shrink-0" />
        <span className="text-lg font-titles font-bold tracking-widest text-foreground">EDGECORE</span>
      </div>

      {/* Session Info */}
      <div className="p-4 border-b border-sidebar-border space-y-2">
        <div className="flex items-center gap-2 text-sm text-sidebar-foreground">
          <BarChart3 className="w-4 h-4 text-primary flex-shrink-0" />
          <span>NASDAQ</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-sidebar-foreground">
          <Clock className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="font-mono">{nyTime.timeString}</span>
        </div>
        <div className={`flex items-center gap-2 text-xs p-2 rounded-md font-semibold ${
          isWindowOpen
            ? 'bg-success/20 text-success border border-success/40'
            : 'bg-destructive/20 text-destructive border border-destructive/40'
        }`}>
          <CircleDot className="w-3 h-3 flex-shrink-0" />
          <span>{isWindowOpen ? 'Ventana Abierta' : 'Mercado Cerrado'}</span>
        </div>
      </div>

      {/* Menu */}
      <ul className="flex-1 py-3 space-y-1">
        {menuItems.map(({ view, icon: Icon, label }) => (
          <li key={view}>
            <button
              onClick={() => onViewChange(view)}
              className={`w-full flex items-center gap-3 px-5 py-3.5 transition-all border-l-4 ${
                currentView === view
                  ? 'bg-sidebar-accent border-l-primary text-primary'
                  : 'border-l-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:border-l-accent'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${currentView === view ? 'text-primary' : 'text-primary/70'}`} />
              <span className="font-medium text-sm">{label}</span>
            </button>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div className="flex items-center gap-2 p-2 bg-sidebar-accent rounded-lg">
          <User className="w-5 h-5 text-primary flex-shrink-0" />
          <span className="text-sm font-medium text-sidebar-foreground truncate">{username}</span>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-start gap-2 py-2.5 px-3 rounded-lg border border-destructive/50 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
}
