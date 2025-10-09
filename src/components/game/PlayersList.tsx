import { Users, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Player {
  id: string;
  pseudo: string;
  is_host: boolean;
  is_connected: boolean;
}

interface PlayersListProps {
  players: Player[];
  sessionCode: string;
}

export const PlayersList = ({ players, sessionCode }: PlayersListProps) => {
  const connectedCount = players.filter(p => p.is_connected).length;

  return (
    <div className="fixed bottom-2 left-2 sm:bottom-4 sm:left-4 z-[60] bg-background/95 backdrop-blur-md border-2 border-primary rounded-lg p-2 sm:p-4 min-w-[160px] sm:min-w-[200px] max-w-[90vw] sm:max-w-none">
      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        <h3 className="font-bold text-sm sm:text-base">Joueurs</h3>
        <Badge variant="secondary" className="ml-auto text-xs">
          {connectedCount}/{players.length}
        </Badge>
      </div>

      <div className="mb-2 sm:mb-3 text-[10px] sm:text-xs text-muted-foreground">
        Session: <span className="font-mono font-bold text-primary">{sessionCode}</span>
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-md transition-colors",
              player.is_connected 
                ? "bg-accent/50 text-foreground" 
                : "bg-muted/30 text-muted-foreground opacity-50"
            )}
          >
            {player.is_host && (
              <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
            )}
            <span className="text-xs sm:text-sm font-medium flex-1 truncate">{player.pseudo}</span>
            <div className={cn(
              "h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full flex-shrink-0",
              player.is_connected ? "bg-green-500" : "bg-gray-500"
            )} />
          </div>
        ))}
      </div>
    </div>
  );
};
