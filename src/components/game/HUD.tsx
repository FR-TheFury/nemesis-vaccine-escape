import { useState } from 'react';
import { Timer } from './Timer';
import { Inventory } from './Inventory';
import { Chat } from './Chat';
import { PlayersList } from './PlayersList';
import { HintButton } from './HintButton';
import { FacilityMap } from './FacilityMap';
import { Button } from '@/components/ui/button';
import { Package, Map, Users } from 'lucide-react';
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
  const [showPlayers, setShowPlayers] = useState(true);
  const [showMap, setShowMap] = useState(true);
  const [showInventory, setShowInventory] = useState(true);

  return (
    <>
      <Timer 
        timeRemaining={timeRemaining}
        isRunning={isTimerRunning}
        formatTime={formatTime}
        isHost={isHost}
        onToggle={onToggleTimer}
      />

      {/* Toggle buttons */}
      <div className="fixed top-20 left-4 z-50 flex flex-col gap-2">
        <Button
          onClick={() => setShowPlayers(!showPlayers)}
          variant="outline"
          size="icon"
          title={showPlayers ? "Cacher les joueurs" : "Afficher les joueurs"}
        >
          <Users className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => setShowMap(!showMap)}
          variant="outline"
          size="icon"
          title={showMap ? "Cacher le plan" : "Afficher le plan"}
        >
          <Map className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => setShowInventory(!showInventory)}
          variant="outline"
          size="icon"
          title={showInventory ? "Cacher l'inventaire" : "Afficher l'inventaire"}
        >
          <Package className="h-4 w-4" />
        </Button>
      </div>

      {showPlayers && (
        <PlayersList 
          players={players}
          sessionCode={sessionCode}
        />
      )}

      {showMap && (
        <FacilityMap 
          currentZone={currentZone}
          solvedPuzzles={solvedPuzzles}
        />
      )}

      {showInventory && <Inventory items={inventory} />}

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
    </>
  );
};
