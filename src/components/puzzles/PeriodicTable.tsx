import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Equation {
  operation: string;
  result: number;
  symbol: string;
}

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

interface PeriodicTableProps {
  isOpen: boolean;
  onClose: () => void;
  equations: Equation[];
  halfFormula: string;
  onSolve: () => void;
  addItem?: (item: InventoryItem) => void;
  isSolved?: boolean;
}

export const PeriodicTable = ({ isOpen, onClose, equations, halfFormula, onSolve, addItem, isSolved = false }: PeriodicTableProps) => {
  const [answers, setAnswers] = useState<string[]>(equations.map(() => ''));
  const { toast } = useToast();

  const handleSubmit = () => {
    const correctAnswers = equations.map(eq => eq.symbol.toUpperCase());
    const userAnswers = answers.map(a => a.trim().toUpperCase());
    
    const allCorrect = correctAnswers.every((correct, idx) => userAnswers[idx] === correct);
    
    if (allCorrect) {
      toast({
        title: "✓ Tableau résolu !",
        description: `Formule β obtenue : ${halfFormula}`,
      });
      
      if (addItem) {
        addItem({
          id: 'half_formula_beta',
          name: 'Demi-formule β',
          description: halfFormula,
          icon: '⚗️'
        });
      }
      
      onSolve();
      onClose();
    } else {
      const correctCount = correctAnswers.filter((correct, idx) => userAnswers[idx] === correct).length;
      
      if (correctCount > 0) {
        toast({
          title: "⚠️ Presque !",
          description: `${correctCount}/${equations.length} symboles corrects`,
          variant: "default",
        });
      } else {
        toast({
          title: "✗ Erreur",
          description: "Vérifiez vos numéros atomiques",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tableau périodique crypté</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {isSolved ? (
            <div className="p-6 bg-green-500/10 border-2 border-green-500 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-500">✓ Validé</p>
              <p className="text-sm text-muted-foreground mt-2">Cette énigme a déjà été résolue</p>
            </div>
          ) : (
            <>
              <div className="p-4 bg-primary/10 border border-primary/50 rounded-md">
                <p className="text-sm font-bold text-primary">🧪 ANALYSE CHIMIQUE</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Résolvez les équations pour trouver les symboles atomiques
                </p>
              </div>

              <div className="space-y-3">
                {equations.map((eq, idx) => (
                  <div key={idx} className="space-y-2">
                    <Label htmlFor={`eq-${idx}`}>
                      Équation {idx + 1}: <span className="font-mono">{eq.operation} = ?</span>
                    </Label>
                    <Input
                      id={`eq-${idx}`}
                      value={answers[idx]}
                      onChange={(e) => {
                        const newAnswers = [...answers];
                        newAnswers[idx] = e.target.value;
                        setAnswers(newAnswers);
                      }}
                      placeholder="Symbole (ex: Cl, O, H)"
                      className="font-mono uppercase"
                      maxLength={2}
                    />
                  </div>
                ))}
              </div>

              <div className="p-3 bg-muted rounded-md">
                <p className="text-xs text-muted-foreground">
                  💡 Indice: Le numéro atomique indique la position dans le tableau périodique
                </p>
              </div>

              <Button 
                onClick={handleSubmit} 
                className="w-full"
                disabled={answers.some(a => a.trim() === '')}
              >
                Valider les symboles
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
