export interface StepConfig {
  id: string;
  name: string;
  items: number;
}

export interface NYTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  dateString: string;
  timeString: string;
}

export type EntryModel = 'M1' | 'M3' | 'Continuación';

export interface SingleTradeData {
  model: EntryModel;
  fvgCount: 1 | 2 | 3;
  notes: string;
  result: 'win' | 'loss' | null;
  points: number | null;
}

/** @deprecated Keep for backward compat with old saved data */
export interface LegacyTradeData {
  fvgCount: number;
  notes: string;
  result: 'win' | 'loss' | null;
  points: number | null;
}

export interface TradeData {
  tradeCount: 1 | 2 | 3;
  trades: SingleTradeData[];
  notes: string;
}

export interface ChecklistData {
  date: string;
  checklist: Record<string, boolean[]>;
  hadEntry: boolean | undefined;
  tradeData: TradeData | LegacyTradeData | null;
  noEntryReasons: string[];
  notes: string;
  savedAt?: string;
}

export function isNewTradeData(data: TradeData | LegacyTradeData | null): data is TradeData {
  return data !== null && 'trades' in data && Array.isArray((data as TradeData).trades);
}

export function isLegacyTradeData(data: TradeData | LegacyTradeData | null): data is LegacyTradeData {
  return data !== null && !('trades' in data) && 'fvgCount' in data;
}

export interface Statistics {
  totalDays: number;
  daysWithEntry: number;
  daysNoEntry: number;
  totalWins: number;
  totalLosses: number;
  totalTrades: number;
  winRate: number;
  totalPoints: number;
  avgPointsPerTrade: number;
  checklistCompleteCount: number;
  checklistCompletePercentage: number;
}

export interface UserData {
  trades: Record<string, ChecklistData>;
  statistics: Statistics;
}

export interface TradeHistoryItem extends ChecklistData {
  date: string;
}

export type ViewType = 'checklist' | 'history' | 'statistics';
