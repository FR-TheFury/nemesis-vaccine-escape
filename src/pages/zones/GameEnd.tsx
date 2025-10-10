import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Clock, Lightbulb, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GameEndProps {
  session: any;
  players: any[];
}

interface Player {
  id: string;
  pseudo: string;
  is_host: boolean;
  is_connected: boolean;
}

export const GameEnd = ({ session, players }: GameEndProps) => {
  const navigate = useNavigate();
  const success = session.status === 'completed';
  const totalPuzzles = Object.keys(session.solved_puzzles || {}).length;
  const timeUsed = 3600 - (session.timer_remaining || 0);
  const minutes = Math.floor(timeUsed / 60);
  const seconds = timeUsed % 60;

  // Animation du timer qui compte progressivement
  const [displayTime, setDisplayTime] = useState(0);
  const [displayPuzzles, setDisplayPuzzles] = useState(0);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    // Animation du timer
    let currentTime = 0;
    const timeInterval = setInterval(() => {
      if (currentTime < timeUsed) {
        currentTime += Math.ceil(timeUsed / 30);
        setDisplayTime(Math.min(currentTime, timeUsed));
      } else {
        clearInterval(timeInterval);
      }
    }, 50);

    // Animation des puzzles
    let currentPuzzles = 0;
    const puzzleInterval = setInterval(() => {
      if (currentPuzzles < totalPuzzles) {
        currentPuzzles++;
        setDisplayPuzzles(currentPuzzles);
      } else {
        clearInterval(puzzleInterval);
      }
    }, 200);

    // Afficher le texte après un délai
    setTimeout(() => setShowText(true), 500);

    return () => {
      clearInterval(timeInterval);
      clearInterval(puzzleInterval);
    };
  }, [timeUsed, totalPuzzles]);

  const displayMinutes = Math.floor(displayTime / 60);
  const displaySeconds = displayTime % 60;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background via-primary/5 to-background p-4 sm:p-8">
      <Card className="max-w-2xl w-full p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 animate-scale-in">
        {/* Texte narratif immersif */}
        {showText && success && (
          <div className="space-y-4 text-center mb-6 animate-fade-in">
            <p className="text-base sm:text-lg text-muted-foreground" style={{ animationDelay: '200ms' }}>
              🦠 Le <strong className="text-primary">Virus Protocol Z</strong> a été confiné avec succès.
            </p>
            <p className="text-base sm:text-lg text-muted-foreground animate-fade-in" style={{ animationDelay: '600ms' }}>
              💉 Grâce à votre équipe, le <strong className="text-green-500">vaccin</strong> a été synthétisé à temps.
            </p>
            <p className="text-base sm:text-lg text-muted-foreground animate-fade-in" style={{ animationDelay: '1000ms' }}>
              🌍 L'humanité est <strong className="text-primary">sauvée</strong>. Le Dr Morel serait fier de vous.
            </p>
          </div>
        )}

        <div className="text-center space-y-3 sm:space-y-4">
          <div className="flex justify-center animate-float">
            <Trophy className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 text-primary" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold animate-scale-in">
            {success ? '🏆 Mission Réussie !' : '💀 Mission Échouée'}
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-2 animate-fade-in" style={{ animationDelay: '300ms' }}>
            {success 
              ? 'Vous avez sauvé l\'humanité du virus Protocol Z !'
              : 'Le temps est écoulé. Le virus s\'est propagé...'}
          </p>
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-2">
          <Card className="p-3 sm:p-4 bg-accent/50 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-2 sm:gap-3">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Temps écoulé</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold">
                  {displayMinutes}:{displaySeconds.toString().padStart(2, '0')}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4 bg-accent/50 animate-fade-in" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center gap-2 sm:gap-3">
              <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Énigmes résolues</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold">{displayPuzzles}</p>
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4 bg-accent/50 animate-fade-in" style={{ animationDelay: '600ms' }}>
            <div className="flex items-center gap-2 sm:gap-3">
              <Lightbulb className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Indices utilisés</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold">{session.hints_used}</p>
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4 bg-accent/50 animate-fade-in" style={{ animationDelay: '700ms' }}>
            <div className="flex items-center gap-2 sm:gap-3">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Joueurs</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold">{players.length}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-2 sm:space-y-3 animate-fade-in" style={{ animationDelay: '800ms' }}>
          <h3 className="font-bold text-base sm:text-lg">Équipe</h3>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {players.map((player: Player, index) => (
              <Badge 
                key={player.id} 
                variant="secondary" 
                className="text-xs sm:text-sm animate-fade-in"
                style={{ animationDelay: `${900 + index * 100}ms` }}
              >
                {player.pseudo}
                {player.is_host && ' 👑'}
              </Badge>
            ))}
          </div>
        </div>

        {/* Section Merci d'avoir joué */}
        <Card className="p-4 sm:p-6 bg-primary/5 border-primary/20 animate-fade-in" style={{ animationDelay: '900ms' }}>
          <div className="text-center space-y-3">
            <h3 className="text-xl sm:text-2xl font-bold text-primary">
              Merci d'avoir joué ! 🎮
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              {success 
                ? 'Votre équipe a fait preuve de courage, d\'intelligence et de collaboration. Le Dr Morel aurait été fier de vous voir sauver l\'humanité du virus Protocol Z.'
                : 'Même si le temps vous a manqué, votre courage et votre détermination resteront dans les mémoires. Peut-être aurez-vous une autre chance de sauver l\'humanité...'}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground italic">
              Cette aventure a été créée avec passion. Nous espérons que vous avez passé un excellent moment ! 💚
            </p>
          </div>
        </Card>

        <Button 
          onClick={async () => {
            const sessionCode = session.code;
            try {
              await supabase.rpc('cleanup_session', { session_code_param: sessionCode });
              toast.success('Session terminée avec succès');
              navigate('/');
            } catch (error) {
              console.error('Error cleaning up session:', error);
              toast.error('Erreur lors de la fermeture de la session');
              navigate('/');
            }
          }} 
          size="lg" 
          className="w-full text-sm sm:text-base animate-fade-in"
          style={{ animationDelay: '1000ms' }}
        >
          Quitter et supprimer la session
        </Button>
      </Card>
    </div>
  );
};
