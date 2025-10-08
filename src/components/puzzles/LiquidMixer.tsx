import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface LiquidMixerProps {
  isOpen: boolean;
  onClose: () => void;
  correctSequence: string[];
  onSolve: () => void;
  isSolved?: boolean;
}

const LIQUID_COLORS = {
  Bleu: 'bg-blue-500',
  Vert: 'bg-green-500',
  Rouge: 'bg-red-500',
};

export const LiquidMixer = ({ isOpen, onClose, correctSequence, onSolve, isSolved = false }: LiquidMixerProps) => {
  const [mixedLiquids, setMixedLiquids] = useState<string[]>([]);
  const { toast } = useToast();

  const handleLiquidAdd = (liquid: string) => {
    if (mixedLiquids.length < 3) {
      setMixedLiquids([...mixedLiquids, liquid]);
    }
  };

  const handleReset = () => {
    setMixedLiquids([]);
  };

  const handleValidate = () => {
    if (JSON.stringify(mixedLiquids) === JSON.stringify(correctSequence)) {
      toast({
        title: "✓ VACCIN SYNTHÉTISÉ !",
        description: "Le virus Protocol Z peut être neutralisé !",
      });
      onSolve();
      onClose();
    } else {
      toast({
        title: "✗ Mélange instable",
        description: "La réaction est incorrecte. Recommencez.",
        variant: "destructive",
      });
      setMixedLiquids([]);
    }
  };

  const getBeakerColor = () => {
    if (mixedLiquids.length === 0) return 'bg-gray-200';
    if (mixedLiquids.length === 1) return LIQUID_COLORS[mixedLiquids[0] as keyof typeof LIQUID_COLORS];
    if (mixedLiquids.length === 2) return 'bg-gradient-to-b from-blue-500 via-green-500 to-green-500';
    if (JSON.stringify(mixedLiquids) === JSON.stringify(correctSequence)) {
      return 'bg-gradient-to-b from-yellow-400 via-yellow-500 to-amber-500';
    }
    return 'bg-gradient-to-b from-purple-500 via-pink-500 to-red-500';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Synthèse du vaccin Protocol Z</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {isSolved ? (
            <div className="p-6 bg-green-500/10 border-2 border-green-500 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-500">✓ Validé</p>
              <p className="text-sm text-muted-foreground mt-2">Cette énigme a déjà été résolue</p>
            </div>
          ) : (
            <>
              {/* Beaker de mélange */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className={cn(
                    "w-32 h-40 rounded-b-3xl border-4 border-foreground transition-all duration-500",
                    getBeakerColor()
                  )}>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 border-t-4 border-x-4 border-foreground" />
                  </div>
                  {mixedLiquids.length === 3 && 
                   JSON.stringify(mixedLiquids) === JSON.stringify(correctSequence) && (
                    <div className="absolute inset-0 animate-pulse">
                      <div className="text-4xl text-center mt-12">✨</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                {mixedLiquids.length === 0 && "Beaker vide - Commencez le mélange"}
                {mixedLiquids.length > 0 && mixedLiquids.length < 3 && 
                 `${mixedLiquids.join(' + ')} ajouté${mixedLiquids.length > 1 ? 's' : ''}`}
                {mixedLiquids.length === 3 && 
                 JSON.stringify(mixedLiquids) === JSON.stringify(correctSequence) && 
                 "🎉 VACCIN STABLE !"}
              </div>

              {/* Flacons disponibles */}
              <div className="grid grid-cols-3 gap-2">
                {(['Bleu', 'Vert', 'Rouge'] as const).map((liquid) => (
                  <Button
                    key={liquid}
                    onClick={() => handleLiquidAdd(liquid)}
                    disabled={mixedLiquids.length >= 3}
                    className={cn(
                      "h-20 text-white font-bold",
                      LIQUID_COLORS[liquid]
                    )}
                  >
                    {liquid}
                  </Button>
                ))}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleReset} variant="outline" className="flex-1">
                  Réinitialiser
                </Button>
                <Button 
                  onClick={handleValidate} 
                  className="flex-1"
                  disabled={mixedLiquids.length !== 3}
                >
                  Valider
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
