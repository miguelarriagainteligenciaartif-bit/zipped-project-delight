import type { NYTime, ChecklistData, UserData, TradeHistoryItem } from './types';
import { STEPS, TRADING_CONFIG } from './checklist-config';

const KEYS = {
  USERS: 'edgecore_nasdaq_users',
  CURRENT_USER: 'edgecore_nasdaq_current_user',
  USER_DATA: 'edgecore_nasdaq_data_',
};

// ========== AUTH ==========

export function registerUser(username: string, password: string): { success: boolean; message: string } {
  const users = getAllUsers();

  if (users[username]) return { success: false, message: 'El usuario ya existe' };
  if (username.length < 3) return { success: false, message: 'El usuario debe tener al menos 3 caracteres' };
  if (password.length < 6) return { success: false, message: 'La contraseña debe tener al menos 6 caracteres' };

  users[username] = { username, password: btoa(password), createdAt: new Date().toISOString() };
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  initUserData(username);
  return { success: true, message: 'Usuario registrado exitosamente' };
}

export function loginUser(username: string, password: string): { success: boolean; message: string } {
  const users = getAllUsers();
  const user = users[username];
  if (!user) return { success: false, message: 'Usuario no encontrado' };
  if (user.password !== btoa(password)) return { success: false, message: 'Contraseña incorrecta' };
  localStorage.setItem(KEYS.CURRENT_USER, username);
  return { success: true, message: 'Inicio de sesión exitoso' };
}

export function logoutUser() {
  localStorage.removeItem(KEYS.CURRENT_USER);
}

export function getCurrentUser(): string | null {
  return localStorage.getItem(KEYS.CURRENT_USER);
}

function getAllUsers(): Record<string, { username: string; password: string; createdAt: string }> {
  const json = localStorage.getItem(KEYS.USERS);
  return json ? JSON.parse(json) : {};
}

function initUserData(username: string) {
  const userData: UserData = {
    trades: {},
    statistics: {
      totalDays: 0, daysWithEntry: 0, daysNoEntry: 0,
      totalWins: 0, totalLosses: 0, totalTrades: 0,
      winRate: 0, totalPoints: 0, avgPointsPerTrade: 0,
      checklistCompleteCount: 0, checklistCompletePercentage: 0,
    },
  };
  localStorage.setItem(KEYS.USER_DATA + username, JSON.stringify(userData));
}

// ========== USER DATA ==========

export function getUserData(): UserData | null {
  const username = getCurrentUser();
  if (!username) return null;
  const json = localStorage.getItem(KEYS.USER_DATA + username);
  return json ? JSON.parse(json) : null;
}

export function saveUserData(userData: UserData) {
  const username = getCurrentUser();
  if (!username) return;
  localStorage.setItem(KEYS.USER_DATA + username, JSON.stringify(userData));
}

// ========== CHECKLIST ==========

export function createEmptyChecklist(): ChecklistData {
  const checklist: Record<string, boolean[]> = {};
  STEPS.forEach(step => {
    checklist[step.id] = new Array(step.items).fill(false);
  });
  return {
    date: formatDateKey(getNYTime()),
    checklist,
    hadEntry: undefined,
    tradeData: null,
    noEntryReasons: [],
    notes: '',
  };
}

export function getTodayChecklist(): ChecklistData {
  const todayNY = getNYTime();
  const dateKey = formatDateKey(todayNY);
  const userData = getUserData();
  if (userData?.trades[dateKey]) return userData.trades[dateKey];
  return createEmptyChecklist();
}

export function saveTodayChecklist(data: ChecklistData) {
  const userData = getUserData();
  if (!userData) return;
  const todayNY = getNYTime();
  const dateKey = formatDateKey(todayNY);
  data.savedAt = new Date().toISOString();
  userData.trades[dateKey] = data;
  updateStatistics(userData);
  saveUserData(userData);
}

// ========== STATISTICS ==========

export function isChecklistComplete(checklist: Record<string, boolean[]>): boolean {
  for (const step of STEPS) {
    if (step.items === 0) continue;
    const stepData = checklist[step.id];
    if (!stepData) return false;
    const items = stepData.slice(0, step.items);
    if (!items.every(item => item === true)) return false;
  }
  return true;
}

export function getChecklistCompletion(checklist: Record<string, boolean[]>): number {
  let total = 0;
  let completed = 0;
  STEPS.forEach(step => {
    if (step.items === 0) return;
    const stepData = checklist[step.id];
    if (stepData && Array.isArray(stepData)) {
      total += step.items;
      completed += stepData.slice(0, step.items).filter(i => i === true).length;
    }
  });
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

export function updateStatistics(userData: UserData) {
  let totalDays = 0, daysWithEntry = 0, totalWins = 0, totalLosses = 0, totalPoints = 0, checklistCompleteCount = 0;

  Object.values(userData.trades).forEach(day => {
    if (day.checklist?.registro) delete day.checklist.registro;
    totalDays++;
    if (isChecklistComplete(day.checklist)) checklistCompleteCount++;
    if (day.hadEntry && day.tradeData) {
      daysWithEntry++;
      if (day.tradeData.result === 'win') { totalWins++; totalPoints += day.tradeData.points || 0; }
      else if (day.tradeData.result === 'loss') { totalLosses++; totalPoints += day.tradeData.points || 0; }
    }
  });

  const totalTrades = totalWins + totalLosses;
  userData.statistics = {
    totalDays, daysWithEntry, daysNoEntry: totalDays - daysWithEntry,
    totalWins, totalLosses, totalTrades,
    winRate: totalTrades > 0 ? Math.round((totalWins / totalTrades) * 100) : 0,
    totalPoints: Math.round(totalPoints * 100) / 100,
    avgPointsPerTrade: totalTrades > 0 ? Math.round((totalPoints / totalTrades) * 100) / 100 : 0,
    checklistCompleteCount,
    checklistCompletePercentage: totalDays > 0 ? Math.round((checklistCompleteCount / totalDays) * 100) : 0,
  };
}

// ========== HISTORY ==========

export function getTradeHistory(filterDays: string = 'all'): TradeHistoryItem[] {
  const userData = getUserData();
  if (!userData) return [];

  let trades: TradeHistoryItem[] = Object.entries(userData.trades).map(([date, data]) => ({ ...data, date }));
  trades.sort((a, b) => b.date.localeCompare(a.date));

  if (filterDays !== 'all') {
    const days = parseInt(filterDays);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    trades = trades.filter(t => new Date(t.date) >= cutoff);
  }
  return trades;
}

export function updateTradeResult(dateKey: string, result: 'win' | 'loss') {
  const userData = getUserData();
  if (!userData?.trades[dateKey]?.tradeData) return;
  userData.trades[dateKey].tradeData!.result = result;
  userData.trades[dateKey].tradeData!.points = 0;
  updateStatistics(userData);
  saveUserData(userData);
}

// ========== WEEKDAY STATS ==========

export function getWeekdayStatistics(): { labels: string[]; data: number[] } {
  const userData = getUserData();
  const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const stats = weekdays.map(() => ({ trades: 0, wins: 0 }));

  if (userData) {
    Object.entries(userData.trades).forEach(([dateStr, data]) => {
      if (!data.hadEntry || !data.tradeData) return;
      const weekday = new Date(dateStr).getDay();
      stats[weekday].trades++;
      if (data.tradeData.result === 'win') stats[weekday].wins++;
    });
  }

  return {
    labels: weekdays,
    data: stats.map(s => s.trades > 0 ? Math.round((s.wins / s.trades) * 100) : 0),
  };
}

export function getChecklistCorrelation(): { labels: string[]; data: number[] } {
  const userData = getUserData();
  const c100 = { trades: 0, wins: 0 };
  const cBelow = { trades: 0, wins: 0 };

  if (userData) {
    Object.values(userData.trades).forEach(data => {
      if (!data.hadEntry || !data.tradeData) return;
      const complete = isChecklistComplete(data.checklist);
      const bucket = complete ? c100 : cBelow;
      bucket.trades++;
      if (data.tradeData.result === 'win') bucket.wins++;
    });
  }

  return {
    labels: ['Checklist 100%', 'Checklist <100%'],
    data: [
      c100.trades > 0 ? Math.round((c100.wins / c100.trades) * 100) : 0,
      cBelow.trades > 0 ? Math.round((cBelow.wins / cBelow.trades) * 100) : 0,
    ],
  };
}

// ========== TIME UTILITIES ==========

export function getNYTime(): NYTime {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TRADING_CONFIG.TIMEZONE,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const v: Record<string, string> = {};
  parts.forEach(p => { if (p.type !== 'literal') v[p.type] = p.value; });

  return {
    year: parseInt(v.year), month: parseInt(v.month), day: parseInt(v.day),
    hour: parseInt(v.hour), minute: parseInt(v.minute), second: parseInt(v.second),
    dateString: `${v.year}-${v.month}-${v.day}`,
    timeString: `${v.hour}:${v.minute}`,
  };
}

export function isWithinTradingWindow(): boolean {
  const ny = getNYTime();
  const current = ny.hour * 60 + ny.minute;
  const [sH, sM] = TRADING_CONFIG.WINDOW_START.split(':').map(Number);
  const [eH, eM] = TRADING_CONFIG.WINDOW_END.split(':').map(Number);
  return current >= sH * 60 + sM && current <= eH * 60 + eM;
}

export function formatDateKey(date: NYTime | string): string {
  if (typeof date === 'string') return date;
  return date.dateString;
}

export function formatDateDisplay(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return d.toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  });
}

// Init storage
if (!localStorage.getItem(KEYS.USERS)) {
  localStorage.setItem(KEYS.USERS, JSON.stringify({}));
}
