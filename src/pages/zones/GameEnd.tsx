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
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <Card className="max-w-2xl w-full p-8 space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Trophy className="h-24 w-24 text-primary" />
          </div>
          
          <h1 className="text-5xl font-bold">
            {success ? 'Mission Réussie !' : 'Mission Échouée'}
          </h1>
          
          <p className="text-xl text-muted-foreground">
            {success 
              ? 'Vous avez sauvé l\'humanité du virus NEMESIS !'
              : 'Le temps est écoulé. Le virus s\'est propagé...'}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4 bg-accent/50">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Temps écoulé</p>
                <p className="text-2xl font-bold">{minutes}:{seconds.toString().padStart(2, '0')}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-accent/50">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Énigmes résolues</p>
                <p className="text-2xl font-bold">{totalPuzzles}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-accent/50">
            <div className="flex items-center gap-3">
              <Lightbulb className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Indices utilisés</p>
                <p className="text-2xl font-bold">{session.hints_used}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-accent/50">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Joueurs</p>
                <p className="text-2xl font-bold">{players.length}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-lg">Équipe</h3>
          <div className="flex flex-wrap gap-2">
            {players.map((player) => (
              <Badge key={player.id} variant="secondary">
                {player.pseudo}
                {player.is_host && ' 👑'}
              </Badge>
            ))}
          </div>
        </div>

        <Button 
          onClick={() => navigate('/')} 
          size="lg" 
          className="w-full"
        >
          Retour à l'accueil
        </Button>
      </Card>
    </div>
  );
};
