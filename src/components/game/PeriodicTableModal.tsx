import { FlaskConical } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PeriodicTableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHEMICAL_ELEMENTS = [
  { symbol: 'H', name: 'Hydrogène', number: 1 },
  { symbol: 'He', name: 'Hélium', number: 2 },
  { symbol: 'Li', name: 'Lithium', number: 3 },
  { symbol: 'Be', name: 'Béryllium', number: 4 },
  { symbol: 'B', name: 'Bore', number: 5 },
  { symbol: 'C', name: 'Carbone', number: 6 },
  { symbol: 'N', name: 'Azote', number: 7 },
  { symbol: 'O', name: 'Oxygène', number: 8 },
  { symbol: 'F', name: 'Fluor', number: 9 },
  { symbol: 'Ne', name: 'Néon', number: 10 },
  { symbol: 'Na', name: 'Sodium', number: 11 },
  { symbol: 'Mg', name: 'Magnésium', number: 12 },
  { symbol: 'Al', name: 'Aluminium', number: 13 },
  { symbol: 'Si', name: 'Silicium', number: 14 },
  { symbol: 'P', name: 'Phosphore', number: 15 },
  { symbol: 'S', name: 'Soufre', number: 16 },
  { symbol: 'Cl', name: 'Chlore', number: 17 },
  { symbol: 'Ar', name: 'Argon', number: 18 },
  { symbol: 'Fe', name: 'Fer', number: 26 },
  { symbol: 'Cu', name: 'Cuivre', number: 29 },
  { symbol: 'Zn', name: 'Zinc', number: 30 },
  { symbol: 'Ag', name: 'Argent', number: 47 },
  { symbol: 'Au', name: 'Or', number: 79 },
  { symbol: 'Pb', name: 'Plomb', number: 82 },
];

export const PeriodicTableModal = ({ isOpen, onClose }: PeriodicTableModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-primary" />
            Tableau Périodique des Éléments
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {CHEMICAL_ELEMENTS.map((element) => (
              <div
                key={element.symbol}
                className="p-2 rounded-lg border bg-card hover:bg-accent transition-colors"
              >
                <div className="text-xs text-muted-foreground text-right">
                  {element.number}
                </div>
                <div className="text-xl font-bold text-center text-primary">
                  {element.symbol}
                </div>
                <div className="text-xs text-center text-muted-foreground truncate">
                  {element.name}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
