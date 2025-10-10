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

// Importez les assets et les composants nécessaires
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Crown, Users, Copy, Check } from 'lucide-react';
interface Enigma {
  id: number;
  title: string;
  description: string;
  hint1: string;
  hint2: string;
  solution: string;
  reward: {
    type: string;
    title: string;
    description: string;
    icon: string;
  };
}

interface Player {
  id: string;
  pseudo: string;
  is_host: boolean;
  volume: number;
}

const Game = () => {
  const { sessionCode } = useParams<{ sessionCode: string }>();
  const navigate = useNavigate();
  const { session, players, currentPlayer, loading, error, setSession, setPlayers } = useGameSession(sessionCode || null);
  const [showFinalCinematic, setShowFinalCinematic] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const { currentReward, showNext } = useRewardQueue();
  
  usePlayerPresence({
    sessionCode: sessionCode || '',
    playerId: currentPlayer?.id || ''
  });
  
  useEffect(() => {
    if (!sessionCode) return;

    const channel = supabase
      .channel('session-deletion')
      .on('postgres_changes', {
          event: 'DELETE',
          schema: 'public',
          table: 'sessions',
          filter: `code=eq.${sessionCode}`
        }, () => {
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
        setSession(updatedSession);
      },
      onPlayerJoin: (player) => {
        setPlayers((prev: any) => [...prev, player]);
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

  // Écouter la progression du préchargement
  useEffect(() => {
    if (!sessionCode || !session?.is_preloading) return;
    
    const progressChannel = supabase
      .channel(`progress-${sessionCode}`)
      .on('broadcast', { event: 'progress' }, ({ payload }) => {
        setPreloadProgress(payload.progress);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(progressChannel);
    };
  }, [sessionCode, session?.is_preloading]);

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

  if (!session) {
    return null;
  }

  // Debug logs
  console.log('[Game] Session status:', session.status);
  console.log('[Game] Players count:', players.length);
  console.log('[Game] Current player:', currentPlayer ? 'found' : 'null');

  const isHost = !!currentPlayer?.is_host;
  const canStart = isHost && session.status === 'waiting';
  const currentZone = session.current_zone;

  const preloadAssets = async () => {
    const assets = [
      { src: zone1Bg, type: 'image' },
      { src: zone2Bg, type: 'image' },
      { src: zone3Bg, type: 'image' },
      { src: zone1Audio, type: 'audio' },
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
      // Créer un canal pour broadcaster la progression
      const progressChannel = supabase.channel(`progress-${sessionCode}`);
      await progressChannel.subscribe();
      
      await supabase
        .from('sessions')
        .update({ is_preloading: true })
        .eq('code', sessionCode);
      
      setIsPreloading(true);
      setPreloadProgress(0);
      
      // Charger les assets et broadcaster la progression
      const assets = [
        { src: zone1Bg, type: 'image' },
        { src: zone2Bg, type: 'image' },
        { src: zone3Bg, type: 'image' },
        { src: zone1Audio, type: 'audio' },
      ];
      
      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        
        // Charger l'asset
        await new Promise((resolve, reject) => {
          if (asset.type === 'audio') {
            const audio = new Audio(asset.src);
            audio.addEventListener('canplaythrough', resolve);
            audio.addEventListener('error', reject);
            audio.load();
          } else {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = asset.src;
          }
        });
        
        // Calculer et broadcaster la progression
        const progress = ((i + 1) / assets.length) * 100;
        setPreloadProgress(progress);
        await progressChannel.send({
          type: 'broadcast',
          event: 'progress',
          payload: { progress }
        });
      }
      
      await supabase
        .from('sessions')
        .update({ 
          status: 'active',
          timer_running: true,
          is_preloading: false 
        })
        .eq('code', sessionCode);
      
      setSession((prev) => prev ? {
        ...prev,
        status: 'active',
        timer_running: true,
        is_preloading: false
      } : prev);
      
      setIsPreloading(false);
      await supabase.removeChannel(progressChannel);
      toast.success('Partie lancée !');
    } catch (err) {
      console.error('Error starting game:', err);
      toast.error('Erreur au démarrage');
      
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
    
    let canAccess = false;
    if (newZone === 1) {
      canAccess = true;
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

  const showLoadingOverlay = isPreloading || session.is_preloading;

  const WaitingScreen = () => {
    const [copied, setCopied] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);
    const connectedCount = players.filter((p: any) => p.is_connected).length;

    useEffect(() => {
      setHasAnimated(true);
    }, []);

    const copyCode = () => {
      if (sessionCode) {
        navigator.clipboard.writeText(sessionCode);
        setCopied(true);
        toast.success('Code de session copié');
        setTimeout(() => setCopied(false), 1200);
      }
    };

    return (
      <div className={`flex min-h-screen bg-background ${!hasAnimated ? 'animate-fade-in' : ''}`}>
        {/* Liste des joueurs - Sidebar gauche */}
        <div className={`w-80 border-r border-border bg-card p-6 flex flex-col ${!hasAnimated ? 'animate-slide-in-right' : ''}`}>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Joueurs connectés
            </h3>
            <p className="text-sm text-muted-foreground">
              {connectedCount}/{players.length} en ligne
            </p>
          </div>
          
          <div className="flex-1 space-y-2 overflow-auto">
            {players.map((p: any) => (
              <div 
                key={p.id} 
                className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 border border-border hover:bg-accent/50 transition-colors"
              >
                {p.is_host && <Crown className="w-5 h-5 text-yellow-500 flex-shrink-0" />}
                <span className="text-sm font-medium flex-1">{p.pseudo}</span>
                <span 
                  className={`h-3 w-3 rounded-full flex-shrink-0 ${
                    p.is_connected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                  }`} 
                />
              </div>
            ))}
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className={`w-full max-w-2xl border-primary/30 bg-primary/5 shadow-lg ${!hasAnimated ? 'animate-scale-in' : ''}`}>
            <CardHeader>
              <CardTitle className="text-center text-3xl">Salle d'attente</CardTitle>
              <CardDescription className="text-center text-base">
                {canStart ? "Démarrez quand tout le monde est prêt." : "En attente du Game Master pour démarrer la partie..."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex flex-col items-center gap-4 p-6 rounded-lg bg-accent/30 border border-border">
                <span className="text-sm text-muted-foreground">Code de session</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-3xl text-primary tracking-wider">{sessionCode}</span>
                  <Button size="lg" variant="outline" onClick={copyCode} className="hover-scale">
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </Button>
                </div>
              </div>

              {!isPreloading && (
                <div className="text-center">
                  {isHost && canStart && (
                    <Button size="lg" onClick={handleStartGame} className="hover-scale text-lg px-8 py-6">
                      Démarrer la partie
                    </Button>
                  )}
                </div>
              )}

              {(isPreloading || session.is_preloading) && (
                <div className="space-y-4">
                  <div className="h-3 w-full rounded-full bg-primary/20 overflow-hidden border border-primary/30">
                    <div
                      className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary transition-all duration-300 ease-out animate-pulse"
                      style={{ width: `${preloadProgress}%` }}
                    />
                  </div>
                  <p className="text-center text-base text-muted-foreground font-medium">
                    Préparation de la mission... {preloadProgress.toFixed(0)}%
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };


  const renderZone = () => {
    // Si le jeu est terminé (success ou échec), afficher GameEnd
    if (session.status === 'completed' || session.status === 'failed') {
      return <GameEnd session={session} players={players} />;
    }

    // Si la cinématique finale est active
    if (showFinalCinematic) {
      return (
        <FinalCinematic
          onComplete={async () => {
            // Le processus est terminé - mise à jour complète
            if (sessionCode) {
              await supabase
                .from('sessions')
                .update({ status: 'completed' })
                .eq('code', sessionCode);
              
              setShowFinalCinematic(false);
              
              // Forcer la mise à jour locale immédiate pour éviter le retour à Zone 3
              setSession((prev: any) => ({ ...prev, status: 'completed' }));
            }
          }}
        />
      );
    }

    switch (currentZone) {
      case 1:
        return <Zone1 sessionCode={sessionCode || ''} session={session} playerPseudo={currentPlayer?.pseudo || ''} />;
      case 2:
        return <Zone2 sessionCode={sessionCode || ''} session={session} playerPseudo={currentPlayer?.pseudo || ''} />;
      case 3:
        return (
          <Zone3 
            sessionCode={sessionCode || ''} 
            session={session} 
            playerPseudo={currentPlayer?.pseudo || ''}
            onFinalDoorUnlock={() => setShowFinalCinematic(true)}
          />
        );
      default:
        return <Zone1 sessionCode={sessionCode || ''} session={session} playerPseudo={currentPlayer?.pseudo || ''} />;
    }
  };

  // Si la partie n'a pas encore démarré, afficher l'écran d'attente
  if (session.status === 'waiting' || showLoadingOverlay) {
    return <WaitingScreen />;
  }

  // Sinon, afficher l'interface de jeu normale
  return (
    <div className="min-h-screen bg-background">
      <HUD
        sessionCode={sessionCode || ''}
        currentPlayerPseudo={currentPlayer?.pseudo || ''}
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
