import { useState } from 'react';
import { Package } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { InventoryItem } from '@/lib/gameLogic';
import { PeriodicTableModal } from './PeriodicTableModal';

interface InventoryProps {
  items: InventoryItem[];
}

export const Inventory = ({ items }: InventoryProps) => {
  const [showPeriodicTable, setShowPeriodicTable] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState<InventoryItem | null>(null);
  
  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-1rem)] sm:w-full max-w-2xl px-2 sm:px-4">
      <div className="bg-background/95 backdrop-blur-md border-2 border-primary rounded-lg p-2 sm:p-4 relative">
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
        )}
        <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
          <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <h3 className="font-bold text-sm sm:text-lg">Inventaire</h3>
          <Badge variant="secondary" className="ml-auto text-xs">
            {items.length}
          </Badge>
        </div>
        
        <ScrollArea className="h-16 sm:h-20">
          {items.length === 0 ? (
            <p className="text-xs sm:text-sm text-muted-foreground text-center py-3 sm:py-4">
              Aucun objet collecté
            </p>
          ) : (
            <div className="flex gap-1.5 sm:gap-2 flex-wrap">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group relative px-2 py-1.5 sm:px-4 sm:py-2 bg-accent/50 hover:bg-accent rounded-md border border-border transition-colors cursor-pointer"
                  title={item.description}
                  onClick={() => {
                    if (item.id === 'periodic_table') {
                      setShowPeriodicTable(true);
                    } else if (item.id === 'half_formula_alpha' || item.id === 'half_formula_beta') {
                      setSelectedFormula(item);
                    }
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    {item.icon && <span className="text-sm sm:text-base">{item.icon}</span>}
                    <p className="text-xs sm:text-sm font-medium">{item.name}</p>
                  </div>
                  {item.description && !item.id.includes('half_formula') && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1.5 sm:px-3 sm:py-2 bg-popover text-popover-foreground text-[10px] sm:text-xs rounded-md border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap max-w-[200px] sm:max-w-none">
                      {item.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
      
      <PeriodicTableModal 
        isOpen={showPeriodicTable} 
        onClose={() => setShowPeriodicTable(false)} 
      />
      
      {/* Modal pour afficher les demi-formules */}
      {selectedFormula && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedFormula(null)}
        >
          <div 
            className="bg-background border-2 border-primary rounded-lg p-6 sm:p-8 max-w-md mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-4">
              <div className="text-4xl sm:text-5xl">{selectedFormula.icon}</div>
              <h3 className="text-xl sm:text-2xl font-bold text-primary">{selectedFormula.name}</h3>
              <div className="p-4 bg-accent/50 rounded-md border-2 border-primary/50">
                <p className="text-2xl sm:text-3xl font-mono font-bold tracking-wider">
                  {selectedFormula.description}
                </p>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Notez cette formule pour résoudre l'énigme finale
              </p>
              <button
                onClick={() => setSelectedFormula(null)}
                className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
