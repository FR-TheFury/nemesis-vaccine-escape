import { Timer } from './Timer';
import { Inventory } from './Inventory';
import { Chat } from './Chat';
import { PlayersList } from './PlayersList';
import { HintButton } from './HintButton';
import { FacilityMap } from './FacilityMap';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import type { InventoryItem } from '@/lib/gameLogic';

interface Player {
  id: string;
  pseudo: string;
  is_host: boolean;
  is_connected: boolean;
}

interface HUDProps {
  sessionCode: string;
  currentPlayerPseudo: string;
  isHost: boolean;
  players: Player[];
  inventory: InventoryItem[];
  timeRemaining: number;
  isTimerRunning: boolean;
  formatTime: (seconds: number) => string;
  onToggleTimer: () => void;
  hintsUsed: number;
  maxHints: number;
  currentPuzzleId: string | null;
  puzzleHints: string[];
  currentZone?: number;
  solvedPuzzles?: Record<string, boolean>;
}

export const HUD = ({
  sessionCode,
  currentPlayerPseudo,
  isHost,
  players,
  inventory,
  timeRemaining,
  isTimerRunning,
  formatTime,
  onToggleTimer,
  hintsUsed,
  maxHints,
  currentPuzzleId,
  puzzleHints,
  currentZone = 1,
  solvedPuzzles = {},
}: HUDProps) => {
  return (
    <>
      <Timer 
        timeRemaining={timeRemaining}
        isRunning={isTimerRunning}
        formatTime={formatTime}
      />

      <PlayersList 
        players={players}
        sessionCode={sessionCode}
      />

      <FacilityMap 
        currentZone={currentZone}
        solvedPuzzles={solvedPuzzles}
      />

      <Inventory items={inventory} />

      <Chat 
        sessionCode={sessionCode}
        currentPlayerPseudo={currentPlayerPseudo}
      />

      <HintButton
        sessionCode={sessionCode}
        currentHints={hintsUsed}
        maxHints={maxHints}
        currentPuzzleId={currentPuzzleId}
        puzzleHints={puzzleHints}
      />

      {isHost && (
        <Button
          onClick={onToggleTimer}
          className="fixed top-20 right-4 z-50"
          variant="outline"
        >
          {isTimerRunning ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Démarrer
            </>
          )}
        </Button>
      )}
    </>
  );
};
