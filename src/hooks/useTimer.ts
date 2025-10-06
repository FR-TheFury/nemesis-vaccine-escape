import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTimer = (
  sessionCode: string | null,
  initialTime: number,
  isHost: boolean,
  onTimeEnd?: () => void
) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);

  // Démarrer/Pause le timer (hôte uniquement)
  const toggleTimer = useCallback(async () => {
    if (!isHost || !sessionCode) return;

    try {
      const newRunningState = !isRunning;
      
      await supabase
        .from('sessions')
        .update({ 
          timer_running: newRunningState,
          timer_remaining: timeRemaining
        })
        .eq('code', sessionCode);

      setIsRunning(newRunningState);
    } catch (err) {
      console.error('Error toggling timer:', err);
    }
  }, [isHost, sessionCode, isRunning, timeRemaining]);

  // Formater le temps en MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Timer local (hôte uniquement décrémente)
  useEffect(() => {
    if (!isRunning || !isHost) return;

    const interval = setInterval(async () => {
      setTimeRemaining((prev) => {
        const newTime = Math.max(0, prev - 1);
        
        // Sauvegarder dans Supabase toutes les 5 secondes
        if (newTime % 5 === 0 && sessionCode) {
          supabase
            .from('sessions')
            .update({ timer_remaining: newTime })
            .eq('code', sessionCode)
            .then();
        }

        // Déclencher la fin du jeu
        if (newTime === 0 && onTimeEnd) {
          onTimeEnd();
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isHost, sessionCode, onTimeEnd]);

  // Synchroniser avec les mises à jour Realtime (non-hôte)
  const syncTime = useCallback((newTime: number, running: boolean) => {
    setTimeRemaining(newTime);
    setIsRunning(running);
  }, []);

  return {
    timeRemaining,
    isRunning,
    toggleTimer,
    formatTime,
    syncTime,
  };
};
