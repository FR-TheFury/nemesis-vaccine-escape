import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { caesarDecode } from '@/lib/gameLogic';
import { useToast } from '@/hooks/use-toast';

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

interface CaesarCipherProps {
  isOpen: boolean;
  onClose: () => void;
  encryptedText: string;
  correctKey: number;
  halfFormula: string;
  onSolve: () => void;
  addItem?: (item: InventoryItem) => void;
  isSolved?: boolean;
}

export const CaesarCipher = ({ 
  isOpen, 
  onClose, 
  encryptedText, 
  correctKey,
  halfFormula,
  onSolve,
  addItem,
  isSolved = false
}: CaesarCipherProps) => {
  const [key, setKey] = useState<number>(0);
  const [decoded, setDecoded] = useState<string>('');
  const { toast } = useToast();

  const handleDecode = () => {
    const result = caesarDecode(encryptedText, key);
    setDecoded(result);
  };

  const handleSubmit = () => {
    if (key === correctKey) {
      toast({
        title: "✓ Message déchiffré !",
        description: "La clé de la porte se trouve dans le casier sécurisé. Le casier est maintenant accessible.",
      });
      
      if (addItem) {
        addItem({
          id: 'half_formula_alpha',
          name: 'Demi-formule α',
          description: halfFormula,
          icon: '🧪'
        });
      }
      
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
                <div className="flex items-center gap-2">
                  <Input
                    id="key"
                    type="number"
                    min={0}
                    max={25}
                    value={key}
                    onChange={(e) => setKey(Number(e.target.value))}
                    placeholder="Entrez la clé"
                  />
                  <Button variant="secondary" onClick={handleDecode}>
                    Déchiffrer
                  </Button>
                </div>
              </div>
              {decoded && (
                <div className="p-4 bg-muted rounded-md font-mono text-center text-lg">
                  {decoded}
                </div>
              )}

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
