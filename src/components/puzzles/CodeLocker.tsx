import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { InventoryItem } from '@/lib/gameLogic';

interface CodeLockerProps {
  isOpen: boolean;
  onClose: () => void;
  correctCode: string;
  onSolve: () => void;
  addItem?: (item: InventoryItem) => void;
  isSolved?: boolean;
}

export const CodeLocker = ({ isOpen, onClose, correctCode, onSolve, addItem, isSolved = false }: CodeLockerProps) => {
  const [code, setCode] = useState<string>('');
  const { toast } = useToast();

  const handleDigit = (digit: string) => {
    if (code.length < 4) {
      setCode(code + digit);
    }
  };

  const handleClear = () => {
    setCode('');
  };

  const handleSubmit = () => {
    if (code === correctCode) {
      if (addItem) {
        addItem({
          id: 'periodic_table',
          name: 'Tableau Périodique',
          description: 'Cliquez pour consulter les éléments chimiques'
        });
        toast({
          title: "✓ Casier déverrouillé !",
          description: "Vous avez obtenu le Tableau Périodique des Éléments. L'énigme 3 est maintenant révélée.",
        });
      } else {
        toast({
          title: "✓ Casier déverrouillé !",
          description: "Le badge magnétique est maintenant accessible.",
        });
      }
      onSolve();
      onClose();
    } else {
      toast({
        title: "✗ Code incorrect",
        description: "Le casier reste verrouillé.",
        variant: "destructive",
      });
      setCode('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <span>🔒</span>
            Casier sécurisé
          </DialogTitle>
          <DialogDescription>
            Le Dr. Morel a caché le code de la porte dans ce casier sécurisé. Vous devez résoudre l'équation inscrite sur la boîte pour l'ouvrir.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {isSolved ? (
            <div className="p-6 bg-green-500/10 border-2 border-green-500 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-500">✓ Validé</p>
              <p className="text-sm text-muted-foreground mt-2">Cette énigme a déjà été résolue</p>
            </div>
          ) : (
            <>
              <div className="p-4 bg-muted rounded-md text-center">
                <div className="text-3xl font-mono tracking-wider">
                  {code.padEnd(4, '•')}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                  <Button
                    key={digit}
                    onClick={() => handleDigit(String(digit))}
                    variant="outline"
                    className="h-12 text-lg"
                  >
                    {digit}
                  </Button>
                ))}
                <Button
                  onClick={handleClear}
                  variant="destructive"
                  className="h-12"
                >
                  ✕
                </Button>
                <Button
                  onClick={() => handleDigit('0')}
                  variant="outline"
                  className="h-12 text-lg"
                >
                  0
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={code.length !== 4}
                  className="h-12"
                >
                  ✓
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
