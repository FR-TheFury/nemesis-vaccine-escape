import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface DNASequenceProps {
  isOpen: boolean;
  onClose: () => void;
  correctSequence: string[];
  onSolve: () => void;
  isSolved?: boolean;
}

const TUBE_COLORS = {
  A: 'bg-red-500',
  T: 'bg-yellow-500',
  C: 'bg-green-500',
  G: 'bg-blue-500',
};

export const DNASequence = ({ isOpen, onClose, correctSequence, onSolve, isSolved = false }: DNASequenceProps) => {
  const [sequence, setSequence] = useState<string[]>(Array(correctSequence.length).fill(''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleTubeClick = (base: string) => {
    const emptyIndex = sequence.findIndex(s => s === '');
    if (emptyIndex !== -1) {
      const newSequence = [...sequence];
      newSequence[emptyIndex] = base;
      setSequence(newSequence);
    }
  };

  const handleReset = () => {
    setSequence(Array(correctSequence.length).fill(''));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      if (JSON.stringify(sequence) === JSON.stringify(correctSequence)) {
        toast({
          title: "✓ Séquence ADN validée !",
          description: "La reconstruction est parfaite.",
        });
        onSolve();
        onClose();
      } else {
        toast({
          title: "✗ Séquence incorrecte",
          description: "La structure ADN ne correspond pas.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Reconstruction de séquence ADN</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {isSolved ? (
            <div className="p-6 bg-green-500/10 border-2 border-green-500 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-500">✓ Validé</p>
              <p className="text-sm text-muted-foreground mt-2">Cette énigme a déjà été résolue</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Placez les tubes dans le bon ordre pour reconstituer la séquence.
              </p>

              {/* Séquence actuelle */}
              <div className="flex flex-wrap justify-center gap-1 max-w-full overflow-x-auto">
                {sequence.map((base, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-10 h-14 sm:w-12 sm:h-16 rounded-md border-2 flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0",
                      base ? TUBE_COLORS[base as keyof typeof TUBE_COLORS] : "border-dashed border-muted bg-muted/20"
                    )}
                  >
                    {base || '?'}
                  </div>
                ))}
              </div>

              {/* Palette de tubes */}
              <div className="p-3 sm:p-4 bg-muted rounded-md">
                <p className="text-sm font-bold mb-2">Tubes disponibles:</p>
                <div className="flex justify-center gap-2 flex-wrap">
                  {(['A', 'T', 'C', 'G'] as const).map((base) => (
                    <Button
                      key={base}
                      onClick={() => handleTubeClick(base)}
                      className={cn(
                        "w-10 h-10 sm:w-12 sm:h-12 text-white font-bold flex-shrink-0",
                        TUBE_COLORS[base]
                      )}
                    >
                      {base}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleReset} variant="outline" className="flex-1">
                  Réinitialiser
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  className="flex-1"
                  disabled={sequence.includes('') || isSubmitting}
                >
                  {isSubmitting ? 'Validation...' : 'Valider'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
