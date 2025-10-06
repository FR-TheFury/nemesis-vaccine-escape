import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameSession } from '@/hooks/useGameSession';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { useTimer } from '@/hooks/useTimer';
import { useInventory } from '@/hooks/useInventory';
import { HUD } from '@/components/game/HUD';
import { Zone1 } from './zones/Zone1';
import { Zone2 } from './zones/Zone2';
import { Zone3 } from './zones/Zone3';
import { GameEnd } from './zones/GameEnd';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogFooter,
  AlertDialogAction 
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import enigmesData from '@/data/enigmes.json';

const Game = () => {
  const { sessionCode } = useParams<{ sessionCode: string }>();
  const navigate = useNavigate();
  const { session, players, currentPlayer, loading, error, setSession, setPlayers } = useGameSession(sessionCode || null);
  const [showTimeUpDialog, setShowTimeUpDialog] = useState(false);
  
  useRealtimeSync(
    sessionCode || null,
    {
      onSessionUpdate: (updatedSession) => {
        setSession(updatedSession as any);
      },
      onPlayerJoin: (player) => {
        setPlayers((prev: any) => [...prev, player as any]);
      },
      onPlayerUpdate: (player) => {
        setPlayers((prev: any) => prev.map((p: any) => p.id === player.id ? player : p));
      },
      onPlayerLeave: (player) => {
        setPlayers((prev: any) => prev.map((p: any) => p.id === player.id ? player : p));
      },
    }
  );

  const { timeRemaining, isRunning, formatTime, toggleTimer, syncTime } = useTimer(
    sessionCode || null,
    session?.timer_remaining || 3600,
    currentPlayer?.is_host || false,
    () => {
      setShowTimeUpDialog(true);
    }
  );

  const inventory = (session?.inventory as any[]) || [];
  const { addItem, removeItem, hasItem } = useInventory(sessionCode || null, inventory);

  useEffect(() => {
    if (!sessionCode) {
      navigate('/');
    }
  }, [sessionCode, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      navigate('/');
    }
  }, [error, navigate]);

  useEffect(() => {
    if (session) {
      syncTime(session.timer_remaining, session.timer_running);
    }
  }, [session?.timer_remaining, session?.timer_running]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold animate-pulse">NEMESIS</h1>
          <p className="text-xl text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session || !currentPlayer) {
    return null;
  }

  const isHost = currentPlayer.is_host;
  const canStartGame = isHost && session.status === 'waiting';
  const currentZone = session.current_zone;

  const handleStartGame = async () => {
    if (!sessionCode) return;
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase
        .from('sessions')
        .update({ status: 'active', timer_running: true })
        .eq('code', sessionCode);
      
      toast.success('Partie lancée !');
    } catch (err) {
      console.error('Error starting game:', err);
      toast.error('Erreur au démarrage');
    }
  };

  if (session.status === 'waiting') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <HUD
          sessionCode={sessionCode || ''}
          currentPlayerPseudo={currentPlayer.pseudo}
          isHost={isHost}
          players={players}
          inventory={inventory}
          timeRemaining={timeRemaining}
          isTimerRunning={isRunning}
          formatTime={formatTime}
          onToggleTimer={toggleTimer}
          hintsUsed={session.hints_used}
          maxHints={enigmesData.hints.maxHints}
          currentPuzzleId={null}
          puzzleHints={[]}
          currentZone={currentZone}
          solvedPuzzles={session.solved_puzzles as any}
        />
        
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold text-primary mb-2">NEMESIS</h1>
          <p className="text-xl text-muted-foreground">Salle d'attente</p>
          <p className="text-sm text-muted-foreground">
            {players.filter(p => p.is_connected).length} joueur(s) connecté(s)
          </p>
          
          {canStartGame && (
            <Button onClick={handleStartGame} size="lg" className="mt-6">
              Démarrer la partie
            </Button>
          )}
          
          {!isHost && (
            <p className="text-sm text-muted-foreground">
              En attente que l'hôte lance la partie...
            </p>
          )}
        </div>
      </div>
    );
  }

  const renderZone = () => {
    switch (currentZone) {
      case 1:
        return <Zone1 sessionCode={sessionCode || ''} session={session} />;
      case 2:
        return <Zone2 sessionCode={sessionCode || ''} session={session} />;
      case 3:
        return <Zone3 sessionCode={sessionCode || ''} session={session} />;
      default:
        return <GameEnd session={session} players={players} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <HUD
        sessionCode={sessionCode || ''}
        currentPlayerPseudo={currentPlayer.pseudo}
        isHost={isHost}
        players={players}
        inventory={inventory}
        timeRemaining={timeRemaining}
        isTimerRunning={isRunning}
        formatTime={formatTime}
        onToggleTimer={toggleTimer}
        hintsUsed={session.hints_used}
        maxHints={enigmesData.hints.maxHints}
        currentPuzzleId={null}
        puzzleHints={[]}
        currentZone={currentZone}
        solvedPuzzles={session.solved_puzzles as any}
      />
      
      {renderZone()}

      <AlertDialog open={showTimeUpDialog} onOpenChange={setShowTimeUpDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive text-2xl">⏰ Temps écoulé !</AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              Le virus s'est propagé... Mission échouée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => navigate('/')}>
              Retour à l'accueil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Game;
