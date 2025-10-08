import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameSession } from '@/hooks/useGameSession';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { usePlayerPresence } from '@/hooks/usePlayerPresence';
import { useTimer } from '@/hooks/useTimer';
import { useInventory } from '@/hooks/useInventory';
import { useRewardQueue } from '@/hooks/useRewardQueue';
import { HUD } from '@/components/game/HUD';
import { RewardModal } from '@/components/game/RewardModal';
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
import { supabase } from '@/integrations/supabase/client';
import enigmesData from '@/data/enigmes.json';

const Game = () => {
  const { sessionCode } = useParams<{ sessionCode: string }>();
  const navigate = useNavigate();
  const { session, players, currentPlayer, loading, error, setSession, setPlayers } = useGameSession(sessionCode || null);
  const [showTimeUpDialog, setShowTimeUpDialog] = useState(false);
  const { currentReward, showNext } = useRewardQueue();
  
  // Gérer la présence du joueur
  usePlayerPresence({
    sessionCode: sessionCode || '',
    playerId: currentPlayer?.id || ''
  });
  
  // Écouter la suppression de la session
  useEffect(() => {
    if (!sessionCode) return;

    const channel = supabase
      .channel('session-deletion')
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'sessions',
          filter: `code=eq.${sessionCode}`
        },
        () => {
          toast.error('La session a été fermée par le Game Master');
          navigate('/');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionCode, navigate]);

  useRealtimeSync(
    sessionCode || null,
    {
      onSessionUpdate: (updatedSession) => {
        setSession(updatedSession as any);
        
        // Détecter la fin de partie pour tous les joueurs
        if (updatedSession.status === 'failed' || updatedSession.status === 'completed') {
          setShowTimeUpDialog(true);
        }
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
          <h1 className="mb-4 text-4xl font-bold animate-pulse">Protocol Z</h1>
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

  const handleZoneChange = async (newZone: number) => {
    if (!sessionCode || !session) return;
    
    const doorStatus = (session.door_status || { zone1: 'locked', zone2: 'locked', zone3: 'locked' }) as Record<string, string>;
    
    // Vérifier que la zone est accessible
    let canAccess = false;
    if (newZone === 1) {
      canAccess = true; // Zone 1 toujours accessible
    } else if (newZone === 2) {
      canAccess = doorStatus.zone1 === 'unlocked';
    } else if (newZone === 3) {
      canAccess = doorStatus.zone2 === 'unlocked';
    }
    
    if (!canAccess) {
      toast.error('Cette zone n\'est pas encore déverrouillée');
      return;
    }
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase
        .from('sessions')
        .update({ current_zone: newZone })
        .eq('code', sessionCode);
      
      toast.success(`Navigation vers Zone ${newZone}`);
    } catch (err) {
      console.error('Error changing zone:', err);
      toast.error('Erreur lors du changement de zone');
    }
  };

  if (session.status === 'waiting') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
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
          onZoneChange={handleZoneChange}
        />
        
        <div className="text-center space-y-4 sm:space-y-6 max-w-md mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2">Protocol Z</h1>
          <p className="text-lg sm:text-xl text-muted-foreground">Salle d'attente</p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {players.filter(p => p.is_connected).length} joueur(s) connecté(s)
          </p>
          
          {canStartGame && (
            <Button onClick={handleStartGame} size="lg" className="mt-4 sm:mt-6 w-full sm:w-auto">
              Démarrer la partie
            </Button>
          )}
          
          {!isHost && (
            <p className="text-xs sm:text-sm text-muted-foreground">
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
        revealedHints={session.revealed_hints as Record<string, string[]>}
        doorCodes={session.door_codes as Record<string, string>}
        doorStatus={session.door_status as Record<string, string>}
        onZoneChange={handleZoneChange}
      />
      
      {renderZone()}

      <RewardModal
        isOpen={currentReward !== null}
        onClose={showNext}
        type={currentReward?.type || 'hint'}
        title={currentReward?.title || ''}
        description={currentReward?.description || ''}
        icon={currentReward?.icon}
      />

      <AlertDialog open={showTimeUpDialog} onOpenChange={setShowTimeUpDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={session.status === 'failed' ? 'text-destructive text-2xl' : 'text-primary text-2xl'}>
              {session.status === 'failed' ? '💀 GAME OVER' : '🎉 Mission accomplie !'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              {session.status === 'failed' 
                ? 'Le temps est écoulé. Le virus Z s\'est propagé dans le monde entier... L\'humanité est perdue.' 
                : 'Félicitations ! Vous avez sauvé l\'humanité !'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={async () => {
              // Nettoyer la session avant de retourner à l'accueil
              if (sessionCode) {
                try {
                  await supabase.rpc('cleanup_session', { session_code_param: sessionCode });
                  console.log('Session cleaned up successfully');
                } catch (error) {
                  console.error('Error cleaning up session:', error);
                }
              }
              navigate('/');
            }}>
              Retour à l'accueil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Game;
