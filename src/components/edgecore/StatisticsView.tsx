import { useEffect, useState } from 'react';
import { CalendarCheck, CheckCircle, TrendingUp, Coins } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getUserData, getWeekdayStatistics, getChecklistCorrelation } from '@/lib/storage';
import type { Statistics } from '@/lib/types';

const emptyStats: Statistics = {
  totalDays: 0, daysWithEntry: 0, daysNoEntry: 0,
  totalWins: 0, totalLosses: 0, totalTrades: 0,
  winRate: 0, totalPoints: 0, avgPointsPerTrade: 0,
  checklistCompleteCount: 0, checklistCompletePercentage: 0,
};

const statCards = [
  { key: 'totalDays', label: 'Días Analizados', icon: CalendarCheck, format: (v: number) => String(v) },
  { key: 'checklistCompletePercentage', label: 'Checklist 100%', icon: CheckCircle, format: (v: number) => v + '%' },
  { key: 'winRate', label: 'Win Rate', icon: TrendingUp, format: (v: number) => v + '%' },
  { key: 'totalPoints', label: 'Total Puntos', icon: Coins, format: (v: number) => v > 0 ? '+' + v : String(v) },
] as const;

export default function StatisticsView() {
  const [stats, setStats] = useState<Statistics>(emptyStats);
  const [weekdayData, setWeekdayData] = useState<{ name: string; value: number }[]>([]);
  const [correlationData, setCorrelationData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    const userData = getUserData();
    if (userData) setStats(userData.statistics);

    const wd = getWeekdayStatistics();
    setWeekdayData(wd.labels.map((l, i) => ({ name: l, value: wd.data[i] })));

    const cd = getChecklistCorrelation();
    setCorrelationData(cd.labels.map((l, i) => ({ name: l, value: cd.data[i] })));
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs text-primary font-semibold">{label}</p>
        <p className="text-xs text-foreground">Win Rate: {payload[0].value}%</p>
      </div>
    );
  };

  return (
    <div className="fade-in">
      <h1 className="text-xl md:text-2xl font-titles font-bold text-primary mb-6">Estadísticas de Trading</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ key, label, icon: Icon, format }) => (
          <div key={key} className="card-surface p-5 flex items-center gap-4 hover:border-primary/50 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 gold-gradient rounded-xl flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-2xl font-titles font-bold text-primary">
                {format(stats[key as keyof Statistics] as number)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-surface p-5">
          <h3 className="text-sm font-titles font-semibold text-primary mb-4">Resultados por Día de la Semana</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weekdayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 20%)" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(0 0% 100%)', fontSize: 12 }} />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: 'hsl(0 0% 100%)', fontSize: 12 }}
                tickFormatter={v => v + '%'}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {weekdayData.map((_, i) => (
                  <Cell key={i} fill="hsl(51 100% 50%)" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card-surface p-5">
          <h3 className="text-sm font-titles font-semibold text-primary mb-4">Correlación: Checklist vs Resultado</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={correlationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 20%)" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(0 0% 100%)', fontSize: 12 }} />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: 'hsl(0 0% 100%)', fontSize: 12 }}
                tickFormatter={v => v + '%'}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {correlationData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? 'hsl(142 71% 45%)' : 'hsl(0 100% 60%)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
