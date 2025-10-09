import { useEffect, useState, useRef } from 'react';
import { useAudio } from '@/hooks/useAudio';
import { Lock, Unlock, Shield, Syringe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FinalCinematicProps {
  onComplete: () => void;
}

type Phase = 'validation' | 'unlock' | 'containment' | 'victory' | 'complete';

export const FinalCinematic = ({ onComplete }: FinalCinematicProps) => {
  const [phase, setPhase] = useState<Phase>('validation');
  const [progress, setProgress] = useState(0);
  
  const currentPhaseIndexRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const onCompleteRef = useRef(onComplete);
  const hasCompletedRef = useRef(false);

  // Synchroniser la référence de onComplete
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const timings = {
      validation: 5000,
      unlock: 10000,
      containment: 10000,
      victory: 10000,
      complete: 3000
    };

    const phases: Phase[] = ['validation', 'unlock', 'containment', 'victory', 'complete'];
    
    // Réinitialiser au montage
    currentPhaseIndexRef.current = 0;
    startTimeRef.current = Date.now();
    setPhase('validation');
    setProgress(0);

    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentPhase = phases[currentPhaseIndexRef.current];
      const phaseDuration = timings[currentPhase];
      const phaseProgress = Math.min((elapsed / phaseDuration) * 100, 100);
      
      setProgress(phaseProgress);

      if (elapsed >= phaseDuration) {
        currentPhaseIndexRef.current++;
        if (currentPhaseIndexRef.current < phases.length) {
          setPhase(phases[currentPhaseIndexRef.current]);
          startTimeRef.current = Date.now();
        } else {
          // Appeler onComplete une seule fois
          if (!hasCompletedRef.current) {
            hasCompletedRef.current = true;
            onCompleteRef.current();
          }
        }
      }
    };

    const interval = setInterval(updateProgress, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-black">
      {/* Phase 1: Validation du code (0-5s) */}
      {phase === 'validation' && (
        <div className="flex items-center justify-center h-full animate-fade-in">
          <div className="text-center space-y-8">
            <div className="text-6xl font-bold text-primary animate-pulse">
              2 9 8 2
            </div>
            <div className="space-y-4">
              <div className="text-2xl text-green-500 font-bold animate-scale-in">
                ✓ CODE VALIDÉ
              </div>
              <div className="flex justify-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phase 2: Déverrouillage de la porte (5-15s) */}
      {phase === 'unlock' && (
        <div className="flex items-center justify-center h-full">
          <div className="relative">
            {/* Animation de la porte */}
            <div className="space-y-8 text-center">
              <div className="relative w-64 h-96 mx-auto">
                {/* Cadre de porte */}
                <div className="absolute inset-0 border-4 border-primary rounded-lg">
                  {/* Battants de porte qui s'ouvrent */}
                  <div className="flex h-full">
                    <div 
                      className="w-1/2 bg-gradient-to-r from-primary/40 to-primary/20 transition-all duration-[3000ms]"
                      style={{ 
                        transform: progress > 50 ? 'translateX(-100%)' : 'translateX(0)',
                        opacity: progress > 50 ? 0 : 1
                      }}
                    />
                    <div 
                      className="w-1/2 bg-gradient-to-l from-primary/40 to-primary/20 transition-all duration-[3000ms]"
                      style={{ 
                        transform: progress > 50 ? 'translateX(100%)' : 'translateX(0)',
                        opacity: progress > 50 ? 0 : 1
                      }}
                    />
                  </div>
                </div>
                
                {/* Icône de cadenas qui change */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  {progress < 50 ? (
                    <Lock className="w-24 h-24 text-red-500 animate-pulse" />
                  ) : (
                    <Unlock className="w-24 h-24 text-green-500 animate-scale-in" />
                  )}
                </div>
              </div>
              
              <div className="text-xl text-primary font-bold">
                {progress < 50 ? 'DÉVERROUILLAGE EN COURS...' : 'PORTE OUVERTE'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phase 3: Confinement (15-25s) */}
      {phase === 'containment' && (
        <div className="flex items-center justify-center h-full animate-fade-in">
          <div className="text-center space-y-12">
            <Shield className="w-32 h-32 mx-auto text-primary animate-pulse" />
            
            <div className="space-y-6">
              <div className={cn(
                "text-3xl font-bold transition-all duration-1000",
                progress > 20 ? "text-green-500" : "text-red-500"
              )}>
                {progress > 20 ? '🔒 CONFINEMENT ACTIVÉ' : '⚠️ ACTIVATION EN COURS...'}
              </div>
              
              {/* Barres de sécurité qui se ferment */}
              <div className="space-y-3 max-w-md mx-auto">
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="relative h-4 bg-background/20 rounded-full overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 to-green-500 transition-all duration-1000"
                      style={{ 
                        width: `${Math.min((progress - index * 20), 100)}%`,
                        transitionDelay: `${index * 200}ms`
                      }}
                    />
                  </div>
                ))}
              </div>
              
              <div className="text-lg text-muted-foreground">
                Sécurisation des zones de confinement...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phase 4: Message de victoire (25-35s) */}
      {phase === 'victory' && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-8 max-w-3xl px-8 animate-fade-in">
            <Syringe className="w-32 h-32 mx-auto text-primary animate-float" />
            
            <div className="space-y-6">
              <div className="text-4xl md:text-6xl font-bold text-primary animate-scale-in">
                🦠 VIRUS PROTOCOL Z
              </div>
              
              <div className="space-y-4 text-xl md:text-2xl">
                <div className="animate-fade-in" style={{ animationDelay: '500ms' }}>
                  <span className="text-green-500 font-bold">🔒 CONFINEMENT RÉUSSI</span>
                </div>
                
                <div className="animate-fade-in" style={{ animationDelay: '1000ms' }}>
                  <span className="text-blue-400 font-bold">💉 VACCIN SYNTHÉTISÉ</span>
                </div>
                
                <div className="animate-fade-in" style={{ animationDelay: '1500ms' }}>
                  <span className="text-primary font-bold text-3xl md:text-4xl">🌍 HUMANITÉ SAUVÉE</span>
                </div>
              </div>
              
              <div className="text-lg text-muted-foreground animate-fade-in" style={{ animationDelay: '2000ms' }}>
                Le Dr Morel serait fier de vous...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phase 5: Transition (35-38s) */}
      {phase === 'complete' && (
        <div className="flex items-center justify-center h-full bg-gradient-to-b from-black to-background animate-fade-in">
          <div className="text-4xl font-bold text-primary animate-pulse">
            Préparation des résultats...
          </div>
        </div>
      )}
    </div>
  );
};
