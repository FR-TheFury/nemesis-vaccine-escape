import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { caesarDecode } from '@/lib/gameLogic';
import { useToast } from '@/hooks/use-toast';

interface CaesarCipherProps {
  isOpen: boolean;
  onClose: () => void;
  encryptedText: string;
  correctKey: number;
  onSolve: () => void;
  isSolved?: boolean;
}

export const CaesarCipher = ({ 
  isOpen, 
  onClose, 
  encryptedText, 
  correctKey,
  onSolve,
  isSolved = false
}: CaesarCipherProps) => {
  const [key, setKey] = useState<number>(0);
  const { toast } = useToast();

  const handleSubmit = () => {
    if (key === correctKey) {
      toast({
        title: "✓ Message déchiffré !",
        description: "La clé de la porte se trouve dans le casier sécurisé. Le casier est maintenant accessible.",
      });
      onSolve();
      onClose();
    } else {
      toast({
        title: "✗ Incorrect",
        description: "Ce n'est pas la bonne clé de déchiffrement.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Carnet du Dr Morel</DialogTitle>
          <DialogDescription>
            Déchiffrez le message en trouvant la bonne clé de décalage
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
              <div className="p-4 bg-muted rounded-md font-mono text-center text-lg">
                {encryptedText}
              </div>

              <div className="space-y-2">
                <Label htmlFor="key">Clé de décalage (0-25)</Label>
                <Input
                  id="key"
                  type="number"
                  min={0}
                  max={25}
                  value={key}
                  onChange={(e) => setKey(Number(e.target.value))}
                  placeholder="Entrez la clé"
                />
              </div>

              <Button onClick={handleSubmit} className="w-full">
                Valider la solution
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
