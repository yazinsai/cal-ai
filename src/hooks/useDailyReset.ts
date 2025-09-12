import { useEffect, useCallback } from 'react';
import { checkAndResetDaily } from '@/lib/storage';

export function useDailyReset(onReset?: () => void) {
  const checkForReset = useCallback(() => {
    checkAndResetDaily();
    if (onReset) {
      onReset();
    }
  }, [onReset]);

  useEffect(() => {
    checkForReset();
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timeoutId = setTimeout(() => {
      checkForReset();
      
      const intervalId = setInterval(checkForReset, 24 * 60 * 60 * 1000);
      
      return () => clearInterval(intervalId);
    }, msUntilMidnight);
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkForReset();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkForReset]);
}