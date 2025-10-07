import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Clock, Lightbulb, Users } from 'lucide-react';

interface GameEndProps {
  session: any;
  players: any[];
}

export const GameEnd = ({ session, players }: GameEndProps) => {
  const navigate = useNavigate();
  const success = session.status === 'completed';
  const totalPuzzles = Object.keys(session.solved_puzzles || {}).length;
  const timeUsed = 3600 - (session.timer_remaining || 0);
  const minutes = Math.floor(timeUsed / 60);
  const seconds = timeUsed % 60;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">
      <Card className="max-w-2xl w-full p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="flex justify-center">
            <Trophy className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 text-primary" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            {success ? 'Mission Réussie !' : 'Mission Échouée'}
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-2">
            {success 
              ? 'Vous avez sauvé l\'humanité du virus Protocol Z !'
              : 'Le temps est écoulé. Le virus s\'est propagé...'}
          </p>
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-2">
          <Card className="p-3 sm:p-4 bg-accent/50">
            <div className="flex items-center gap-2 sm:gap-3">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Temps écoulé</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold">{minutes}:{seconds.toString().padStart(2, '0')}</p>
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4 bg-accent/50">
            <div className="flex items-center gap-2 sm:gap-3">
              <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Énigmes résolues</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold">{totalPuzzles}</p>
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4 bg-accent/50">
            <div className="flex items-center gap-2 sm:gap-3">
              <Lightbulb className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Indices utilisés</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold">{session.hints_used}</p>
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4 bg-accent/50">
            <div className="flex items-center gap-2 sm:gap-3">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Joueurs</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold">{players.length}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <h3 className="font-bold text-base sm:text-lg">Équipe</h3>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {players.map((player) => (
              <Badge key={player.id} variant="secondary" className="text-xs sm:text-sm">
                {player.pseudo}
                {player.is_host && ' 👑'}
              </Badge>
            ))}
          </div>
        </div>

        <Button 
          onClick={() => navigate('/')} 
          size="lg" 
          className="w-full text-sm sm:text-base"
        >
          Retour à l'accueil
        </Button>
      </Card>
    </div>
  );
};
