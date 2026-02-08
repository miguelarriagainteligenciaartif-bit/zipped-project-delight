import { useState, useEffect } from 'react';
import { History as HistoryIcon, CheckCircle, XCircle, Trophy, Minus } from 'lucide-react';
import { getTradeHistory, getChecklistCompletion, formatDateDisplay, updateTradeResult } from '@/lib/storage';
import type { TradeHistoryItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function HistoryView() {
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [history, setHistory] = useState<TradeHistoryItem[]>([]);
  const { toast } = useToast();

  const loadHistory = () => {
    let trades = getTradeHistory(filterPeriod);
    if (filterType === 'withEntry') trades = trades.filter(t => t.hadEntry);
    else if (filterType === 'noEntry') trades = trades.filter(t => !t.hadEntry);
    setHistory(trades);
  };

  useEffect(() => { loadHistory(); }, [filterPeriod, filterType]);

  const handleUpdateResult = (dateKey: string, result: 'win' | 'loss') => {
    if (!confirm(`¿Confirmas que este trade fue un ${result === 'win' ? 'WIN' : 'LOSS'}?`)) return;
    updateTradeResult(dateKey, result);
    toast({ title: `Trade marcado como ${result === 'win' ? 'WIN ✅' : 'LOSS ❌'}` });
    loadHistory();
  };

  return (
    <div className="fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-titles font-bold text-primary">Historial de Operaciones</h1>
        <div className="flex gap-2">
          <select
            value={filterPeriod}
            onChange={e => setFilterPeriod(e.target.value)}
            className="px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground cursor-pointer focus:border-primary focus:outline-none"
          >
            <option value="7">Últimos 7 días</option>
            <option value="30">Últimos 30 días</option>
            <option value="90">Últimos 90 días</option>
            <option value="all">Todos</option>
          </select>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground cursor-pointer focus:border-primary focus:outline-none"
          >
            <option value="all">Todos</option>
            <option value="withEntry">Con entrada</option>
            <option value="noEntry">Sin entrada</option>
          </select>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="card-surface p-12 text-center">
          <HistoryIcon className="w-12 h-12 text-primary mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-titles font-semibold text-foreground mb-2">No hay registros todavía</h3>
          <p className="text-sm text-muted-foreground">Completa tu primer checklist para ver el historial aquí</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((trade, i) => {
            const completion = getChecklistCompletion(trade.checklist);
            const isEntry = trade.hadEntry;
            const result = trade.tradeData?.result;

            return (
              <div
                key={i}
                className={`card-surface p-5 border-l-4 ${
                  !isEntry ? 'border-l-destructive' :
                  result === 'win' ? 'border-l-success' :
                  result === 'loss' ? 'border-l-destructive' :
                  'border-l-primary'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                  <span className="text-sm font-titles font-bold text-primary capitalize">
                    {formatDateDisplay(trade.date)}
                  </span>
                  <span className={`px-3 py-1 rounded-md text-xs font-semibold ${
                    isEntry ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                  }`}>
                    {isEntry ? 'TRADE EJECUTADO' : 'SIN OPERACIÓN'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground">Checklist</span>
                    <p className="text-sm font-semibold text-foreground">{completion}% completado</p>
                  </div>
                  {isEntry && trade.tradeData && (
                    <>
                      <div>
                        <span className="text-xs text-muted-foreground">FVG Count</span>
                        <p className="text-sm font-semibold text-foreground">{trade.tradeData.fvgCount} FVG</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Resultado</span>
                        <p className="text-sm font-semibold">
                          {result === 'win' ? <span className="text-success">✅ WIN</span> :
                           result === 'loss' ? <span className="text-destructive">❌ LOSS</span> :
                           <span className="text-primary">⏳ Pendiente</span>}
                        </p>
                      </div>
                    </>
                  )}
                  {!isEntry && trade.noEntryReasons?.length > 0 && (
                    <div className="col-span-2">
                      <span className="text-xs text-muted-foreground">Razones</span>
                      <p className="text-sm text-foreground">{trade.noEntryReasons.join(', ')}</p>
                    </div>
                  )}
                </div>

                {trade.tradeData?.notes && (
                  <p className="text-xs text-muted-foreground mt-3">
                    <strong>Notas:</strong> {trade.tradeData.notes}
                  </p>
                )}

                {isEntry && trade.tradeData?.result === null && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                    <button
                      onClick={() => handleUpdateResult(trade.date, 'win')}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-success/50 text-success text-sm font-semibold hover:bg-success/10 transition-colors"
                    >
                      <Trophy className="w-4 h-4" /> Marcar WIN
                    </button>
                    <button
                      onClick={() => handleUpdateResult(trade.date, 'loss')}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-destructive/50 text-destructive text-sm font-semibold hover:bg-destructive/10 transition-colors"
                    >
                      <Minus className="w-4 h-4" /> Marcar LOSS
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
