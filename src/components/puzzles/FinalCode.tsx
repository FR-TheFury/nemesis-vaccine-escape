import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Shuffle } from 'lucide-react';

interface FinalCodeProps {
  isOpen: boolean;
  onClose: () => void;
  letters: string[];
  solution: string;
  onSolve: () => void;
}

export const FinalCode = ({ isOpen, onClose, letters, solution, onSolve }: FinalCodeProps) => {
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [availableLetters, setAvailableLetters] = useState<string[]>([...letters]);
  const { toast } = useToast();

  const handleLetterClick = (letter: string, index: number) => {
    setSelectedLetters([...selectedLetters, letter]);
    setAvailableLetters(availableLetters.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setSelectedLetters([]);
    setAvailableLetters([...letters]);
  };

  const handleSubmit = () => {
    const userAnswer = selectedLetters.join('');
    
    if (userAnswer.toUpperCase() === solution.toUpperCase()) {
      toast({
        title: "🏆 MISSION ACCOMPLIE !",
        description: "Virus NEMESIS neutralisé. Vaccin synthétisé avec succès !",
      });
      onSolve();
      onClose();
    } else {
      toast({
        title: "✗ Séquence incorrecte",
        description: "Ce n'est pas le bon ordre...",
        variant: "destructive",
      });
      handleReset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Code final - Activation du vaccin</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-primary/20 to-destructive/20 border-2 border-primary rounded-md animate-pulse">
            <p className="text-sm font-bold text-center">🧬 SÉQUENCE D'ACTIVATION</p>
            <p className="text-xs text-muted-foreground text-center mt-1">
              Ordonnez les lettres pour former le mot final
            </p>
          </div>

          {/* Selected letters display */}
          <div className="p-4 bg-muted rounded-md min-h-[60px] flex items-center justify-center gap-2">
            {selectedLetters.length === 0 ? (
              <span className="text-muted-foreground text-sm">Sélectionnez les lettres...</span>
            ) : (
              selectedLetters.map((letter, idx) => (
                <div
                  key={idx}
                  className="w-10 h-10 bg-primary text-primary-foreground rounded-md flex items-center justify-center font-bold text-lg"
                >
                  {letter}
                </div>
              ))
            )}
          </div>

          {/* Available letters */}
          <div className="grid grid-cols-6 gap-2">
            {availableLetters.map((letter, idx) => (
              <Button
                key={idx}
                onClick={() => handleLetterClick(letter, idx)}
                variant="outline"
                className="h-12 text-lg font-bold"
              >
                {letter}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleReset}
              variant="destructive"
              className="flex-1"
              disabled={selectedLetters.length === 0}
            >
              <Shuffle className="mr-2 h-4 w-4" />
              Réinitialiser
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedLetters.length !== letters.length}
              className="flex-1"
            >
              ✓ Activer
            </Button>
          </div>

          <div className="p-3 bg-accent/50 rounded-md">
            <p className="text-xs text-muted-foreground text-center">
              💡 Le but de toute cette mission...
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
