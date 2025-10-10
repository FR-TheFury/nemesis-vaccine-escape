import { useState } from 'react';
import { Lock, Unlock, Shield, Syringe, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FinalCinematicProps {
  onComplete: () => void;
}

type Phase = 'validation' | 'unlock' | 'containment' | 'victory' | 'complete';

export const FinalCinematic = ({ onComplete }: FinalCinematicProps) => {
  const [phase, setPhase] = useState<Phase>('validation');

  const handleNext = () => {
    const phaseOrder: Phase[] = ['validation', 'unlock', 'containment', 'victory', 'complete'];
    const currentIndex = phaseOrder.indexOf(phase);
    
    if (currentIndex < phaseOrder.length - 1) {
      const nextPhase = phaseOrder[currentIndex + 1];
      if (nextPhase === 'complete') {
        onComplete();
      } else {
        setPhase(nextPhase);
      }
    }
  };

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

      {/* Phase 2: Déverrouillage de la porte */}
      {phase === 'unlock' && (
        <div className="flex items-center justify-center h-full animate-fade-in">
          <div className="text-center space-y-8">
            <Unlock className="w-32 h-32 mx-auto text-green-500 animate-scale-in" />
            <div className="text-3xl font-bold text-primary">
              PORTE OUVERTE
            </div>
          </div>
        </div>
      )}

      {/* Phase 3: Confinement */}
      {phase === 'containment' && (
        <div className="flex items-center justify-center h-full animate-fade-in">
          <div className="text-center space-y-12">
            <Shield className="w-32 h-32 mx-auto text-primary animate-pulse" />
            <div className="text-3xl font-bold text-green-500">
              🔒 CONFINEMENT ACTIVÉ
            </div>
            <div className="text-lg text-muted-foreground">
              Zones de confinement sécurisées
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

      {/* Bouton Suivant */}
      {phase !== 'complete' && (
        <Button 
          onClick={handleNext}
          className="fixed bottom-8 right-8 z-[300]"
          size="lg"
        >
          {phase === 'victory' ? 'Voir les résultats' : 'Suivant'}
          <ChevronRight className="ml-2" />
        </Button>
      )}
    </div>
  );
};
