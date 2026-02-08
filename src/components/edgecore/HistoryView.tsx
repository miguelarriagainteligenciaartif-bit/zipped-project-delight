import { useState, useEffect } from 'react';
import { History as HistoryIcon, Trophy, Minus } from 'lucide-react';
import { getTradeHistory, getChecklistCompletion, formatDateDisplay, updateTradeResult } from '@/lib/storage';
import { isNewTradeData, isLegacyTradeData } from '@/lib/types';
import type { TradeHistoryItem, SingleTradeData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

function getTradesFromItem(item: TradeHistoryItem): SingleTradeData[] {
  if (!item.hadEntry || !item.tradeData) return [];
  if (isNewTradeData(item.tradeData)) return item.tradeData.trades;
  if (isLegacyTradeData(item.tradeData)) {
    return [{
      model: 'M1',
      fvgCount: (item.tradeData.fvgCount || 1) as 1 | 2 | 3,
      notes: item.tradeData.notes || '',
      result: item.tradeData.result,
      points: item.tradeData.points,
    }];
  }
  return [];
}

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

  const handleUpdateResult = (dateKey: string, tradeIndex: number, result: 'win' | 'loss') => {
    if (!confirm(`¿Confirmas que este trade fue un ${result === 'win' ? 'WIN' : 'LOSS'}?`)) return;
    updateTradeResult(dateKey, tradeIndex, result);
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
          {history.map((item, i) => {
            const completion = getChecklistCompletion(item.checklist);
            const isEntry = item.hadEntry;
            const trades = getTradesFromItem(item);
            const allResults = trades.map(t => t.result);
            const hasWin = allResults.includes('win');
            const hasLoss = allResults.includes('loss');
            const hasPending = allResults.includes(null);

            const borderColor = !isEntry ? 'border-l-destructive' :
              hasWin && !hasLoss ? 'border-l-success' :
              hasLoss && !hasWin ? 'border-l-destructive' :
              hasPending ? 'border-l-primary' :
              'border-l-primary';

            return (
              <div key={i} className={`card-surface p-5 border-l-4 ${borderColor}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                  <span className="text-sm font-titles font-bold text-primary capitalize">
                    {formatDateDisplay(item.date)}
                  </span>
                  <div className="flex items-center gap-2">
                    {isEntry && trades.length > 0 && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-primary/20 text-primary">
                        {trades.length} {trades.length === 1 ? 'trade' : 'trades'}
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-md text-xs font-semibold ${
                      isEntry ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                    }`}>
                      {isEntry ? 'TRADE EJECUTADO' : 'SIN OPERACIÓN'}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <span className="text-xs text-muted-foreground">Checklist</span>
                  <p className="text-sm font-semibold text-foreground">{completion}% completado</p>
                </div>

                {/* Individual trades */}
                {isEntry && trades.length > 0 && (
                  <div className="space-y-3">
                    {trades.map((trade, tIdx) => (
                      <div key={tIdx} className="bg-background rounded-lg p-4 border border-border">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {trades.length > 1 && (
                            <span className="text-xs font-titles font-bold text-primary">Trade {tIdx + 1}</span>
                          )}
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent/20 text-accent">
                            {trade.model}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary">
                            {trade.fvgCount === 3 ? '3+ FVG (Envolvente)' : `${trade.fvgCount} FVG`}
                          </span>
                          <span className="text-sm font-semibold ml-auto">
                            {trade.result === 'win' ? <span className="text-success">✅ WIN</span> :
                             trade.result === 'loss' ? <span className="text-destructive">❌ LOSS</span> :
                             <span className="text-primary">⏳ Pendiente</span>}
                          </span>
                        </div>

                        {trade.notes && (
                          <p className="text-xs text-muted-foreground mb-2">
                            <strong>Notas:</strong> {trade.notes}
                          </p>
                        )}

                        {trade.result === null && (
                          <div className="flex gap-3 pt-2 border-t border-border">
                            <button
                              onClick={() => handleUpdateResult(item.date, tIdx, 'win')}
                              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-success/50 text-success text-xs font-semibold hover:bg-success/10 transition-colors"
                            >
                              <Trophy className="w-3 h-3" /> WIN
                            </button>
                            <button
                              onClick={() => handleUpdateResult(item.date, tIdx, 'loss')}
                              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-destructive/50 text-destructive text-xs font-semibold hover:bg-destructive/10 transition-colors"
                            >
                              <Minus className="w-3 h-3" /> LOSS
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {!isEntry && item.noEntryReasons?.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs text-muted-foreground">Razones</span>
                    <p className="text-sm text-foreground">{item.noEntryReasons.join(', ')}</p>
                  </div>
                )}

                {/* General notes */}
                {isEntry && isNewTradeData(item.tradeData) && item.tradeData.notes && (
                  <p className="text-xs text-muted-foreground mt-3">
                    <strong>Notas generales:</strong> {item.tradeData.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
