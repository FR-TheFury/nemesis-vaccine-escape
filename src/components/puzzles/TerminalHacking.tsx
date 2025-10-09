import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface TerminalHackingProps {
  isOpen: boolean;
  onClose: () => void;
  finalCode: string;
}

export const TerminalHacking = ({ isOpen, onClose, finalCode }: TerminalHackingProps) => {
  const [displayedDigits, setDisplayedDigits] = useState<string[]>(['0', '0', '0', '0']);
  const [lockedIndices, setLockedIndices] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [allLocked, setAllLocked] = useState(false);

  const targetDigits = finalCode.split('');

  // Reset quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setDisplayedDigits(['0', '0', '0', '0']);
      setLockedIndices([]);
      setElapsed(0);
      setAllLocked(false);
    }
  }, [isOpen]);

  // Animation principale
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setElapsed(prev => {
        const newElapsed = prev + 0.1;
        
        // Défilement random pour chiffres non verrouillés
        setDisplayedDigits(current => current.map((digit, idx) => {
          if (lockedIndices.includes(idx)) return digit;
          return Math.floor(Math.random() * 10).toString();
        }));

        // Verrouillage progressif
        if (newElapsed >= 7 && !lockedIndices.includes(0)) {
          setLockedIndices(prev => [...prev, 0]);
          setDisplayedDigits(prev => {
            const copy = [...prev];
            copy[0] = targetDigits[0];
            return copy;
          });
        }
        
        if (newElapsed >= 14 && !lockedIndices.includes(1)) {
          setLockedIndices(prev => [...prev, 1]);
          setDisplayedDigits(prev => {
            const copy = [...prev];
            copy[1] = targetDigits[1];
            return copy;
          });
        }
        
        if (newElapsed >= 21 && !lockedIndices.includes(2)) {
          setLockedIndices(prev => [...prev, 2]);
          setDisplayedDigits(prev => {
            const copy = [...prev];
            copy[2] = targetDigits[2];
            return copy;
          });
        }
        
        if (newElapsed >= 28 && !lockedIndices.includes(3)) {
          setLockedIndices(prev => [...prev, 3]);
          setDisplayedDigits(prev => {
            const copy = [...prev];
            copy[3] = targetDigits[3];
            return copy;
          });
        }

        // Tout est verrouillé après 30s
        if (newElapsed >= 30) {
          setAllLocked(true);
        }

        return newElapsed;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, lockedIndices, targetDigits]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-black border-2 border-green-500/50 text-green-500">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-mono font-bold tracking-widest animate-pulse">
            🖥️ TERMINAL DE SÉCURITÉ
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8 py-6">
          {/* Sous-titre avec effet scanline */}
          <div className="text-center">
            <p className="text-sm opacity-70 font-mono tracking-wider">
              /// DÉCHIFFREMENT EN COURS ///
            </p>
          </div>

          {/* Zone des chiffres qui défilent */}
          <div className="flex justify-center gap-4 md:gap-8">
            {displayedDigits.map((digit, index) => {
              const isLocked = lockedIndices.includes(index);
              return (
                <div key={index} className="relative">
                  <div 
                    className={`
                      text-6xl md:text-8xl font-bold font-mono
                      transition-all duration-300
                      ${isLocked 
                        ? 'text-green-400 drop-shadow-[0_0_20px_rgba(0,255,0,0.8)] scale-110' 
                        : 'text-green-600 animate-pulse'
                      }
                    `}
                  >
                    {digit}
                  </div>
                  {isLocked && (
                    <>
                      <div className="absolute inset-0 border-2 border-green-400 rounded animate-ping opacity-50" />
                      <div className="absolute -inset-2 bg-green-500/10 rounded blur-xl" />
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Effet de grille matricielle en arrière-plan */}
          <div className="relative h-20 overflow-hidden">
            <div className="absolute inset-0 opacity-20 font-mono text-xs leading-tight overflow-hidden">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  {Math.random().toString(36).substring(2, 50)}
                </div>
              ))}
            </div>
          </div>

          {/* Barre de progression */}
          <div className="space-y-2">
            <Progress 
              value={Math.min((elapsed / 30) * 100, 100)} 
              className="h-2 bg-green-950"
            />
            <div className="text-center text-xs font-mono opacity-70">
              {Math.floor((elapsed / 30) * 100)}% COMPLÉTÉ
            </div>
          </div>

          {/* Message de statut */}
          <div className="text-center space-y-2">
            {allLocked ? (
              <div className="space-y-4 animate-fade-in">
                <p className="text-xl font-mono font-bold text-green-400 animate-pulse">
                  🔓 CODE D'ACCÈS DÉVERROUILLÉ
                </p>
                <p className="text-3xl font-mono font-bold tracking-wider drop-shadow-[0_0_30px_rgba(0,255,0,0.9)]">
                  {finalCode}
                </p>
                <p className="text-sm opacity-70">
                  Utilisez ce code pour accéder à la porte finale
                </p>
              </div>
            ) : (
              <p className="text-sm font-mono animate-pulse">
                {lockedIndices.length === 0 && '⚙️ INITIALISATION DU SYSTÈME...'}
                {lockedIndices.length === 1 && '🔍 ANALYSE DES DONNÉES...'}
                {lockedIndices.length === 2 && '💾 DÉCODAGE EN COURS...'}
                {lockedIndices.length === 3 && '🔐 FINALISATION...'}
              </p>
            )}
          </div>

          {/* Bouton de fermeture (actif seulement après 30s) */}
          <Button 
            onClick={onClose} 
            variant="outline" 
            className={`
              w-full font-mono border-green-500 text-green-500 
              hover:bg-green-500 hover:text-black
              ${!allLocked && 'opacity-50 cursor-not-allowed'}
            `}
            disabled={!allLocked}
          >
            <X className="h-4 w-4 mr-2" />
            {allLocked ? 'FERMER' : `VERROUILLÉ (${Math.max(0, 30 - Math.floor(elapsed))}s)`}
          </Button>
        </div>

        {/* Effet scanline */}
        <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,0,0.03)_2px,rgba(0,255,0,0.03)_4px)] opacity-50" />
      </DialogContent>
    </Dialog>
  );
};
