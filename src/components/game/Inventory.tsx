import { Package } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { InventoryItem } from '@/lib/gameLogic';

interface InventoryProps {
  items: InventoryItem[];
}

export const Inventory = ({ items }: InventoryProps) => {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4">
      <div className="bg-background/95 backdrop-blur-md border-2 border-primary rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Package className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-lg">Inventaire</h3>
          <Badge variant="secondary" className="ml-auto">
            {items.length} items
          </Badge>
        </div>
        
        <ScrollArea className="h-20">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucun objet collecté
            </p>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group relative px-4 py-2 bg-accent/50 hover:bg-accent rounded-md border border-border transition-colors"
                  title={item.description}
                >
                  <p className="text-sm font-medium">{item.name}</p>
                  {item.description && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-md border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      {item.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};
