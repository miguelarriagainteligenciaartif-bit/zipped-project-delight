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

export interface TradeData {
  fvgCount: number;
  notes: string;
  result: 'win' | 'loss' | null;
  points: number | null;
}

export interface ChecklistData {
  date: string;
  checklist: Record<string, boolean[]>;
  hadEntry: boolean | undefined;
  tradeData: TradeData | null;
  noEntryReasons: string[];
  notes: string;
  savedAt?: string;
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
