import { Clock, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface TimerProps {
  timeRemaining: number;
  isRunning: boolean;
  formatTime: (seconds: number) => string;
  isHost?: boolean;
  onToggle?: () => void;
}

export const Timer = ({ timeRemaining, isRunning, formatTime, isHost, onToggle }: TimerProps) => {
  const isWarning = timeRemaining <= 300; // 5 minutes
  const isCritical = timeRemaining <= 60; // 1 minute

  return (
    <div className={cn(
      "fixed top-2 right-2 sm:top-4 sm:right-4 z-50 px-3 py-2 sm:px-6 sm:py-3 rounded-lg backdrop-blur-md border-2 transition-all",
      isCritical ? "bg-destructive/20 border-destructive animate-pulse" :
      isWarning ? "bg-orange-500/20 border-orange-500" :
      "bg-primary/20 border-primary"
    )}>
      <div className="flex items-center gap-2 sm:gap-3">
        <Clock className={cn(
          "h-4 w-4 sm:h-6 sm:w-6",
          isCritical ? "text-destructive" :
          isWarning ? "text-orange-500" :
          "text-primary"
        )} />
        <div className="flex-1">
          <div className={cn(
            "text-lg sm:text-2xl font-bold font-mono",
            isCritical ? "text-destructive" :
            isWarning ? "text-orange-500" :
            "text-primary"
          )}>
            {formatTime(timeRemaining)}
          </div>
          <div className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
            {isRunning ? "En cours" : "En pause"}
          </div>
        </div>
        {isHost && onToggle && (
          <Button
            onClick={onToggle}
            size="sm"
            variant={isRunning ? "destructive" : "default"}
            className="ml-2"
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
  );
};
