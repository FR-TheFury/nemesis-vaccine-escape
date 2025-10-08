import { useState } from 'react';
import { Timer } from './Timer';
import { Inventory } from './Inventory';
import { Chat } from './Chat';
import { PlayersList } from './PlayersList';
import { HintButton } from './HintButton';
import { HintsPanel } from './HintsPanel';
import { HostControls } from './HostControls';
import { FacilityMap } from './FacilityMap';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Package, Map, Users, FileText, Shield } from 'lucide-react';
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
  revealedHints?: Record<string, string[]>;
  doorCodes?: Record<string, string>;
  doorStatus?: Record<string, string>;
  onZoneChange?: (zone: number) => void;
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
  revealedHints = { zone1: [], zone2: [], zone3: [] },
  doorCodes = {},
  doorStatus = { zone1: 'locked', zone2: 'locked', zone3: 'locked' },
  onZoneChange,
}: HUDProps) => {
  const [showPlayers, setShowPlayers] = useState(true);
  const [showMap, setShowMap] = useState(true);
  const [showInventory, setShowInventory] = useState(true);
  const [showHintsDialog, setShowHintsDialog] = useState(false);
  const [showHostDialog, setShowHostDialog] = useState(false);

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
      <div className="fixed top-16 sm:top-20 left-2 sm:left-4 z-50 flex flex-col gap-1.5 sm:gap-2">
        <Button
          onClick={() => setShowPlayers(!showPlayers)}
          variant="outline"
          size="icon"
          className="h-8 w-8 sm:h-10 sm:w-10"
          title={showPlayers ? "Cacher les joueurs" : "Afficher les joueurs"}
        >
          <Users className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        <Button
          onClick={() => setShowMap(!showMap)}
          variant="outline"
          size="icon"
          className="h-8 w-8 sm:h-10 sm:w-10"
          title={showMap ? "Cacher le plan" : "Afficher le plan"}
        >
          <Map className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        <Button
          onClick={() => setShowInventory(!showInventory)}
          variant="outline"
          size="icon"
          className="h-8 w-8 sm:h-10 sm:w-10 relative"
          title={showInventory ? "Cacher l'inventaire" : "Afficher l'inventaire"}
        >
          <Package className="h-3 w-3 sm:h-4 sm:w-4" />
          {inventory.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
              {inventory.length}
            </span>
          )}
        </Button>
        
        {/* Bouton Indices révélés */}
        <Dialog open={showHintsDialog} onOpenChange={setShowHintsDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10 relative"
              title="Indices révélés"
            >
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              {revealedHints[`zone${currentZone}` as keyof typeof revealedHints]?.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {revealedHints[`zone${currentZone}` as keyof typeof revealedHints]?.length}
                </span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Indices Révélés</DialogTitle>
            </DialogHeader>
            <HintsPanel currentZone={currentZone} revealedHints={revealedHints} />
          </DialogContent>
        </Dialog>

        {/* Bouton Contrôles Game Master (host uniquement) */}
        {isHost && (
          <Dialog open={showHostDialog} onOpenChange={setShowHostDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10 border-orange-500/50"
                title="Contrôles Game Master"
              >
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Contrôles Game Master</DialogTitle>
              </DialogHeader>
              <HostControls
                sessionCode={sessionCode}
                currentZone={currentZone}
                doorCodes={doorCodes}
                doorStatus={doorStatus}
                isHost={isHost}
              />
            </DialogContent>
          </Dialog>
        )}
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
          doorStatus={doorStatus}
          onZoneChange={onZoneChange}
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
