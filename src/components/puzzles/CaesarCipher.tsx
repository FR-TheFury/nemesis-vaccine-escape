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
}

export const CaesarCipher = ({ 
  isOpen, 
  onClose, 
  encryptedText, 
  correctKey,
  onSolve 
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
          <div className="p-4 bg-muted rounded-md font-mono text-center text-lg">
            {encryptedText}
          </div>

          <div className="space-y-2">
            <Label htmlFor="key">Clé de décalage (0-25)</Label>
            <div className="flex gap-2">
              <Input
                id="key"
                type="number"
                min={0}
                max={25}
                value={key}
                onChange={(e) => setKey(Number(e.target.value))}
                placeholder="Entrez la clé"
              />
              <Button onClick={handleDecode} variant="outline">
                Déchiffrer
              </Button>
            </div>
          </div>

          {decoded && (
            <div className="p-4 bg-accent rounded-md">
              <p className="text-sm font-bold mb-1">Résultat:</p>
              <p className="font-mono">{decoded}</p>
            </div>
          )}

          <Button onClick={handleSubmit} className="w-full">
            Valider la solution
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
