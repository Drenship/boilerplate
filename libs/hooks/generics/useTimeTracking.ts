import { useState, useEffect } from 'react';

export function useTimeTracking(chapterId: string) {
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const currentTime = Math.floor((Date.now() - startTime) / 60000); // Convert to minutes
      setTimeSpent(currentTime);
      localStorage.setItem(`chapter-${chapterId}-time`, currentTime.toString());
    }, 60000); // Update every minute

    return () => {
      clearInterval(interval);
      const finalTime = Math.floor((Date.now() - startTime) / 60000);
      localStorage.setItem(`chapter-${chapterId}-time`, finalTime.toString());
    };
  }, [chapterId]);

  return timeSpent;
}