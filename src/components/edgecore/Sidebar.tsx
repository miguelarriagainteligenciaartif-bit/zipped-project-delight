import { TrendingUp, ClipboardCheck, History, BarChart3, LogOut, Clock, CircleDot, User } from 'lucide-react';
import { useNYClock } from '@/hooks/use-ny-clock';
import type { ViewType } from '@/lib/types';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  username: string;
  onLogout: () => void;
}

const menuItems: { view: ViewType; icon: typeof ClipboardCheck; label: string }[] = [
  { view: 'checklist', icon: ClipboardCheck, label: 'Checklist Hoy' },
  { view: 'history', icon: History, label: 'Historial' },
  { view: 'statistics', icon: BarChart3, label: 'Estadísticas' },
];

export default function Sidebar({ currentView, onViewChange, username, onLogout }: SidebarProps) {
  const { nyTime, isWindowOpen } = useNYClock();

  return (
    <nav className="w-16 md:w-60 bg-sidebar fixed h-screen left-0 top-0 z-50 flex flex-col border-r border-sidebar-border">
      {/* Header */}
      <div className="p-3 md:p-5 flex items-center gap-3 border-b border-sidebar-border">
        <TrendingUp className="w-7 h-7 text-primary flex-shrink-0" />
        <span className="hidden md:block text-lg font-titles font-bold tracking-widest text-foreground">
          EDGECORE
        </span>
      </div>

      {/* Session Info */}
      <div className="p-3 md:p-4 border-b border-sidebar-border space-y-2">
        <div className="flex items-center gap-2 text-xs md:text-sm text-sidebar-foreground">
          <BarChart3 className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="hidden md:block">NASDAQ</span>
        </div>
        <div className="flex items-center gap-2 text-xs md:text-sm text-sidebar-foreground">
          <Clock className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="hidden md:block font-mono">{nyTime.timeString}</span>
        </div>
        <div className={`flex items-center gap-2 text-xs p-2 rounded-md font-semibold ${
          isWindowOpen
            ? 'bg-success/20 text-success border border-success/40'
            : 'bg-destructive/20 text-destructive border border-destructive/40'
        }`}>
          <CircleDot className="w-3 h-3 flex-shrink-0" />
          <span className="hidden md:block">{isWindowOpen ? 'Ventana Abierta' : 'Mercado Cerrado'}</span>
        </div>
      </div>

      {/* Menu */}
      <ul className="flex-1 py-3 space-y-1">
        {menuItems.map(({ view, icon: Icon, label }) => (
          <li key={view}>
            <button
              onClick={() => onViewChange(view)}
              className={`w-full flex items-center gap-3 px-3 md:px-5 py-3.5 transition-all border-l-4 ${
                currentView === view
                  ? 'bg-sidebar-accent border-l-primary text-primary'
                  : 'border-l-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:border-l-accent'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${currentView === view ? 'text-primary' : 'text-primary/70'}`} />
              <span className="hidden md:block font-medium text-sm">{label}</span>
            </button>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="p-3 md:p-4 border-t border-sidebar-border space-y-3">
        <div className="flex items-center gap-2 p-2 bg-sidebar-accent rounded-lg">
          <User className="w-5 h-5 text-primary flex-shrink-0" />
          <span className="hidden md:block text-sm font-medium text-sidebar-foreground truncate">{username}</span>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center md:justify-start gap-2 py-2.5 px-3 rounded-lg border border-destructive/50 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span className="hidden md:block">Cerrar Sesión</span>
        </button>
      </div>
    </nav>
  );
}
