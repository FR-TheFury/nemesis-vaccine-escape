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
    <div className="fixed top-4 left-4 z-50 bg-background/95 backdrop-blur-md border-2 border-primary rounded-lg p-4 min-w-[200px]">
      <div className="flex items-center gap-2 mb-3">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="font-bold">Joueurs</h3>
        <Badge variant="secondary" className="ml-auto">
          {connectedCount}/{players.length}
        </Badge>
      </div>

      <div className="mb-3 text-xs text-muted-foreground">
        Session: <span className="font-mono font-bold text-primary">{sessionCode}</span>
      </div>

      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
              player.is_connected 
                ? "bg-accent/50 text-foreground" 
                : "bg-muted/30 text-muted-foreground opacity-50"
            )}
          >
            {player.is_host && (
              <Crown className="h-4 w-4 text-yellow-500" />
            )}
            <span className="text-sm font-medium flex-1">{player.pseudo}</span>
            <div className={cn(
              "h-2 w-2 rounded-full",
              player.is_connected ? "bg-green-500" : "bg-gray-500"
            )} />
          </div>
        ))}
      </div>
    </div>
  );
};
