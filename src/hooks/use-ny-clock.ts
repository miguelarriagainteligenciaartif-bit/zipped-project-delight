import { useState, useEffect } from 'react';
import { getNYTime, isWithinTradingWindow } from '@/lib/storage';
import type { NYTime } from '@/lib/types';

export function useNYClock() {
  const [nyTime, setNyTime] = useState<NYTime>(getNYTime());
  const [isWindowOpen, setIsWindowOpen] = useState(isWithinTradingWindow());

  useEffect(() => {
    const interval = setInterval(() => {
      setNyTime(getNYTime());
      setIsWindowOpen(isWithinTradingWindow());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return { nyTime, isWindowOpen };
}
