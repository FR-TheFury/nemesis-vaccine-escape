import { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HintButtonProps {
  sessionCode: string;
  currentHints: number;
  maxHints: number;
  currentPuzzleId: string | null;
  puzzleHints: string[];
}

export const HintButton = ({ 
  sessionCode, 
  currentHints, 
  maxHints,
  currentPuzzleId,
  puzzleHints
}: HintButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const canUseHint = currentHints < maxHints;
  const hintIndex = Math.min(currentHints, puzzleHints.length - 1);

  const useHint = async () => {
    if (!canUseHint || !currentPuzzleId) return;

    try {
      const { error } = await supabase
        .from('sessions')
        .update({ hints_used: currentHints + 1 })
        .eq('code', sessionCode);

      if (!error) {
        toast({
          title: "Indice utilisé",
          description: `Indices restants: ${maxHints - currentHints - 1}`,
        });
      }
    } catch (err) {
      console.error('Error using hint:', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="fixed bottom-24 left-2 sm:bottom-4 sm:left-4 z-[60] text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4"
          disabled={!canUseHint}
        >
          <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Indices</span>
          <span className="sm:hidden">💡</span>
          <Badge variant="secondary" className="ml-1 sm:ml-2 text-[10px] sm:text-xs px-1">
            {currentHints}/{maxHints}
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Centre de contrôle - Indices
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!currentPuzzleId ? (
            <p className="text-muted-foreground">
              Aucune énigme active pour le moment.
            </p>
          ) : (
            <>
              {puzzleHints.slice(0, currentHints + 1).map((hint, index) => (
                <div key={index} className="p-4 bg-accent/50 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">Indice {index + 1}</Badge>
                  </div>
                  <p className="text-sm">{hint}</p>
                </div>
              ))}

              {canUseHint && hintIndex < puzzleHints.length - 1 && (
                <Button onClick={useHint} className="w-full">
                  Utiliser un indice ({maxHints - currentHints} restants)
                </Button>
              )}

              {!canUseHint && (
                <p className="text-sm text-destructive text-center">
                  Vous avez utilisé tous vos indices !
                </p>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
