
import { useState, useEffect, useRef, useCallback } from 'react';

export const useTimer = (initialDuration: number, onComplete: () => void) => {
  const [duration, setDuration] = useState(initialDuration * 60); // Convert to seconds
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const timerRef = useRef<number | null>(null);
  
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);
  
  const start = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      setTimeRemaining(duration);
    }
  }, [isRunning, duration]);
  
  const stop = useCallback(() => {
    if (isRunning && timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
      setIsRunning(false);
    }
  }, [isRunning]);
  
  const reset = useCallback(() => {
    stop();
    setTimeRemaining(duration);
  }, [duration, stop]);
  
  const updateDuration = useCallback((minutes: number) => {
    const newDuration = minutes * 60;
    setDuration(newDuration);
    if (!isRunning) {
      setTimeRemaining(newDuration);
    }
  }, [isRunning]);
  
  const percentRemaining = useCallback(() => {
    return (timeRemaining / duration) * 100;
  }, [timeRemaining, duration]);
  
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            stop();
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [isRunning, onComplete, stop]);
  
  return {
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    percentRemaining: percentRemaining(),
    isRunning,
    start,
    stop,
    reset,
    updateDuration
  };
};
