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
import { FinalCinematic } from './zones/FinalCinematic';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import enigmesData from '@/data/enigmes.json';
import zone1Bg from '@/assets/zone1-bg.png';
import zone2Bg from '@/assets/zone2-bg.png';
import zone3Bg from '@/assets/zone3-bg.png';
import zone1Audio from '@/assets/Zone-1-audio.mp3';

const Game = () => {
  const { sessionCode } = useParams<{ sessionCode: string }>();
  const navigate = useNavigate();
  const { session, players, currentPlayer, loading, error, setSession, setPlayers } = useGameSession(sessionCode || null);
  const [showFinalCinematic, setShowFinalCinematic] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);
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
    async () => {
      // Timer expiré - marquer comme failed
      if (sessionCode) {
        await supabase
          .from('sessions')
          .update({ status: 'failed' })
          .eq('code', sessionCode);
      }
    }
  );

  const inventory = (session?.inventory as any[]) || [];
  const { addItem, removeItem, hasItem } = useInventory(
    sessionCode || null, 
    inventory, 
    currentPlayer?.pseudo || ''
  );

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

  const preloadAssets = async () => {
    const assets = [
      { src: zone1Bg, type: 'image' },
      { src: zone2Bg, type: 'image' },
      { src: zone3Bg, type: 'image' },
      { src: zone1Audio, type: 'audio' }
    ];

    const loadPromises = assets.map((asset, index) => {
      return new Promise((resolve, reject) => {
        if (asset.type === 'audio') {
          const audio = new Audio(asset.src);
          audio.addEventListener('canplaythrough', () => {
            setPreloadProgress(((index + 1) / assets.length) * 100);
            resolve(asset.src);
          });
          audio.addEventListener('error', reject);
          audio.load();
        } else {
          const img = new Image();
          img.onload = () => {
            setPreloadProgress(((index + 1) / assets.length) * 100);
            resolve(asset.src);
          };
          img.onerror = reject;
          img.src = asset.src;
        }
      });
    });

    try {
      await Promise.all(loadPromises);
    } catch (error) {
      console.error('Error preloading assets:', error);
    }
  };

  const handleStartGame = async () => {
    if (!sessionCode) return;
    
    try {
      // 1. Indiquer que le préchargement commence pour tous les joueurs
      await supabase
        .from('sessions')
        .update({ is_preloading: true })
        .eq('code', sessionCode);
      
      // 2. Précharger tous les assets
      setIsPreloading(true);
      setPreloadProgress(0);
      await preloadAssets();
      
      // 3. Démarrer la partie et arrêter le préchargement
      await supabase
        .from('sessions')
        .update({ 
          status: 'active', 
          timer_running: true,
          is_preloading: false 
        })
        .eq('code', sessionCode);
      
      // 4. Mise à jour optimiste locale
      setSession(prev => prev ? { 
        ...prev, 
        status: 'active', 
        timer_running: true,
        is_preloading: false 
      } : prev);
      
      setIsPreloading(false);
      toast.success('Partie lancée !');
    } catch (err) {
      console.error('Error starting game:', err);
      toast.error('Erreur au démarrage');
      
      // Remettre is_preloading à false en cas d'erreur
      await supabase
        .from('sessions')
        .update({ is_preloading: false })
        .eq('code', sessionCode);
      
      setIsPreloading(false);
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

  // Afficher l'overlay de chargement si preloading est actif
  const showLoadingOverlay = isPreloading || session.is_preloading;

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
        
        {showLoadingOverlay ? (
          // Overlay plein écran de préchargement
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
            <div className="text-center space-y-6 max-w-md mx-auto px-4">
              <h1 className="text-5xl md:text-6xl font-bold text-primary animate-pulse">
                Protocol Z
              </h1>
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xl text-muted-foreground">
                  Préparation de la partie...
                </p>
              </div>
              {isHost && (
                <div className="w-full space-y-2">
                  <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-primary h-full transition-all duration-300 ease-out"
                      style={{ width: `${preloadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">{Math.round(preloadProgress)}%</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Écran d'attente normal
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
        )}
      </div>
    );
  }

  const renderZone = () => {
    // Si le jeu est terminé (victoire ou défaite), afficher GameEnd
    if (session.status === 'completed' || session.status === 'failed') {
      return <GameEnd session={session} players={players} />;
    }

    // Si la cinématique finale est active
    if (showFinalCinematic) {
      return (
        <FinalCinematic
          onComplete={async () => {
            // À la fin de la cinématique, marquer la session comme completed
            if (sessionCode) {
              await supabase
                .from('sessions')
                .update({ status: 'completed' })
                .eq('code', sessionCode);
              
              setShowFinalCinematic(false);
            }
          }}
        />
      );
    }

    switch (currentZone) {
      case 1:
        return <Zone1 sessionCode={sessionCode || ''} session={session} playerPseudo={currentPlayer.pseudo} />;
      case 2:
        return <Zone2 sessionCode={sessionCode || ''} session={session} playerPseudo={currentPlayer.pseudo} />;
      case 3:
        return (
          <Zone3 
            sessionCode={sessionCode || ''} 
            session={session} 
            playerPseudo={currentPlayer.pseudo}
            onFinalDoorUnlock={() => setShowFinalCinematic(true)}
          />
        );
      default:
        return <Zone1 sessionCode={sessionCode || ''} session={session} playerPseudo={currentPlayer.pseudo} />;
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
    </div>
  );
};

export default Game;
