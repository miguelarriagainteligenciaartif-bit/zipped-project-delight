import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import type { TradeData, SingleTradeData, EntryModel, ChecklistData } from '@/lib/types';

interface TradeRegistrationProps {
  data: ChecklistData;
  onUpdate: (updates: Partial<ChecklistData>) => void;
}

const FVG_RULES: Record<number, { title: string; rules: string[] }> = {
  1: {
    title: '1 FVG',
    rules: ['Ejecutar en el único FVG', 'SL: Proteger 3 velas del FVG', 'Si no 1:1.2, esperar descuento'],
  },
  2: {
    title: '2 FVG',
    rules: ['Ejecutar en el ÚLTIMO FVG', 'SL: Proteger 3 velas del 1er FVG', 'Si no 1:1.2, descuento o vela envolvente'],
  },
  3: {
    title: '3+ FVG',
    rules: ['Esperar protocolo vela envolvente', 'NO ejecutar sin protocolo'],
  },
};

function createEmptyTrade(): SingleTradeData {
  return { model: 'M1', fvgCount: 1, notes: '', result: null, points: null };
}

function getTradeData(data: ChecklistData): TradeData | null {
  if (!data.tradeData) return null;
  if ('trades' in data.tradeData) return data.tradeData as TradeData;
  return null;
}

export default function TradeRegistration({ data, onUpdate }: TradeRegistrationProps) {
  const [editingTrade, setEditingTrade] = useState(0);

  const tradeData = getTradeData(data);

  const handleTradeDecision = (hadEntry: boolean) => {
    if (hadEntry) {
      onUpdate({ hadEntry: true });
    } else {
      onUpdate({ hadEntry: false, tradeData: null });
    }
  };

  const handleTradeCount = (count: 1 | 2 | 3) => {
    const currentTrades = tradeData?.trades || [];
    const trades: SingleTradeData[] = [];
    for (let i = 0; i < count; i++) {
      trades.push(currentTrades[i] || createEmptyTrade());
    }
    onUpdate({
      tradeData: { tradeCount: count, trades, notes: tradeData?.notes || '' },
    });
    setEditingTrade(0);
  };

  const updateSingleTrade = (index: number, updates: Partial<SingleTradeData>) => {
    if (!tradeData) return;
    const trades = [...tradeData.trades];
    trades[index] = { ...trades[index], ...updates };
    onUpdate({ tradeData: { ...tradeData, trades } });
  };

  const updateGeneralNotes = (notes: string) => {
    if (!tradeData) return;
    onUpdate({ tradeData: { ...tradeData, notes } });
  };

  return (
    <div className="fade-in">
      {/* Entry Decision */}
      <div className="text-center my-8">
        <h3 className="text-lg font-titles font-semibold text-foreground mb-5">¿Hubo entrada hoy?</h3>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            type="button"
            onClick={() => handleTradeDecision(true)}
            className={`flex flex-col items-center gap-3 px-8 py-6 rounded-xl border-2 font-titles font-semibold transition-all ${
              data.hadEntry === true
                ? 'border-primary bg-primary/10 text-primary gold-shadow'
                : 'border-border text-foreground hover:border-primary hover:bg-primary/5'
            }`}
          >
            <CheckCircle className="w-10 h-10" />
            <span>SÍ — Ejecuté Trade</span>
          </button>
          <button
            type="button"
            onClick={() => handleTradeDecision(false)}
            className={`flex flex-col items-center gap-3 px-8 py-6 rounded-xl border-2 font-titles font-semibold transition-all ${
              data.hadEntry === false
                ? 'border-destructive bg-destructive/10 text-destructive'
                : 'border-border text-foreground hover:border-destructive hover:bg-destructive/5'
            }`}
          >
            <XCircle className="w-10 h-10" />
            <span>NO — Sin Entrada</span>
          </button>
        </div>
      </div>

      {/* YES Flow */}
      {data.hadEntry === true && (
        <div className="fade-in space-y-6">
          {/* Trade Count */}
          <div>
            <h3 className="text-base font-titles font-semibold text-foreground text-center mb-4">
              ¿Cuántos trades ejecutaste?
            </h3>
            <div className="flex justify-center gap-3">
              {([1, 2, 3] as const).map(count => (
                <button
                  key={count}
                  type="button"
                  onClick={() => handleTradeCount(count)}
                  className={`w-20 h-20 rounded-xl border-2 flex flex-col items-center justify-center gap-1 font-titles font-bold text-lg transition-all ${
                    tradeData?.tradeCount === count
                      ? 'border-primary bg-primary/10 text-primary gold-shadow'
                      : 'border-border text-foreground hover:border-primary hover:bg-primary/5'
                  }`}
                >
                  {count}
                  <span className="text-[10px] font-normal text-muted-foreground">
                    {count === 1 ? 'trade' : 'trades'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Individual Trade Details */}
          {tradeData && tradeData.trades.length > 0 && (
            <div className="space-y-4">
              {/* Trade Tabs (if more than 1) */}
              {tradeData.tradeCount > 1 && (
                <div className="flex gap-2 justify-center">
                  {tradeData.trades.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditingTrade(idx)}
                      className={`px-4 py-2 rounded-lg text-sm font-titles font-semibold transition-all ${
                        editingTrade === idx
                          ? 'gold-gradient text-primary-foreground gold-shadow'
                          : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary'
                      }`}
                    >
                      Trade {idx + 1}
                    </button>
                  ))}
                </div>
              )}

              {/* Active Trade Form */}
              <TradeForm
                key={editingTrade}
                trade={tradeData.trades[editingTrade]}
                tradeIndex={editingTrade}
                tradeCount={tradeData.tradeCount}
                onChange={(updates) => updateSingleTrade(editingTrade, updates)}
              />
            </div>
          )}

          {/* General Notes */}
          {tradeData && (
            <div>
              <label className="text-sm font-medium text-primary block mb-2">Notas Generales</label>
              <textarea
                value={tradeData.notes}
                onChange={(e) => updateGeneralNotes(e.target.value)}
                rows={3}
                placeholder="Observaciones generales del día..."
                className="w-full p-3 bg-background border-2 border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors resize-none"
              />
            </div>
          )}
        </div>
      )}

      {/* NO Flow */}
      {data.hadEntry === false && (
        <div className="fade-in space-y-4">
          <h3 className="text-base font-titles font-semibold text-foreground text-center">¿Por qué no ejecutaste?</h3>
          <div className="space-y-2">
            {['R:R no era mínimo 1:1.2', 'Fuera de ventana 9:30-10:15 AM'].map((reason, idx) => (
              <label key={idx} className="flex items-center gap-3 p-4 bg-background rounded-lg cursor-pointer hover:bg-secondary transition-colors">
                <input
                  type="checkbox"
                  className="custom-checkbox"
                  checked={data.noEntryReasons.includes(reason)}
                  onChange={(e) => {
                    onUpdate({
                      noEntryReasons: e.target.checked
                        ? [...data.noEntryReasons, reason]
                        : data.noEntryReasons.filter(r => r !== reason),
                    });
                  }}
                />
                <span className="text-sm text-foreground">{reason}</span>
              </label>
            ))}
          </div>
          <div>
            <label className="text-sm font-medium text-primary block mb-2">Notas Adicionales</label>
            <textarea
              value={data.notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              rows={3}
              placeholder="Describe qué observaste hoy..."
              className="w-full p-3 bg-background border-2 border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ========== Individual Trade Form ========== */

interface TradeFormProps {
  trade: SingleTradeData;
  tradeIndex: number;
  tradeCount: number;
  onChange: (updates: Partial<SingleTradeData>) => void;
}

function TradeForm({ trade, tradeIndex, tradeCount, onChange }: TradeFormProps) {
  return (
    <div className="card-surface p-5 space-y-5">
      <h4 className="text-sm font-titles font-semibold text-primary">
        {tradeCount === 1 ? 'Detalles del Trade' : `Trade ${tradeIndex + 1}`}
      </h4>

      {/* Entry Model */}
      <div>
        <p className="text-sm font-medium text-foreground mb-3">¿Qué modelo utilizaste para entrar?</p>
        <div className="grid grid-cols-3 gap-3">
          {(['M1', 'M3', 'Continuación'] as EntryModel[]).map(model => (
            <button
              key={model}
              type="button"
              onClick={() => onChange({ model })}
              className={`py-4 rounded-xl border-2 font-titles font-bold text-sm sm:text-lg transition-all ${
                trade.model === model
                  ? 'border-primary bg-primary/10 text-primary gold-shadow'
                  : 'border-border text-foreground hover:border-primary hover:bg-primary/5'
              }`}
            >
              {model}
            </button>
          ))}
        </div>
      </div>

      {/* FVG Count */}
      <div>
        <p className="text-sm font-medium text-foreground mb-3">¿Cuántos FVG identificaste?</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {([1, 2, 3] as const).map(count => {
            const fvgRule = FVG_RULES[count];
            return (
              <button
                key={count}
                type="button"
                onClick={() => onChange({ fvgCount: count })}
                className={`p-5 rounded-xl border-2 text-left transition-all ${
                  trade.fvgCount === count
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-accent bg-background'
                }`}
              >
                <strong className="text-primary text-sm block mb-2">{fvgRule.title}</strong>
                {fvgRule.rules.map((r, i) => (
                  <p key={i} className="text-xs text-muted-foreground leading-relaxed">→ {r}</p>
                ))}
              </button>
            );
          })}
        </div>
      </div>

      {/* Envolvente Warning for 3+ FVG */}
      {trade.fvgCount === 3 && (
        <div className="flex items-start gap-3 p-4 rounded-lg border-2 border-destructive/50 bg-destructive/10">
          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0 text-destructive" />
          <span className="text-sm font-semibold text-foreground">
            ⚠️ Con 3+ FVG el modelo de entrada es por ENVOLVENTE. NO ejecutar sin protocolo de vela envolvente.
          </span>
        </div>
      )}

      {/* SL Reminder */}
      <div className="flex items-start gap-3 p-4 rounded-lg border-2 border-primary/50 bg-primary/10">
        <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
        <span className="text-sm font-semibold text-foreground">
          RECORDATORIO: NO mover el SL (sin break even). Solo TP o SL inicial.
        </span>
      </div>

      {/* Trade Notes */}
      <div>
        <label className="text-sm font-medium text-primary block mb-2">
          Notas del {tradeCount === 1 ? 'Trade' : `Trade ${tradeIndex + 1}`}
        </label>
        <textarea
          value={trade.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          rows={2}
          placeholder="Ej: Confluencia perfecta con zona semanal..."
          className="w-full p-3 bg-background border-2 border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors resize-none"
        />
      </div>
    </div>
  );
}
