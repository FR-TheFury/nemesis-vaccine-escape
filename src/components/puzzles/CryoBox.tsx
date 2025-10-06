import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface CryoBoxProps {
  isOpen: boolean;
  onClose: () => void;
  correctCode: string;
  onSolve: () => void;
}

export const CryoBox = ({ isOpen, onClose, correctCode, onSolve }: CryoBoxProps) => {
  const [code, setCode] = useState<string>('');
  const { toast } = useToast();

  const handleSubmit = () => {
    const normalized = code.trim().toUpperCase().replace(/[\s\-+]/g, '');
    const normalizedCorrect = correctCode.toUpperCase().replace(/[\s\-+]/g, '');
    
    // Alternative: also accept with "+" separator
    const alternativeCorrect = correctCode.replace(/[\s-]/g, '+').toUpperCase().replace(/\+/g, '');

    if (normalized === normalizedCorrect || normalized === alternativeCorrect) {
      toast({
        title: "✓ Coffre cryogénique ouvert !",
        description: "Les flacons de synthèse sont accessibles.",
      });
      onSolve();
      onClose();
    } else {
      toast({
        title: "✗ Code incorrect",
        description: "La séquence de sécurité ne correspond pas.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Coffre cryogénique - Accès sécurisé</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-destructive/10 border border-destructive/50 rounded-md">
            <p className="text-sm font-bold text-destructive">⚠️ SYSTÈME DE CONFINEMENT</p>
            <p className="text-xs text-muted-foreground mt-1">
              Séquence de formule complète requise
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="formula">Code d'accès</Label>
            <Input
              id="formula"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Entrez la formule complète"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Indice: Combinez les deux formules découvertes...
            </p>
          </div>

          <Button onClick={handleSubmit} className="w-full">
            Déverrouiller le coffre
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
