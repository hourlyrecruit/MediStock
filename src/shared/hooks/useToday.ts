import { useEffect, useState } from 'react';
import { addDays, startOfDay } from 'date-fns';

export function useToday() {
  const [today, setToday] = useState(() => startOfDay(new Date()));

  useEffect(() => {
    const msUntilMidnight = addDays(today, 1).getTime() - Date.now();
    const timer = window.setTimeout(() => setToday(startOfDay(new Date())), msUntilMidnight + 50);
    return () => window.clearTimeout(timer);
  }, [today]);

  return today;
}
